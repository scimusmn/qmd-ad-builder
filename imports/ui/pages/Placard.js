import React from 'react';
import { Link } from 'react-router';
import { Row, Col, Button } from 'react-bootstrap';
import CarouselContainer from '../containers/AdCarousel';

const Placard = () => (
  <div className='placard'>
    <Row>
      <Col xs={ 12 }>
        <div className='page-header clearfix'>
          <h4 className='pull-left'>Here, the cycling placards will display.</h4>
          <CarouselContainer />
        </div>
      </Col>
    </Row>
  </div>
);

export default Placard;
