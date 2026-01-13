/*************************************************************
 * Name         :   user.js
 * Author       :   Pooja Seethur
 * Description  :   Manages user functionality requests
 *************************************************************/

/**********Include library***********/

const User = require("../model/user");
const bcrypt = require("bcrypt");
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const axios = require("axios");
const jwt = require("jsonwebtoken");
const checkAuth = require("../middleWare/checkAuth");
const errorConfig = require("../errorConfig/errorConfig");

/***************************************************************
 * name : add
 * description: creates new user, pushes user details to
 *               DB and hashes the password for security
 ***************************************************************/

router.post("/add", (req, res, next) => {
  var verifiedRole = req.body.userRole;
  if (req.body.password === "" || req.body.password === null) {
    return res.status(errorConfig.successMessageCode).json({
      responseCode: errorConfig.badRequestCode,
      responseDescription: errorConfig.badRequestMsg,
    });
  } else {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
      if (err) {
        return res.status(errorConfig.successMessageCode).json({
          responseCode: errorConfig.generalDbErrorCode,
          responseDescription: "password hashing error",
        });
      } else {
        if (req.body.adminSecret === "sharedAdminSecret") {
          verifiedRole = "admin";
        }
        const user = new User({
          _id: new mongoose.Types.ObjectId(),
          userName: req.body.userName,
          emailId: req.body.emailId,
          userRole: req.body.userRole,
          password: hash,
        });

        user
          .save()
          .then((result) => {
            res.status(errorConfig.successMessageCode).json({
              responseCode: errorConfig.createdCode,
              responseDescription: "User added successfully",
              responseObject: {
                userId: result._id,
                userName: result.userName,
                emailId: result.emailId,
                userRole: result.userRole,
              },
            });
          })
          .catch((err) => {
            console.log(err);
            if (err.code === 11000) {
              return res.status(errorConfig.successMessageCode).json({
                responseCode: errorConfig.dataDuplicationErrorCode,
                responseDescription: errorConfig.dataDuplicationErrorMsg,
                keyValue: err.keyValue,
              });
            } else {
              return res.status(errorConfig.generalDbErrorCode).json({
                responseCode: errorConfig.generalDbErrorCode,
                responseDescription: errorConfig.generalDbErrorMsg,
              });
            }
          });
      }
    });
  }
});

/***************************************************************
 * name : delete
 * description: deletes user details from user collection and
 *              user-role map collection
 ***************************************************************/

