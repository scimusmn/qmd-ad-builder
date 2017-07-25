/* eslint-disable max-len, no-return-assign */

import React from 'react';
import { Meteor } from 'meteor/meteor';
import { SettingsGroup } from './SettingsGroup';
import { SaveButton } from './SaveButton';
import _ from 'underscore';

export class SettingsLayer extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      unsavedChanges:false,
    };

    // Determine key string for local storage.
    // (If changed, saved settings will be lost)
    this.storageKey = props.storageKey;

    if (props.storageKey) {
      this.storageKey = props.storageKey;
    } else {
      this.storageKey = props.label;
    }

    console.log('SettingsLayer storageKey:', this.storageKey);

    this.currentSettings = {};

  }

  componentDidMount() {

    this.loadSavedSettings();

    Tracker.autorun(() => {

      this.currentSettings.targetQuad = Session.get('targetQuad');
      this.setState({unsavedChanges:true});

    });

  }

  onGroupChange(key, value) {

    console.log('Settings Update:', key, value);

    // Update session var
    Session.set(key, value);

    // Update settings object
    this.currentSettings[key] = value;

    this.setState({unsavedChanges:true});

  }

  saveCurrentSettings() {

    // Record all current settings
    // as cookie on hard drive.
    localStorage.setItem(this.storageKey, JSON.stringify(this.currentSettings));

    this.setState({unsavedChanges:false});

    // TODO: A future, more time consuming
    // version could be: each settings group for
    // a setting-object. Toggle lists return
    // an object full of their settings.
    // Marker detection returns an object
    // with coordinates of quad.
    // Selection group returns the id
    // of the currently selected setting...
    // Later, these, 'setting-object' can
    // also contain the drag-position and
    // open/closed state of that group.

  }

  loadSavedSettings() {

    console.log('SettingsLayer.loadSavedSettings()');

    const storedSettings = JSON.parse(localStorage.getItem(this.storageKey));

    if (!storedSettings) {

      console.log('SettingsLayer: No stored settings found.');

    } else {

      console.log(storedSettings);
      this.currentSettings = storedSettings;

      // We will broadcast the settings
      // twice, so components waiting
      // on hardware don't miss anything
      // (e.g. see ArCamera.js)
      this.broadcastSettings();

      setTimeout(() => {
        this.broadcastSettings();
      }, 5000);

    }

  }

  broadcastSettings() {

    _.each(this.currentSettings, (element, index, list) => {

      console.log('[emit setting] ' + index + ':', element);

      // Set Session variable,
      // which will alert all listeners.
      Session.set(index, element);

    });

  }

  resetAll() {

    if (confirm('Are you sure? This will revert all settings to defaults and refresh browser.') == true) {

      // Clear settings objects
      this.currentSettings = {};

      // Update local storage
      this.saveCurrentSettings();

      // Refresh browser
      window.location.reload();

    }

  }

  renderHeader() {

    let jsx = <div>
                <h1>{this.props.label}</h1>
                <SaveButton onSave={this.saveCurrentSettings.bind(this)} onReset={this.resetAll.bind(this)} unsavedChanges={this.state.unsavedChanges}></SaveButton>
              </div>;

    return jsx;

  }

  renderChildren() {

    // Add onChange property to all children
    const childrenWithProps = React.Children.map(this.props.children,
     (child) => React.cloneElement(child, {
       onChange: this.onGroupChange.bind(this),
     })
    );

    return childrenWithProps;

  }

  render() {

    return <div className='settings-layer'>

              {this.renderHeader()}
              {this.renderChildren()}

           </div>;

  }

}

SettingsLayer.propTypes = {
  id: React.PropTypes.string,
  label: React.PropTypes.string,
  storageKey: React.PropTypes.string,
};

SettingsLayer.defaultProps = {
  id: 'settings',
  label: 'Settings',
};
