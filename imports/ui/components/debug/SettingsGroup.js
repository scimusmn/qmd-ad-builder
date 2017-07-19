/* eslint-disable max-len, no-return-assign */

import React from 'react';
import { Setting } from './Setting';
import { Option } from './Option';
import s from 'underscore.string';
import Draggable from 'react-draggable'; // The default

export class SettingsGroup extends React.Component {

  constructor(props) {

    super(props);

    this.state = {

    };

    this.optionChangeCallback = this.optionChangeCallback.bind(this);

  }

  optionChangeCallback(event) {

    console.log('Selection group change: ', this.props.id, '->', event.target.id);

    const optionId = event.target.id;

    Session.set(this.props.id, optionId);

  }

  handleDragStop(event, position) {
    console.log('handleDragStop');
    console.log(position);
  }

  renderLabel() {
    let label = this.props.label;
    if (label === '') label = s.titleize(s.humanize(this.props.id));
    return <div>
      <h2 className='label'>{label}</h2>
      <div className='handle bar'></div>
    </div>;
  }

  renderChildren() {

    if (this.props.type == 'select') {

      return this.renderSelectionGroup();

    } else {

      // Render children as individual toggles.
      return this.props.children;

    }

  }

  renderSelectionGroup() {

    // Create children from passed array...
    let optionsJSX = [];

    for (var i = 0; i < this.props.children.length; i++) {

      let option = this.props.children[i];
      optionsJSX.push(<Option key={option.key} id={option.props.id} groupName={this.props.id} changeCallback={this.optionChangeCallback}></Option>);

    }

    return <div>{optionsJSX}</div>;
  }

  render() {

    return <Draggable id={this.props.id} handle='.handle' onStop={this.handleDragStop}>
              <div id={this.props.id} className='settings-group'>
                {this.renderLabel()}
                {this.renderChildren()}
             </div>
           </Draggable>;

  }
/*
  render() {

    return <div id={this.props.id} className='settings-group'>
              {this.renderLabel()}
              {this.renderChildren()}
           </div>;

  }
  */
}

SettingsGroup.propTypes = {
  id: React.PropTypes.string,
  label: React.PropTypes.string,
  type: React.PropTypes.string,
};

SettingsGroup.defaultProps = {
  id: '',
  label: '',
  type: 'generic',
};
