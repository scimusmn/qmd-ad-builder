/* eslint-disable max-len, no-return-assign */

import React from 'react';
import s from 'underscore.string';

export class Option extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      isChecked: false,
    };

    // Bind methods to this instance.
    this.handleChange = this.handleChange.bind(this);

  }

  componentDidMount() {

    // Listen for external changes
    // to session change
    Tracker.autorun(() => {

      // When selected, groupName will match this id.
      const selection = Session.get(this.props.groupName);

      if (selection == this.props.id) {
        this.setState({isChecked: true});
      } else {
        this.setState({isChecked: false});
      }

    });

  }

  handleChange(event) {

    this.setState({isChecked: event.target.checked});
    this.props.changeCallback(event);

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
                <input id={this.props.id} type='radio' name={this.props.groupName} className='setting-input radio' onChange={this.handleChange} checked={this.state.isChecked}></input>
                <span className='setting-label' >{this.getLabel()}</span>
              </label>

           </div>;
  }
}

Option.propTypes = {
  id: React.PropTypes.string,
  label: React.PropTypes.string,
  defaultState: React.PropTypes.bool,
  type:React.PropTypes.string,
  groupName:React.PropTypes.string,
  value:React.PropTypes.object,
};

Option.defaultProps = {
  defaultState: false,
  type:'checkbox',
  groupName:'',
  value: null,
};

