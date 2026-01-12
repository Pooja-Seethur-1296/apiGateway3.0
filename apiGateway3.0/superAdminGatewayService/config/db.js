/*************************************************************
 * Name         :   db.js 
 * Author       :   Pooja Seethur
 * Description  :   Contains code for establishing a connection 
 *                  between gateway and mongodb                 
 *************************************************************/

/**********Include NPM modules, Libraries and files***********/

const mongoose = require('mongoose');

/*********Export the DB connecting function*********/

module.exports.connect = (error) => {

    mongoose.connect(process.env.DB_URL, {                              // Connecting to the database
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

   console.log("Successfully connected to database");

   if(error){
       console.log("DB connection failed: " + error);
   }

};

