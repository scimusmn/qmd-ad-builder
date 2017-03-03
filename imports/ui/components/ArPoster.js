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

    let i;
    let itemId;

    for (i = 0; i !== markers.length; ++i) {

      corners = markers[i].corners;

      // CLEANUP: This defaulting to 5
      // shouldn't be necessary once
      // only using a set num
      // of marker ids.
      if (this.lookup[markers[i].id]) {
        itemId = this.lookup[markers[i].id];
      } else {
        itemId = this.lookup[5];
      }

      this.updateItem(itemId, markers[i]);

    }

  }

  updateItem(id, mark) {

    let x = mark.center.x;
    let y = mark.center.y;

    // console.log('updateItem:', id, mark.quadPos.x, mark.quadPos.y);

    if (mark.quadPos.x >= 0) {
      x = mark.quadPos.x * this.posterWidth;
      y = mark.quadPos.y * this.posterHeight;
    } else {
      x = x * this.wRatio;
      x = y * this.wRatio;
    }

    // Appending '_short' tells tween to choose
    // direction of shortest distance.
    const rotation = -mark.rot + '_short';
    console.log('rotation:', rotation);

    // TODO: should pre-populate a dictionary with all jquery targets...
    // Do not lookup by string id every tick.
    TweenMax.to($('#' + id), 0.2, {x:x, y:y, rotation:rotation});

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
