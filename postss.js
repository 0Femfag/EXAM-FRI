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
