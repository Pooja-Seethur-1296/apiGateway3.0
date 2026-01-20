/*************************************************************
 * Name         :   projectUserMap.js
 * Author       :   Pooja Seethur
 * Description  :   Creates a SourceServer - role map schema
 *************************************************************/

/**********Include mongoose library***********/

const mongoose = require("mongoose");

/*****Create schema*****/

let projectUserSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  projectName: { type: String, required: true },
  projectCode: { type: String, required: true },
  userRole: {
    type: String,
    required: true,
    enum: ["superAdmin", "admin", "user", "infinteUser"],
  },
});

/*****Export model*****/

module.exports = mongoose.model("projectUser", projectUserSchema);
