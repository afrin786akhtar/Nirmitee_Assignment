const mongoose = require("mongoose");
const userModel = require("../Model/userModel");
const postModel = require("../Model/PostModel");
const commentModel = require("../Model/commentModel");
const {
  checkEmptyBody,
  isValid,
  isValidEmail,
  isValidObjectId,
  isValidName,
  isValidPassword,
} = require("../Validations/validation");

const addPost = async function (req, res) {
  try {
    const userIdFromParam = req.params.userId;

    if (!isValidObjectId(userIdFromParam))
      return res.status(400).send({
        status: false,
        message: `userId: ${userIdFromParam} is invalid, Please Provide Valid userId.`,
      });
    // authorizing user with token's userId
    if (userIdFromParam !== req.userId)
      return res
        .status(403)
        .send({ status: false, message: "Unauthorized user access." });

    if (!checkEmptyBody(req.body))
      return res.status(400).send({ status: false, message: "empty body" });

    const { postName, body, userId, posted_at, ...rest } = req.body;

    if (rest.length > 0)
      return res
        .status(400)
        .send({ status: false, message: "unnecessary fields used" });

    if (!postName)
      return res
        .status(400)
        .send({ status: false, message: "missing post name" });
    if (!isValid(postName))
      return res
        .status(400)
        .send({ status: false, message: "invalid post name" });

    if (!body)
      return res
        .status(400)
        .send({ status: false, message: "missing post body" });
    if (!isValid(body))
      return res
        .status(400)
        .send({ status: false, message: "invalid post body" });

    if (userId) {
      if (!isValidObjectId(userId))
        return res
          .status(400)
          .send({ status: false, message: "invalid userId" });
      if (userId !== req.userId)
        return res
          .status(400)
          .send({
            status: false,
            message: "only logged in user id is allowed",
          });
    } else {
      req.body.userId = userIdFromParam;
    }

    let result = await userModel.findById(req.body.userId);
    if (!result)
      return res.send({ status: "false", message: "userId is not registered" });

    let newPost = await postModel.create(req.body);
    return res.status(201).send({ status: "true", data: newPost });
  } catch (error) {
    return res.send({ message: error.message });
  }
};

const seePost = async function (req, res) {
  try {
    let postDetails = await postModel
      .find({ isDeleted: false })
      .select({ postName: 1, body: 1, userId: 1 });
    if (postDetails) {
      return res
        .status(200)
        .send({ status: true, message: "Success", data: postDetails });
    } else {
      return res
        .status(404)
        .send({ status: false, message: "posts are not found" });
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const editPost = async function (req, res) {
  try {
    const userIdFromParam = req.params.userId;
    const postIdFromParam = req.params.postId;

    if (!isValidObjectId(userIdFromParam))
      return res.status(400).send({
        status: false,
        message: `userId: ${userIdFromParam} is invalid, Please Provide Valid userId.`,
      });

    if (!isValidObjectId(postIdFromParam))
      return res.status(400).send({
        status: false,
        message: `userId: ${postIdFromParam} is invalid, Please Provide Valid postId.`,
      });

    if (!checkEmptyBody(req.body))
      return res.status(400).send({ status: false, message: "empty body" });

    // authorizing user with token's userId
    if (userIdFromParam !== req.userId)
      return res
        .status(403)
        .send({ status: false, message: "Unauthorized user access." });

    // finding user in DB
    let findPostData = await postModel.findById(postIdFromParam);
    if (!findPostData)
      return res.status(400).send({
        status: false,
        message: `post with postId: ${findPostData} is not exist in database.`,
      });

    if (findPostData.userId === userIdFromParam)
      return res.status(403).send({
        status: false,
        message: "this post is not belongs to this user",
      });

    const { postName, body, userId, posted_at, isDeleted } = req.body;

    if (userId)
      res
        .status(400)
        .send({ status: false, message: "userId is not required here" });

    if (postName) {
      if (!isValid(postName))
        return res
          .status(400)
          .send({ status: false, message: "invalid postname" });

      findPostData.postName = postName;
    }

    if (body) {
      if (!isValid(body))
        return res.status(400).send({ status: false, message: "invalid body" });

      findPostData.body = body;
    }

    if (posted_at) {
      if (!typeof posted_at === "date")
        return res
          .status(400)
          .send({ status: false, message: "posted_at is not valid" });
    }

    if (isDeleted) {
      if (!(isDeleted === true))
        return res
          .status(404)
          .send({ status: false, message: "isDeleted is only can be true" });
      findPostData.isDeleted = isDeleted;
    }

    findPostData.save();
    return res
      .status(200)
      .send({ status: true, message: "Post is updated", data: findPostData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const deletePost = async function (req, res) {
  try {
    const userIdFromParam = req.params.userId;
    const postIdFromParam = req.params.postId;

    userIdFromParam = userIdFromParam.trim();
    postIdFromParam = postIdFromParam.trim();

    if (!isValidObjectId(userIdFromParam))
      return res.status(400).send({
        status: false,
        message: `userId: ${userIdFromParam} is invalid, Please Provide Valid userId.`,
      });
    // authorizing user with token's userId
    if (userIdFromParam !== req.userId)
      return res
        .status(403)
        .send({ status: false, message: "Unauthorized user access." });

    if (!isValidObjectId(postIdFromParam))
      return res.status(400).send({
        status: false,
        message: `postId: ${postIdFromParam} is invalid, Please Provide Valid postId.`,
      });

    const post = await postModel.findById(postIdFromParam);
    if (!post)
      return res.status(404).send({
        status: false,
        message: `No post found with the postId: ${postIdFromParam}.`,
      });

    if (post.isDeleted === true)
      return res.status(404).send({
        status: false,
        message: `the post with postId: ${postIdFromParam}, has been deleted already.`,
      });

    let deletePost = await postModel.findOneAndUpdate(
      { _id: postIdFromParam },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    return res.status(200).send({
      status: true,
      message: `post: ${post.postName} is deleted successfully`,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { addPost, seePost, editPost, deletePost };
