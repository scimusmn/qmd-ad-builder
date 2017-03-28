/* eslint-disable max-len, no-return-assign */

import { Meteor } from 'meteor/meteor';
import React from 'react';
import arCam from '../../modules/client/ArCamera';
import Utils from '../../modules/client/Utils';
import TweenMax from 'gsap';
import html2canvas from 'html2canvas';

export class ArPoster extends React.Component {

  constructor(props) {

    super(props);

    this.state = {

    };

    // Dictionary to find
    // item ids from marker ids.
    this.lookup = {
      343:{ id:'name', label:'(Suspicious) Name' },
      672:{ id:'details', label:'(The devil\'s in the...)  details' },
      1019:{ id:'claim', label:'(False) Claim' },
      839:{ id:'endorsement', label:'(Meaningless) Endorsement' },
      975:{ id:'image', label:'(Misleading) Images' },
      767:{ id:'flair', label:'(Attention-grabbing) Flair' },

      863:{ id:'name-modern', label:'(Suspicious) Name' },
      1023:{ id:'details-modern', label:'(The devil\'s in the...)  details' },
      383:{ id:'claim-modern', label:'(False) Claim' },
      255:{ id:'endorsement-modern', label:'(Meaningless) Endorsement' },
      991:{ id:'image-modern', label:'(Misleading) Images' },
      682:{ id:'flair-modern', label:'(Attention-grabbing) Flair' },
    };

    // Holds all poster items.
    // Dynamically populated.
    this.items = {};

    this.activeItem;

    this.inactivitySeconds = 0;

    // Bind to this instance.
    this.markerUpdate = this.markerUpdate.bind(this);

  }

  componentDidMount() {

    console.log('ArPoster::componentDidMount()');

    // Update local variables
    this.posterWidth = parseInt($('.ar-poster').css('width'));
    this.posterHeight = parseInt($('.ar-poster').css('height'));

    const camSize = arCam.getCamDimensions();
    this.wRatio = this.posterWidth / camSize.width;
    this.hRatio = this.posterHeight / camSize.height;

    arCam.setMarkerUpdateCallback(this.markerUpdate);

    // Set up all poster items and
    // ready initial display state.
    for (let key in this.lookup) {

      const itemId = this.lookup[key].id;
      const label = this.lookup[key].label;
      const $target = $('#' + itemId);
      const $image = $target.find('img');

      // TODO: Should add div to container
      // here. So

      this.items[key] = { id:itemId,
                          key:key,
                          label:label,
                          target:$target,
                          image:$image,
                          alive:false,
                          active:false,
                          deadCount:0,
                          assets:[],
                          assetIndex:0,
                          prevRot:-1,
                          prevX:-1,
                          prevY:-1,
                          scale:1.0,
                          zIndex:1,
                        };

      // Hide
      TweenMax.set($target, {opacity:0.0});

      // Get list of possible
      // assets for this item
      Meteor.call('getFiles', itemId, (error, result) => {

        if (result) {

          const item = this.items[key];

          item.assets = result;

          // Set default asset
          item.image.attr('src', item.assets[item.assetIndex]);

        }

      });

    }

    // Listen for Arrow keys
    Mousetrap.bind(['left', 'c'], () => {

      this.incrementImage(-1);
      this.resetInactivity();

    });

    Mousetrap.bind(['right', 'b'], () => {

      this.incrementImage(1);
      this.resetInactivity();

    });

    Mousetrap.bind(['s', 'a'], () => {

      this.incrementSize();
      this.resetInactivity();

    });

    Mousetrap.bind(['return return return', 'e e e'], () => {

      console.log('Save Image');

      if (this.inactivitySeconds > 5) {

        this.saveLayoutAsImage();

      }

    });

    // Start inactivity counter
    setInterval(() => {

      this.inactivitySeconds++;

      if (this.inactivitySeconds == 5) {

        // If red UI is hidden, show.
        TweenMax.to($('.ar-poster #arrows'), 0.25, {autoAlpha:0.0});

      }

    }, 1000);

  }

  componentWillUnmount() {

    // Stop all tweens
    // and timers.

  }

  markerUpdate(markers) {

    this.updateLifeCycles(markers);

    if (markers.length == 0) return;

    let i;
    let marker;
    let item;
    let itemId;
    let topDelta = -1;
    let topDeltaId = -1;

    for (i = 0; i !== markers.length; ++i) {

      // AR marker object
      marker = markers[i];

      // Poster item
      item = this.items[marker.id];

      // If marker isn't associated
      // with a poster item, ignore.
      if (!item) return;

      // Check if beaten record for
      // top movement this cycle.
      if (marker.delta > topDelta) {
        topDelta = marker.delta;
        topDeltaId = marker.id;
      }

      this.updateItemDisplay(item, marker);

    }

    // After checking all markers,
    // mark which had top movement.
    if (topDeltaId >= 0 && topDelta > 6) {
      // Only make a change if delta is larger
      // than X. Prevents unintentional highlight
      // jittering when everything is resting.

      this.setActiveItem(topDeltaId);

    }

  }

