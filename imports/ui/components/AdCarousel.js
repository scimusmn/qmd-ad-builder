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

  componentWillUpdate(nextProps, nextState) {

    console.log('AdCarousel.componentWillUpdate:', nextProps);

    if (this.props.savedAds.length != 0) this.refs.slider.slickGoTo(0);

    // TweenMax.from('.ad-carousel', 3.0, { opacity: 0.01, ease:Power3.EaseIn});

  }

  renderSlideShow() {

    if (this.props.savedAds.length == 0) return null;

    const settings = {
      centerMode: true,
      centerPadding: '140px',
      slidesToShow: 1,
      dots: false,
      arrows: false,
      infinite: true,
      speed: 500,
      autoplay: true,
      autoplaySpeed: 4000,
      variableWidth: false,
    };

    const slides = this.props.savedAds.map((ad, index) =>

        <div key={index}>
          <img src={ ad.imgURL } className={ad.genre} />
        </div>

      );

    return <Slider ref='slider' {...settings}>
              {slides}
            </Slider>;

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
