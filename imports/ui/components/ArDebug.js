/* eslint-disable max-len, no-return-assign */

import React from 'react';
import Mousetrap from 'mousetrap';
import CV from '../../../client/lib/js-aruco/cv.js';
import AR from '../../../client/lib/js-aruco/aruco.js';

export class ArDebug extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      showing:false,
    };

    Mousetrap.bind('d', () => {

      console.log('toggle debug');
      this.setState({showing: !this.state.showing});

    });

  }

  componentDidMount() {

  }

  componentWillUnmount() {

    // Stop all tweens
    // and timers.

  }

  render() {

    if (!this.state.showing) {
      return null;
    }

    return <div className='ar-debug'>
              <h1>DEBUG & SETTINGS</h1>
              <div><h2><strong>-=///////////////=-</strong></h2></div>
              <video id='video' autoPlay='true' style={{width:'320px', height:'240px', display:'none'}}></video>
              <canvas id='canvas' style={{width:'960px', height:'620px'}}></canvas><br/>
              <input id='invert' type='checkbox' name='invert' value='Invert'></input> Invert Detection
           </div>;
  }
}

ArDebug.propTypes = {

};
