import React from 'react';
import {Route, Redirect} from 'react-router-dom';
import PropTypes from 'prop-types'
import {connect} from 'react-redux';

//...rest and anything else 
const PrivateRoute = ({ component: Component, auth: {isAuthenticated, loading}, ...rest}) => (
    <Route {...rest} render={props => 
        !isAuthenticated && !loading ? 
        (<Redirect to="/login" /> ) : (<Component {...props}/>)}/>
)

PrivateRoute.propTypes = {
    auth: PropTypes.object.isRequired,
}

//GET ALL STATE AUTH FROM AUTH REDUCER
const mapStateToProps = state => ({
    auth: state.auth
})

//GET ACCES TO REDUX STORE
export default connect(mapStateToProps)(PrivateRoute)
