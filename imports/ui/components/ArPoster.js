/* eslint-disable max-len, no-return-assign */

import { Meteor } from 'meteor/meteor';
import React from 'react';
import arCam from '../../modules/client/ArCamera';
import Utils from '../../modules/client/Utils';
import ImageFiles from '../../api/ImageFiles';
import TweenMax from 'gsap';
import html2canvas from 'html2canvas';

export class ArPoster extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      assetGenre: 'new',
      language: 'en',
      saveLockdown:false,
      attractMode:false,
    };

    // Dictionary to find
    // item ids from marker ids.
    this.lookup = {

      343:{ id:'name', label:'(Suspicious) Name' },
      672:{ id:'details', label:'(The devil\'s in the...)  details' },
      1019:{ id:'claim', label:'(False) Claim' },
      839:{ id:'endorsement', label:'(Meaningless) Endorsement' },
      975:{ id:'image', label:'(Misleading) Images' },
      767:{ id:'flair', label:'(Attention-grabbing) Flair' },

      /*     863:{ id:'name', label:'(Suspicious) Name' },
            1023:{ id:'details', label:'(The devil\'s in the...)  details' },
            383:{ id:'claim', label:'(False) Claim' },
            255:{ id:'endorsement', label:'(Meaningless) Endorsement' },
            991:{ id:'image', label:'(Misleading) Images' },
            682:{ id:'flair', label:'(Attention-grabbing) Flair' },
            */

      /*
      84:{ id:'motion1', label:'(Eye-catching) Motion (1)' },
      85:{ id:'motion2', label:'(Eye-catching) Motion (2)' },
      340:{ id:'motion3', label:'(Eye-catching) Motion (3)' },
*/
    };

    // Holds all poster items.
    // Dynamically populated.
    this.items = {};

    this.activeItem;

    this.inactivitySeconds = 0;
    this.holdToSaveTimer = {};
    this.holdToSaveStart = 0;

    // Bind to this instance.
    this.markerUpdate = this.markerUpdate.bind(this);

  }

  componentDidMount() {

    // Update local variables
    this.posterWidth = parseInt($('.ar-poster').css('width'));
    this.posterHeight = parseInt($('.ar-poster').css('height'));

    const camSize = arCam.getCamDimensions();
    this.wRatio = this.posterWidth / camSize.width;
    this.hRatio = this.posterHeight / camSize.height;

    arCam.setMarkerUpdateCallback(this.markerUpdate);

    // Set up all poster items and
    // ready initial display state.
    for (let key in this.lookup) {

      const itemId = this.lookup[key].id;
      const label = this.lookup[key].label;
      const $target = $('#' + itemId);
      const $image = $target.find('img');

      // TODO: Should add div to container here?
      // That way we can add/remove categories
      // more easily without having to tie
      // to specific divs.

      this.items[key] = { id:itemId,
                          key:key,
                          label:label,
                          target:$target,
                          image:$image,
                          alive:false,
                          active:false,
                          deadCount:0,
                          assets:[],
                          assetIndex:0,
                          prevRot:-1,
                          prevX:-1,
                          prevY:-1,
                          scale:0.6,
                          zIndex:1,
                        };

      // Hide
      TweenMax.set($target, {opacity:0.0});
      TweenMax.to($target, 0.15, { scale: 0.1, autoAlpha:0.0});

      // Get list of possible
      // assets for this item
      Meteor.call('getFiles', itemId, (error, result) => {

        if (result) {

          const item = this.items[key];

          item.assets = {};

          // Separate assets into 2 sets of 2 sets.
          item.assets.new = { en: this.filterAssets(result, 'new', 'en'),
                              es:this.filterAssets(result, 'new', 'es'),
                            };

          item.assets.old = { en: this.filterAssets(result, 'old', 'en'),
                              es:this.filterAssets(result, 'old', 'es'),
                            };

          // Default to new english set.
          item.activeAssets = item.assets.new.en;

          // Set default asset
          item.image.attr('src', item.activeAssets[item.assetIndex]);

        }

      });

    };

    /* Keyboard events */

    // Asset left
    Mousetrap.bind(['left', 'a'], () => {

      this.incrementImage(-1);
      this.resetInactivity();

    });

    // Asset right
    Mousetrap.bind(['right', 'c'], () => {

      this.incrementImage(1);
      this.resetInactivity();

    });

    // Size up
    Mousetrap.bind(['up', 'b'], () => {

      this.incrementScale(1);
      this.resetInactivity();

    });

    // Size down
    Mousetrap.bind(['down', 'd'], () => {

      this.incrementScale(-1);
      this.resetInactivity();

    });

    // Old/New Toggle
    Mousetrap.bind(['shift', 'f'], () => {

      this.toggleOldNew();
      this.resetInactivity();

    });

    // Old/New Toggle
    Mousetrap.bind(['l', 'g'], () => {

      this.toggleLanguage();
      this.resetInactivity();

    });

    // Hold to save
    Mousetrap.bind(['return', 'e'], (event) => {

      // Ignore key repeats
      if (event.repeat == false) {
        this.startHoldToSave();
      }

    }, 'keydown');

    Mousetrap.bind(['return', 'e'], () => {

      this.stopHoldToSave();

    }, 'keyup');

    // Start inactivity counter
    setInterval(() => {

      this.inactivitySeconds++;

      if (this.inactivitySeconds == 5) {

        // If red UI is showing, hide.
        TweenMax.to($('.ar-poster #arrows'), 0.25, {autoAlpha:0.0});

      }

      // After long inactivity, hide all items
      // and show main intructions. This handles
      // the scenario when someone walks away
      // leaving blocks on the glass.
      if (this.inactivitySeconds == 15) {

        this.setState({attractMode:true});

        let item;

        // Fade out all items.
        for (let key in this.items) {

          item = this.items[key];
          $(item.image).addClass('grayed');

        }

        // Show inactive instruction message.
        $('#intro-instruct').show();

      }

    }, 1000);

  }

  componentWillUnmount() {

    // Stop all tweens
    // and timers.

  }

  markerUpdate(markers) {

    this.updateLifeCycles(markers);

    if (markers.length == 0) return;

    let i;
    let marker;
    let item;
    let itemId;
    let topDelta = -1;
    let topDeltaId = -1;

    for (i = 0; i !== markers.length; ++i) {

      // AR marker object
      marker = markers[i];

      // Poster item
      item = this.items[marker.id];

      // If marker isn't associated
      // with a poster item, ignore.
      if (!item) return;

      // Check if beaten record for
      // top movement this cycle.
      if (marker.delta > topDelta) {
        topDelta = marker.delta;
        topDeltaId = marker.id;
      }

      this.updateItemDisplay(item, marker);

    }

    // After checking all markers,
    // mark which had top movement.
    if (topDeltaId >= 0 && topDelta > 6) {
      // Only make a change if delta is larger
      // than X. Prevents unintentional highlight
      // jittering when everything is resting.

      this.setActiveItem(topDeltaId);

    }

  }

  setActiveItem(activeId) {

    // Exit early if trying
    // to set same active item.
    if (this.activeItem && this.activeItem.key == activeId) {
      return;
    }

    let item;

    for (let key in this.items) {

      item = this.items[key];

      if (key == activeId) {

        // Deal with active item.
        item.active = true;
        this.activeItem = this.items[key];

        // Z-sort active item to top
        item.zIndex = _.size(this.items) + 1;
        item.target.css('z-index', item.zIndex);

        // Move arrows into
        // active item's div
        this.activeItem.target.append($('#arrows'));

        // Update active block label
        $('#arrows #label').html(this.activeItem.label);

        // Hide no-block instructions.
        $('#intro-instruct').hide();

      } else {

        item.active = false;

        // Reduce z sorting layer.
        item.zIndex = item.zIndex - 1;
        item.target.css('z-index', item.zIndex);

      }

    }

  }

  incrementImage(incremental) {

    if (!this.activeItem) return;

    const numAssets = this.activeItem.activeAssets.length;
    let index = this.activeItem.assetIndex;

    index += incremental;

    if (index > numAssets - 1) {
      index = 0;
    } else if (index < 0) {
      index = numAssets - 1;
    }

    // Update img source
    this.activeItem.assetIndex = index;
    this.activeItem.image.attr('src', this.activeItem.activeAssets[index]);

  }

  incrementScale(dir) {

    if (!this.activeItem) return;

    const currentScale = this.activeItem.scale;

    if (currentScale >= 1.0) {
      if (dir > 0) {
        newScale = 0.36;
      } else {
        newScale = 0.6;
      }
    } else if (currentScale >= 0.6) {
      if (dir > 0) {
        newScale = 1.0;
      } else {
        newScale = 0.36;
      }
    } else {
      if (dir > 0) {
        newScale = 0.6;
      } else {
        newScale = 1.0;
      }
    }

    this.activeItem.scale = newScale;
    TweenMax.set(this.activeItem.target, { scale: newScale });

  }

  updateItemDisplay(item, marker) {

    // Calculate item's position
    // on poster with current settings.
    let x = marker.center.x;
    let y = marker.center.y;

    // Emsure position is within
    // target quad. (quadPos will be -1 otherwise)
    if (marker.quadPos.x >= 0) {

      x = marker.quadPos.x * this.posterWidth;
      y = marker.quadPos.y * this.posterHeight;

      if (Session.get('flip-output-h') == true) {
        x = this.posterWidth - x;
      }

    } else {

      console.log('Marker "' + item.id + '" is outside target quad. Do not update.');
      return;

    }

    let rotation = -marker.rot;

    // If item isn't already
    // 'alive', show and awake.
    if (item.alive == false) {

      // New item added to workspace

      item.alive = true;
      item.deadCount = 0;

      // New item's always default to middle size
      item.scale = 0.6;

      TweenMax.killTweensOf(item.target);
      TweenMax.set(item.target, {autoAlpha:1.0, scale: item.scale, x:x, y:y, rotation:rotation + '_short'});
      TweenMax.from(item.target, 0.2, {autoAlpha:0.0, scale:item.scale + 0.4});

      // First asset defaults
      // to instruction blocks.
      if (this.getAliveCount() <= 1 || this.inactivitySeconds >= 15) {
        item.image.attr('src', 'images/block-instruct.png');
      } else {
        // Assume user doesn't need instructions.
        // Default to most recent asset.
        item.image.attr('src', item.activeAssets[item.assetIndex]);
      }

    } else {

      // Here, we check to make sure the
      // display's transform has changed
      // a significant amount before applying.
      // This prevents jittering when it
      // should be static.
      if (Math.abs(item.prevRot - rotation) < 3) {
        rotation = item.prevRot;
      } else {
        // If significant change,
        // reset inactivity counter.
        this.resetInactivity();
      }

      if (Math.abs(item.prevX - x) < 3) {
        x = item.prevX;
      } else {
        this.resetInactivity();
      }

      if (Math.abs(item.prevY - y) < 3) {
        y = item.prevY;
      } else {
        this.resetInactivity();
      }

      // Snap rotation when close to 0°
      // this is to prevent frustrating
      // "close but not perfect" alignment.
      if (rotation < 3 && rotation > -3) {
        rotation = 0;
      }

      // Item already showing.
      // Smooth between current position
      // and target position...
      TweenMax.to(item.target, 0.2, {x:x, y:y, rotation:rotation + '_short'});

      // TEMP: Set arrow positions
      // based on active item's
      // size. Could be optimized
      // further. Should probably
      // not calc size each tick or
      // do jq lookup each tick
      if (item.active == true) {

        const offset = (item.image.outerWidth() + $(item.target).find('#arrows .right').outerWidth()) * 0.51;

        TweenMax.to($(item.target).find('#arrows .right'), 0.15, {left:offset});
        TweenMax.to($(item.target).find('#arrows .left'), 0.15, {left:-offset});

        const itemTop = item.image.outerHeight() * -0.5;
        TweenMax.to($(item.target).find('#arrows #label'), 0.15, {top:itemTop});

      }

      // Remember transform values
      // to check for meaningful
      // change next cycle
      item.prevRot = rotation;
      item.prevX = x;
      item.prevY = y;

    }

  }

  // Remove items whose markers
  // have no-showed for X cycles.
  updateLifeCycles(markers) {

    let item;
    let hasActiveMarker;

    for (let key in this.items) {

      item = this.items[key];

      // Skip dead items.
      if (!item.alive) continue;

      // Is this marker still active
      // according to current batch of
      // incoming marker objects?
      hasActiveMarker = Utils.arrayContainsId(markers, key);

      if (hasActiveMarker == true) {

        item.deadCount = 0;

      } else {

        item.deadCount++;

        if (item.deadCount > 80) {

          // Marker has been MIA for a while now,
          // let's assume the user has intentionally
          // removed it from the poster and remove.
          TweenMax.killTweensOf(item.target);
          TweenMax.to(item.target, 0.15, { scale: item.scale - 0.3, autoAlpha:0.0});

          item.alive = false;

          // If this item was active
          // shift, highlight to another
          // random alive item.
          const aliveItemId = this.fishAliveIDs();

          if (aliveItemId === undefined) {
            // No blocks remaining.
            // Show inactive instruction message.
            $('#intro-instruct').show();
            this.activeItem = null;
          } else {
            this.setActiveItem(aliveItemId);
          }

        }

      }

    }

  }

  resetInactivity() {

    this.inactivitySeconds = 0;

    // If red UI is hidden and not saving, show.
    if (this.state.saveLockdown == false) {
      TweenMax.to($('.ar-poster #arrows'), 0.2, {autoAlpha:1.0});
    }

    if (this.state.attractMode == true) {

      this.setState({attractMode:false});

      // Hide inactive instruction message.
      $('#intro-instruct').hide();

      let item;

      // Fade in all items.
      for (let key in this.items) {

        item = this.items[key];
        $(item.image).removeClass('grayed');

      }

    }

  }

  fishAliveIDs() {

    for (let key in this.items) {

      if (this.items[key].alive == true) {

        return key;

      }

    }

  }

  getAliveCount() {

    let count = 0;

    for (let key in this.items) {

      if (this.items[key].alive == true) {

        count++;

      }

    }

    return count;

  }

  /**
   * Toggle between old and new assets.
   */
   toggleOldNew() {

     if (this.state.assetGenre == 'new') {
       this.setState({assetGenre:'old'});
     } else {
       this.setState({assetGenre:'new'});
     }

     this.refreshActiveAssets();

   }

   /**
   * Toggle between languages.
   */
   toggleLanguage() {

     if (this.state.language == 'en') {
       this.setState({language:'es'});
     } else {
       this.setState({language:'en'});
     }

     this.refreshActiveAssets();

   }

   /**
   * Filter assets based on toggles.
   */
   filterAssets(assets, genre, lang) {

     return assets.filter((src)=> {
       return (src.substring(src.length - 10, src.length - 7) == genre &&
                src.substring(src.length - 6, src.length - 4) == lang);
     });

   }

   /**
   * Set active assets for all items.
   */
   refreshActiveAssets() {

     let item;

     for (let key in this.items) {

       item = this.items[key];
       item.activeAssets = item.assets[this.state.assetGenre][this.state.language];

       // Reload image in current set.
       item.image.attr('src', item.activeAssets[item.assetIndex]);

     }

     // Refresh background
     const bgSrc = 'bg_' + this.state.assetGenre + '_' + this.state.language + '.png';
     Session.set('backgrounds', bgSrc);

   }

   /**
    * Hold to save.
    */
    startHoldToSave() {

      console.log('Hold to save start.');

      // Clear any current
      // hold to save...
      this.stopHoldToSave();

      // If red UI is showing, hide.
      this.setState({saveLockdown:true});
      TweenMax.to($('.ar-poster #arrows'), 0.15, {autoAlpha:0.0});

      this.holdToSaveStart = Date.now();
      const timeRequired = 2000;

      // TEMP
      TweenMax.to('.workspace', 1.5, { ease:Power3.easeOut, scale: 0.9});
      TweenMax.set('body', { backgroundColor: 'rgba(255,0,0,0.8)'});

      this.holdToSaveTimer = setInterval(() => {

        const timeHeld = Date.now() - this.holdToSaveStart;
        const percentage = timeHeld / timeRequired;

        // TEMP - USE CSS TO DRAW CLOCK TIMER
        let percDeg = Math.ceil(90 + (percentage * 360) * 0.5);
        let backgroundClock = '';
        if (percDeg < 180) {
          backgroundClock = 'linear-gradient(' + percDeg + 'deg, transparent 50%, #111114 50%), linear-gradient(' + (-percDeg) + 'deg, transparent 50%, #111114 50%)';
        } else {
          backgroundClock = 'linear-gradient(' + percDeg + 'deg, rgba(255,0,0,0.8) 50%, transparent 50%), linear-gradient(' + (-percDeg) + 'deg, rgba(255,0,0,0.8) 50%, #111114 50%)';
        }

        TweenMax.set('body', { backgroundImage: backgroundClock });

        if (timeHeld > timeRequired) {
          console.log('! [o] ! • Hold to save success.');
          this.stopHoldToSave();
          this.saveLayoutAsImage();

          TweenMax.set('body', { backgroundImage: 'linear-gradient(#fff 0%, #fff 100%)'});
          TweenMax.from('.workspace', 3.0, { opacity: 0.01, ease:Power3.EaseIn});

        }

      }, 12);

    }

    /**
    * Cancel attempt to save.
    */
    stopHoldToSave() {

      clearInterval(this.holdToSaveTimer);
      this.setState({saveLockdown:false});

      // TEMP
      TweenMax.set('body', { backgroundColor: 'white'});
      TweenMax.to('.workspace', 0.4, { scale: 1.0});

    }

   /**
    * Save ad layout as image.
    */
    saveLayoutAsImage() {

      console.log('saveLayoutAsImage()');

      // TODO: Hide anything not wanted
      // in exported image.

      // Flatten desired layers into canvas
      const renderContainer = $('.workspace')[0];

      html2canvas(renderContainer, {
        onrendered: (canvas) => {
          // Canvas is the final rendered <canvas> element
          this.handleSavedImage(canvas);
        },
      });

    }

    /**
     * Do things with saved image.
     */
     handleSavedImage(canvas) {

       const img = canvas.toDataURL('image/png');
       const blob = this.dataURItoBlob(img);

       const fileReader = new FileReader();
       const method = 'readAsBinaryString';

       // TEMP CFS file save
       ImageFiles.insert(blob, function(err, fileObj) {

         // Inserted new doc with ID fileObj._id,
         // and kicked off the data upload using HTTP

         if (err) {
           // Handle error
           console.log('Images.insert::ERROR ');
           console.log(err);
         } else {
           console.log('Images.insert::SUCCESS');

           fileObj.on('uploaded', () => {
             fileObj.off('uploaded'); // Remove listener
             console.log('fileObj uploaded');

             // Add new ad to saved ads collection
             Meteor.call('saveAdvertisement', fileObj._id);
           });

         }

       });

       // TODO: Reset advertisement.

     }

     // Converts image string
     // to image blob.
  dataURItoBlob(dataURI) {

    let byteString = atob(dataURI.split(',')[1]);
    let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    let ab = new ArrayBuffer(byteString.length);
    let ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });

  }

  render() {

    return <div className='ar-poster'>

              <div id='name' className='item'>
                <img src='#' className='asset'/>
              </div>

              <div id='details' className='item'>
                <img src='#' className='asset'/>
              </div>

              <div id='claim' className='item'>
                <img src='#' className='asset'/>
              </div>

              <div id='endorsement' className='item'>
                <img src='#' className='asset'/>
              </div>

              <div id='image' className='item'>
                <img src='#' className='asset'/>
              </div>

              <div id='flair' className='item'>
                <img src='#' className='asset'/>
              </div>

              <div id='motion1' className='item'>
                <img src='#' className='asset'/>
              </div>

              <div id='motion2' className='item'>
                <img src='#' className='asset'/>
              </div>

              <div id='motion3' className='item'>
                <img src='#' className='asset'/>
              </div>

              <div id='arrows'>
                <h3 id='label'>(Block) Label Here</h3>
                <img src='images/arrow.png' className='right'/>
                <img src='images/arrow.png' className='left'/>
              </div>

              <div id='intro-instruct' className='center-overlay'>
                <img src='images/intro-instruct.png'/>
              </div>

          </div>;
  }
}

ArPoster.propTypes = {

};
