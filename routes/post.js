const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    title: String,
    imageurl : String,
    likes : [{
        type : Array,
        default : 0
    }],
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    },
    comment : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'comment',
        default: 0
    }]  
});

module.exports = mongoose.model("postt", postSchema);