  setActiveItem(activeId) {

    // Exit early if trying
    // to set same active item.
    if (this.activeItem && this.activeItem.key == activeId) {
      return;
    }

    let item;

    for (let key in this.items) {

      item = this.items[key];

      if (key == activeId) {

        // Deal with active item.
        item.active = true;
        this.activeItem = this.items[key];

        // Z-sort active item to top
        item.zIndex = _.size(this.items) + 1;
        item.target.css('z-index', item.zIndex);

        // Move arrows into
        // active item's div
        this.activeItem.target.append($('#arrows'));

        // Update active block label
        $('#arrows #label').html(this.activeItem.label);

        // Hide no-block instructions.
        $('#intro-instruct').hide();

      } else {

        item.active = false;

        // Reduce z sorting layer.
        item.zIndex = item.zIndex - 1;
        item.target.css('z-index', item.zIndex);

      }

    }

  }

  incrementImage(incremental) {

    const numAssets = this.activeItem.assets.length;
    let index = this.activeItem.assetIndex;

    index += incremental;

    if (index > numAssets - 1) {
      index = 0;
    } else if (index < 0) {
      index = numAssets - 1;
    }

    // Update img source
    this.activeItem.assetIndex = index;
    this.activeItem.image.attr('src', this.activeItem.assets[index]);

  }

  incrementSize() {

    const currentScale = this.activeItem.scale;
    let newScale = 1.0;

    if (currentScale >= 1.4) {
      newScale = 0.6;
    } else if (currentScale >= 1.0) {
      newScale = 1.4;
    } else {
      newScale = 1.0;
    }

    this.activeItem.scale = newScale;
    TweenMax.set(this.activeItem.target, { scale: newScale });

  }

  updateItemDisplay(item, marker) {

    // Calculate item's position
    // on poster with current settings.
    let x = marker.center.x;
    let y = marker.center.y;

    // Emsure position is within
    // target quad. (quadPos will be -1 otherwise)
    if (marker.quadPos.x >= 0) {

      x = marker.quadPos.x * this.posterWidth;
      y = marker.quadPos.y * this.posterHeight;

      if (Session.get('flip-output-h') == true) {
        x = this.posterWidth - x;
      }

    } else {

      console.log('Marker "' + item.id + '" is outside target quad. Do not update.');
      return;

    }

    let rotation = -marker.rot;

    // If item isn't already
    // 'alive', show and awake.
    if (item.alive == false) {

      // New item added to workspace

      item.alive = true;
      item.deadCount = 0;

      TweenMax.killTweensOf(item.target);
      TweenMax.set(item.target, {opacity:1.0, scale: item.scale, x:x, y:y, rotation:rotation + '_short'});
      TweenMax.from(item.target, 0.2, {opacity:0.0, scale:item.scale + 0.4});

      // First asset defaults
      // to instruction blocks.
      if (this.getAliveCount() <= 1 || this.inactivitySeconds >= 20) {
        item.image.attr('src', '/images/block-instruct.png');
      } else {
        // Assume user doesn't need instructions.
        // Default to most recent asset.
        item.image.attr('src', item.assets[item.assetIndex]);
      }

    } else {

      // Here, we check to make sure the
      // display's transform has changed
      // a significant amount before applying.
      // This prevents jittering when it
      // should be static.
      if (Math.abs(item.prevRot - rotation) < 3) {
        rotation = item.prevRot;
      } else {
        // If significant change,
        // reset inactivity counter.
        this.resetInactivity();
      }

      if (Math.abs(item.prevX - x) < 3) {
        x = item.prevX;
      } else {
        this.resetInactivity();
      }

      if (Math.abs(item.prevY - y) < 3) {
        y = item.prevY;
      } else {
        this.resetInactivity();
      }

      // Snap rotation when close to 0°
      // this is to prevent frustrating
      // "close but not perfect" alignment.
      if (rotation < 3 && rotation > -3) {
        rotation = 0;
      }

      // Item already showing.
      // Smooth between current position
      // and target position...
      TweenMax.to(item.target, 0.2, {x:x, y:y, rotation:rotation + '_short'});

      // TEMP: Set arrow positions
      // based on active item's
      // size. Could be optimized
      // further. Should probably
      // not calc size each tick or
      // do jq lookup each tick
      if (item.active == true) {

        const offset = (item.image.outerWidth() + $(item.target).find('#arrows .right').outerWidth()) * 0.5;

        TweenMax.to($(item.target).find('#arrows .right'), 0.15, {left:offset});
        TweenMax.to($(item.target).find('#arrows .left'), 0.15, {left:-offset});

        const offsetTop = item.image.outerHeight() * 0.5;
        TweenMax.to($(item.target).find('#arrows #label'), 0.15, {top:-offsetTop});

      }

      // Remember transform values
      // to check for meaningful
      // change next cycle
      item.prevRot = rotation;
      item.prevX = x;
      item.prevY = y;

    }

  }

