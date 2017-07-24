/* eslint-disable max-len, no-return-assign */

import React from 'react';
import { Button } from 'react-bootstrap';
import s from 'underscore.string';
import Draggable from 'react-draggable'; // The default

export class SaveButton extends React.Component {

  constructor(props) {

    super(props);

    // Bind methods to this instance.
    this.handleClick = this.handleClick.bind(this);

  }

  handleClick(event) {

    this.props.onSave();

  }

  render() {

    return <div id={this.props.id} className='debug-save'>

              <Button bsStyle='success' bsSize='large' onClick={this.handleClick}>
                SAVE
              </Button>

           </div>;

  }
}

SaveButton.propTypes = {
  id: React.PropTypes.string,
  onSave: React.PropTypes.func,
};

SaveButton.defaultProps = {

};

