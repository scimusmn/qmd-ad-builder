/* eslint-disable max-len, no-return-assign */

import React from 'react';
import { SettingsGroup } from './SettingsGroup';
import { SaveButton } from './SaveButton';

export class SettingsLayer extends React.Component {

  constructor(props) {

    super(props);

    this.state = {

    };

  }

  componentDidMount() {

  }

  componentWillUnmount() {

  }

  renderHeader() {

    let jsx = <div>
                <h1>{this.props.label}</h1>
                <SaveButton></SaveButton>
              </div>;

    return jsx;

  }

  renderChildren() {

    return this.props.children;

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
};

SettingsLayer.defaultProps = {
  id: 'settings',
  label: 'Settings',
};
