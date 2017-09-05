import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

const SavedAds = new Mongo.Collection('savedAds');
export default SavedAds;

if (Meteor.isServer) {

  Meteor.publish('savedAds', () => SavedAds.find());

}

SavedAds.allow({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

