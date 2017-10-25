import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { Accounts } from 'meteor/accounts-base';

import SavedAds from '../../api/savedAds/savedAds';
import ImageFiles from '../../api/ImageFiles';

if (!Meteor.isProduction) {
  const users = [{
    email: 'admin@admin.com',
    password: 'password',
    profile: {
      name: { first: 'Carl', last: 'Winslow' },
    },
    roles: ['admin'],
  },];

  users.forEach(({ email, password, profile, roles }) => {
    const userExists = Meteor.users.findOne({ 'emails.address': email });

    if (!userExists) {
      const userId = Accounts.createUser({ email, password, profile });
      Roles.addUsersToRoles(userId, roles);
    }
  });
}

/**
*
* When a large quantity of saved ads build
* up in the database, clean them out by
* emptying both the databases, as well as
* deleting the actual image files.
*
*/

const savedAds = SavedAds.find();
const imageFiles = ImageFiles.find();
const MAX_SAVED_ADS = 75;

console.log('Checking SavedAds count on startup. ', savedAds.count(), imageFiles.count());

if (savedAds.count() > MAX_SAVED_ADS && imageFiles.count() > MAX_SAVED_ADS) {

  clearAllSavedAds();

} else {
  console.log('Not enough SavedAds to warrant clearing databases.');
}

function clearAllSavedAds() {

  console.log('Clearing all SavedAds and ImageFiles to prevent filling hard drive...');
  console.log('removing count...', savedAds.count(), imageFiles.count());

  // Remove all SavedAds from mongo collection
  SavedAds.remove({});

  // Remove all ImageFiles from mongo collection
  // Since this collection is of type FS.Collection,
  // the actual image files will also be deleted from drive.
  ImageFiles.remove({});

  console.log('removed count...', savedAds.count(), imageFiles.count());

}
