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
      collapsed: false,
      dragPosition: {x:0,y:0},
    };

    this.optionChangeCallback = this.optionChangeCallback.bind(this);
    this.settingChangeCallback = this.settingChangeCallback.bind(this);
    this.handleDragStop = this.handleDragStop.bind(this);
    this.onCollapseClick = this.onCollapseClick.bind(this);

  }

  componentDidMount() {

    // Listen for external changes
    // to this setting.
    Tracker.autorun(() => {

      const newPosition = Session.get('POSXY-' + this.props.id);
      console.log('new position detected', Session.get('POSXY-' + this.props.id));
      this.setState({dragPosition:newPosition});

    });

  }

  optionChangeCallback(event) {

    const optionId = event.target.id;

    this.emitSettings(this.props.id, optionId);

  }

  settingChangeCallback(key, value) {

    this.emitSettings(key, value);

  }

  handleDragStop(event, position) {

    const newPosition = {x:position.x,y:position.y};

    this.setState({dragPosition:newPosition});

    this.emitSettings('POSXY-' + this.props.id, newPosition);

  }

  onCollapseClick(event) {

    console.log('onCollapseClick');
    this.setState({collapsed: !this.state.collapsed})

    // this.emitSettings('COLLAPSE-' + this.props.id, this.state.collapsed);

  }

  emitSettings(key, value) {
    this.props.onChange(key, value);
  }

  collapseClassName() {

    let className = 'label collapse-btn';

    if (this.state.collapsed == true) {
      className += ' down';
    } else {
      className += ' up';
    }

    return className;

  }

  renderLabel() {
    let label = this.props.label;
    if (label === '') label = s.titleize(s.humanize(this.props.id));
    return <div>

      <h2 className='label'>{label}</h2>
      <div className='handle bar'></div>
      {/* <h2 className={this.collapseClassName()} onClick={this.onCollapseClick}><span className='tri-symbol'></span></h2> */}

    </div>;

  }

  renderChildren() {

    if (this.state.collapsed == false) {

      if (this.props.type == 'select') {

        return this.renderSelectionGroup();

      } else {

        // Add onChange property to all children
        const childrenWithProps = React.Children.map(this.props.children,
          (child) => React.cloneElement(child, {
            onChange: this.settingChangeCallback.bind(this),
          })
        );

        return childrenWithProps;

      }

    } else {

      return null;

    }

  }

  renderSelectionGroup() {

    // Create children from passed array...
    let optionsJSX = [];

    for (var i = 0; i < this.props.children.length; i++) {

      let option = this.props.children[i];
      optionsJSX.push(<Option key={option.key} id={option.props.id} groupName={this.props.id} changeCallback={this.optionChangeCallback.bind(this)}></Option>);

    }

    return <div>{optionsJSX}</div>;
  }

  render() {

    return <Draggable id={this.props.id} handle='.handle' onStop={this.handleDragStop} position={this.state.dragPosition}>
              <div id={this.props.id} className='settings-group'>
                {this.renderLabel()}
                {this.renderChildren()}
             </div>
           </Draggable>;

  }

}

SettingsGroup.propTypes = {
  id: React.PropTypes.string,
  label: React.PropTypes.string,
  type: React.PropTypes.string,
  onChange: React.PropTypes.func,
};

SettingsGroup.defaultProps = {
  id: '',
  label: '',
  type: 'generic',
};
