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

  }

  componentWillUnmount() {

  }

  handleChange(event) {

    Session.set(this.props.id, event.target.checked);
    this.setState({isChecked: event.target.checked});

    // TEMP
/*    console.log('//// SESSION VARS ///////');
    _.each(Session.keys, function(element, index, list) {
      console.log(index, element);
    });
*/
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
};

Setting.defaultProps = {
  defaultState: false,
};

