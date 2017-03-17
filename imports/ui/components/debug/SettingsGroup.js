/* eslint-disable max-len, no-return-assign */

import React from 'react';
import { ButtonToolbar, ButtonGroup, Button } from 'react-bootstrap';

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

  render() {

    return <div className='debug-settings-group'>
              {this.renderGroupLabel()}
              {this.props.children}
           </div>;
  }
}

SettingsGroup.propTypes = {
  label: React.PropTypes.string,
};

SettingsGroup.defaultProps = {
  label: '',
};
