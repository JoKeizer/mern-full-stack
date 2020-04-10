import React, {Fragment, useState} from 'react';
import { Link, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import {login} from '../../actions/auth'
import {connect} from 'react-redux';

//props.login
const Login = ({login, isAuthenticated}) => {

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const {email, password} = formData;

    //e.target.name takes name emai or password from name="name" input field
    const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        //login reducer with redux
        login(email, password)
    }

    //REDIRECT IF LOGGED 
    if(isAuthenticated) {
        return <Redirect to='/dashboard'/>
    }

    return (
        <Fragment>
            <section className="container">
                <h1 className="large text-primary">Sign In</h1>
                <p className="lead"><i className="fas fa-user"></i> Sign Into Your Account</p>
                <form className="form" onSubmit={e => onSubmit(e)}>
                    <div className="form-group">
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        name="email" 
                        value={email} 
                        onChange={e => onChange(e)}
                        required 
                    />

                    </div>
                    <div className="form-group">
                    <input
                        type="password"
                        placeholder="Password"
                        name="password"
                        minLength="6"
                        value={password}
                        onChange={e => onChange(e)}

                    />
                    </div>
                    
                    <input type="submit" className="btn btn-primary" value="Login" />
                </form>
                <p className="my-1">
                    Don't have an account? <Link to="/register">Sign Up</Link>
                </p>
            </section>
        </Fragment>

    )
}

Login.propTypes = {
    login: PropTypes.func.isRequired,
    isAuthenticated: PropTypes.bool,

}

//TO GET THE AUTH STATE REDUCER GET 
const mapStateToProps = state => ({
    // auth: state.auth ===> ALL FROM STATE we want ONLY isAuthenticated
    isAuthenticated: state.auth.isAuthenticated
})


//GET LOGIN FROM REDUX WITH CONNECT

export default connect(mapStateToProps, {login }) (Login);
