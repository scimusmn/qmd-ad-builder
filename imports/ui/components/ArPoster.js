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
    // Populated on mount.
    this.items = {};

    this.activeMarkers = [];

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
      const $item = $('#' + itemId);

      this.items[key] = { id:itemId,
                          target:$item,
                          active:false,
                          deadCount:0,
                        };

      // Hide
      TweenMax.set($item, {opacity:0.0});

    }

    console.log('--==poster items==--');;
    console.dir(this.items);

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
    let itemId;
    let topDelta = -1;
    let topDeltaId = -1;

    for (i = 0; i !== markers.length; ++i) {

      marker = markers[i];

      // Check if beaten record for
      // top movement this cycle.
      if (marker.delta > topDelta) {
        topDelta = marker.delta;
        topDeltaId = marker.id;
      }

      // CLEANUP: This check
      // shouldn't be necessary once
      // only using a set num
      // of marker ids.
      if (this.lookup[marker.id]) {

        itemId = this.lookup[marker.id];
        if (marker.highlight == true) {
          console.log('highlight:', itemId);
        }

        this.updateItemDisplay(itemId, markers[i]);
      }

    }

    // After checking all markers,
    // mark which had top movement.
    if (topDeltaId >= 0 && topDelta > 20) {
      // Only make a change if delta is larger
      // than X. Prevents unintentional highlight
      // jittering when everything is resting.

      // markers[topDeltaId].highlight = true;
      // prevTopDeltaId = topDeltaId;

      console.log('highlight:', this.lookup[topDeltaId]);
    } else {
      // Leave previous highlight
      // markers[topDeltaId].highlight = true;
    }

  }

  updateItemDisplay(id, mark) {

    // TODO: should pre-populate a dictionary with all jquery targets...
    // Do not lookup by string id every tick.
    const $item = $('#' + id);

    // Calculate item's position
    // on poster with current settings.
    let x = mark.center.x;
    let y = mark.center.y;

    // Emsure position is within
    // target quad. (quadPos will be -1 otherwise)
    if (mark.quadPos.x >= 0) {

      x = mark.quadPos.x * this.posterWidth;
      y = mark.quadPos.y * this.posterHeight;

      if (Session.get('flip-output-h') == true) {
        x = this.posterWidth - x;
      }

    } else {

      console.log('Marker "' + id + '" is outside target quad. Do not update.');
      return;

    }

    // Appending '_short' tells tween to choose
    // direction of shortest distance.
    const rotation = -mark.rot + '_short';

    // If item isn't already
    // 'active', activate.
    if (Utils.arrayContainsId(this.activeMarkers, mark.id) == false) {
      // TODO: the above conditional should eventually be something like:
      // if (this.items[id].isActive == false) {
      // instead of adding/removeing items in realtime, should just
      // track state of each item, and update display accordingly

      this.activeMarkers.push({id:mark.id, deadCount:0});

      // $('#' + id).show();

      TweenMax.killTweensOf($item);
      TweenMax.set($item, {opacity:1.0, scale: 1.0, x:x, y:y, rotation:rotation});
      TweenMax.from($item, 0.2, {opacity:0.0, scale:1.45});

    } else {

      // Already showing, only need to update.
      // Smooth between current position
      // and target position...
      TweenMax.to($item, 0.2, {x:x, y:y, rotation:rotation});

      if (mark.highlight == true) {
        TweenMax.set($item.find('img'), {backgroundColor:'yellow'});
      } else {
        TweenMax.set($item.find('img'), {backgroundColor:'rgba(255,255,100,0.0)'});
      }

    }

  }

  // Remove items whose markers
  // have no-showed for X cycles.
  updateLifeCycles(markers) {

    for (let i = this.activeMarkers.length - 1; i >= 0; i--) {

      // Is this marker still active
      // according to current batch of
      // incoming marker objects?
      const isActive = Utils.arrayContainsId(markers, this.activeMarkers[i].id);

      if (isActive == true) {

        this.activeMarkers[i].deadCount = 0;

      } else {

        this.activeMarkers[i].deadCount++;

        if (this.activeMarkers[i].deadCount > 100) {
          // Marker has been MIA for a while now,
          // let's assume the user has intentionally
          // removed it from the poster and remove.

          const itemId = this.lookup[this.activeMarkers[i].id];
          const $item = $('#' + itemId);

          // $item.hide();

          TweenMax.killTweensOf($item);
          TweenMax.to($item, 0.15, { scale: 0.6, opacity:0.0});

          this.activeMarkers.splice(i, 1);
        }

      }

    }

  }

  isMarkerActive(testId, markers) {

    for (i = 0; i !== markers.length; ++i) {

      if (markers[i].id == testId) {
        return true;
      }

    }

    return false;

  }

  render() {

    return <div className='ar-poster'>

              <div id='headline' className='item'>
                <img src='images/headline0.png'/>
              </div>

              <div id='quote' className='item'>
                <img src='images/quote0.png'/>
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
