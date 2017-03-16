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

  render() {

    return <div className='debug-settings-group'>
              {this.props.children}
           </div>;
  }
}

SettingsGroup.propTypes = {

};
