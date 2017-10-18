/* eslint-disable max-len, no-return-assign */

import { Meteor } from 'meteor/meteor';
import React from 'react';
import ImageFiles from '../../api/ImageFiles';
import TweenMax from 'gsap';
import { TimelineMax } from 'gsap';

export class FinaleSequence extends React.Component {

  constructor(props) {

    super(props);

    this.state = {

    };

    this.sequence = {};
    this.startOldSequence = this.startOldSequence.bind(this);
    this.startNewSequence = this.startNewSequence.bind(this);
    this.endSequence = this.endSequence.bind(this);

  }

  componentDidMount() {

    Session.set('savedGenre', '');

    // Hide both sequences
    $(this.refs.finaleContainer).hide();

  }

  componentWillUnmount() {

    // Stop all tweens
    // and timers.

  }

  componentWillReceiveProps(nextProps) {

    if (this.props.savedAd && this.props.savedAd._id !== nextProps.savedAd._id) {

      $(this.refs.finaleContainer).show();
      this.restartFinaleSequence(nextProps);

    } else {

      console.log('No saved ad available. Likely empty SavedAds collection.');

    }

  }

/*

  prepareFinaleSequences() {

    // Init
    this.tl = new TimelineMax({repeat:-1, delay:1});

    // Transition in
    this.tl.from(this.refs.bg, 0.5, {left:-500, autoAlpha:0.0,});
    this.tl.from(this.refs.en, 0.5, {x:-500, autoAlpha:0.0}, '-=0.4');
    this.tl.from(this.refs.es, 0.5, {x:-500, autoAlpha:0.0}, '-=0.8');

    // Transition out
    this.tl.to(this.refs.bg, 0.5, {left:500, autoAlpha:0.0, ease: Power2.easeIn, }, '+=18');
    this.tl.to(this.refs.en, 0.5, {x:500, autoAlpha:0.0, ease: Power2.easeIn}, '-=0.4');
    this.tl.to(this.refs.es, 0.5, {x:500, autoAlpha:0.0, ease: Power2.easeIn}, '-=0.4');

    // Rotate dashed ring in
    this.tl.to(this.refs.bg, 9.5, {rotation: 220, ease:Power2.easeOut}, 0.01);

    // Rotate dashed ring out
    this.tl.to(this.refs.bg, 3.5, {rotation: 570, ease:Power2.easeIn}, '-=2.725');

    // Subtle hint movement
    // for Os easter egg
    // this.tl.to(this.refs.O_static, 3.14, {x:-8, y:5, rotation: 2, ease: Power2.easeInOut, yoyo:true, repeat:1}, 0.1);
    // this.tl.to(this.refs.O_drag, 3.14, {x:5, y:-8, rotation: -2, ease: Power2.easeInOut, yoyo:true, repeat:1}, 0.2);

    this.tl.from(this.refs.fader, 0.5, { backgroundColor: 'rgba(0,0,0,1.0)' }, 0.0);
    this.tl.to(this.refs.fader, 0.5, { backgroundColor: 'rgba(0,0,0,1.0)' }, '-=0.5');

  }

  stopAllSequences() {
    // DOM is about to become
    // inaccessible. Clean up
    // all timers ans tweens.
    console.log('AttractLoop - componentWillUnmount');

    // Kills the timeline and forces to completion
    this.tl.kill();

    // Set to null so the reference is garbage collected
    this.tl = null;
  }

*/

  restartFinaleSequence(withProps) {

    console.log('restartFinaleSequence', withProps);

    if (withProps.savedGenre == 'old') {
      this.startOldSequence(withProps);
    } else if (withProps.savedGenre == 'new') {
      this.startNewSequence(withProps);
    } else {
      console.log('Warning. Saved genre not recognized:', withProps.savedGenre);
    }

  }

