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
    this.restartX = 0;
    this.restartSecs = 0;

    this.cabooseOnTheTrain = this.cabooseOnTheTrain.bind(this);

  }

  componentDidMount() {

    console.log('AdCarousel:componentDidMount()');
    this.chooChooHereComesTheSlideTrain();

    this.transitionIn();

  }

  componentWillUnmount() {

    // Stop all tweens
    // and timers.
    console.log('AdCarousel:componentWillUnmount()');

    this.transitionOut();

  }

  transitionIn() {

    TweenMax.set($('.ad-carousel'), {bottom: -600});
    TweenMax.to($('.ad-carousel'), 0.75, {bottom: 112, ease:Power3.easeOut});

  }

  transitionOut() {

    TweenMax.to($('.ad-carousel'), 0.75, {bottom: -600, ease:Power3.easeOut});

  }

  chooChooHereComesTheSlideTrain() {

    const count = this.props.savedAds.length;
    this.currentSlideIndex++;

    if (this.currentSlideIndex >= count) {
      this.currentSlideIndex = 0;
    }

    const $allSlides = $('.ad-carousel .fade-slide');

    this.restartX = this.props.offscreenX + (this.props.slideSpacing * $allSlides.length);
    if (this.restartX < 1920) {
      this.restartX = 1920;
    }

    const amountOfPixelsToTravel = this.restartX - this.props.offscreenX;
    const secs = amountOfPixelsToTravel * this.props.secsPerPixel;
    this.restartSecs = amountOfPixelsToTravel * this.props.secsPerPixel;

    const _this = this;

    $allSlides.each(function(index) {

      const xPos = (_this.props.slideSpacing * index) + _this.props.initialOffset;

      const amountOfPixelsToTravel = xPos - _this.props.offscreenX;
      const secs = amountOfPixelsToTravel * _this.props.secsPerPixel;

      TweenMax.set($(this), {x:xPos});
      TweenMax.to($(this), secs, {delay: 1.0, x: _this.props.offscreenX, ease: Linear.easeNone, onComplete: _this.cabooseOnTheTrain, onCompleteParams:[$(this)]});

    });

  }

  cabooseOnTheTrain(element) {

    TweenMax.from(element, this.restartSecs, {x:this.restartX, ease:Linear.easeNone, onComplete: this.cabooseOnTheTrain, onCompleteParams:[element]});

  }

  renderSlideShow() {

    if (this.props.savedAds.length == 0) return null;

    const slides = this.props.savedAds.map((ad, index) =>

        <div key={index} className={('fade-slide slide-' + index + ' ' + ad.genre)}>
          <div className='slide-container'>
            <img src={ ad.imgURL }/>
            <p>Created {moment(ad.timestamp, 'x').fromNow()}</p>
          </div>
        </div>

      );

    return <div className='fade-slider'>
              {slides}
            </div>;

  }

  render() {

    return <div className='ad-carousel'>

            { this.renderSlideShow() }
            <div className='vignette-overlay'></div>

          </div>;

  }
}

AdCarousel.propTypes = {

  savedAds: React.PropTypes.array,
  offscreenX: React.PropTypes.number,
  secsPerPixel: React.PropTypes.number,
  slideSpacing: React.PropTypes.number,
  initialOffset: React.PropTypes.number,

};

AdCarousel.defaultProps = {

  offscreenX: -1000,
  secsPerPixel: 0.015,
  slideSpacing: 656,
  initialOffset: 636,

};

