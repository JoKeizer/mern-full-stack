import React, {Fragment, useState} from 'react';
import { Link, Redirect } from 'react-router-dom';
import {setAlert} from '../../actions/alert'
import {register} from '../../actions/auth'
import PropTypes from 'prop-types';

//when we want to connect to store / reducer ALSO export connect down
import {connect} from 'react-redux';

//setAlert ipv props we take setAlert from props
const Register = ({setAlert, register, isAuthenticated}) => {

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        passwordTwo: ''
    });

    const {name, email, password, passwordTwo} = formData;

    //e.target.name takes name emai or password from name="name" input field
    const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();

        if(password !== passwordTwo) {
            setAlert('Passwords do not match', 'danger');
        } else {
            //register to database
            register({
                name, email, password
            }) 
        }
    }

    //REDIRECT IF LOGGED 
    if(isAuthenticated) {
        return <Redirect to='/dashboard'/>
    }

    return (
        <Fragment>
            <section className="container">
                <h1 className="large text-primary">Sign Up</h1>
                <p className="lead"><i className="fas fa-user"></i> Create Your Account</p>
                <form className="form" onSubmit={e => onSubmit(e)}>
                    <div className="form-group">
                    <input 
                        type="text" 
                        placeholder="Name" 
                        name="name" 
                        value={name} 
                        onChange={e => onChange(e)}
                    />
                    </div>
                    <div className="form-group">
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        name="email" 
                        value={email} 
                        onChange={e => onChange(e)}
                    />
                    <small className="form-text"
                        >This site uses Gravatar so if you want a profile image, use a
                        Gravatar email</small
                    >
                    </div>
                    <div className="form-group">
                    <input
                        type="password"
                        placeholder="Password"
                        name="password"
                        value={password}
                        onChange={e => onChange(e)}

                    />
                    </div>
                    <div className="form-group">
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        name="passwordTwo"
                        value={passwordTwo}
                        onChange={e => onChange(e)}
                    />
                    </div>
                    <input type="submit" className="btn btn-primary" value="Register" />
                </form>
                <p className="my-1">
                    Already have an account? <Link href="/login">Sign In</Link>
                </p>
            </section>
        </Fragment>

    );
};

Register.propTypes = {
  setAlert: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
};

//TO GET THE AUTH STATE REDUCER GET 
const mapStateToProps = state => ({
    // auth: state.auth ===> ALL FROM STATE we want ONLY isAuthenticated
    isAuthenticated: state.auth.isAuthenticated
})

export default connect(mapStateToProps, {setAlert, register})(Register)
