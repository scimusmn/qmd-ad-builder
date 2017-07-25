/* eslint-disable max-len, no-return-assign */

import React from 'react';
import { Button } from 'react-bootstrap';
import s from 'underscore.string';
import Draggable from 'react-draggable'; // The default

export class SaveButton extends React.Component {

  constructor(props) {

    super(props);

  }

  handleSaveClick(event) {

    this.props.onSave();

  }

  handleResetClick(event) {

    this.props.onReset();

  }

  render() {

    return <div id={this.props.id} className='debug-save'>

              <Button bsStyle='success' bsSize='large' onClick={this.handleSaveClick.bind(this)} className={this.props.unsavedChanges ? 'unsaved' : 'saved'}>
                {this.props.unsavedChanges ? 'SAVE' : '(SAVED)'}
              </Button>

              <Button bsStyle='success' bsSize='large' onClick={this.handleResetClick.bind(this)}>
                RESET
              </Button>

           </div>;

  }
}

SaveButton.propTypes = {
  id: React.PropTypes.string,
  onSave: React.PropTypes.func,
  onReset: React.PropTypes.func,
  unsavedChanges: React.PropTypes.bool,
};

SaveButton.defaultProps = {
  unsavedChanges: true,
};

