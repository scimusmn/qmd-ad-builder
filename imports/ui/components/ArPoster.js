/* eslint-disable max-len, no-return-assign */

import React from 'react';
import arCam from '../../modules/client/ArCamera';
import TweenMax from 'gsap';

export class ArPoster extends React.Component {

  constructor(props) {

    super(props);

    this.state = {

    };

    // Dictionary to find
    // item ids from marker ids.
    this.lookup = {
      5:'headline',
      6:'quote',
    };

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

  }

  componentWillUnmount() {

    // Stop all tweens
    // and timers.

  }

  markerUpdate(markers) {

    if (markers.length == 0) return;

    // console.log(markers);

    let corners;
    let i;
    let cX;
    let cY;
    let rot;
    let itemId;

    for (i = 0; i !== markers.length; ++i) {

      corners = markers[i].corners;

      // Get center point of corners
      cX = (corners[0].x + corners[2].x) * 0.5;
      cY = (corners[0].y + corners[2].y) * 0.5;

      // Get rotation between top two corners
      rot = Math.atan2(corners[1].y - corners[0].y, corners[1].x - corners[0].x) * 180 / Math.PI;

      // CLEANUP: This check shouldn't
      // be necessary once only a set num
      // of marker ids.
      if (this.lookup[markers[i].id]) {
        itemId = this.lookup[markers[i].id];
      } else {
        itemId = this.lookup[5];
      }

/*
      var isActive = false;
      if (itemId == markers[i].id) {
        isActive = true;
      }
*/
      this.updateItem(itemId, cX, cY, rot, false);

    }

  }

  updateItem(id, x, y, rot, isActive) {

    // TODO: should pre-populate a dictionary with all jquery targets...
    // Do not lookup by string id every tick.

    TweenMax.to($('#' + id), 0.2, {x:this.posterWidth - (x * this.wRatio), y:y * this.hRatio, rotation:-rot});

    // Show object highlight
    // on this element
    if (isActive == true) {
      TweenLite.set($('#' + id).children('img'), {css:{borderColor:'#c4160a'}});
    } else {
      TweenLite.set($('#' + id).children('img'), {css:{borderColor:'rgba(0,0,0,0.4)'}});
    }

  }

  render() {

    return <div className='ar-poster'>

              <div id='headline' className='item'>
                <img src='images/headline0.png'/>
              </div>

              <div id='quote' className='item'>
                <img src='images/quote0.png'/>
              </div>

          </div>;
  }
}

ArPoster.propTypes = {

};
