import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import SavedAds from '../../api/savedAds/savedAds.js';
import Loading from '../components/Loading.js';
import { FinaleSequence } from '../components/FinaleSequence.js';

const composer = (params, onData) => {

  const subscription = Meteor.subscribe('savedAds');

  if (subscription.ready()) {

    // Sort by timestamp, limit to 1
    const savedAd = SavedAds.find({}, {sort: {timestamp: -1}, limit: 1}).fetch()[0];

    const savedGenre = Session.get('savedGenre');

    onData(null, { savedAd, savedGenre });

  }

};

export default composeWithTracker(composer, Loading)(FinaleSequence);
