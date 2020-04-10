import React, {Fragment, useEffect} from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Alert from './components/layout/Alert';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import {loadUser} from './actions/auth';
import Dashboard from './components/dashboard/Dashboard';
import PrivateRoute from './components/routing/PrivateRoute';

import setAuthToken from '../src/utils/setAuthToken';

//Redux will combine together with Provider
import {Provider} from 'react-redux';
import store from './store';

import './App.css';

//global token in header
if(localStorage.token) {
  setAuthToken(localStorage.token)
}


//Fragment ghost element ,[] runs only one time
const App = () => {
  //dispatch loadUser 
  useEffect(() => {
    store.dispatch(loadUser())

  }, [] )

  return (
  <Provider store ={store}>
    <Router>
        <Fragment>
          <Navbar/>
          <Route exact path="/" component={Landing} />
          <section className="container">
            <Alert/>
            <Switch>
              <Route exact path="/Register" component={Register}/>
              <Route exact path="/login" component={Login}/>
              <PrivateRoute exact path="/dashboard" component={Dashboard}/>
            </Switch>
          </section>
        </Fragment>
      </Router>
  </Provider>
  
)};

export default App;
