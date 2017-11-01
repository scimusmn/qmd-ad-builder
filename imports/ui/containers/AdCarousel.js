import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import SavedAds from '../../api/savedAds/savedAds.js';
import { AdCarousel } from '../components/AdCarousel.js';
import Loading from '../components/Loading.js';

const composer = (params, onData) => {

  const subscription = Meteor.subscribe('savedAds');

  if (subscription.ready()) {
    // Get all...
    // const savedAds = SavedAds.find().fetch();

    // Sort by timestamp, limit to 10
    const savedAds = SavedAds.find({}, {sort: {timestamp: -1}, limit: 15}).fetch();

    onData(null, { savedAds });

  }

};

export default composeWithTracker(composer, Loading)(AdCarousel);
