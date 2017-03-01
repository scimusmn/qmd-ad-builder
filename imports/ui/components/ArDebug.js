/* eslint-disable max-len, no-return-assign */

import React from 'react';
import Mousetrap from 'mousetrap';

import arCam from '../../modules/client/ArCamera';

export class ArDebug extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      showing:false,
    };

    // Listen for 'D' keystrokes
    // to toggle debug view.
    Mousetrap.bind('d', () => {

      this.setState({showing: !this.state.showing});

    });

  }

  componentDidMount() {

    console.log('ArDebug::componentDidMount');
    arCam.initCamera();

  }

  componentWillUnmount() {

    // Stop all tweens
    // and timers.

  }

  render() {

    // if (!this.state.showing) {
    //   return null;
    // }

    return <div className='ar-debug'>
              <h1>DEBUG</h1>
              <div><h2><strong>-=///////////////=-</strong></h2></div>
              <video id='debug-video' autoPlay='true' style={{width:'320px', height:'240px', display:'none'}}></video>
              <canvas id='debug-canvas' style={{width:'960px', height:'620px'}}></canvas><br/>
              <input id='invert' type='checkbox' name='invert' value='Invert'></input> Invert Detection
           </div>;
  }
}

ArDebug.propTypes = {

};
