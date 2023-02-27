const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const postSchema = new mongoose.Schema({
    postName : {
        type : String,
        required : true
    },
    body : {
        type : String,
        required : true
    },
    userId : {
        type : ObjectId,
        ref : 'user10',
        required : true
    },
    posted_at : {
        type : Date,
        default : new Date()
    }, 
    isDeleted : {
        type : Boolean,
        default : false
    }
}, {timestamps : true})

module.exports = mongoose.model('POST', postSchema);