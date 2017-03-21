/* eslint-disable max-len, no-return-assign */

import React from 'react';

export class Toggle extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      isChecked: false,
    };

    // Bind methods to this instance.
    this.toggleIsChecked = this.toggleIsChecked.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);

  }

  handleCheckboxChange(event) {

    const toggleState = !this.state.isChecked;
    this.setState({isChecked: toggleState});

  }

  toggleIsChecked() {

    this.setState({isChecked: !this.state.isChecked});

  }

  render() {

    if (this.state.isChecked == true) {

      return <div className='debug-toggle toggled'>
                <svg xmlns='http://www.w3.org/2000/svg' onClick={this.handleCheckboxChange}>
                  <line x1='0' x2='40' y1='0' y2='40' stroke='white' strokeWidth='1'/>
                  <line x1='40' x2='0' y1='0' y2='40' stroke='white' strokeWidth='1'/>
                  <rect x='0' y='0' width='40' height='40' stroke='white' fill='transparent' strokeWidth='1'/>
                </svg>
              </div>;

    } else {

      return <div className='debug-toggle'>
                <svg className='toggle' xmlns='http://www.w3.org/2000/svg' onClick={this.handleCheckboxChange}>
                  <rect x='0' y='0' width='40' height='40' stroke='white' fill='transparent' strokeWidth='1'/>
                </svg>
              </div>;
    }

  }
}

Toggle.propTypes = {

};

Toggle.defaultProps = {

};

