const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    comments : String,
    comlikes: [{
        type: Array,
        default: 0
    }]
});

module.exports = mongoose.model('comment', commentSchema);