  startOldSequence(withProps) {

    // Show current sequence
    $(this.refs.containerOld).show();
    $(this.refs.containerNew).hide();

    // Initialize timeline tween
    this.sequence = new TimelineMax({onComplete: this.endSequence});

    // Newspaper
    const divNewspaper = this.refs.divNewspaper;
    $(divNewspaper).show();

    // Load newly saved image into newspaper
    $(divNewspaper).find('.saved-ad').attr('src', withProps.savedAd.imgURL);

    this.sequence.set(divNewspaper, {x: 400, y:-170, scale:0.001, autoAlpha:0.0, transformOrigin:'574px 750px', webkitFilter:'blur(' + 0 + 'px)'}, 0.0);
    this.sequence.from(divNewspaper, 1.4, {webkitFilter:'blur(' + 24 + 'px)', ease:Power2.easeOut}, 2.1);
    this.sequence.to(divNewspaper, 0.2, {autoAlpha:1.0, ease:Power0.easeOut}, 2.1);
    this.sequence.from(divNewspaper, 1.34, {rotation: 1280, ease:Power1.easeInOut}, 2.1);
    this.sequence.to(divNewspaper, 1.1, {scale:1.2, ease:Power3.easeInOut }, 2.2);
    this.sequence.to(divNewspaper, 0.25, {scale:0.9, ease:Power3.easeIn }, 3.5);

    // Play timeline
    this.sequence.restart();

  }

