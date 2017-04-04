/* eslint-disable max-len, no-return-assign */

import { Meteor } from 'meteor/meteor';
import React from 'react';
import moment from 'moment';

export class AdCarousel extends React.Component {

  constructor(props) {

    super(props);

    this.state = {

    };

  }

  componentDidMount() {

  }

  componentWillUnmount() {

    // Stop all tweens
    // and timers.

  }

  getCurrentAd() {

    if (this.props.savedAds && this.props.savedAds.length != 0) {

      const ad = this.props.savedAds[0];

      ad.timestampLabel = moment(ad.timestamp).format('MMMM Do YYYY, h:mm a');

      // TODO: If created today, show format "Create XX hours and XX minutes ago."

      return ad;

    } else {
      return {imgURL:'no-url', timestamp:-1, slug:'no-slug'};
    }

  }

  render() {

    const curAd = this.getCurrentAd();

    return <div className='ad-carousel'>

              <img src={ curAd.imgURL } height='600px'/>
              <img src='images/placard-frame.png'/>
              <p className='time'>Created <span className='highlight'>{ curAd.timestampLabel }</span>.</p>
              {/* <p className='slug'>View online at <span className='highlight'> www.smm.org/{ curAd.slug }</span> (Coming soon)</p> */}

           </div>;
  }
}

AdCarousel.propTypes = {
  savedAds: React.PropTypes.array,
};
