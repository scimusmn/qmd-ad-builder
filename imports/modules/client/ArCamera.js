/* eslint-disable consistent-return */

import { Meteor } from 'meteor/meteor';
import CV from '../../../client/lib/js-aruco/cv.js';
import AR from '../../../client/lib/js-aruco/aruco.js';
import Utils from './Utils.js';

/*
 *
 * NOTE - On server, you must ensure correct browser
 * policy has been set to allow reading media from local blobs.
 *
 * e.g., in startup/server/browser-policy.js :
 *   BrowserPolicy.content.allowImageOrigin('blob:');
 *   const constructedCsp = BrowserPolicy.content._constructCsp();
 *   BrowserPolicy.content.setPolicy(constructedCsp + ' media-src blob:;');
 *
*/

let video;
let canvas;
let context;
let imageData;
let pixels;
let detector;
let debugImage;
let warpImage;
let homographyImage;
let onMarkersUpdate = (markers) => {};

let debugMode = false;
let flipCamera = false;

const color1 = '#ffd847'; // Gold
const color2 = '#f58277'; // Salmon
const color3 = '#6dc2e8'; // Light blue
const color4 = '#07b6ca'; // Turqoise
const color5 = '#9178ea'; // Purple

// Corner pts for target quad
let targetQuadDragIndex = -1;
let targetQuad = [
                    {x:15, y:10},
                    {x:300, y:10},
                    {x:300, y:220},
                    {x:15, y:220},
                  ];

export const initCamera = () => {

  console.log('ArCamera: initCamera()');

  video = document.getElementById('debug-video');
  canvas = document.getElementById('debug-canvas');
  context = canvas.getContext('2d');

  video.width = 320;
  video.height = 240;

  canvas.width = parseInt(canvas.style.width);
  canvas.height = parseInt(canvas.style.height);

  // Gather all available cameras
  navigator.mediaDevices.enumerateDevices().then(onGatherDevices);

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  if (navigator.getUserMedia) {

    function successCallback(stream) {
        if (window.webkitURL) {
          video.src = window.webkitURL.createObjectURL(stream);
        } else if (video.mozSrcObject !== undefined) {
          video.mozSrcObject = stream;
        } else {
          video.src = stream;
        }
      }

    function errorCallback(error) {
      console.log('ERROR', error);
    }

    navigator.getUserMedia({video:true}, successCallback, errorCallback);

    imageData = context.getImageData(0, 0, video.width, video.height);
    pixels = [];
    detector = new AR.Detector();

    debugImage = context.createImageData(video.width, video.height);
    warpImage = context.createImageData(49, 49);
    homographyImage = new CV.Image();

    requestAnimationFrame(tick);

  }

  // Listen for checkbox changes
  // TODO: This should go into ArDebug.js, where
  // it can set a session variable.
  const invertCB = document.getElementById('invert');
  invertCB.addEventListener('change', function() {

    detector.invertDetection = invertCB.checked;

  });

  const flipCamCB = document.getElementById('flip-input');
  flipCamCB.addEventListener('change', function() {

    flipCamera = flipCamCB.checked;

  });

  const flipOutCB = document.getElementById('flip-output');
  flipOutCB.addEventListener('change', function() {

    Session.set('flip-output-h', flipOutCB.checked);

  });

  // Listen for target quad clicks
  canvas.addEventListener('mousedown', function(event) {

    const mousePos = getCanvasMousePos(canvas, event);

    // Check for corner drag
    // on target quad
    for (var i = 0; i < targetQuad.length; i++) {
      let pt = targetQuad[i];
      const dist = Utils.distCalc(mousePos.x, mousePos.y, pt.x, pt.y);
      if (dist < 10) {
        console.log('start drag. corner index', i);
        targetQuadDragIndex = i;
        break;
      }
    }

    // Did not start drag.
    // log output coordinate
    console.log('pt click:');
    console.log(mousePos);

    const mappedPos = Utils.mapPointFromQuad(mousePos, targetQuad[0], targetQuad[1], targetQuad[2], targetQuad[3]);
    console.log('mapped pt: ');
    console.log(mappedPos);

  });

  // Listen for mouse move to update drags
  canvas.addEventListener('mousemove', function(event) {

    // Update target quad
    // if currently dragging.
    if (targetQuadDragIndex >= 0) {

      const mousePos = getCanvasMousePos(canvas, event);
      targetQuad[targetQuadDragIndex].x = mousePos.x;
      targetQuad[targetQuadDragIndex].y = mousePos.y;

    }

  });

  // Listen for mouse up to end drags
  canvas.addEventListener('mouseup', function(event) {

    targetQuadDragIndex = -1;

  });

};