  startNewSequence(withProps) {

    // Show current sequence
    $(this.refs.containerNew).show();
    $(this.refs.containerOld).hide();

    // Initialize timeline tween
    this.sequence = new TimelineMax({onComplete: this.endSequence});

    // Cursor
    const imgCursor = this.refs.imgCursor;
    $(imgCursor).show();
    this.sequence.set(imgCursor, {x: 2000, y:240, rotation:0.0}, 0.0);

    // Popups
    const popups = [

      {ref:this.refs.divPopup1, x:450, y:100, s: 0.6, t: 0.4},
      {ref:this.refs.divPopup2, x:280, y:220, s: 0.6, t: 6.0},
      {ref:this.refs.divPopup3, x:700, y:-100, s: 0.6, t: 8.6},
      {ref:this.refs.divPopup4, x:300, y:220, s: 0.6, t: 9.9},
      {ref:this.refs.divPopup5, x:478, y:430, s: 0.6, t: 10.5},
      {ref:this.refs.divPopup6, x:990, y:278, s: 0.6, t: 10.8},
      {ref:this.refs.divPopup7, x:330, y:-50, s: 0.6, t: 11.0},
      {ref:this.refs.divPopup8, x:30, y:230, s: 0.6, t: 11.5},
      {ref:this.refs.divPopup9, x:880, y:626, s: 0.65, t: 11.8},
      {ref:this.refs.divPopup10, x:260, y:27, s: 0.5, t: 12.4},
      {ref:this.refs.divPopup11, x:-30, y:20, s: 0.44, t: 12.8},
      {ref:this.refs.divPopup12, x:30, y:630, s: 0.5, t: 13.2},
      {ref:this.refs.divPopup13, x:1180, y:426, s: 0.34, t: 13.4},
      {ref:this.refs.divPopup14, x:1111, y:-107, s: 0.7, t: 13.7},
      {ref:this.refs.divPopup15, x:-100, y:680, s: 0.3, t: 13.8},
      {ref:this.refs.divPopup16, x:530, y:130, s: 0.8, t: 13.9},

    ];

    for (var i = 0; i < popups.length; i++) {

      const popup = popups[i];

      // TEMP - Add delay to all times
      popup.t += 2.0;

      // Load newly saved image into
      // all container divs
      $(popup.ref).find('.saved-ad').attr('src', withProps.savedAd.imgURL);

      // Set initial display values now
      this.sequence.set(popup.ref, {autoAlpha: 0.0, x: popup.x, y: popup.y, scale: popup.s, transformOrigin:'350px 350px'}, 0.0);

      // Plan popup tween in future
      this.sequence.to(popup.ref, 0.2, {scale: '+=0.25', autoAlpha: 1.0, ease:Power2.easeIn}, popup.t);

      // Plan a cursor tween that moves to
      // upper-right of popup and closes it.
      const reactionTime = 1.0 / (i + 1);
      const cursorMoveTime = (2.0 / (i + 1)) + 0.75; // Gets faster each popup...
      const closeX = popup.x + 740;
      const closeY = popup.y + 100;
      this.sequence.to(imgCursor, cursorMoveTime, {x: closeX, y: closeY, ease:Power2.easeInOut}, (popup.t + reactionTime));

      // Plan successful popup close
      if (i < 6) {

        this.sequence.to(imgCursor, 0.1, {scale: 0.9, repeat:1, yoyo:true, ease:Power2.easeIn}, (popup.t + cursorMoveTime + reactionTime));
        this.sequence.to(popup.ref, 0.2, {autoAlpha: 0.0, scale: popup.s}, popup.t + cursorMoveTime + reactionTime + 0.16);

      }

      // Cursor gives up and flies away
      if (i == popups.length - 1) {

        this.sequence.to(imgCursor, 0.7, {x: 2200, y:-360, rotation: 999, ease:Power2.easeInOut}, '+=0.0');

        // Also feign cursor moving off screen after first popup close
        this.sequence.to(imgCursor, 1.7, {x: 1744, y: 144, ease:Power1.easeInOut}, 6.5);

      }

    }

    // TODO:  Add chaotic popups and cursor movement.

    // Cursor movement
    // this.sequence.set(imgCursor, {x: 2000, y:600, ease:Power2.easeInOut}, 0.0);
    // this.sequence.to(imgCursor, 3.0, {x: 600, y:300, ease:Power2.easeInOut}, 1.5);
    // this.sequence.to(imgCursor, 0.1, {scale: 0.9, repeat:1, yoyo:true, ease:Power2.easeIn}, '+=0.0');
    // this.sequence.to(imgCursor, 2.0, {x: 970, y:410, ease:Power2.easeInOut}, '+=1.0');
    // this.sequence.to(imgCursor, 0.1, {scale: 0.9, repeat:1, yoyo:true, ease:Power2.easeIn}, '+=0.0');
    // this.sequence.to(imgCursor, 1.0, {x: 244, y:80, ease:Power2.easeInOut}, '+=0.0');
    // this.sequence.to(imgCursor, 0.1, {scale: 0.9, repeat:1, yoyo:true, ease:Power2.easeIn}, '+=0.0');
    // this.sequence.to(imgCursor, 0.6, {x: 970, y:410, ease:Power2.easeInOut}, '+=0.0');
    // this.sequence.to(imgCursor, 0.1, {scale: 0.9, repeat:1, yoyo:true, ease:Power2.easeIn}, '+=0.0');
    // this.sequence.to(imgCursor, 0.6, {x: 344, y:444, ease:Power2.easeInOut}, '+=0.0');
    // this.sequence.to(imgCursor, 0.1, {scale: 0.9, repeat:1, yoyo:true, ease:Power2.easeIn}, '+=0.0');
    // this.sequence.to(imgCursor, 0.6, {x: 970, y:410, ease:Power2.easeInOut}, '+=0.0');
    // this.sequence.to(imgCursor, 0.1, {scale: 0.9, repeat:1, yoyo:true, ease:Power2.easeIn}, '+=0.0');
    // this.sequence.to(imgCursor, 0.6, {x: 144, y:180, ease:Power2.easeInOut}, '+=0.0');
    // this.sequence.to(imgCursor, 0.1, {scale: 0.9, repeat:1, yoyo:true, ease:Power2.easeIn}, '+=0.0');
    // this.sequence.to(imgCursor, 0.5, {x: 844, y:580, ease:Power2.easeInOut}, '+=0.0');
    // this.sequence.to(imgCursor, 0.1, {scale: 0.9, repeat:1, yoyo:true, ease:Power2.easeIn}, '+=0.0');
    // this.sequence.to(imgCursor, 0.4, {x: 344, y:280, ease:Power2.easeInOut}, '+=0.0');
    // this.sequence.to(imgCursor, 0.1, {scale: 0.9, repeat:1, yoyo:true, ease:Power2.easeIn}, '+=0.0');
    // this.sequence.to(imgCursor, 0.7, {x: 2000, y:-360, rotation: 990, autoAlpha: 0.0, ease:Power2.easeInOut}, '+=0.0');

    // Start the timeline animation
    this.sequence.restart();

  }

