/* eslint-disable max-len, no-return-assign */

import React from 'react';
import arCam from '../../modules/client/ArCamera';
import TweenMax from 'gsap';
import Utils from '../../modules/client/Utils';

export class ArPoster extends React.Component {

  constructor(props) {

    super(props);

    this.state = {

    };

    // Dictionary to find
    // item ids from marker ids.
    // TODO: Once all lookup ids
    // are added here. Create official
    // marker print docs for this project
    // and add to repo. Also, use the
    // lookup dict to loop through
    // on mount and pre find all jquery
    // objects. (e.g., 6:$('#headline'));
    this.lookup = {
      5:'headline',
      6:'quote',
      255: 'name',
      991: 'details',
      383: 'claim',
      767: 'endorsement',
      682: 'image',
    };

    // Holds all poster items.
    // Dynamically populated.
    this.items = {};

    this.activeItem;

    // Bind to 'this'
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

      const itemId = this.lookup[key];
      const $target = $('#' + itemId);
      const $image = $target.find('img');

      this.items[key] = { id:itemId,
                          target:$target,
                          image:$image,
                          alive:false,
                          active:false,
                          deadCount:0,
                        };

      // Hide
      TweenMax.set($target, {opacity:0.0});

    }

    // Listen for Arrow keys
    Mousetrap.bind('left', () => {

      this.incrementImage(-1);

    });

    Mousetrap.bind('right', () => {

      this.incrementImage(1);

    });

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
    if (topDeltaId >= 0 && topDelta > 10) {
      // Only make a change if delta is larger
      // than X. Prevents unintentional highlight
      // jittering when everything is resting.

      this.updateActiveItem(topDeltaId);

    }

  }

  updateActiveItem(activeId) {

    let item;

    for (let key in this.items) {

      item = this.items[key];

      if (key == activeId) {
        item.active = true;
        this.activeItem = this.items[key];
        // TweenMax.set(item.image, {backgroundColor:'rgba(255,255,100,0.5)'});
        TweenMax.set(item.image, {borderColor:'rgba(255,5,5,0.6)'});
      } else {
        item.active = false;
        // TweenMax.set(item.image, {backgroundColor:'rgba(255,255,100,0.0)'});
        TweenMax.set(item.image, {borderColor:'rgba(255,255,100,0.0)'});
      }

    }

  }

  incrementImage(incremental) {

    this.activeItem.image.attr('src', newSrc);

    // TODO: This hacky string manip works for now,
    // but should be replaced with a system that collects
    // all image paths for an item on init,
    // then stores as part of the item object.
    // item.assets = ['name_01.png','name_02.png','name_03.png'];

    const curSrc = this.activeItem.image.attr('src');
    const targetIndex = curSrc.length - 5;

    let numId = curSrc.charAt(targetIndex);
    numId = parseInt(numId);
    numId += incremental;

    if (numId > 6) {
      numId = 1;
    } else if (numId < 1) {
      numId = 6;
    }

    const newSrc = curSrc.substr(0, targetIndex) + numId + curSrc.substr(targetIndex + 1);

    // Update img source
    this.activeItem.image.attr('src', newSrc);

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

    // Appending '_short' tells tween to choose
    // direction of shortest distance.
    const rotation = -marker.rot + '_short';

    // If item isn't already
    // 'alive', show and awake.
    if (item.alive == false) {

      item.alive = true;
      item.deadCount = 0;

      TweenMax.killTweensOf(item.target);
      TweenMax.set(item.target, {opacity:1.0, scale: 1.0, x:x, y:y, rotation:rotation});
      TweenMax.from(item.target, 0.2, {opacity:0.0, scale:1.45});

    } else {

      // Item already showing.
      // Smooth between current position
      // and target position...
      TweenMax.to(item.target, 0.2, {x:x, y:y, rotation:rotation});

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

        if (item.deadCount > 100) {

          // Marker has been MIA for a while now,
          // let's assume the user has intentionally
          // removed it from the poster and remove.
          TweenMax.killTweensOf(item.target);
          TweenMax.to(item.target, 0.15, { scale: 0.6, opacity:0.0});

          item.alive = false;

          // If this item was active
          // shift, highlight to another
          // random alive item.
          const aliveItemId = this.fishAliveIDs();
          this.updateActiveItem(aliveItemId);

        }

      }

    }

  }

  fishAliveIDs() {

    for (let key in this.items) {

      if (this.items[key].alive == true) {

        return key;

      }

    }

  }

  render() {

    return <div className='ar-poster'>

              <div id='headline' className='item'>
                <img src='images/headline_01.png'/>
              </div>

              <div id='quote' className='item'>
                <img src='images/quote_01.png'/>
              </div>

              <div id='name' className='item'>
                <img src='images/name_01.png'/>
              </div>

              <div id='details' className='item'>
                <img src='images/details_01.png'/>
              </div>

              <div id='claim' className='item'>
                <img src='images/claim_01.png'/>
              </div>

              <div id='endorsement' className='item'>
                <img src='images/endorsement_01.png'/>
              </div>

              <div id='image' className='item'>
                <img src='images/image_01.png'/>
              </div>

          </div>;
  }
}

ArPoster.propTypes = {

};