const onGatherDevices = (deviceInfos) => {

  const targetDeviceName = 'FaceTime HD Camera'; // temp

  for (var i = 0; i !== deviceInfos.length; ++i) {

    var deviceInfo = deviceInfos[i];

    if (deviceInfo.kind === 'videoinput') {

      console.log('videoinput option::', i, deviceInfo);

      // Use usb camera if available
      if (deviceInfo.label.indexOf(targetDeviceName) != -1) {

        console.log('Found target cam:', targetDeviceName);

        cameraToUse = deviceInfo;
        break;

      }

    }
  }
}

const tick = () => {

  requestAnimationFrame(tick);

  if (video.readyState === video.HAVE_ENOUGH_DATA) {

    snapshot();

    var markers = detector.detect(imageData);

    // TEMP. Should we go ahead and calculate
    // center points, rotation, and mapped QuadPts here??
    calcDisplayMetas(markers);

    if (debugMode == true) {
      // TODO: these could be individually toggleable
      drawDebug();
      drawCorners(markers);
      drawId(markers);
      listMarkers(markers);
      drawTargetQuad();

    }

    // Update external markers.
    onMarkersUpdate(markers);

  }

};

const snapshot = () => {

  if (flipCamera) {
    context.translate(video.width, 0);
    context.scale(-1, 1);
  }

  context.drawImage(video, 0, 0, video.width, video.height);

  if (flipCamera) {
    context.scale(-1, 1);
    context.translate(-video.width, 0);
  }

  imageData = context.getImageData(0, 0, video.width, video.height);

};

const getCanvasMousePos = (canvas, evt) => {

  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };

};

// Prep the markers with extra information
// that will be useful on the poster display.
const calcDisplayMetas = (markers) => {

  let corners;
  let i;
  let cX;
  let cY;
  let rot;
  let center;
  let quadPos;

  for (i = 0; i !== markers.length; ++i) {

    corners = markers[i].corners;

    // Calc center point of corners
    cX = (corners[0].x + corners[2].x) * 0.5;
    cY = (corners[0].y + corners[2].y) * 0.5;

    center = {x:cX,y:cY};

    quadPos = Utils.mapPointFromQuad(center, targetQuad[0], targetQuad[1], targetQuad[2], targetQuad[3]);

    // Calc rotation of top two corners
    // TODO: Does this rotation need to use
    // quad-mapped points to be accurate???
    rot = Math.atan2(corners[1].y - corners[0].y, corners[1].x - corners[0].x) * 180 / Math.PI;

    markers[i].center = center;
    markers[i].rot = rot;
    markers[i].quadPos = quadPos;

  }

};

const drawTargetQuad = () => {

  // Draw target quad

  context.strokeStyle = color2;
  context.lineWidth = 3;

  context.beginPath();
  context.moveTo(targetQuad[0].x, targetQuad[0].y);
  context.lineTo(targetQuad[1].x, targetQuad[1].y);
  context.lineTo(targetQuad[2].x, targetQuad[2].y);
  context.lineTo(targetQuad[3].x, targetQuad[3].y);
  context.closePath();
  context.stroke();

  context.strokeRect(targetQuad[0].x, targetQuad[0].y, -4, -4);
  context.strokeRect(targetQuad[1].x, targetQuad[1].y, 4, -4);
  context.strokeRect(targetQuad[2].x, targetQuad[2].y, 4, 4);
  context.strokeRect(targetQuad[3].x, targetQuad[3].y, -4, 4);

  context.lineWidth = 1;

};

