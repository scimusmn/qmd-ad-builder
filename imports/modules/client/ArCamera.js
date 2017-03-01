/* eslint-disable consistent-return */

import { Meteor } from 'meteor/meteor';
import CV from '../../../client/lib/js-aruco/cv.js';
import AR from '../../../client/lib/js-aruco/aruco.js';

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

var video, camera, canvas, context, imageData, pixels, detector;
var debugImage, warpImage, homographyImage;

export const initCamera = () => {

  console.log('ArCamera: initCamera()');

  video = document.getElementById('debug-video');
  canvas = document.getElementById('debug-canvas');
  context = canvas.getContext('2d');

  video.width = 320;
  video.height = 240;

  canvas.width = parseInt(canvas.style.width);
  canvas.height = parseInt(canvas.style.height);

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
      }

    navigator.getUserMedia({video:true}, successCallback, errorCallback);

    imageData = context.getImageData(0, 0, video.width, video.height);
    pixels = [];
    detector = new AR.Detector();

    debugImage = context.createImageData(video.width, video.height);
    warpImage = context.createImageData(49, 49);
    homographyImage = new CV.Image();

    console.log('---');
    console.log(video);

    requestAnimationFrame(tick);
  }

  // Listen for checkbox changes
  var invertCB = document.getElementById('invert');
  invertCB.addEventListener('change', function() {

    if (invertCB.checked) {
      detector.invertDetection = true;
    } else {
      detector.invertDetection = false;
    }

  });

}

const tick = () => {

  requestAnimationFrame(tick);

  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    snapshot();

    var markers = detector.detect(imageData);
    drawDebug();
    drawCorners(markers);
    drawId(markers);
  }

};

const snapshot = () => {

  context.drawImage(video, 0, 0, video.width, video.height);
  imageData = context.getImageData(0, 0, video.width, video.height);

};

const drawDebug = () => {
  const width = video.width;
  const height = video.height;

  context.clearRect(0, 0, canvas.width, canvas.height);

  context.putImageData(imageData, 0, 0);
  context.putImageData(createImage(detector.grey, debugImage), width, 0);
  context.putImageData(createImage(detector.thres, debugImage), width * 2, 0);

  drawContours(detector.contours, 0, height, width, height, function(hole) {return hole ? 'magenta' : 'blue';});

  drawContours(detector.polys, width, height, width, height, function() {return 'green';});

  drawContours(detector.candidates, width * 2, height, width, height, function() {return 'red';});

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
  var corners, corner, i, j;

  context.lineWidth = 3;

  for (i = 0; i !== markers.length; ++i) {
    corners = markers[i].corners;

    context.strokeStyle = 'red';
    context.beginPath();

    for (j = 0; j !== corners.length; ++j) {
      corner = corners[j];
      context.moveTo(corner.x, corner.y);
      corner = corners[(j + 1) % corners.length];
      context.lineTo(corner.x, corner.y);
    }

    context.stroke();
    context.closePath();

    context.strokeStyle = 'green';
    context.strokeRect(corners[0].x - 2, corners[0].y - 2, 4, 4);
  }
};

const drawId = (markers) => {
  var corners, corner, x, y, i, j;

  context.strokeStyle = 'blue';
  context.lineWidth = 1;

  for (i = 0; i !== markers.length; ++i) {
    corners = markers[i].corners;

    x = Infinity;
    y = Infinity;

    for (j = 0; j !== corners.length; ++j) {
      corner = corners[j];

      x = Math.min(x, corner.x);
      y = Math.min(y, corner.y);
    }

    context.strokeText(markers[i].id, x, y)
  }
};

const createImage = (src, dst) => {
  var i = src.data.length, j = (i * 4) + 3;

  while (i--) {
    dst.data[j -= 4] = 255;
    dst.data[j - 1] = dst.data[j - 2] = dst.data[j - 3] = src.data[i];
  }

  return dst;
};

const arCam = {
  initCamera:initCamera,
};

export default arCam;
