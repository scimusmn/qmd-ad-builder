/* eslint-disable max-len, no-return-assign */

import React from 'react';
import Mousetrap from 'mousetrap';

import arCam from '../../modules/client/ArCamera';
import { SettingsGroup } from './debug/SettingsGroup';
import { Setting } from './debug/Setting';

export class ArDebug extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      showing:false,
    };

    // Listen for 'D' keystrokes
    // to toggle debug view.
    Mousetrap.bind('d', () => {

      this.toggleVisible(!this.state.showing);

    });

  }

  componentDidMount() {

    console.log('ArDebug::componentDidMount');
    arCam.initCamera();

    // Set initial state.
    this.toggleVisible(this.state.showing);

    // Listen for session variable changes,
    // and update corresponding variables.
    Tracker.autorun(function() {

      if (Session.get('background-image')) {
        $('.workspace').addClass('newspaper');
      } else {
        $('.workspace').removeClass('newspaper');
      }

    });

  }

  componentWillUnmount() {

    // Stop all tweens
    // and timers.

  }

  toggleVisible(show) {

    this.setState({showing: show});
    arCam.toggleDebugMode(show);

    if (show) {
      $('.ar-debug').css('display', 'block');
    } else {
      $('.ar-debug').css('display', 'none');
    }

  }

  render() {

    return <div className='ar-debug'>
              <h1>DEBUG</h1>
              <div><h2><strong>-=///////DEBUG///////=-</strong></h2></div>
              <video id='debug-video' autoPlay='true' style={{width:'320px', height:'240px', display:'none'}}></video>
              <canvas id='debug-canvas' style={{width:'960px', height:'620px'}}></canvas><br/>

              <SettingsGroup label='Options'>
                <Setting id='invert-detection'/>
                <Setting id='flip-input-h' label='Flip Input'/>
                <Setting id='flip-output-h' label='Flip Output'/>
                <Setting id='background-image'/>
              </SettingsGroup>

              <div className='cam-settings' >
                <SettingsGroup label='Cameras' options={arCam.getCameraOptions()}>
                    <Setting id='xooxoxox' label={arCam.getSelectedCameraLabel()}/>
                    <Setting id='oxoxoxox' label='Flip CHUG'/>
                </SettingsGroup>
              </div>

           </div>;
  }
}

ArDebug.propTypes = {

};
