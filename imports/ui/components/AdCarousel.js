/* eslint-disable max-len, no-return-assign */

import { Meteor } from 'meteor/meteor';
import React from 'react';
import moment from 'moment';

import Slider from 'react-slick';
import TweenMax from 'gsap';

import '../../../node_modules/slick-carousel/slick/slick.css';
import '../../../node_modules/slick-carousel/slick/slick-theme.css';

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

  componentWillUpdate(nextProps, nextState) {

    console.log('Feature new add:');
    console.log(nextProps.savedAds[0].slug);

    this.refs.slider.slickGoTo(0);

    TweenMax.from('.ad-carousel', 3.0, { opacity: 0.01, ease:Power3.EaseIn});

  }

  getCurrentAd() {

    if (this.props.savedAds && this.props.savedAds.length != 0) {

      const ad = this.props.savedAds[0];

      ad.timestampLabel = getTimeLabel(ad.timestamp);

      return ad;

    } else {
      return {imgURL:'no-url', timestamp:-1, slug:'no-slug'};
    }

  }

  getTimeLabel(time) {

    // TODO: If created today, show format "Create XX hours and XX minutes ago."
    return moment(time).format('MMMM Do YYYY, h:mm a');

  }

  renderSlideShow() {

    const settings = {
      dots: false,
      arrows: false,
      infinite: true,
      speed: 500,
      autoplay: true,
      autoplaySpeed: 11000,
    };

    const slides = this.props.savedAds.map((ad, index) =>

        <div key={index}>
          <img src={ ad.imgURL } />
          {/* <h3>{index} | {this.getTimeLabel(ad.timestamp)} | {ad.slug} | {ad.imgURL}</h3> */}
        </div>

      );

    return <Slider ref='slider' {...settings}>
              {slides}
            </Slider>;

  }

  renderFeatured() {

    const curAd = this.getCurrentAd();

    return <div>
              <img src={ curAd.imgURL } height='600px'/>
                <img src='images/placard-frame.png'/>
                <p className='time'>Created <span className='highlight'>{ curAd.timestampLabel }</span>.</p>
                {/* <p className='slug'>View online at <span className='highlight'> www.smm.org/{ curAd.slug }</span> (Coming soon)</p> *//* <p className='slug'>View online at <span className='highlight'> www.smm.org/{ curAd.slug }</span> (Coming soon)</p> */}/* <p className='slug'>View online at <span className='highlight'> www.smm.org/{ curAd.slug }</span> (Coming soon)</p> */}/* <p className='slug'>View online at <span className='highlight'> www.smm.org/{ curAd.slug }</span> (Coming soon)</p> */}/* <p className='slug'>View online at <span className='highlight'> www.smm.org/{ curAd.slug }</span> (Coming soon)</p> */}/* <p className='slug'>View online at <span className='highlight'> www.smm.org/{ curAd.slug }</span> (Coming soon)</p> */}
              </div>;

  }

  render() {

    return <div className='ad-carousel'>
              {this.renderSlideShow()}
            </div>;
  }
}

AdCarousel.propTypes = {
  savedAds: React.PropTypes.array,
};
