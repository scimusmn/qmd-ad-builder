/* eslint-disable max-len, no-return-assign */

import { Meteor } from 'meteor/meteor';
import React from 'react';

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
      console.log(ad);

      return ad;

    } else {
      return {imgURL:'no-url', timestamp:-1, slug:'no-slug'};
    }

  }


  render() {

    const curAd = this.getCurrentAd();

    return <div className='ad-carousel'>
              <img src={ curAd.imgURL } width='420px'/>
              <p>Created: { curAd.timestamp } </p>
              <p>To share go to: { curAd.slug }</p>

           </div>;
  }
}

AdCarousel.propTypes = {
  savedAds: React.PropTypes.array,
};
