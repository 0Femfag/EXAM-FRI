const mongoose = require("mongoose");
const newuserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    credentialAccount: {
      type: Boolean,
      default: true,
    },
    creatorId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
    },
    details: {
      address: String,
      postcode: Number,
    },
    role: {
      type: String,
      enum: ["Basic", "Admin", "SuperAdmin"],
      default: "Basic",
    },
  },
  { timestamps: true }
);

const newuserModel = mongoose.model("LUMINARY", newuserSchema);
module.exports = newuserModel;

const mongoose = require("mongoose");
const newSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    previewPix: {
      type: String,
      required: true,
    },
    detailPix: {
      type: String,
      required: true,
    },
    creatorId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "LUMINARY",
    },
    likes: {
      type: [mongoose.Types.ObjectId],
      default: [],
      ref: "LUMINARY",
    },
    comments: {
      type: [mongoose.Types.ObjectId],
      default: [],
      ref: "COMMENT",
    },
  },
  { timestamps: true }
);

const postModel = mongoose.model("POST", newSchema);
module.exports = postModel;


const newuserModel = require("../models/newuser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const createnewUser = async (req, res) => {
  const { password, role, ...others } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  const newUser = await newuserModel({
    password: hashedPassword,
    ...others,
  });
  try {
    await newUser.save();
    res.status(201).json({ message: "Account created successfully" });
  } catch (error) {
    res.status(504).json({ message: error.message });
  }
};


const OauthRegister = async (req, res) => {
  const { username, email, gender } = req.body;
  try {
    const findOne = await newuserModel.findOne({ email });
    if (findOne && findOne.credentialAccount) {
      return res.status(404).json({ message: "illegal parameter" });
    }
    if (findOne) {
      const aboutUser = { id: findOne.id, role: findOne.role };
      const token = jwt.sign(aboutUser, process.env.JWT_SECRET);
      return res
        .cookie("user_token", token)
        .status(200)
        .json({ message: "Login successful" });
    }
    const newUser = new newuserModel({
      username,
      email,
      gender,
      credentialAccount: false,
    });
    const savedUser = await newUser.save();
    const aboutUser = { id: savedUser.id, role: savedUser.role };
    const token = jwt.sign(aboutUser, process.env.JWT_SECRET);
    return res
      .cookie("user_token", token)
      .status(201)
      .json({ message: "Created successfully" });
  } catch (error) {
    res.status(500).json({ message: "something went wrong" });
  }
};


const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userInfo = await newuserModel.findOne({ email });
    if (!userInfo) {
      return res.status(404).json({ message: "User doesn't exist" });
    }
    const verify = bcrypt.compareSync(password, userInfo.password);
    if (!verify) {
      return res.status(401).json({ message: "Password doesn't match" });
    }
    const aboutUser = { id: userInfo.id, role: userInfo.role };
    const token = jwt.sign(aboutUser, process.env.JWT_SECRET);
    return res
      .cookie("user_token", token)
      .status(202)
      .json({ message: "user logged in succesfully" });
  } catch (error) {
    res.status(505).json({ message: error.message });
  }
};

const logoutUser = async (req, res) => {
  try {
    res
      .clearCookie("user_token")
      .status(202)
      .json({ message: "user logged out succesfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createnewUser, OauthRegister,  loginUser, logoutUser };


const newuserModel = require("../models/newuser");
const jwt = require("jsonwebtoken");

const deleteUser = async (req, res) => {
  const { id } = req.user;
  try {
    await newuserModel.findByIdAndDelete(id);
    res
      .clearCookie("user_token")
      .status(200)
      .json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {deleteUser};


const postModel = require("../models/post");
const makePost = async (req, res) => {
  const { creatorId, ...others } = req.body;
  const { id } = req.user;
  const newPost = new postModel({ ...others, creatorId: id });
  try {
    await newPost.save();
    res.status(200).json({ message: "Post created successfully" });
  } catch (error) {
    res.status(503).json({ message: error.message });
  }
};


const getallPost = async (req, res) => {
  try {
    const allPost = await postModel
      .find()
      .populate("comments")
      .populate("postId");
    res.status(200).json(allPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getonePost = async (req, res) => {
  const { postId } = req.params;
  try {
    const getOne = await postModel
      .findById(postId)
      .populate("creatorId")
      .populate("commentorsId");
    res.status(200).json(getOne);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { makePost, getallPost, getonePost };


const likeModel = require("../models/likes");
const likePost = async (req, res) => {
  const { id, userId } = req.body;
  try {
    const thePost = await likeModel.findById(id);
    if (!thePost) {
      return res.status(404).json({ message: "Such post doesn't exist" });
    }
    const checkuserinArray = thePost.likes.includes(userId);
    if (!checkuserinArray) {
      thePost.likes.push(userId);
    }
    await likeModel.findByIdAndUpdate(
      id,
      { likes: thePost.likes },
      { new: true }
    );
    return res.status(202).json({ message: "You've like this post" });
  } catch (error) {
    res.status(504).json({ message: error.message });
  }
};

const dislikePost = async (req, res) => {
  const { id, userId } = req.body;
  try {
    const thePost = await likeModel.findById(id);
    const checkuserinArray = thePost.likes.includes(userId);
    if (checkuserinArray) {
      const index = thePost.likes.indexOf(userId);
      getPost.likes.splice(index, 1);
    }
    await likeModel.findByIdAndUpdate(
      id,
      { likes: thePost.likes },
      { new: true }
    );
    return res.status(202).json({ message: "You've dislike this post" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { likePost, dislikepost };

const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: true,
    },
    postId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "POST",
    },
    commentorsId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "LUMINARY",
    },
  },
  { timestamps: true }
);
const commentModel = mongoose.model("COMMENT", commentSchema);
module.exports = commentModel;


const commentModel = require("../models/comment");
const postModel = require("../models/post");

const createComment = async (req, res) => {
  const { comment, postId } = req.body;
  const { id } = req.user;
  try {
    const newestComment = new commentModel({
      comment,
      commentorsId: id,
      postId,
    });
    const savedComment = await newestComment.save();
    await postModel.findByIdAndUpdate(postId, {
      $push: { comments: savedComment.id },
    });
    return res.status(200).json({ message: "Comment made successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getallComment = async (req, res) => {
  const { commentId } = req.query;
  try {
    const allComment = await commentModel
      .findById(commentId)
      .populate("postId")
      .populate("commentorsId");
    return res.satus(200).json(allComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createComment, getallComment };

