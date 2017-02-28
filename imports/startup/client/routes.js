/* eslint-disable max-len */

import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { Meteor } from 'meteor/meteor';
import App from '../../ui/layouts/App.js';
import Index from '../../ui/pages/Index.js';
import NotFound from '../../ui/pages/NotFound.js';
import Workspace from '../../ui/pages/Workspace.js';
import Placard from '../../ui/pages/Placard.js';


Meteor.startup(() => {
  render(
    <Router history={ browserHistory }>
      <Route path="/" component={ App }>

        <IndexRoute name="index" component={ Index } />

        <Route name="workspace" path="/workspace" component={ Workspace }  />
        <Route name="placard" path="/placard" component={ Placard } />

        <Route path="*" component={ NotFound } />

      </Route>
    </Router>,
    document.getElementById('react-root')
  );
});
