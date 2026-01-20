/*************************************************************
 * Name         :   db.js
 * Author       :   Pooja Seethur
 * Description  :   Contains code for establishing a connection
 *                  between gateway and mongodb
 *************************************************************/

/**********Include NPM modules, Libraries and files***********/

const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

/*********Export the DB connecting function*********/

module.exports = {
  connect: (error) => {
    mongoose.connect(process.env.DB_URL, {
      // Connecting to the database
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Successfully connected to database");

    if (error) {
      console.log("DB connection failed: " + error);
    }
  },
  sendMail: (emailId, emailSubject, emailContent) => {
    const transporter = nodemailer.createTransport({
      service: "zoho",
      port: 587,
      auth: {
        //user: 'pooja.sp@ortusolis.com',
        //pass: 'pSiauIFsTvjb',
        user: "ots.executive@ortusolis.com",
        pass: "XcQ0RXyxRPxz",
      },
    });

    const mailOptions = {
      from: "ots.executive@ortusolis.com", //'pooja.sp@ortusolis.com',
      to: emailId, //'dinesh.s@ortusolis.com,jayasimha.hsd@ortusolis.com',
      subject: emailSubject,
      text: "message",
      html: emailContent,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("Could not send email: " + error);
        return {
          statusCode: 404,
          message: "Could not send email",
        };
      } else {
        console.log("Mail sent: ", info.response);
        return {
          statusCode: 200,
          message: "Email sent successfully, check mail inbox",
        };
      }
    });
  },
  gatewayPortalLink: "http://localhost:3000/",
};
