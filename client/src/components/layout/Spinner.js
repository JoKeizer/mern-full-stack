import React, { Fragment } from 'react';
import spinner from './spinner.gif';

export default () => (
  <Fragment>
      <h1>LOADING</h1>
    <img
      src={spinner}
      style={{ width: '200px', margin: 'auto', display: 'block' }}
      alt='Loading...'
    />
  </Fragment>
);
