
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

    const PostSchema = new Schema({
    //Posts connected to users
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    text: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    avatar: {
        type: String
    },
        //Array of like user can make more than one like!

    likes: [
        {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        }
        }
    ],
        //Array of comments user can make more than one comment!

    comments: [
        {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },
        text: {
            type: String,
            required: true
        },
        name: {
            type: String
        },
        avatar: {
            type: String
        },
        date: {
            type: Date,
            default: Date.now
        }
        }
    ],
    date: {
        type: Date,
        default: Date.now
  }
});

module.exports = Post = mongoose.model('post', PostSchema);