const drawDebug = () => {
  const width = video.width;
  const height = video.height;

  context.clearRect(0, 0, canvas.width, canvas.height);

  context.putImageData(imageData, 0, 0);
  context.putImageData(createImage(detector.grey, debugImage), width, 0);
  context.putImageData(createImage(detector.thres, debugImage), width * 2, 0);

  drawContours(detector.contours, 0, height, width, height, function(hole) {return hole ? color5 : color1;});

  drawContours(detector.polys, width, height, width, height, function() {return color5;});

  drawContours(detector.candidates, width * 2, height, width, height, function() {return color2;});

  drawWarps(detector.grey, detector.candidates, 0, height * 2 + 20);

};

const drawContours  = (contours, x, y, width, height, fn) => {
  let i = contours.length;
  let j;
  let contour;
  let point;

  while (i--) {
    contour = contours[i];

    context.strokeStyle = fn(contour.hole);
    context.beginPath();

    for (j = 0; j < contour.length; ++j) {
      point = contour[j];
      context.moveTo(x + point.x, y + point.y);
      point = contour[(j + 1) % contour.length];
      context.lineTo(x + point.x, y + point.y);
    }

    context.stroke();
    context.closePath();
  }
};

const drawWarps  = (imageSrc, contours, x, y) => {
  let i = contours.length;
  let j;
  let contour;

  const offset = (canvas.width - ((warpImage.width + 10) * contours.length)) / 2;
  while (i--) {
    contour = contours[i];

    CV.warp(imageSrc, homographyImage, contour, warpImage.width);
    context.putImageData(createImage(homographyImage, warpImage), offset + i * (warpImage.width + 10), y);

    CV.threshold(homographyImage, homographyImage, CV.otsu(homographyImage));
    context.putImageData(createImage(homographyImage, warpImage), offset + i * (warpImage.width + 10), y + 60);
  }
};

const drawCorners  = (markers) => {

  let corners;
  let corner;
  let i;
  let j;

  context.lineWidth = 3;

  for (i = 0; i !== markers.length; ++i) {
    corners = markers[i].corners;

    context.strokeStyle = color1;
    context.beginPath();

    for (j = 0; j !== corners.length; ++j) {
      corner = corners[j];
      context.moveTo(corner.x, corner.y);
      corner = corners[(j + 1) % corners.length];
      context.lineTo(corner.x, corner.y);
    }

    context.stroke();
    context.closePath();

    context.strokeStyle = color5;
    context.strokeRect(corners[0].x - 2, corners[0].y - 2, 4, 4);
  }
};

const drawId = (markers) => {
  let corners;
  let corner;
  let x;
  let y;
  let i;
  let j;

  context.strokeStyle = color2;
  context.lineWidth = 1;
  context.font = '10px Helvetica';

  for (i = 0; i !== markers.length; ++i) {
    corners = markers[i].corners;

    x = Infinity;
    y = Infinity;

    for (j = 0; j !== corners.length; ++j) {
      corner = corners[j];

      x = Math.min(x, corner.x);
      y = Math.min(y, corner.y);
    }

    context.strokeText(markers[i].id, x, y);

  }
};

const createImage = (src, dst) => {
  let i = src.data.length;
  let j = (i * 4) + 3;

  while (i--) {
    dst.data[j -= 4] = 255;
    dst.data[j - 1] = dst.data[j - 2] = dst.data[j - 3] = src.data[i];
  }

  return dst;
};

const listMarkers = (markers) => {

  context.fillStyle = color1;
  context.font = '40px Helvetica';

  for (let i = 0; i < markers.length; i++) {
    context.fillText(markers[i].id + ', ', i * 64, canvas.height - 64);
  }

};

/* Utils */
export let getCamDimensions = function() {

  return {width:video.width, height:video.height};

};

export const toggleDebugMode = function(value) {

  debugMode = value;

};

/* Callbacks */
export let setMarkerUpdateCallback = function(func) {

  onMarkersUpdate = func;

};

const arCam = {
  initCamera,
  getCamDimensions,
  toggleDebugMode,
  setMarkerUpdateCallback,
};

export default arCam;
