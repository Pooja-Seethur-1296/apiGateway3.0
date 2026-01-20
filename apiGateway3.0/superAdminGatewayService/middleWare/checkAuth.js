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
  if (!token) {
    return {
      responseCode: errorConfig.unAuthorizedCode,
      responseDescription: "Token is missing, please login",
    };
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.userData = decoded;
    let userInDb = await User.find({
      _id: new mongoose.Types.ObjectId(decoded.userId),
    });
    if (userInDb.length === 0) {
      console.log("No User");
      return res.status(errorConfig.unAuthorizedCode).json({
        responseCode: errorConfig.unAuthorizedCode,
        responseDescription: "User not found, create one",
      });
    } else if (userInDb.length > 0) {
      var now = Math.floor(Date.now() / 1000);
      if (now > decoded.exp) {
        console.log("why?");
        return res.status(errorConfig.unAuthorizedCode).json({
          responseCode: errorConfig.unAuthorizedCode,
          responseDescription: "Token expired",
        });
      } else {
        console.log("Valid token");
        next();
        return;
      }
    }
  } catch (err) {
    // console.log("bantu");
    // console.log(err);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        responseCode: errorConfig.unAuthorizedCode,
        responseDescription: "Token expired",
      }); // Return 401 for expired token
    }
    return res.status(401).json({
      responseCode: errorConfig.unAuthorizedCode,
      responseDescription: "Invalid token",
    });
  }
};
