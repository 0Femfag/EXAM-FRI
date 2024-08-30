const userModel = require("../models/user");
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
