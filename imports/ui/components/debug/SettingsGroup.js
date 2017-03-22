/* eslint-disable max-len, no-return-assign */

import React from 'react';
import { Setting } from './Setting';
import { Option } from './Option';
import _ from 'underscore';

export class SettingsGroup extends React.Component {

  constructor(props) {

    super(props);

    this.state = {

    };

    this.optionChangeCallback = this.optionChangeCallback.bind(this);

  }

  componentDidMount() {

  }

  componentWillUnmount() {

  }

  optionChangeCallback(event) {

    console.log('Settings group change: ', this.props.id, '->', event.target.id);

    const optionId = event.target.id;

    Session.set(this.props.id, optionId);

  }

  groupLabel() {

    let label = this.props.label;

    if (label == undefined) {
      label = s.titleize(s.humanize(this.props.id));
    }

    return label;

  }

  renderLabel() {
    if (this.props.label != '') {
      return <h2 className='label'>{this.props.label}</h2>;
    } else {
      return '';
    }
  }

  renderChildren() {

    if (this.props.options) {

      // Create children from passed array...
      let optionsJSX = [];

      for (var i = 0; i < this.props.options.length; i++) {

        let option = this.props.options[i];

        // Convert string to usesable object.
        if (typeof option == 'string') {
          option = {id:option,label:option};
        }

        if (_.has(option, 'id') == false && _.has(option, 'label') == true) {
          option.id = option.label;
        }

        if (_.has(option, 'label') == false) {
          option.label = option.id;
        }

        optionsJSX.push(<Option key={i} id={option.label} groupName={this.props.label} changeCallback={this.optionChangeCallback}></Option>);

      }

      return <div>{optionsJSX}</div>;

    } else {

      return this.props.children;

    }

  }

  render() {

    return <div id={this.props.id} className='debug-settings-group'>
              {this.renderLabel()}
              {this.renderChildren()}
           </div>;

  }
}

SettingsGroup.propTypes = {
  id: React.PropTypes.string,
  label: React.PropTypes.string,
  options: React.PropTypes.array,
};

SettingsGroup.defaultProps = {
  id: '',
  label: '',
};
