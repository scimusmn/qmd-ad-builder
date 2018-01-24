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

    if (nextProps.savedAd == undefined) {
      console.log('No saved ad available. Likely empty SavedAds collection.');
      return;
    }

    if (this.props.savedAd == undefined) {
      console.log('No previous saved ad found. Likely first SavedAd in collection.');
    }

    if (this.props.savedAd == undefined || this.props.savedAd._id !== nextProps.savedAd._id) {

      console.log('FinaleSequence: NEW AD');

      $(this.refs.finaleContainer).show();
      TweenMax.set(this.refs.finaleContainer, {autoAlpha: 1.0, scale: 1.0, transformOrigin:'900px 500px'});
      this.restartFinaleSequence(nextProps);

    } else {

      console.log('Same ad as previous. Ignore. ');

    }

  }

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

    // After news has spun in, position
    // individual papers into long reel.
    const sequence = this.sequence;
    let reelLength = 0;
    $(divNewspaper).find('.single').each(function(index) {
      const topPos = index * 1515;
      reelLength += 1515;

      // Start position
      sequence.set($(this), {top:0, autoAlpha:0.0}, 0.0);

      if (index == 0) {
        sequence.set($(this), {autoAlpha:1.0}, 0.0);
      }

      // Move into reel after delay.
      sequence.set($(this), {top:topPos, autoAlpha:1.0}, 4.0);

    });

    this.sequence.set(divNewspaper, {x: 400, y:-185, scale:0.001, autoAlpha:0.0, transformOrigin:'574px 750px', webkitFilter:'blur(' + 0 + 'px)'}, 0.0);
    // this.sequence.from(divNewspaper, 1.4, {webkitFilter:'blur(' + 24 + 'px)', ease:Power2.easeOut}, 2.1);
    this.sequence.to(divNewspaper, 0.2, {autoAlpha:1.0, ease:Power0.easeOut}, 2.1);
    this.sequence.from(divNewspaper, 1.34, {rotation: 1280, ease:Power1.easeInOut}, 2.1);
    this.sequence.to(divNewspaper, 1.1, {scale:1.2, ease:Power3.easeInOut }, 2.2);
    this.sequence.to(divNewspaper, 0.25, {scale:0.9, ease:Power3.easeIn }, 3.5);

    this.sequence.to(divNewspaper, 7.5, {y:-reelLength, ease:Power2.easeIn }, 8.5);

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
    this.sequence.set(imgCursor, {x: 200, y:640, rotation:0.0}, 0.0);

    // Popups
    const popups = [

      {ref:this.refs.divPopup1, x:510, y:75, s: 0.4, t: 3}, // Start with medium, centered popup.
      {ref:this.refs.divPopup2, x:260, y:220, s: 0.25, t: 8},
      {ref:this.refs.divPopup3, x:700, y:-40, s: 0.25, t: 11.0},
      {ref:this.refs.divPopup4, x:300, y:220, s: 0.25, t: 11.5},
      {ref:this.refs.divPopup5, x:478, y:390, s: 0.25, t: 12.0}, // Enter chaos mode.
      {ref:this.refs.divPopup6, x:890, y:278, s: 0.25, t: 12.5},
      {ref:this.refs.divPopup7, x:330, y:-50, s: 0.25, t: 13.0},
      {ref:this.refs.divPopup8, x:80, y:190, s: 0.25, t: 13.5},
      {ref:this.refs.divPopup9, x:650, y:426, s: 0.25, t: 14.0},
      {ref:this.refs.divPopup10, x:550, y:27, s: 0.3, t: 14.5},
      {ref:this.refs.divPopup11, x:-30, y:20, s: 0.25, t: 15.0},
      {ref:this.refs.divPopup12, x:30, y:430, s: 0.15, t: 15.25},
      {ref:this.refs.divPopup13, x:900, y:426, s: 0.3, t: 15.5},
      {ref:this.refs.divPopup14, x:920, y:-70, s: 0.3, t: 15.75},
      {ref:this.refs.divPopup15, x:90, y:680, s: 0.15, t: 16.0},
      {ref:this.refs.divPopup16, x:490, y:55, s: 0.6, t: 17.0}, // Finish with large, centered popup.

    ];

    for (var i = 0; i < popups.length; i++) {

      const popup = popups[i];

      // Add initial delay to all popups
      popup.t = popup.t + 1.5;

      // Load newly saved image into
      // all container divs
      $(popup.ref).find('.saved-ad').attr('src', withProps.savedAd.imgURL);

      // TEMP for debug.
      // $(popup.ref).append('<p> popup ' + (i + 1) + '</p>');

      // Set initial display values now
      this.sequence.set(popup.ref, {autoAlpha: 0.0, x: popup.x, y: popup.y, scale: popup.s, transformOrigin:'350px 350px'}, 0.0);

      // Plan popup tween in future
      this.sequence.to(popup.ref, 0.2, {scale: '+=0.25', autoAlpha: 1.0, ease:Power2.easeIn}, popup.t);

      // Plan a cursor tween that moves to
      // upper-right of popup and closes it.
      const reactionTime = 1.0 / (i + 1);
      const cursorMoveTime = (2.0 / (i + 1)) + 0.75; // Gets faster each popup...

      let closeX = popup.x + 580;
      let closeY = popup.y + 206;
      if (i == 0) {
        closeX += 65;
        closeY -= 35;
      }

      this.sequence.to(imgCursor, cursorMoveTime, {x: closeX, y: closeY, ease:Power2.easeInOut}, (popup.t + reactionTime));

      // Plan successful popup close
      if (i < 4) {

        this.sequence.to(imgCursor, 0.1, {scale: 0.9, repeat:1, yoyo:true, ease:Power2.easeIn}, (popup.t + cursorMoveTime + reactionTime));
        this.sequence.to(popup.ref, 0.2, {autoAlpha: 0.0, scale: popup.s}, popup.t + cursorMoveTime + reactionTime + 0.19);

      }

      // Cursor gives up and flies away
      if (i == popups.length - 1) {

        this.sequence.to(imgCursor, 0.7, {x: 1800, y:-160, rotation: 999, ease:Power2.easeInOut}, '+=0.0');

        // Supplemental non-visible delay for effect...
        this.sequence.to(imgCursor, 0.75, {x: 1900, ease:Power2.easeInOut}, '+=0.0');

        // Also feign cursor moving off screen after first popup close
        this.sequence.to(imgCursor, 2.2, {x: 1444, y: 190, ease:Power1.easeInOut}, 8.25);

      }

    }

    // Start the timeline animation
    this.sequence.restart();

  }

  endSequence() {

    TweenMax.to(this.refs.finaleContainer, 0.5, {autoAlpha: 0.0, scale: 1.5, ease:Power2.easeIn, delay:1.1, onComplete:() => {

      Session.set('savedGenre', '');
      $(this.refs.finaleContainer).hide();

    },});

  }

  render() {

    return <div ref='finaleContainer' className='finale-sequence-container'>

              <div className='finale-sequence'>

                <div ref='containerOld'>

                  <div ref='divNewspaper' className='newspaper-container'>
                    <div className='single'>
                      <img src='../images/newspaper.png' />
                      <img className='saved-ad old' src='#'/>
                    </div>
                    <div className='single'>
                      <img src='../images/newspaper.png' />
                      <img className='saved-ad old' src='#'/>
                    </div>
                    <div className='single'>
                      <img src='../images/newspaper.png' />
                      <img className='saved-ad old' src='#'/>
                    </div>
                    <div className='single'>
                      <img src='../images/newspaper.png' />
                      <img className='saved-ad old' src='#'/>
                    </div>
                    <div className='single'>
                      <img src='../images/newspaper.png' />
                      <img className='saved-ad old' src='#'/>
                    </div>
                    <div className='single'>
                      <img src='../images/newspaper.png' />
                      <img className='saved-ad old' src='#'/>
                    </div>
                    <div className='single'>
                      <img src='../images/newspaper.png' />
                      <img className='saved-ad old' src='#'/>
                    </div>
                    <div className='single'>
                      <img src='../images/newspaper.png' />
                      <img className='saved-ad old' src='#'/>
                    </div>
                    <div className='single'>
                      <img src='../images/newspaper.png' />
                      <img className='saved-ad old' src='#'/>
                    </div>
                    <div className='single'>
                      <img src='../images/newspaper.png' />
                      <img className='saved-ad old' src='#'/>
                    </div>
                    <div className='single'>
                      <img src='../images/newspaper.png' />
                      <img className='saved-ad old' src='#'/>
                    </div>
                    <div className='single'>
                      <img src='../images/newspaper.png' />
                      <img className='saved-ad old' src='#'/>
                    </div>
                    <div className='single'>
                      <img src='../images/newspaper.png' />
                      <img className='saved-ad old' src='#'/>
                    </div>
                    <div className='single'>
                      <img src='../images/newspaper.png' />
                      <img className='saved-ad old' src='#'/>
                    </div>
                    <div className='single'>
                      <img src='../images/newspaper.png' />
                      <img className='saved-ad old' src='#'/>
                    </div>
                    <div className='single'>
                      <img src='../images/newspaper.png' />
                      <img className='saved-ad old' src='#'/>
                    </div>
                    <div className='single'>
                      <img src='../images/newspaper.png' />
                      <img className='saved-ad old' src='#'/>
                    </div>
                    <div className='single'>
                      <img src='../images/newspaper.png' />
                      <img className='saved-ad old' src='#'/>
                    </div>
                    <div className='single'>
                      <img src='../images/newspaper.png' />
                      <img className='saved-ad old' src='#'/>
                    </div>
                    <div className='single'>
                      <img src='../images/newspaper.png' />
                      <img className='saved-ad old' src='#'/>
                    </div>
                    <div className='single'>
                      <img src='../images/newspaper.png' />
                      <img className='saved-ad old' src='#'/>
                    </div>
                    <div className='single'>
                      <img src='../images/newspaper.png' />
                      <img className='saved-ad old' src='#'/>
                    </div>
                    <div className='single'>
                      <img src='../images/newspaper.png' />
                      <img className='saved-ad old' src='#'/>
                    </div>
                    <div className='single'>
                      <img src='../images/newspaper.png' />
                      <img className='saved-ad old' src='#'/>
                    </div>
                    <div className='single'>
                      <img src='../images/newspaper.png' />
                      <img className='saved-ad old' src='#'/>
                    </div>
                    <div className='single'>
                      <img src='../images/newspaper.png' />
                      <img className='saved-ad old' src='#'/>
                    </div>
                    <div className='single'>
                      <img src='../images/newspaper.png' />
                      <img className='saved-ad old' src='#'/>
                    </div>
                    <div className='single'>
                      <img src='../images/newspaper.png' />
                      <img className='saved-ad old' src='#'/>
                    </div>
                    <div className='single'>
                      <img src='../images/newspaper.png' />
                      <img className='saved-ad old' src='#'/>
                    </div>
                  </div>

                </div>

                <div ref='containerNew'>

                  <img src='images/laptop.png' className='laptop'/>

                  <div ref='divPopup1' className='popup-container'>
                    <img src='../images/popup_03.png' />
                    <img className='saved-ad new' src='#' width='700px'/>
                  </div>

                  <div ref='divPopup2' className='popup-container'>
                    <img src='../images/popup_04.png' />
                    <img className='saved-ad new' src='#' width='700px'/>
                  </div>

                  <div ref='divPopup3' className='popup-container'>
                    <img src='../images/popup_02.png' />
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
                    <img src='../images/popup_03.png' />
                    <img className='saved-ad new' src='#' width='700px'/>
                  </div>

                  <img id='imgCursor' ref='imgCursor' src='../images/cursor.png' />

                  <img src='images/laptop_mask.png' className='laptop'/>

                </div>

              </div>

          </div>;

  }

}

FinaleSequence.propTypes = {

};
