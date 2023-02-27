const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    title : {
        type : String,
        required : true,
        enum : ["Mr" , "Mrs" , "Miss"]
    },
    email : {
        type : String,
        unique : true,
        required : true
    },
    password : {
        type : String,
        required : true
    }
}, {timestamps : true})

module.exports = mongoose.model('user10', userSchema);