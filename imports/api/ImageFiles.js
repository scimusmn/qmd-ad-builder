import { Meteor } from 'meteor/meteor';

const imageStore = new FS.Store.FileSystem('images', {});

const ImageFiles = new FS.Collection('images', {
  stores: [imageStore],
});

if (Meteor.isServer) {
  ImageFiles.allow({
    insert: function() {
      return true;
    },

    update: function() {
      return true;
    },

    remove: function() {
      return true;
    },

    download: function() {
      return true;
    },
  });

  Meteor.publish('images', () => ImageFiles.find());

}

export default ImageFiles;
