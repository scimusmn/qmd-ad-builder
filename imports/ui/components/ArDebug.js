/* eslint-disable max-len, no-return-assign */

import React from 'react';
import Mousetrap from 'mousetrap';

import arCam from '../../modules/client/ArCamera';
import { SettingsGroup } from './debug/SettingsGroup';
import { Setting } from './debug/Setting';
import { Option } from './debug/Option';

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

      const bg = Session.get('background-selection');
      if (bg == 'None') {
        $('.workspace').css('background-image', 'none');
      } else {
        $('.workspace').css('background-image', 'url(images/' + bg + ')');
      }

    });

    Tracker.autorun(function() {

      if (Session.get('show-frame')) {
        $('.workspace .ar-poster').addClass('show-frame');
      } else {
        $('.workspace .ar-poster').removeClass('show-frame');
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

              <h1>DEBUG VIEW</h1>
              <div><h2><strong>//////////////////////////////////////////////////////</strong></h2></div>

              <video id='debug-video' autoPlay='true' style={{width:'320px', height:'240px', display:'none'}}></video>
              <canvas id='debug-canvas' style={{width:'960px', height:'620px'}}></canvas><br/>

              <SettingsGroup id='all-options' label='OPTIONS'>
                <Setting id='invert-detection'/>
                <Setting id='flip-input-h' label='Flip Input'/>
                <Setting id='flip-output-h' label='Flip Output'/>
                <Setting id='show-frame' label='Poster Frame'/>
              </SettingsGroup>

              <SettingsGroup id='cam-selection' label='CAMERAS' options={arCam.getCameraOptions()}>
              </SettingsGroup>

              <SettingsGroup id='background-selection' label='BACKGROUNDS' options={['newspaper-bg.png', 'news-temp-bg.png', 'None']}>
              </SettingsGroup>

           </div>;
  }
}

ArDebug.propTypes = {

};
