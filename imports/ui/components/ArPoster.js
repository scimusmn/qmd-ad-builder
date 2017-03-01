/* eslint-disable max-len, no-return-assign */

import React from 'react';

import CV from '../../../client/lib/js-aruco/cv.js';
import AR from '../../../client/lib/js-aruco/aruco.js';


export class ArPoster extends React.Component {

  constructor(props) {

    super(props);

    this.state = {

    };

  }

  componentDidMount() {

    console.log('ArPoster::componentDidMount()');
    var detector = new AR.Detector();
    console.log(detector);

  }

  componentWillUnmount() {

    // Stop all tweens
    // and timers.
    console.log('ArPoster::componentDidMount()');
    var detector = new AR.Detector();
    console.log(detector);

  }

  render() {

    return <div className='ar-poster'>
          arposter

          </div>;
  }
}

ArPoster.propTypes = {

};