  endSequence() {

    setTimeout(()=> {

      $(this.refs.imgFinale).attr('src', '#');
      $(this.refs.imgCursor).hide();
      Session.set('savedGenre', '');
      $(this.refs.finaleContainer).hide();

    }, 7000);

  }

  render() {

    const genre = Session.get('savedGenre');

    return <div ref='finaleContainer' className='finale-sequence-container'>

              <div className='finale-sequence'>

                <div ref='containerOld'>

                  <div ref='divNewspaper' className='newspaper-container'>
                    <img src='../images/newspaper.png' />
                    <img className='saved-ad old' src='#' width='540px'/>
                  </div>

                </div>

                <div ref='containerNew'>

                  <div ref='divPopup1' className='popup-container'>
                    <img src='../images/popup_02.png' />
                    <img className='saved-ad new' src='#' width='700px'/>
                  </div>

                  <div ref='divPopup2' className='popup-container'>
                    <img src='../images/popup_04.png' />
                    <img className='saved-ad new' src='#' width='700px'/>
                  </div>

                  <div ref='divPopup3' className='popup-container'>
                    <img src='../images/popup_03.png' />
                    <img className='saved-ad new' src='#' width='700px'/>
                  </div>

                  <div ref='divPopup4' className='popup-container'>
                    <img src='../images/popup_01.png' />
                    <img className='saved-ad new' src='#' width='700px'/>
                  </div>

                  <div ref='divPopup5' className='popup-container'>
                    <img src='../images/popup_01.png' />
                    <img className='saved-ad new' src='#' width='700px'/>
                  </div>

                  <div ref='divPopup6' className='popup-container'>
                    <img src='../images/popup_02.png' />
                    <img className='saved-ad new' src='#' width='700px'/>
                  </div>

                  <div ref='divPopup7' className='popup-container'>
                    <img src='../images/popup_03.png' />
                    <img className='saved-ad new' src='#' width='700px'/>
                  </div>

                  <div ref='divPopup8' className='popup-container'>
                    <img src='../images/popup_01.png' />
                    <img className='saved-ad new' src='#' width='700px'/>
                  </div>

                  <div ref='divPopup9' className='popup-container'>
                    <img src='../images/popup_02.png' />
                    <img className='saved-ad new' src='#' width='700px'/>
                  </div>

                  <div ref='divPopup10' className='popup-container'>
                    <img src='../images/popup_01.png' />
                    <img className='saved-ad new' src='#' width='700px'/>
                  </div>

                  <div ref='divPopup11' className='popup-container'>
                    <img src='../images/popup_02.png' />
                    <img className='saved-ad new' src='#' width='700px'/>
                  </div>

                  <div ref='divPopup12' className='popup-container'>
                    <img src='../images/popup_04.png' />
                    <img className='saved-ad new' src='#' width='700px'/>
                  </div>

                  <div ref='divPopup13' className='popup-container'>
                    <img src='../images/popup_03.png' />
                    <img className='saved-ad new' src='#' width='700px'/>
                  </div>

                  <div ref='divPopup14' className='popup-container'>
                    <img src='../images/popup_01.png' />
                    <img className='saved-ad new' src='#' width='700px'/>
                  </div>

                  <div ref='divPopup15' className='popup-container'>
                    <img src='../images/popup_03.png' />
                    <img className='saved-ad new' src='#' width='700px'/>
                  </div>

                  <div ref='divPopup16' className='popup-container'>
                    <img src='../images/popup_02.png' />
                    <img className='saved-ad new' src='#' width='700px'/>
                  </div>

                  <img id='imgCursor' ref='imgCursor' src='../images/cursor.png' />

                </div>

              </div>

          </div>;

  }

}

FinaleSequence.propTypes = {

};
