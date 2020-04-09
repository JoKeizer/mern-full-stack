const express = require('express');
const router = express.Router();

const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator');

//Models we can use
const Post = require('../../models/Post')
const Profile = require('../../models/Profile')
const User = require('../../models/User')



//@route POST api/posts
//@desc Create a post
//@access Private

router.post('/', auth, [
    //express-validator
    check('text', 'Text is required')
    .not()
    .isEmpty()

], async(req, res) => {
    try {
        const errors = validationResult(req)

        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        //user model we can get / select the user_id
        const user = await User.findById(req.user.id).select('-password')

        //newpost new from Post Schema
        const newPost = new Post(
            {
                text: req.body.text,
                //inner from user
                name: user.name,
                avatar: user.avatar,
                //object ID
                user: req.user.id
            }
        )
        const post = await newPost.save();

        res.json(post);

    } catch(err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

//@route GET api/posts
//@desc GEt all posts
//@access Private

router.get('/', auth, async(req, res) => {
    //-1 most recent first date 1 is oldest first
    try {
        const post = await Post.find().sort({date: -1})

        res.json(post);
    }catch(error) {
        console.log(err.message);
        res.status(500).send('Server Error'); 
    }
})


//@route GET api/posts/:id
//@desc GET by user ID
//@access Private

router.get('/:id', auth, async(req, res) => {
    //-1 most recent first date 1 is oldest first
    try {
        const post = await Post.findById(req.params.id);

        //check if there is a post with ID
        if (!post) {
            return res.status(404).json({msg: "Post not found"})
        }

        res.json(post);
    }catch(error) {
        //if id is not valid object ID not showing server error
        if (err.kind === 'ObjectId') {
            return res.status(404).json({msg: "Post not found"})
        }
        console.log(err.message);
        res.status(500).send('Server Error'); 
    }
})


//@route DELETE api/posts/:id
//@desc Delete post by ID
//@access Private

router.delete('/:id', auth, async(req, res) => {
    //-1 most recent first date 1 is oldest first
    //req.params.id = user logedin param in url
    try {
        const post = await Post.findById(req.params.id);
        //post not excist
        if (!post) {
            return res.status(404).json({msg: "Post not found"})
        }
        //user delete the post that makes the post
        //user check
        //object ID vs string check
        if(post.user.toString() !== req.user.id) {
            return res.status(401).json({msg: 'User not authorized'})
        }

        //remove
        await post.remove();

        //return json
        res.json({msg: 'Post removed'});
    }catch(error) {
        //if id is not valid object ID not showing server error
        if (err.kind === 'ObjectId') {
            return res.status(404).json({msg: "Post not found"})
        }
        console.log(err.message);
        res.status(500).send('Server Error'); 
    }
})


//@route PUT api/posts/unlike/:id
//@desc Unlike a post
//@access Private

router.put('/unlike/:id', auth, async(req, res) => {

    //req.params.id included in url
    try {
        const post = await Post.findById(req.params.id);

        //check if the post had already been liked by the user
        //req.user.id is the logged in user

        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({msg: 'Post has not yet been liked'})
        }

        //remove index from the array
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id)

        post.likes.splice(removeIndex, 1)

        await post.save();
        res.json(post.likes);

    } catch {
        console.log(err.message);
        res.status(500).send('Server Error');  
    }
})


//@route POST api/comment/:id
//@desc Create a comment on a post
//@access Private

router.post('/comment/:id', auth, [
    //express-validator
    check('text', 'Text is required')
    .not()
    .isEmpty()

], async(req, res) => {
    try {
        const errors = validationResult(req)

        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        //user model we can get / select the user_id
        const user = await User.findById(req.user.id).select('-password')
        //give us the post
        const post = await Post.findById(req.params.id);

        //newpost new from Post Schema
        const newComment = 
        {
            text: req.body.text,
            //inner from user
            name: user.name,
            avatar: user.avatar,
            //object ID
            user: req.user.id
        }


        post.comments.unshift(newComment);
        await post.save();

        //send all comments back
        res.json(post.comments);

    } catch(err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

//@route DELETE api/comment/:id/:comment_id
//@desc Delete comment
//@access Private

router.delete('/comment/:id/:comment_id', auth, async(req, res) => {
  try {
      const post = await Post.findById(req.params.id)

      //pull out comment
      const comment = post.comments.find(comment => comment.id === req.params.comment_id)

      //Make sure comment exist
      if(!comment) {
          console.log(err.message);
          return res.status(404).json({msg: "Comment does not exist"})
      }

      //User delete comment is the user from comment

      if(comment.user.toString() !== req.user.id) {
        console.log(err.message);
        return res.status(401).json({msg: "User not authorized"})
      }

        //remove index from the array
        const removeIndex = post.comments
            .map(comment => comment.user.toString())
            .indexOf(req.user.id)

        post.comments.splice(removeIndex, 1)

        await post.save();
        res.json(post.comments);

  
    }catch(error) {

        console.log(error.message);
        res.status(500).send('Server Error'); 
    }
})

module.exports = router
