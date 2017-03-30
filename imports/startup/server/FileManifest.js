import { Meteor } from 'meteor/meteor';
import mime from 'mime';
import fs from 'fs';
import _ from 'lodash';

let manifest = {};
manifest.files = {};

const allowedTypes = [
                        'image/jpeg',
                        'image/png',
                        'image/gif',
                      ];

// Path to our images folder
const parentDirectory = `${process.env.PWD}/public/images/`;
const targetFolders = ['name', 'details', 'claim', 'endorsement', 'image', 'flair', 'name-modern', 'details-modern', 'claim-modern', 'endorsement-modern', 'image-modern', 'flair-modern'];

// On startup, gather all
// filepaths in public/ folder.
Meteor.startup(() => {

  for (var i = 0; i < targetFolders.length; i++) {

    const folder = targetFolders[i];
    const targetDirectory = parentDirectory + folder + '/';

    // Init array for this folder's paths
    manifest.files[folder] = [];

    fs.readdir(

      targetDirectory,

      // Handle the async file read process inside of Meteor's fiber
      Meteor.bindEnvironment(
        (err, files) => {

          _.each(files, file => {

            const filePath = 'images/' + folder + '/' + file;

            const mimeType = mime.lookup(filePath);

            if (_.includes(allowedTypes, mimeType)) {

              // console.log('Adding to manifest:', file);

              manifest.files[folder].push(filePath);

            }

          });
        }
      )
    );

  }

  /*
   * Expose methods
   * to client.
   */
  Meteor.methods({

    getFiles: function(folderName) {
      check(folderName, String);
      return manifest.files[folderName];
    },

  });

});

module.exports = manifest;
