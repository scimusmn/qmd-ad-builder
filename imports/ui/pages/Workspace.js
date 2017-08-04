import React from 'react';
import { Link } from 'react-router';
import { Row, Col, Button } from 'react-bootstrap';
import { ArDebug } from '../components/ArDebug';
import { ArPoster } from '../components/ArPoster';

const Workspace = () => (
  <div className='workspace'>
    <img src='#' className='poster-background'/>
    <ArDebug/>
    <ArPoster/>
  </div>
);

export default Workspace;
