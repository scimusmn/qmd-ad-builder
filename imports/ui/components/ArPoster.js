/* eslint-disable max-len, no-return-assign */

import { Meteor } from 'meteor/meteor';
import React from 'react';
import arCam from '../../modules/client/ArCamera';
import Utils from '../../modules/client/Utils';
import ImageFiles from '../../api/ImageFiles';
import TweenMax from 'gsap';
import html2canvas from '../../modules/client/vendor/html2canvas/dist/html2canvas';
import CarouselContainer from '../containers/AdCarousel';

export class ArPoster extends React.Component {

  constructor(props) {

    super(props);

    this.state = {

      assetGenre: 'old',
      language: 'en',
      saveLockdown: false,
      attractMode: false,

    };

    // Dictionary to find
    // item ids from marker ids.
    this.lookup = {

      343:{ id:'name', labelEn:'Suspicious Name', labelEs:'Nombre Sospechoso' },
      672:{ id:'details', labelEn:'The Devil\'s in the... Details', labelEs:'Detalles Engañosos' },
      1019:{ id:'claim', labelEn:'False Claim', labelEs:'Reclama Falsa' },
      839:{ id:'endorsement', labelEn:'Meaningless Endorsement', labelEs:'Respaldo Insensato' },
      975:{ id:'image', labelEn:'Misleading Images', labelEs:'Imagen Engañosa' },
      767:{ id:'flair', labelEn:'Attention-grabbing Flair', labelEs:'Estilo Llamativo' },

    };

    // Holds all poster items.
    // Dynamically populated.
    this.items = {};

    this.activeItem;

    this.inactivitySeconds = 0;
    this.holdToSaveTimer = {};
    this.holdToSaveStart = 0;

    // Enable to never auto-remove
    // when tag disappear (for debug)
    this.noKillMode = false;

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
      const labelEn = this.lookup[key].labelEn;
      const labelEs = this.lookup[key].labelEs;
      const $target = $('#' + itemId);
      const $image = $target.find('img');

      // TODO: Should add div to container here?
      // That way we can add/remove categories
      // more easily without having to tie
      // to specific divs.

      this.items[key] = { id:itemId,
                          key:key,
                          labelEn:labelEn,
                          labelEs:labelEs,
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
                              es: this.filterAssets(result, 'new', 'es'),
                            };

          item.assets.old = { en: this.filterAssets(result, 'old', 'en'),
                              es: this.filterAssets(result, 'old', 'es'),
                            };

          // Default to new english set.
          item.activeAssets = item.assets.old.en;

          // Set default asset
          item.image.attr('src', item.activeAssets[item.assetIndex]);

        }

      });

    };

    // Listen for keyboard events
    // (Physical buttons and debug keys)
    this.setupKeyboardListeners();

    // Start inactivity counter
    setInterval(() => {

      this.inactivitySeconds++;

      if (this.inactivitySeconds == 5) {

        // If red UI is showing, hide.
        TweenMax.to($('.ar-poster #arrows'), 0.25, {autoAlpha:0.0});

      }

      // After long inactivity, hide all items
      // and show main intructions. This handles
      // the scenario of someone walking away
      // leaving blocks on the glass.
      if (this.inactivitySeconds == 20) {

        this.setState({attractMode:true});
        Session.set('attractMode', true);

        let item;

        // Fade out all items.
        for (let key in this.items) {

          item = this.items[key];
          $(item.image).addClass('grayed');

        }

        // Show inactive instruction message.
        $('#attract-overlay').show();

      }

      // After longer inactivity, refresh
      // browser to clear cache and cobwebs.
      if (this.inactivitySeconds == 300) {

        location.reload();

      }

    }, 1000);

    // Some initial display states
    $('.ar-poster #arrows').hide();
    TweenMax.set($('.black-overlay'), { autoAlpha: 0.0});

  }

  componentWillUnmount() {

    // Stop all tweens
    // and timers.

  }

  setupKeyboardListeners() {

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

    // Language Toggle
    Mousetrap.bind(['l', 'g'], () => {

      this.toggleLanguage();
      this.resetInactivity();

    });

    // Hold to save
    Mousetrap.bind(['return', 'e'], (event) => {

      // Ignore key repeats
      // Ignore is savedGenre is set,
      // meaning finale sequence in progress...
      if (event.repeat == false && Session.get('savedGenre') == '') {
        this.resetInactivity();
        this.startHoldToSave();
      }

    }, 'keydown');

    Mousetrap.bind(['return', 'e'], () => {

      this.stopHoldToSave();

    }, 'keyup');

    // Debug Util
    // Create random layout despite
    // current blocks. Good for when you
    // need to test assets without a full
    // camera setup
    Mousetrap.bind(['r'], () => {

      this.noKillMode = true;

      // Hide no-block instructions.
      $('#attract-overlay').hide();
      this.resetInactivity();

      const numBlocks = Math.floor(Math.random() * 3) + 2;

      let item;
      let hasActiveMarker;

      for (let key in this.items) {

        item = this.items[key];

        var rand = Math.random();

        if (rand < 0.6) {
          // Show, scale, and place.

          item.alive = true;
          item.deadCount = 0;

          // Middle size
          item.scale = Math.random() * 0.5 + 0.3;

          const rotation = 0;

          const rX = Math.random() * 500 + 150;
          const rY = Math.random() * 750 + 100;

          TweenMax.killTweensOf(item.target);
          TweenMax.set(item.target, {autoAlpha:1.0, scale: item.scale, x:rX, y:rY, rotation:rotation + '_short'});
          TweenMax.from(item.target, 0.2, {autoAlpha:0.0, scale:item.scale + 0.4});

          // Display random asset
          const rAIndex = Math.floor(Math.random() * 4);
          item.image.attr('src', item.activeAssets[rAIndex]);

        } else {
          // Hide

          // Skip dead items.
          if (!item.alive) continue;

          // Marker has been MIA for a while now,
          // let's assume the user has intentionally
          // removed it from the poster and remove.
          TweenMax.killTweensOf(item.target);
          TweenMax.to(item.target, 0.15, { scale: item.scale - 0.3, autoAlpha:0.0});
          item.alive = false;

        }

      }

    });

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
        $('.ar-poster #arrows').show();

        // Update block label
        this.refreshActiveBlockLabel();

        // Hide no-block instructions.
        $('#attract-overlay').hide();

      } else {

        item.active = false;

        // Reduce z sorting layer.
        item.zIndex = item.zIndex - 1;
        item.target.css('z-index', item.zIndex);

      }

    }

  }

  refreshActiveBlockLabel() {
    // Update active block label
    if (this.activeItem) {
      if (this.state.language == 'en') {
        $('#arrows #label').html(this.activeItem.labelEn);
      } else {
        $('#arrows #label').html(this.activeItem.labelEs);
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
        const blockInstructSrc = 'images/block-instruct_' + this.state.language + '.png';
        item.image.attr('src', blockInstructSrc);
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

        if (this.noKillMode == true) return;

        item.deadCount++;

        if (item.deadCount > 160) {

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
            $('#attract-overlay').show();
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
      Session.set('attractMode', false);

      // Hide inactive instruction message.
      $('#attract-overlay').hide();

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

     if (this.state.assetGenre == 'old') {
       this.setState({assetGenre:'new'});
     } else {
       this.setState({assetGenre:'old'});
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

     this.refreshActiveBlockLabel();

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

     // Swap instruction assets language
     const introInstructSrc = 'images/intro-instruct_' + this.state.language + '.png';
     $('#intro-instruct img').attr('src', introInstructSrc);

     // Refresh background
     // NOTE - We opted keep same backgrounds for both languages. -tn
     // const bgSrc = 'bg_' + this.state.assetGenre + '_' + this.state.language + '.png';
     const bgSrc = 'bg_' + this.state.assetGenre + '_en.png';
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

      TweenMax.to('.workspace', 1.5, { ease:Power3.easeOut, scale: 0.9});
      TweenMax.set('body', { backgroundColor: 'rgba(255,0,0,0.8)'});

      this.holdToSaveTimer = setInterval(() => {

        const timeHeld = Date.now() - this.holdToSaveStart;
        const percentage = timeHeld / timeRequired;

        let percDeg = Math.ceil(90 + (percentage * 360) * 0.5);
        let backgroundClock = '';
        if (percDeg < 180) {
          backgroundClock = 'linear-gradient(' + percDeg + 'deg, transparent 50%, #111114 50%), linear-gradient(' + (-percDeg) + 'deg, transparent 50%, #111114 50%)';
        } else {
          backgroundClock = 'linear-gradient(' + percDeg + 'deg, rgba(255,0,0,0.8) 50%, transparent 50%), linear-gradient(' + (-percDeg) + 'deg, rgba(255,0,0,0.8) 50%, #111114 50%)';
        }

        TweenMax.set('body', { backgroundImage: backgroundClock });

        // TODO - Once sequence is settled, refactor for comments and clarity...
        if (timeHeld > timeRequired) {
          console.log('! [o] ! • Hold to save success.');

          Session.set('savedGenre', this.state.assetGenre);
          console.log('! [o] ! • Genre:', Session.get('savedGenre'));

          this.stopHoldToSave();

          TweenMax.set($('.poster-background'), { autoAlpha: 0});
          this.saveLayoutAsImage();
          TweenMax.set($('.black-overlay'), { autoAlpha: 1.0});

          TweenMax.set('body', { backgroundImage: 'linear-gradient(#fff 0%, #fff 100%)'});
          TweenMax.from('.workspace', 3.0, { opacity: 0.01, ease:Power3.EaseIn, onComplete:() => {
            // Display background once workspace fades back in (still covered by black overlay)
            TweenMax.set($('.poster-background'), { autoAlpha: 1.0});
            TweenMax.set($('.black-overlay'), { autoAlpha: 0.0});
          },});

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

      // Flatten desired layers into canvas
      TweenMax.set('.workspace', { scale: 1.0});

      // TweenMax.set('.ar-poster', { backgroundColor: 'rgba(33,255,33, 0.5)' }); // TEMP

      const renderContainer = $('.ar-poster')[0];

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

             // Add new ad to saved ads collection
             const imgFileData = {imgFileId: fileObj._id, genre: Session.get('savedGenre')};

             Meteor.call('saveAdvertisement', imgFileData, (error, result) => {

               // Ad is ready. Start finale sequence.

             });

           });

         }

       });

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

    let carouselJSX = null;
    if (this.state.attractMode == true) {
      carouselJSX = <CarouselContainer/>;
    }

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

              <div id='arrows'>
                <h3 id='label'>(Block) Label Here</h3>
                <img src='images/arrow.png' className='right'/>
                <img src='images/arrow.png' className='left'/>
              </div>

              <div id='attract-overlay'>
                <div id='intro-instruct' className='center-overlay'>
                  <img src='images/intro-instruct_en.png'/>
                </div>
                {carouselJSX}
              </div>

          </div>;
  }
}

ArPoster.propTypes = {

};
