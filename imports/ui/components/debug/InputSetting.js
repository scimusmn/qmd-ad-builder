/* eslint-disable max-len, no-return-assign */

import React from 'react';
import s from 'underscore.string';

export class InputSetting extends React.Component {

  constructor(props) {

    super(props);

    this.state = {

    };

    // Bind methods to this instance.
    this.handleChange = this.handleChange.bind(this);

    this.inputTimer = {};

  }

  componentDidMount() {

    // Listen for external changes
    // to this setting.
    Tracker.autorun(() => {

      this.refs.textSetting.value = Session.get(this.props.id);

    });

  }

  componentWillUnmount() {

  }

  handleChange(event) {

    clearTimeout(this.inputTimer);
    this.inputTimer = setTimeout(() => {
      this.commitCurrentValue();
    }, 5000);

  }

  commitCurrentValue() {

    const val = this.refs.textSetting.value;

    if (!val || val == undefined || val == 'undefined') {
      console.log('Warning: Invalid InputSetting ' + this.props.id + ': ' + val);
      return;
    }

    this.props.onChange(this.props.id, val);

  }

  renderLabel() {

    let labelTxt = this.props.label;
    if (labelTxt === '') label = s.titleize(s.humanize(this.props.id));
    return labelTxt;

  }

  getLabel() {

    let labelTxt = this.props.label;

    if (labelTxt == undefined) {
      labelTxt = s.titleize(s.humanize(this.props.id));
    }

    return labelTxt;

  }

  render() {

    return <div className='debug-setting'>

              <label>
                <input id={this.props.id} ref='textSetting' type={this.props.forceNum ? 'number' : 'text'} className={this.props.forceNum ? 'number' : 'text'} onChange={this.handleChange}></input>
                <span className='setting-label'>{this.getLabel()}</span>
              </label>

           </div>;

  }

}

InputSetting.propTypes = {
  id: React.PropTypes.string,
  label: React.PropTypes.string,
  defaultValue: React.PropTypes.number,
  onChange:React.PropTypes.func,
  forceNum:React.PropTypes.bool,
};

InputSetting.defaultProps = {
  defaultValue: 10,
  forceNum: false,
};

