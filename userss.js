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
