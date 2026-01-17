/*************************************************************
 * Name         :   checkAuth.js
 * Author       :   Murli
 * Description  :   Creates a unique token whenever user logins
 *                  in, which is valid for 2 hrs with
 *                  error handling
 *************************************************************/

const jwt = require("jsonwebtoken");
const errorConfig = require("../errorConfig/errorConfig");
const User = require("../model/user");
const mongoose = require("mongoose");

module.exports = async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.SECRET_KEY);
  req.userData = decoded;
  // console.log("User ID: ", decoded.userId);

  let userInDb = await User.find({
    _id: new mongoose.Types.ObjectId(decoded.userId),
  });

  if (userInDb.length === 0) {
    console.log("No User");
    return res.status(errorConfig.unAuthorizedCode).json({
      statusCode: errorConfig.unAuthorizedCode,
      message:
        "Unauthorized access, either user does not exist or inactive, or invalid/malicious access",
    });
  } else if (userInDb.length > 0) {
    console.log("User exists");
    var now = Math.floor(Date.now() / 1000);
    if (now > decoded.exp) {
      console.log("why?");
      return res.status(errorConfig.unAuthorizedCode).json({
        statusCode: errorConfig.unAuthorizedCode,
        message: "Token expired",
      });
    } else {
      console.log("Not expired");
      next();
      return;
    }
  } else {
    console.log("Authorized");
    next();
    return;
  }
};
