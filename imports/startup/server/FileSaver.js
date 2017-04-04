import { Meteor } from 'meteor/meteor';
import SavedAds from '../../api/savedAds/savedAds.js';



/**
 *
 * TODO: This file no longer is performing
 * its original intention, and should be renamed
 * and reorganized. It could probably become a
 * smaller part of another file.
 *
 */

/**
 * Server side methods
 */
Meteor.methods({

  /**
   * Save an image file from a blob
   *
   * @param blob Image data in a blob from the web camera stream
   */

  saveAdvertisement: function(imgFileId) {

    check(imgFileId, String);

    const imgURL = 'cfs/files/images/' + imgFileId;
    console.log('imgURL:', imgURL);

    console.log('The file ' + imgFileId + ' was saved to ' + imgURL);

    const timestamp = Date.now();

    // TEMP: We can do something like this to create memorable slugs.
    const slugAdjs = ['trusty', 'tricky', 'reliable', 'realish', 'not-fake', 'kinda', 'endorsed'];
    const slugNouns = ['product', 'ad', 'invention', 'miracle', 'discovery'];
    let slug = '';
    for (i = 0; i <= 3; i++) {
      slug += ('' + slugAdjs[Math.floor(Math.random() * slugAdjs.length)] + '-');
      if (i == 3) {
        slug += slugNouns[Math.floor(Math.random() * slugNouns.length)];
      }
    }

    const adDoc = {timestamp:timestamp, slug:slug, imgId:imgFileId, imgURL:imgURL};

    SavedAds.insert(adDoc);

  },

});
