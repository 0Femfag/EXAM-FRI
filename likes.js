const likeModel = require("../models/likes");

const createPost = async (req, res) => {
  const body = req.body;
  const newPost = new likeModel(body);
  try {
    await newPost.save();
    res.json("post successfully created");
  } catch (error) {
    console.log(error.message);
  }
};

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
