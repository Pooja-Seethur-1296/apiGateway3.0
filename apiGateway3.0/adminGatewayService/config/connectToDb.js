/**
 * @name : connectToDb.js
 * @author: Pooja Seethur
 * @description: Establishes connection between server and database
 */

/**
 * Include libraries and modules
 */
const mongoose = require("mongoose");

/**
 * @name {*} connect
 * @param {*} error
 */

module.exports.connect = (error) => {
  mongoose.connect("mongodb://mongodb:26045/apiGatewayDataBase", {
    // Connecting to actual API gateway database
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("Successfully connected to database");

  if (error) {
    console.log("DB connection failed: " + error);
  }
};
