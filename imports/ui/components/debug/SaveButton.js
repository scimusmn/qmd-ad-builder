/* eslint-disable max-len, no-return-assign */

import React from 'react';
import { Button } from 'react-bootstrap';
import s from 'underscore.string';

export class SaveButton extends React.Component {

  constructor(props) {

    super(props);

    // Bind methods to this instance.
    this.handleClick = this.handleClick.bind(this);

    // TODO: Should be absorbed from parent group id.
    this.localStorageKey = 'settings-' + props.id;

  }

  handleClick(event) {

    this.saveCurrentSettings();

  }

  saveCurrentSettings() {

    console.log('//// - saving settings - ///////');

    let settingsJSON = {};
    _.each(Session.keys, function(element, index, list) {

      console.log('[save setting] ' + index + ': ' + JSON.stringify(element));
      localStorage.setItem(index, JSON.stringify(element));

    });

    // localStorage.setItem(this.localStorageKey, JSON.stringify(settingsJSON));

  }

  componentDidMount() {

    const localSettings = localStorage.getItem(this.localStorageKey);

    // const localSettingsJSON = JSON.parse(localSettings);

    setTimeout(() => {

      console.log('/// - loading settings - ///');

      for (var i = 0; i < localStorage.length; i++) {

        const key = localStorage.key(i);

        const value = JSON.parse(localStorage.getItem(key));
        console.log('[load setting] ' + key + ': ' + value);
        Session.set(key, value);

      }

      /*  _.each(localSettingsJSON, function(element, index, list) {

          console.log('  --  ' + index + ':', element);

          Session.set(index, element);

        });*/

    }, 3500);

  }

  render() {

    return <div id={this.props.id} className='debug-save'>

              <Button bsStyle='success' bsSize='large' onClick={this.handleClick}>
                SAVE
              </Button>

           </div>;
  }
}

SaveButton.propTypes = {
  id: React.PropTypes.string,
};

SaveButton.defaultProps = {

};

