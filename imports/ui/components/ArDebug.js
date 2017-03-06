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

      this.toggleVisible(!this.state.showing);

    });

  }

  componentDidMount() {

    console.log('ArDebug::componentDidMount');
    arCam.initCamera();

    // Set initial state.
    this.toggleVisible(this.state.showing);

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
              <input id='invert' type='checkbox' name='invert' value='Invert'></input> Invert Detection<br/>
              <input id='flip-input' type='checkbox' name='flip-input' value='FlipInput'></input> Flip Camera<br/>
              <input id='flip-output' type='checkbox' name='flip-output' value='FlipOutput'></input> Flip Output Horizontally<br/><br/>
              <input id='cam-name' type='text' name='cam-name'></input>: Camera Search String<br/>
              <h3>Available Cameras</h3>
              <ul className='list-group'>
                <li className='list-group-item'>First item</li>
                <li className='list-group-item'>Second item</li>
                <li className='list-group-item'>Third item</li>
              </ul>
           </div>;
  }
}

ArDebug.propTypes = {

};
