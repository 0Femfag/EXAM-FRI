const express = require("express");
const routes = require("./routes/likes");
const route = require("./routes/user");
const dotenv = require("dotenv");
const router = require("./routes/comment");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(routes);
app.use(route);
app.use(router);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("connected"))
  .catch((error) => console.log(error));

// const oneUser = {
//   id: "ahahdhshdd",
//   name: "Oluwafemi",
//   email: "Femimane1@gmail.com",
// };
// const mySecrete = "Global651310@%";

// app.post("/login", (req, res) => {
//   const { email } = req.body;
//   const myToken = jwt.sign(oneUser, mySecrete, { expiresIn: "24h" });
//   res.cookie("my_user_info", myToken);
//   res.json({ message: "successfully logged in" });
// });

// app.put("/update", (req, res) => {
//   const { my_user_info } = req.cookies;
//   jwt.verify(my_user_info, mySecrete, (err, info) => {
//     if (err) {
//       console.log(err.message);
//       res.json({ message: err.message });
//     } else {
//       console.log(info);
//       res.json(info);
//     }
//   });
// });

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`app is running at ${8000}`);
});
