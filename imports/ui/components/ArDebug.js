/* eslint-disable max-len, no-return-assign */

import React from 'react';
import Mousetrap from 'mousetrap';

import arCam from '../../modules/client/ArCamera';
import { SettingsLayer } from './debug/SettingsLayer';
import { SettingsGroup } from './debug/SettingsGroup';
import { Setting } from './debug/Setting';
import { Option } from './debug/Option';

export class ArDebug extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      showing:false,
    };

    // Listen for 't' keystrokes
    // to toggle debug view.
    Mousetrap.bind('t', () => {

      this.toggleVisible(!this.state.showing);

    });

    this.backgroundOptions = ['bg_old_en.png', 'bg_new_en.png', 'None'];

  }

  componentDidMount() {

    console.log('ArDebug::componentDidMount');
    arCam.initCamera();

    // Set initial state.
    this.toggleVisible(this.state.showing);

    // Listen for session variable changes,
    // and update corresponding variables.
    Tracker.autorun(function() {

      const bg = Session.get('backgrounds');
      if (!bg || bg == 'None') {
        $('.poster-background').attr('src', '#');
      } else {
        $('.poster-background').attr('src', 'images/' + bg);
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

              <SettingsLayer label='Ad Builder Settings'>

                <SettingsGroup id='tracking'>
                  <video id='debug-video' className='setting-vis' autoPlay='true' style={{width:'320px', height:'240px', display:'none'}}></video>
                  <canvas id='debug-canvas' className='setting-vis' style={{width:'960px', height:'620px'}}></canvas><br/>
                </SettingsGroup>

                <SettingsGroup id='options'>
                  <Setting id='invert-detection'/>
                  <Setting id='flip-input-h'/>
                  <Setting id='flip-output-h'/>
                  <Setting id='show-frame'/>
                </SettingsGroup>

                <SettingsGroup id='backgrounds' type='select'>
                  {this.backgroundOptions.map(key =>
                    <Setting key={key} id={key}></Setting>
                  )}
                </SettingsGroup>

                <SettingsGroup id='cameras' type='select'>
                  {arCam.getCameraOptions().map((cam, index) =>
                    <Setting key={index} id={cam.label}></Setting>
                  )}
                </SettingsGroup>

              </SettingsLayer>

           </div>;

  }

}

ArDebug.propTypes = {

};