  // Remove items whose markers
  // have no-showed for X cycles.
  updateLifeCycles(markers) {

    let item;
    let hasActiveMarker;

    for (let key in this.items) {

      item = this.items[key];

      // Skip dead items.
      if (!item.alive) continue;

      // Is this marker still active
      // according to current batch of
      // incoming marker objects?
      hasActiveMarker = Utils.arrayContainsId(markers, key);

      if (hasActiveMarker == true) {

        item.deadCount = 0;

      } else {

        item.deadCount++;

        if (item.deadCount > 80) {

          // Marker has been MIA for a while now,
          // let's assume the user has intentionally
          // removed it from the poster and remove.
          TweenMax.killTweensOf(item.target);
          TweenMax.to(item.target, 0.15, { scale: item.scale - 0.3, opacity:0.0});

          item.alive = false;

          // If this item was active
          // shift, highlight to another
          // random alive item.
          const aliveItemId = this.fishAliveIDs();
          if (aliveItemId === undefined) {
            // No blocks remaining.
            // Show inactive instruction message.
            $('#intro-instruct').show();
          } else {
            this.setActiveItem(aliveItemId);
          }

        }

      }

    }

  }

  resetInactivity() {

    this.inactivitySeconds = 0;

    // If red UI is hidden, show.
    TweenMax.to($('.ar-poster #arrows'), 0.2, {autoAlpha:1.0});

  }

  fishAliveIDs() {

    for (let key in this.items) {

      if (this.items[key].alive == true) {

        return key;

      }

    }

  }

  getAliveCount() {

    let count = 0;

    for (let key in this.items) {

      if (this.items[key].alive == true) {

        count++;

      }

    }

    return count;

  }

  /**
   * Save ad layout as image.
   */
  saveLayoutAsImage() {

    // TODO: Hide anything not wanted
    // in exported image.

    // Flatten desired layers into canvas
    const renderContainer = $('.workspace')[0];

    html2canvas(renderContainer, {
      onrendered: (canvas) => {
        // Canvas is the final rendered <canvas> element
        this.handleSavedImage(canvas);
      },
    });

  }

  /**
   * Do things with saved image.
   */
  handleSavedImage(canvas) {

    const img = canvas.toDataURL('image/png');
    const blob = this.dataURItoBlob(img);

    const fileReader = new FileReader();
    const method = 'readAsBinaryString';

    fileReader.onload = function(file) {
      Meteor.call('saveImageToFile', file.srcElement.result);
    };

    fileReader[method](blob);

    // TODO: Reset advertisment.

  }

  // Converts image string
  // to image blob.
  dataURItoBlob(dataURI) {

    let byteString = atob(dataURI.split(',')[1]);
    let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    let ab = new ArrayBuffer(byteString.length);
    let ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });

  }

  render() {

    return <div className='ar-poster'>

              <div id='name' className='item'>
                <img src='#' className='asset'/>
              </div>

              <div id='details' className='item'>
                <img src='#' className='asset'/>
              </div>

              <div id='claim' className='item'>
                <img src='#' className='asset'/>
              </div>

              <div id='endorsement' className='item'>
                <img src='#' className='asset'/>
              </div>

              <div id='image' className='item'>
                <img src='#' className='asset'/>
              </div>

              <div id='flair' className='item'>
                <img src='#' className='asset'/>
              </div>

              <div id='name-modern' className='item'>
                <img src='#' className='asset'/>
              </div>

              <div id='details-modern' className='item'>
                <img src='#' className='asset'/>
              </div>

              <div id='claim-modern' className='item'>
                <img src='#' className='asset'/>
              </div>

              <div id='endorsement-modern' className='item'>
                <img src='#' className='asset'/>
              </div>

              <div id='image-modern' className='item'>
                <img src='#' className='asset'/>
              </div>

              <div id='flair-modern' className='item'>
                <img src='#' className='asset'/>
              </div>

              <div id='arrows'>
                <h3 id='label'>(Block) Label Here</h3>
                <img src='images/arrow.png' className='right'/>
                <img src='images/arrow.png' className='left'/>
              </div>

              <div id='intro-instruct' className='center-overlay'>
                <img src='images/intro-instruct.png'/>
              </div>

          </div>;
  }
}

ArPoster.propTypes = {

};
