const mongoose = require('mongoose');
const PostModel = require('../Model/PostModel');
const commentModel = require('../Model/commentModel');

const addComment = async function(req, res){
    try {
        let data = req.body;
        let postId = req.params.Id;
        if(!mongoose.Types.ObjectId.isValid(postId)) return res.send({message : `invalid ${postId}`});

        let postData = await PostModel.findById(postId)
        if(!postData) return res.send({message : "No data Found"});

        if(postData.isDeleted == true) return res.send({message : "Post is already deleted"});

        if(!data.comment_By) data.comment_By = 'Guest' ;
        if(!data.commented_at) data.commented_at = new Date();

        const newComment = await commentModel.create(data);

        let updatePost = await PostModel.findOneAndUpdate({_id : postId, isDeleted : false}, {new : true});

        if(!updatePost) return res.send({message : "No post Present."});

        updatePost.commentData = newComment;

        return res.send({data : updatePost});

    } catch (error) {
        return res.send({message : error.message});
    }
}

const editComment = async function(req,res){
    try {
        let data = req.params;
        let postId = data.postId;

        if(!mongoose.Types.ObjectId.isValid(postId)) return res.status(400).send({message : "Invalid postIs"});

        let commentId = data.commentId
        if(!mongoose.Types.ObjectId.isValid(commentId)) return res.status(400).send({message : "Invalid commentId"});

        let commentData = req.body;
        let {comment_By, comment} = commentData

        if(Object.keys(commentData).length == 0) return res.status(400).send({message : "Please input some values."});

        const post = await PostModel.findOne({ _id : postId , isDeleted : false});
        if(!post) return res.status(404).send({message : "No post found"});

        const comments = await commentModel.findById(commentId)
        if(!comments) return res.status(404).send({message : "No comments"});

        if(comments.isDeleted == true) return res.status(404).send({message : "comment Already deleted."});

        let updateComment = await commentModel.findOneAndUpdate({
            $set : { comment : comment, comment_By : comment_By, commented_at : new Date()} 
        },{new : true})

        return res.status(200).send({message : updateComment});

    } catch (error) {
        return res.send({message : error.message});
    }
}

const deleteComment = async function(req,res){
    try {
        let {postId, commentId} = req.params ;

        if(!mongoose.Types.ObjectId.isValid(postId)) return res.status(400).send({message : "Invalid postID"});

        if(!mongoose.Types.ObjectId.isValid(commentId)) return res.status(400).send({message : "Invalid commentId"});

        let checkComment = await commentModel.findOne({_id : commentId, isDeleted :false});
        if(!checkComment) return res.status(404).send({message : `No comment with this ${commentId}`});

        let checkPost = await PostModel.findOne({_id : postId , isDeleted : false})
        if(!checkPost) return res.status(404).send({message : `No Post with this ${postId}`});

        let delComment = await commentModel.findByIdAndUpdate({ _id : commentId , isDeleted : false}, {$set : {isDeleted : true, deleted_at : new Date()}});

        // let updatePost = await PostModel.findByIdAndUpdate({ _id : postId, isDeleted : false}, {comment : checkPost.comment - 1})

        return res.status(200).send({message : "comment deleted."})

    } catch (error) {
        return res.send({message : error.message});
    }
}

module.exports = {addComment, editComment, deleteComment}