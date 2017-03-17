/* eslint-disable max-len, no-return-assign */

import React from 'react';
import { Setting } from './Setting';

export class SettingsGroup extends React.Component {

  constructor(props) {

    super(props);

    this.state = {

    };

  }

  componentDidMount() {

  }

  componentWillUnmount() {

  }

  renderGroupLabel() {
    if (this.props.label != '') {
      return <h2>{this.props.label}</h2>;
    } else {
      return '';
    }
  }

  renderGroupChildren() {

    if (this.props.options) {

      let settings = [];
      for (var i = 0; i < this.props.options.length; i++) {

        const option = this.props.options[i];
        const idStr = option.label;

        settings.push( <Setting key={i} id={idStr}></Setting> );
      }

      return <div>{settings}</div>;

    } else {

      return this.props.children;

    }
  }

  render() {

    return <div className='debug-settings-group'>
              {this.renderGroupLabel()}
              {this.renderGroupChildren()}
           </div>;
  }
}

SettingsGroup.propTypes = {
  label: React.PropTypes.string,
  options: React.PropTypes.array,
};

SettingsGroup.defaultProps = {
  label: '',
};
