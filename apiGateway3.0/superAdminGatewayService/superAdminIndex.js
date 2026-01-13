/*************************************************************
 * Name         :   index.js
 * Author       :   Pooja Seethur
 * Description  :   Main API server to handle all db related
 *                  operations.
 * version      :   2.0.0
 *************************************************************/

/**********Include library***********/

const express = require("express");
const db = require("./config/db");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse requests of content-type - application/json
app.use(bodyParser.json());

app.use(
  cors({
    origin: "*",
  })
);

// Add headers before the routes are defined

app.use((req, res, next) => {
  //Allow all the requests to access
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods that are allowed
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  //access for websites to allow the cookies along with requests
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

// Read config file .env for all environment variables or (import {env} from 'process';)
require("dotenv").config();

// connect to database
db.connect();

/**********Importing indiviadual details routes*********/

const userRoutes = require("./routes/userRoute");
app.use("/user", userRoutes);

// const roleRoutes = require('./routes/roleRoute');
// app.use('/role', roleRoutes);

const projectRoutes = require("./routes/projects");
app.use("/project", projectRoutes);

// const endPointRoutes = require('./routes/endPointRoute');
// app.use('/endPoint', endPointRoutes);

//Listening on port

app.listen(process.env.DB_PORT, () => {
  console.log(`Listening on ${process.env.DB_PORT}...`);
});
