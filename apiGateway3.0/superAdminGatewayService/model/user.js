/*************************************************************
 * Name         :   user.js
 * Author       :   Pooja Seethur
 * Description  :   Creates an user schema
 *************************************************************/

/**********Include mongoose library***********/

const mongoose = require("mongoose");

/*****Create schema*****/

let userSchema = new mongoose.Schema({
  _userUniqueId: mongoose.Schema.Types.ObjectId,
  userName: { type: String, required: true },
  userRole: {
    type: String,
    required: true,
    enum: ["superAdmin", "admin", "user", "infiniteUser"],
  },
  secretKey: { type: String },
  emailId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

/*****Export model*****/

module.exports = mongoose.model("User", userSchema);
