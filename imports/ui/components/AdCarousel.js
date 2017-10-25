/* eslint-disable max-len, no-return-assign */

import { Meteor } from 'meteor/meteor';
import React from 'react';
import moment from 'moment';

import Slider from 'react-slick';
import TweenMax from 'gsap';

export class AdCarousel extends React.Component {

  constructor(props) {

    super(props);

    this.state = {

    };

    this.slideshowTimer = {};
    this.currentSlideIndex = 0;

  }

  componentDidMount() {
    this.slideshowTimer = setInterval(() => {
      this.nextSlide();
    }, 7000);
  }

  componentWillUnmount() {

    // Stop all tweens
    // and timers.

  }

  nextSlide() {

    const count = this.props.savedAds.length;
    this.currentSlideIndex++;

    if (this.currentSlideIndex >= count) {
      this.currentSlideIndex = 0;
    }

    $('.ad-carousel .fade-slide').removeClass('active');
    $('.ad-carousel .slide-' + this.currentSlideIndex).addClass('active');

  }

  renderSlideShow() {

    if (this.props.savedAds.length == 0) return null;

    const slides = this.props.savedAds.map((ad, index) =>

        <div key={index} className={('fade-slide slide-' + index)}>
          <img src={ ad.imgURL } className={ad.genre}/>
          <p>Created {moment(ad.timestamp, 'x').fromNow()}</p>
        </div>

      );

    return <div className='fade-slider'>
              {slides}
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
