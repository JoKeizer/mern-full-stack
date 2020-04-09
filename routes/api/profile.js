const express = require('express');
//github request
const request = require('request');
const config = require('config');

const router = express.Router();
const auth = require('../../middleware/auth');

const {check, validationResult} = require('express-validator');


//make profile model available
const Profile = require('../../models/Profile')
const User = require('../../models/User')

// @route    GET api/profile/me
// @desc     Get current users profile
// @access   Private
router.get('/me', auth, async (req, res) => {
    try {
      const profile = await Profile.findOne({
        user: req.user.id
      });
  
      if (!profile) {
        return res.status(400).json({ msg: 'There is no profile for this user' });
      }
  
      // only populate from user document if profile exists
      res.json(profile.populate('user', ['name', 'avatar']));
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

// @route POST api/profile
// @desc Create or update user profile
// @access private

router.post('/', [auth, [
    //express validator check
    check('status', 'Status is required')
    .not()
    .isEmpty(),
    check('skills', 'Skills is required')
    .not()
    .isEmpty()
] ], async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }

    //no error what to do with the data
    const {
        company,
        location,
        website,
        bio,
        skills,
        status,
        githubusername,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook
      } = req.body;

      // Build profile object req.user.id already know witch profile token
      const  profileFields = {};
      profileFields.user = req.user.id

      if(company) profileFields.company = company;
      if(website) profileFields.website = website;
      if(location) profileFields.location = location;
      if(bio) profileFields.bio = bio;
      if(status) profileFields.status = status;
      if(githubusername) profileFields.githubusername = githubusername;

      //skills is array .map and trim it doesn't matter how many spaces there are and split the text on the ,
      if(skills) {
          profileFields.skills = skills.split(',').map(skill => skill.trim())
      }
    //   console.log(profileFields.skills);

      //social field Build social object
      profileFields.social = {}
      if(youtube) profileFields.social.youtube = youtube;
      if(twitter) profileFields.social.twitter = twitter;
      if(facebook) profileFields.social.facebook = facebook;
      if(linkedin) profileFields.social.linkedin = linkedin;

      try {
        let profile = await Profile.findOne({user: req.user.id})
        if(profile) {
            //update
            profile = await Profile.findOneAndUpdate(
                {user: req.user.id}, 
                {$set: profileFields}, 
                {new: true}
            );

            return res.json(profile);
        }

        //if not found Create profile

        profile = new Profile(profileFields);

        await profile.save();
        //Send back profile
        res.json(profile);

        await Profile.save();
      } catch(err) {
          console.log(err.message)
          res.status(500).send('Server error');
      }


});

//@route Get api/profile
//@desc Get all profile
//@access Public
router.get('/', async(req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar'])
        res.json(profiles)
    } catch(err) {
        res.status(500).send('Server Error')
    }
})


//@route Get api/profile/user/:user_is
//@desc Get profile by user ID
//@access Public
router.get('/user/:user_id', async(req, res) => {
    try {
        const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name', 'avatar'])
        
        if(!profile) {
            return res.status(400).json({msg:'Profile not found' })
        }
    
        res.json(profile)
    } catch(err) {
        if(err.kind === 'ObjectId') {
            return res.status(400).json({msg:'Profile not found' })
        }
        res.status(500).send('Server Error')
    }
})



// @route    DELETE api/profile
// @desc     Delete profile, user & posts
// @access   Private
router.delete('/', auth, async (req, res) => {
    try {
    //   // Remove user posts
    //   await Post.deleteMany({ user: req.user.id });

      // Remove profile
      await Profile.findOneAndRemove({ user: req.user.id });
      // Remove user
      await User.findOneAndRemove({ _id: req.user.id });
  
      res.json({ msg: 'User deleted' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});


// @route    PUT api/profile/experience
// @desc     Add profile experience
// @access   Private
router.put(
    '/experience',
    [
      auth,
      [
        check('title', 'Title is required')
          .not()
          .isEmpty(),
        check('company', 'Company is required')
          .not()
          .isEmpty(),
        check('from', 'From date is required and needs to be from the past')
          .not()
          .isEmpty()
          .custom((value, { req }) => (req.body.to ? value < req.body.to : true))
      ]
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
      } = req.body;
  
      const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
      };
  
      try {
        const profile = await Profile.findOne({ user: req.user.id });
  
        profile.experience.unshift(newExp);
  
        await profile.save();
  
        res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  );


// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete experience from profile
// @access   Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
      const foundProfile = await Profile.findOne({ user: req.user.id });
  
      //find the experience you want to delete
      foundProfile.experience = foundProfile.experience.filter(
        exp => exp._id.toString() !== req.params.exp_id
      );
  
      await foundProfile.save();
      return res.status(200).json(foundProfile);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: 'Server error' });
    }
  });

// @route    PUT api/profile/education
// @desc     Add profile education
// @access   Private

router.put('/education', auth,       
[
    check('school', 'school is required')
      .not()
      .isEmpty(),
    check('degree', 'degree is required')
      .not()
      .isEmpty(),
      check('fieldofstudy', 'fieldofstudy is required')
      .not()
      .isEmpty(),
    check('from', 'From date is required and needs to be from the past')
      .not()
      .isEmpty()
      .custom((value, { req }) => (req.body.to ? value < req.body.to : true))
  ], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
      } = req.body;
  
      const newEducation = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
      };

      try {
          const profile = await Profile.findOne({user: req.user.id})

          profile.education.unshift(newEducation);

          await profile.save();

          res.json(profile);

      }catch(err) {
          console.log(err.message);
          res.status(500).send('Server Error')
      }
})

// @route    DELETE api/profile/education/:edu_id
// @desc     Delete education from profile
// @access   Private
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
      const foundProfile = await Profile.findOne({ user: req.user.id });
  
      //find the education you want to delete
      foundProfile.education = foundProfile.education.filter(
        edu => edu._id.toString() !== req.params.edu_id
      );
  
      await foundProfile.save();
      return res.status(200).json(foundProfile);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: 'Server error' });
    }
  });

// @route    GET api/profile/github/:username
// @desc     Get user repos from github
// @access   Public

router.get('/github/:username', async(req, res) => {
    try {

        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&
            sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            methor: 'GET',
            headers: {'user-agent': 'node.js'}
        }

        request(options, (error, response, body) => {
            if(error) console.log(error);

            if(response.statusCode !== 200) {
                res.status(404).json({msg: 'No github profile found'})
            }

            res.json(JSON.parse(body));
        })

    } catch(err) {
        console.log(err.message)
        res.status(500).send('Server Error')
    }
})

// // @route    GET api/profile/github/:username
// // @desc     Get user repos from Github
// // @access   Public
// router.get('/github/:username', async (req, res) => {
//     try {
//       const uri = encodeURI(
//         `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
//       );
//       const headers = {
//         'user-agent': 'node.js',
//         Authorization: `token ${config.get('githubToken')}`
//       };
  
//       const gitHubResponse = await axios.get(uri, { headers });
//       return res.json(gitHubResponse.data);
//     } catch (err) {
//       console.error(err.message);
//       return res.status(404).json({ msg: 'No Github profile found' });
//     }
//   });

module.exports = router
