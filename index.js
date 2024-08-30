const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
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
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
    },
    age: {
      type: Number,
    },
    creatorId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    details: {
      address: String,
      postcode: Number,
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model("LUMINARY", userSchema);
module.exports = userModel;

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
    },
    likes: {
      type: [mongoose.Types.ObjectId],
      default: [],
    },
  },
  { timestamps: true }
);

const postModel = mongoose.model("POST", newSchema);
module.exports = postModel;

const userModel = require("../models/userss");
const bcrypt = require("bcryptjs");

const createnewUser = async (req, res) => {
  const { password, ...others } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  console.log(hashedPassword);
  const newUser = new userModel({ password: hashedPassword, ...others });
  try {
    await newUser.save();
    res.json({ message: "user created successfully" });
  } catch (error) {
    console.log(error.message);
    res.json({ message: "user already exist" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const findUser = await userModel.findOne({ email });
    if (!findUser) {
      return res.json({ message: "user not found" });
    }
    const verify = bcrypt.compareSync(password, findUser.password);
    console.log(verify);
    if (!verify) {
      return res.json({ message: "pass doesn't match" });
    }
    res.json(findUser);
  } catch (error) {
    console.log(error.message);
    res.json({ message: error.message });
  }
};

module.exports = { createnewUser, loginUser };

const postModel = require("../models/post");
const makePost = async (req, res) => {
  const body = req.body;
  const newPost = new postModel(body);
  try {
    await newPost.save();
    res.json(newPost);
  } catch (error) {
    console.log(error.message);
    res.json({ message: error.message });
  }
};

const getallPost = async (req, res) => {
  try {
    const allPost = await postModel.find();
    res.json(allPost);
  } catch (error) {
    console.log(error.message);
    res.json({ message: error.message });
  }
};

const getonePost = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const getOne = await postModel.findById(id);
    res.json(getOne);
  } catch (error) {
    console.log(error.message);
    res.json({ message: error.message });
  }
};

module.exports = { makePost, getallPost, getonePost };

const likeModel = require("../models/likes");

const likePost = async (req, res) => {
  const { id, userId } = req.body;
  try {
    const thePost = await likeModel.findById(id);
    if (!thePost) {
      return res.json({ message: "Such post doesn't exist" });
    }
    const checkuserinArray = thePost.likes.includes(userId);
    console.log(checkuserinArray);
    if (!checkuserinArray) {
      thePost.likes.push(userId);
    } else {
      const index = thePost.likes.indexOf(userId);
      thePost.likes.splice(index, 1);
    }
    await likeModel.findByIdAndUpdate(
      id,
      { likes: thePost.likes },
      { new: true }
    );
    res.json({ message: "You've like this post" });
  } catch (error) {
    res.json({ message: error.message });
  }
};

module.exports = { createPost, likePost };
