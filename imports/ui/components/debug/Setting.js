/* eslint-disable max-len, no-return-assign */

import React from 'react';
import s from 'underscore.string';

export class Setting extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      isChecked: false,
    };

    // Bind methods to this instance.
    this.handleChange = this.handleChange.bind(this);

  }

  componentDidMount() {

    let startChecked = Session.get(this.props.id);

    if (startChecked === undefined) {
      // Session var was never set
      // Default to the defaultState
      startChecked = this.props.defaultState;

      Session.set(this.props.id, startChecked);
    }

    this.setState({isChecked: startChecked});

    // Listen for external changes
    // to this setting.
    Tracker.autorun(() => {

      this.setState({isChecked: Session.get(this.props.id)});

    });

  }

  componentWillUnmount() {

  }

  handleChange(event) {

    this.setState({isChecked: event.target.checked});

    this.props.onChange(this.props.id, event.target.checked);

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
                <input id={this.props.id} type='checkbox' className='checkbox setting-input' onChange={this.handleChange} checked={this.state.isChecked}></input>
                <span className='setting-label' >{this.getLabel()}</span>
              </label>

           </div>;
  }

}

Setting.propTypes = {
  id: React.PropTypes.string,
  label: React.PropTypes.string,
  defaultState: React.PropTypes.bool,
  onChange:React.PropTypes.func,
};

Setting.defaultProps = {
  defaultState: false,
};

