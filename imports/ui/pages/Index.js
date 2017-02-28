import React from 'react';
import { Jumbotron } from 'react-bootstrap';

const Index = () => (
  <div className="Index">
    <Jumbotron className="text-center">
      <h2>WTE - Red Flags Component</h2>
      <p><a className="btn btn-default" href="/workspace" role="button">Workspace</a></p>
      <p><a className="btn btn-default" href="/placard" role="button">Placard</a></p>
      <p style={ { fontSize: '16px', color: '#aaa' } }>Science Museum of Minnesota, 2017</p>
    </Jumbotron>
  </div>
);

export default Index;
