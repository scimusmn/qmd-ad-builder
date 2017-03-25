import { Meteor } from 'meteor/meteor';
import fs from 'fs';

/**
 * Server side methods
 */
Meteor.methods({

  /**
   * Save an image file from a blob
   *
   * @param blob Image data in a blob from the web camera stream
   */

  saveImageToFile: function(blob) {

    check(blob, String);

    // Generate a filename and filePath
    const filePath = process.env.PWD + '/public/saved-ads/';
    const uniqueId = uuid();
    const filename = uniqueId + '.png';
    const filePathName = filePath + filename;

    // Save file
    fs.writeFile(filePathName, blob, 'binary', function(err) {

      if (err) {

        console.log('Failed', err);

      } else {

        console.log('The file ' + filename + ' was saved to ' + filePath);

      }

    });

    /**
     * Generate a unique (enough) string for saved file names
     * @return {string} uuid
     */
    function uuid() {
      return uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
        function(c) {
          const r = Math.random() * 16 | 0;
          const v = c == 'x' ? r : r & 0x3 | 0x8;
          return v.toString(16);
        }
      );
    }

  },

});
