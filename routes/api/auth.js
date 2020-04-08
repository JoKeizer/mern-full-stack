const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('config')
const {check,validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');


//model 
const User = require('../../models/User')

//use middleware
const auth = require('../../middleware/auth');

//@route GET api/auth
//@desc Test route
//@access Public

//use auth now here before (req,res) make the route protected
router.get('/', auth, async(req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user)

    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server error')

    }
});

//@route POST api/auth
//@desc Authenticate user & get token
//@access Public

router.post('/', [
    //Express-validator
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }

    const {email, password } =  req.body;

    try {
        let user = await User.findOne({email})

        // See if user exist
        if(!user) {
            return res.status(400).json({errors: [{msg: "Invalid Credentials"}]})
        }

    

        //match email and password compare from bcrypt user.password is bcrypt
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return res.status(400).json({errors: [{msg: "Invalid Credentials"}]})
        }   
        
        // Retun jsonwebtoken GET a User TOKEN
        const payload = {
            user: {
                id: user.id
            }
        }

        //send token back to protect routes 
        jwt.sign(
            payload, 
            config.get('jwtSecret'),
            {expiresIn: 360000},
             (err, token) => {
                if(err) throw err;
                res.json({token})
            })


    } catch(error) {
        console.log(err.message);
        res.status(500).send('Server error')
    }
});

module.exports = router
