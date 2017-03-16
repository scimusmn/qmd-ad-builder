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
    this.toggleIsChecked = this.toggleIsChecked.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);

  }

  componentDidMount() {

    let startChecked = Session.get(this.props.id);

    if (startChecked === undefined) {
      // Session var was never set
      // Let's default to the defaultState
      startChecked = this.props.defaultState;

      Session.set(this.props.id, startChecked);
    }

    this.setState({isChecked: startChecked});

  }

  componentWillUnmount() {

  }

  handleCheckboxChange(event) {
    const checkState = event.target.checked;
    this.setState({isChecked: checkState});
    Session.set(this.props.id, checkState);

    // console.log('ALL SESSION VARS ///////')
    // _.each(Session.keys, function(element, index, list) {
    //   console.log(index, element);
    // });

  }

  toggleIsChecked() {
    const checkState = !this.state.isChecked;
    this.setState({isChecked: checkState});
    Session.set(this.props.id, checkState);
  }

  renderLabel() {

    let labelTxt = this.props.label;

    if (labelTxt == undefined) {
      labelTxt = s.humanize(this.props.id);
    }

    return <h3>{labelTxt}</h3>;
  }

  render() {

    return <div className='debug-setting'>
              {this.renderLabel()}
              <input id={this.props.id} type='checkbox' name={this.props.id} value={this.props.id} onChange={this.handleCheckboxChange} checked={this.state.isChecked}></input>
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