router.post("/delete", checkAuth, async (req, res, next) => {
  //remove user from user collection

  let result = await User.deleteOne({ _id: req.body.userId });
  try {
    let userDeletion = result.deletedCount;
    if (userDeletion === 0) {
      return res.status(errorConfig.successMessageCode).json({
        responseCode: errorConfig.notFoundErrorCode,
        responseDescription: "Could not delete user",
      });
    } else {
      return res.status(errorConfig.successMessageCode).json({
        responseCode: errorConfig.successMessageCode,
        responseDescription: "User deleted from both collections",
        responseObject: { userId: req.body.userId },
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(errorConfig.generalDbErrorCode).json({
      responseCode: errorConfig.generalDbErrorCode,
      responseDescription: errorConfig.generalDbErrorMsg,
    });
  }
});

/***************************************************************
 * name : edit
 * description: renames the user detail
 ***************************************************************/

router.post("/edit", checkAuth, async (req, res) => {
  var updatableDoc, updatableData;
  try {
    if (
      req.body.userName === "" ||
      req.body.userName === null ||
      req.body.emailId === "" ||
      req.body.emailId === null
    ) {
      return res.status(config.successMessageCode).json({
        responseCode: config.badRequestCode,
        responseDescription: config.badRequestMsg,
      });
    } else {
      let userFind = await User.findOne({
        emailId: req.body.emailId,
        createdBy: "System",
      });
      let passwordHash = await bcrypt.hash(req.body.password, 10);
      if (userFind.userRole === "superAdmin") {
        //only super-admins can edit the roles
        updatableData = {
          userName: req.body.userName,
          emailId: req.body.emailId,
          userRole: req.body.userRole,
          password: hash,
        };
      } else {
        updatableData = {
          userName: req.body.userName,
          emailId: req.body.emailId,
          password: passwordHash,
        };
      }
      let updatedResult = await User.findOneAndUpdate(
        { phoneNumber: req.body.phoneNumber },
        updatableData
      );
      console.log(updatedResult);
      if (updatedResult.modifiedCount === 0 || updatedResult === null) {
        return res.status(config.successMessageCode).json({
          responseCode: config.notFoundErrorCode,
          responseDescription: "Could not update user information",
        });
      } else {
        return res.status(config.successMessageCode).json({
          responseCode: config.successMessageCode,
          responseDescription: "User details updated successfully",
          responseData: {
            userId: req.body.userId,
            userName: req.body.userName,
            emailId: req.body.emailId,
            userRole: req.body.roleId,
          },
        });
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(config.generalDbErrorCode).json({
      responseCode: config.generalDbErrorCode,
      responseDescription: config.generalDbErrorMsg,
    });
  }
});

/***************************************************************
 * name : getDetails
 * description: gets the details for a given username.
 ***************************************************************/

router.post("/getDetails", checkAuth, (req, res) => {
  User.findOne({ _id: req.body.userId })
    .select("-password")
    .then((result) => {
      if (result.length === 0) {
        return res.status(errorConfig.successMessageCode).json({
          responseCode: errorConfig.notFoundErrorCode,
          responseDescription: errorConfig.notFoundErrorMsg,
        });
      } else {
        res.status(errorConfig.successMessageCode).json({
          responseCode: errorConfig.successMessageCode,
          responseDescription: "Details of the request",
          responseObject: { result },
        });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(errorConfig.generalDbErrorCode).json({
        responseCode: errorConfig.generalDbErrorCode,
        responseDescription: errorConfig.generalDbErrorMsg,
      });
    });
});

/***************************************************************
 * name : getList ?? not required
 * description: gets the list of all users in user collection.
 ***************************************************************/

// router.get('/getList', checkAuth, (req, res) => {

//     User.find().select('-password')
//         .then(result => {
//             res.status(errorConfig.successMessageCode).json({
//                 responseCode: errorConfig.successMessageCode,
//                 responseDescription: "List of users",
//                 responseObject: {users: result}
//             });
//         })
//         .catch(err => {
//             console.log(err);
//             return res.status(errorConfig.generalDbErrorCode).json({responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg});
//         })
// });

/***************************************************************
 * name : login
 * description: logs in the user with authentication and returns
 *              list of roles associated for user.
 ***************************************************************/

/************Handle post request for login************/

router.post("/login", async (req, res, next) => {
  let users = await User.find({ emailId: req.body.emailId });

  //console.log(users.length)
  if (users.length === 0) {
    return res.status(errorConfig.successMessageCode).json({
      responseCode: errorConfig.unAuthorizedCode,
      responseDescription: errorConfig.unAuthorizedMsg,
    });
  }

  //Compare passwords and issue the token
  try {
    bcrypt.compare(req.body.password, users[0].password, (err, result) => {
      const { SECRET_KEY } = process.env;

      if (result) {
        const token = jwt.sign(
          {
            userId: users[0]._id,
          },
          SECRET_KEY,
          {
            expiresIn: "2h",
            algorithm: "HS512",
          }
        );

        console.log("Generated token: " + token);

        return res.status(errorConfig.successMessageCode).json({
          responseCode: errorConfig.successMessageCode,
          responseDescription: "Auth succeeded",
          responseObject: {
            authToken: token,
            rolesForUser: response.data.responseObject,
          },
        });
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(errorConfig.generalDbErrorCode).json({
      responseCode: errorConfig.generalDbErrorCode,
      responseDescription: errorConfig.generalDbErrorMsg,
    });
  }
});

/**
 * @name : forgotPassword
 * @description: sends password reset link to the recipient email address with valid JWT token
 **/

router.post("/forgotPassword", (req, res) => {
  console.log("Received request to reset password");

  /**@description : Check user schema based on userId to retirve email ID*/

  User.find({ emailId: req.body.emailId })
    .then((result) => {
      console.log(result);
      console.log("Recipient's registered email Id: " + result[0].emailId);

      /**@description : Generate specific JWT token for password reset link and send along with URL*/

      const { SECRET_KEY } = process.env;

      const passwordResetToken = jwt.sign(
        {
          userId: result[0]._id,
        },
        SECRET_KEY,
        {
          expiresIn: "10m",
        }
      );

      let forgotPasswordLink = `${process.env.FORGOT_PASSWORD_URL}userId=${result[0]._id}&authToken=${passwordResetToken}`;
      console.log(forgotPasswordLink);

      let emailContent = `<h3> We heard that you lost your Ortusolis dashboard password! </h3>
                                <p> <a href=${forgotPasswordLink}>Click here</a> to reset your password, which will be active for 5 minutes, after which link expires.<p>
                                <p>Thank you</p>
                                <h3>Team Ortusolis <h3>`;

      let emailSubject = "Password reset link";

      //sendEmail(recipientAddress, emailSubject, emailContent);

      var transporter = nodemailer.createTransport({
        service: "zoho",
        port: 587,
        auth: {
          user: "pooja.sp@ortusolis.com",
          pass: "pSiauIFsTvjb",
        },
      });

      console.log("aisygwbdhe");

      var mailOptions = {
        from: "pooja.sp@ortusolis.com", //'pooja.sp@ortusolis.com',
        to: result[0].emailId, //'dinesh.s@ortusolis.com,jayasimha.hsd@ortusolis.com',
        subject: emailSubject,
        text: "message",
        html: emailContent,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log("Could not send email: " + error);
          return res.status(errorConfig.successMessageCode).json({
            responseCode: errorConfig.notFoundErrorCode,
            responseDescription: "Could not send email",
          });
        } else {
          console.log("Mail sent: ", info.response);
          return res.status(errorConfig.successMessageCode).json({
            responseCode: errorConfig.successMessageCode,
            responseDescription:
              "Reset email sent successfully, check mail inbox",
          });
        }
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(errorConfig.generalDbErrorCode).json({
        responseCode: errorConfig.generalDbErrorCode,
        responseDescription: errorConfig.generalDbErrorMsg,
      });
    });
});

/**
 * @name : resetPassword
 * @description: hashes and stores updated password, sent by the user
 **/

router.post("/resetPassword", checkAuth, (req, res) => {
  let authTok = req.headers.authorization;
  console.log("authhh " + authTok);

  /**@description : handle new password */

  //if((authTok==="")||(typeof authTok==='undefined')){

  if (req.body.password === "" || req.body.password === null) {
    return res.status(errorConfig.successMessageCode).json({
      responseCode: errorConfig.badRequestCode,
      responseDescription: errorConfig.badRequestMsg,
    });
  } else {
    //Find user in DB using userId

    User.findOne({ _id: req.body.userId })
      .select("-password")
      .then((result) => {
        if (result.length === 0) {
          return res.status(errorConfig.successMessageCode).json({
            responseCode: errorConfig.notFoundErrorCode,
            responseDescription: errorConfig.notFoundErrorMsg,
          });
        } else {
          //hash new password

          bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
              return res.status(errorConfig.successMessageCode).json({
                responseCode: errorConfig.generalDbErrorCode,
                responseDescription: "Password hashing error",
              });
            } else {
              User.findOneAndUpdate(
                { _id: req.body.userId },
                { password: hash }
              )
                .then((result) => {
                  res.status(errorConfig.successMessageCode).json({
                    responseCode: errorConfig.successMessageCode,
                    responseDescription: "Password updated",
                    responseObject: {
                      userId: result._id,
                      userName: result.userName,
                      emailId: result.emailId,
                    },
                  });
                })
                .catch((err) => {
                  console.log(err);
                  if (err.code === 11000) {
                    return res.status(errorConfig.successMessageCode).json({
                      responseCode: dataDuplicationErrorCode,
                      responseDescription: errorConfig.dataDuplicationErrorMsg,
                      keyValue: err.keyValue,
                    });
                  } else {
                    return res.status(errorConfig.generalDbErrorCode).json({
                      responseCode: errorConfig.generalDbErrorCode,
                      responseDescription: errorConfig.generalDbErrorMsg,
                    });
                  }
                });
            }
          });
        }
      })
      .catch((err) => {
        console.log(err);
        return res.status(errorConfig.generalDbErrorCode).json({
          responseCode: errorConfig.generalDbErrorCode,
          responseDescription: errorConfig.generalDbErrorMsg,
        });
      });
  }
  //}
});

module.exports = router; //export router
