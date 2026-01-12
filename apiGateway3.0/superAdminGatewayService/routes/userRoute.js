/*************************************************************
 * Name         :   user.js
 * Author       :   Pooja Seethur
 * Description  :   Manages user functionality requests
 *************************************************************/

/**********Include library***********/

const User = require("../model/adminModel/user");
const Role = require("../model/adminModel/role");
const userRole = require("../model/adminModel/userRoleMap");
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
  if (req.body.password === "" || req.body.password === null) {
    return res
      .status(errorConfig.successMessageCode)
      .json({
        responseCode: errorConfig.badRequestCode,
        responseDescription: errorConfig.badRequestMsg,
      });
  } else {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
      if (err) {
        return res
          .status(errorConfig.successMessageCode)
          .json({
            responseCode: errorConfig.generalDbErrorCode,
            responseDescription: "password hashing error",
          });
      } else {
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
              },
            });
          })
          .catch((err) => {
            console.log(err);
            if (err.code === 11000) {
              return res
                .status(errorConfig.successMessageCode)
                .json({
                  responseCode: errorConfig.dataDuplicationErrorCode,
                  responseDescription: errorConfig.dataDuplicationErrorMsg,
                  keyValue: err.keyValue,
                });
            } else {
              return res
                .status(errorConfig.generalDbErrorCode)
                .json({
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

router.post("/delete", checkAuth, (req, res, next) => {
  //remove user from user collection

  User.deleteOne({ _id: req.body.userId })
    .then((result) => {
      let userDeletion = result.deletedCount;

      //removes user from user-role, user-project map collection //todo

      userRole
        .deleteMany({ userId: req.body.userId })
        .then((result) => {
          let userRoleDeletion = result.deletedCount;

          console.log("user role collection deletion " + result.deletedCount);

          if (userRoleDeletion === 0 && userDeletion === 0) {
            return res
              .status(errorConfig.successMessageCode)
              .json({
                responseCode: errorConfig.notFoundErrorCode,
                responseDescription: errorConfig.notFoundErrorMsg,
              });
          } else if (userRoleDeletion === 0 && userDeletion != 0) {
            return res.status(errorConfig.successMessageCode).json({
              responseCode: errorConfig.successMessageCode,
              responseDescription:
                "Record deleted from user collection, but not deleted from user-role collection",
            });
          } else if (userRoleDeletion != 0 && userDeletion === 0) {
            return res.status(errorConfig.successMessageCode).json({
              responseCode: errorConfig.successMessageCode,
              responseDescription:
                "Record deleted from user-role collection, but not deleted from user collection",
            });
          } else if (userRoleDeletion != 0 && userDeletion != 0) {
            return res.status(errorConfig.successMessageCode).json({
              responseCode: errorConfig.successMessageCode,
              responseDescription: "User deleted from both collections",
              responseObject: { userId: req.body.userId },
            });
          }
        })
        .catch((err) => {
          console.log(err);
          return res
            .status(errorConfig.generalDbErrorCode)
            .json({
              responseCode: errorConfig.generalDbErrorCode,
              responseDescription: errorConfig.generalDbErrorMsg,
            });
        });
    })
    .catch((err) => {
      console.log(err);
      return res
        .status(errorConfig.generalDbErrorCode)
        .json({
          responseCode: errorConfig.generalDbErrorCode,
          responseDescription: errorConfig.generalDbErrorMsg,
        });
    });
});

/***************************************************************
 * name : modify
 * description: renames the username,emailId in mongodb
 ***************************************************************/

router.post("/modify", checkAuth, (req, res) => {
  if (
    req.body.userName === "" ||
    req.body.userName === null ||
    req.body.emailId === "" ||
    req.body.emailId === null
  ) {
    return res
      .status(errorConfig.successMessageCode)
      .json({
        responseCode: errorConfig.badRequestCode,
        responseDescription: errorConfig.badRequestMsg,
      });
  } else {
    axios({
      method: "post",
      url: process.env.API_BASE_URL + "/user/getDetails",
      data: { userId: req.body.userId },
      headers: { Authorization: req.headers.authorization },
    })
      .then((response) => {
        try {
          console.log(response);
          if (response.length === 0) {
            return res
              .status(errorConfig.successMessageCode)
              .json({
                responseCode: errorConfig.notFoundErrorCode,
                responseDescription: errorConfig.notFoundErrorMsg,
              });
          } else {
            User.findByIdAndUpdate(
              req.body.userId,
              {
                userName: req.body.userName,
                emailId: req.body.emailId,
              },
              { returnDocument: "after" }
            )
              .then((result) => {
                console.log(result);
                res.status(errorConfig.successMessageCode).json({
                  responseCode: errorConfig.successMessageCode,
                  responseDescription: "User details modified",
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
                  return res
                    .status(errorConfig.successMessageCode)
                    .json({
                      responseCode: errorConfig.dataDuplicationErrorCode,
                      responseDescription: errorConfig.dataDuplicationErrorMsg,
                      keyValue: err.keyValue,
                    });
                } else {
                  return res
                    .status(errorConfig.generalDbErrorCode)
                    .json({
                      responseCode: errorConfig.generalDbErrorCode,
                      responseDescription: errorConfig.generalDbErrorMsg,
                    });
                }
              });
          }
        } catch (err) {
          console.log(err);
          return res
            .status(errorConfig.generalDbErrorCode)
            .json({
              responseCode: errorConfig.generalDbErrorCode,
              responseDescription: errorConfig.generalDbErrorMsg,
            });
        }
      })
      .catch((err) => {
        console.log(err);
        return res
          .status(errorConfig.generalDbErrorCode)
          .json({
            responseCode: errorConfig.generalDbErrorCode,
            responseDescription: errorConfig.generalDbErrorMsg,
          });
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
        return res
          .status(errorConfig.successMessageCode)
          .json({
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
      return res
        .status(errorConfig.generalDbErrorCode)
        .json({
          responseCode: errorConfig.generalDbErrorCode,
          responseDescription: errorConfig.generalDbErrorMsg,
        });
    });
});

/***************************************************************
 * name : addRole
 * description: Adds the role to user
 ***************************************************************/

router.post("/addRole", checkAuth, (req, res) => {
  let incomingRoleIdArray = req.body.roleId;
  let outGoingRoleArray = [];
  let addCount = 0;

  for (addCount = 0; addCount < incomingRoleIdArray.length; addCount++) {
    const userRoleMaps = new userRole({
      _id: new mongoose.Types.ObjectId(),
      roleId: incomingRoleIdArray[addCount],
      userId: req.body.userId,
    });
    userRoleMaps
      .save()
      .then((result) => {
        outGoingRoleArray.push({
          userRoleMapId: result._id,
          roleId: result.roleId,
        });

        if (outGoingRoleArray.length === incomingRoleIdArray.length) {
          return res.status(errorConfig.successMessageCode).json({
            userId: req.body.userId,
            roleId: outGoingRoleArray,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        return res
          .status(errorConfig.generalDbErrorCode)
          .json({
            responseCode: errorConfig.generalDbErrorCode,
            responseDescription: errorConfig.generalDbErrorMsg,
          });
      });
  }
});

/***************************************************************
 * name : modifyRoles
 * description: modifies roles for the user
 ***************************************************************/

router.post("/modifyRoles", checkAuth, (req, res) => {
  //delete all the roles mapped with userId

  console.log(JSON.stringify(req.body));

  userRole
    .deleteMany({ userId: req.body.userId })
    .then((result) => {
      if (result.deletedCount === 0) {
        //return res.status(errorConfig.successMessageCode).json({responseCode: errorConfig.notFoundErrorCode, responseDescription: errorConfig.notFoundErrorMsg});
      }
    })
    .catch((err) => {
      console.log(err);
      return res
        .status(errorConfig.generalDbErrorCode)
        .json({
          responseCode: errorConfig.generalDbErrorCode,
          responseDescription: errorConfig.generalDbErrorMsg,
        });
    });

  // Send a POST request to addRole API after deleting roles in order to rewrite them

  if (
    req.body.userId === "" ||
    req.body.userId === null ||
    req.body.roleId === "" ||
    req.body.roleId === null
  ) {
    return res
      .status(errorConfig.successMessageCode)
      .json({
        responseCode: errorConfig.badRequestCode,
        responseDescription: errorConfig.badRequestMsg,
      });
  } else {
    axios({
      method: "post",
      url: process.env.API_BASE_URL + "/user/addRole",
      data: {
        userId: req.body.userId,
        roleId: req.body.roleId,
      },
      headers: { Authorization: req.headers.authorization },
    })
      .then((response) => {
        console.log("Made request to add role: " + response.request);
        return res.status(errorConfig.successMessageCode).json({
          responseCode: errorConfig.successMessageCode,
          responseDescription: "Role mapped to user",
          responseObject: response.data,
        });
      })
      .catch((err) => {
        console.log(err);
        return res
          .status(errorConfig.generalDbErrorCode)
          .json({
            responseCode: errorConfig.generalDbErrorCode,
            responseDescription: errorConfig.generalDbErrorMsg,
          });
      });
  }
});

/***************************************************************
 * name : deleteRole
 * description: Deletes roles from user
 ***************************************************************/

router.post("/deleteRole", checkAuth, (req, res) => {
  userRole
    .deleteOne({ userId: req.body.userId, roleId: req.body.roleId })
    .then((result) => {
      console.log(result);
      if (result.deletedCount === 0) {
        return res
          .status(errorConfig.successMessageCode)
          .json({
            responseCode: errorConfig.notFoundErrorCode,
            responseDescription: errorConfig.notFoundErrorMsg,
          });
      } else {
        res.status(errorConfig.successMessageCode).json({
          responseCode: errorConfig.successMessageCode,
          responseDescription: "Role deleted for user",
          responseObject: { userId: req.body.userId },
        });
      }
    })
    .catch((err) => {
      console.log(err);
      return res
        .status(errorConfig.generalDbErrorCode)
        .json({
          responseCode: errorConfig.generalDbErrorCode,
          responseDescription: errorConfig.generalDbErrorMsg,
        });
    });
});

/***************************************************************
 * name : getRoles
 * description: Gets all roles for a given user
 ***************************************************************/

router.post("/getRoles", checkAuth, (req, res) => {
  //find returns the array, find role and send back to user.
  if (req.body.userId === "" || req.body.userId === null) {
    return res
      .status(errorConfig.successMessageCode)
      .json({
        responseCode: errorConfig.badRequestCode,
        responseDescription: errorConfig.badRequestMsg,
      });
  } else {
    //find returns the array, find role and send back to user.

    userRole.find({ userId: req.body.userId }, (err, data) => {
      if (err) {
        console.log(err);
        return res
          .status(errorConfig.generalDbErrorCode)
          .json({
            responseCode: errorConfig.generalDbErrorCode,
            responseDescription: errorConfig.generalDbErrorMsg,
          });
      } else if (data.length === 0) {
        return res
          .status(errorConfig.successMessageCode)
          .json({
            responseCode: errorConfig.notFoundErrorCode,
            responseDescription: errorConfig.notFoundErrorMsg,
          });
      } else {
        let returnedArray = data;
        let roleNameArray = [];
        let counter = 0;
        let falseArray = [];
        let nullDocFlag = false;

        for (counter = 0; counter < returnedArray.length; counter++) {
          let rolesId = returnedArray[counter].roleId;

          Role.findById({ _id: rolesId }, (err, data) => {
            if (err) {
              return res
                .status(errorConfig.generalDbErrorCode)
                .json({
                  responseCode: errorConfig.generalDbErrorCode,
                  responseDescription: errorConfig.generalDbErrorMsg,
                });
            } else {
              if (data.length === 0) {
                nullDocFlag = true;
                falseArray.push("aaa");
              } else {
                let newItem = {
                  roleName: data.roleName,
                  roleId: rolesId,
                };
                roleNameArray.push(newItem);
              }
            }
            if (roleNameArray.length === returnedArray.length) {
              res.status(errorConfig.successMessageCode).json({
                responseCode: errorConfig.successMessageCode,
                responseDescription: "roles for particular user",
                responseObject: {
                  userId: req.body.userId,
                  roles: roleNameArray,
                },
              });
            } else if (
              falseArray.length + roleNameArray.length ===
                returnedArray.length &&
              nullDocFlag === true
            ) {
              return res
                .status(errorConfig.successMessageCode)
                .json({
                  responseCode: errorConfig.notFoundErrorCode,
                  responseDescription: errorConfig.notFoundErrorMsg,
                });
            }
          });
        }
      }
    });
  }
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

router.post("/login", (req, res, next) => {
  User.find({ emailId: req.body.emailId })
    .exec()
    .then((users) => {
      //console.log(users.length)
      if (users.length === 0) {
        return res
          .status(errorConfig.successMessageCode)
          .json({
            responseCode: errorConfig.unAuthorizedCode,
            responseDescription: errorConfig.unAuthorizedMsg,
          });
      }

      //Compare passwords and issue the token

      bcrypt.compare(req.body.password, users[0].password, (err, result) => {
        const { SECRET_KEY } = process.env;
        console.log(result);
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

          //call getRoles API to get roles for the user while logging in

          axios({
            method: "post",
            url: process.env.API_BASE_URL + "/user/getRoles",
            data: { userId: users[0]._id },
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((response) => {
              console.log(response.data);
              if (
                response.data.responseCode === errorConfig.notFoundErrorCode
              ) {
                return res
                  .status(errorConfig.successMessageCode)
                  .json({
                    responseCode: errorConfig.notFoundErrorCode,
                    authToken: token,
                    responseDescription:
                      "No roles are mapped for the given user",
                  });
              } else {
                return res.status(errorConfig.successMessageCode).json({
                  responseCode: errorConfig.successMessageCode,
                  responseDescription: "Auth succeeded",
                  responseObject: {
                    authToken: token,
                    rolesForUser: response.data.responseObject,
                  },
                });
              }
            })
            .catch((err) => {
              console.log(err.response.data);
              return res
                .status(errorConfig.generalDbErrorCode)
                .json({
                  responseCode: errorConfig.generalDbErrorCode,
                  responseDescription: errorConfig.generalDbErrorMsg,
                });
            });
        } else {
          return res
            .status(errorConfig.successMessageCode)
            .json({
              responseCode: errorConfig.unAuthorizedCode,
              responseDescription: errorConfig.unAuthorizedMsg,
            });
        }
      });
    })
    .catch((err) => {
      console.log(err);
      return res
        .status(errorConfig.generalDbErrorCode)
        .json({
          responseCode: errorConfig.generalDbErrorCode,
          responseDescription: errorConfig.generalDbErrorMsg,
        });
    });
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
      return res
        .status(errorConfig.generalDbErrorCode)
        .json({
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
    return res
      .status(errorConfig.successMessageCode)
      .json({
        responseCode: errorConfig.badRequestCode,
        responseDescription: errorConfig.badRequestMsg,
      });
  } else {
    //Find user in DB using userId

    User.findOne({ _id: req.body.userId })
      .select("-password")
      .then((result) => {
        if (result.length === 0) {
          return res
            .status(errorConfig.successMessageCode)
            .json({
              responseCode: errorConfig.notFoundErrorCode,
              responseDescription: errorConfig.notFoundErrorMsg,
            });
        } else {
          //hash new password

          bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
              return res
                .status(errorConfig.successMessageCode)
                .json({
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
                    return res
                      .status(errorConfig.successMessageCode)
                      .json({
                        responseCode: dataDuplicationErrorCode,
                        responseDescription:
                          errorConfig.dataDuplicationErrorMsg,
                        keyValue: err.keyValue,
                      });
                  } else {
                    return res
                      .status(errorConfig.generalDbErrorCode)
                      .json({
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
        return res
          .status(errorConfig.generalDbErrorCode)
          .json({
            responseCode: errorConfig.generalDbErrorCode,
            responseDescription: errorConfig.generalDbErrorMsg,
          });
      });
  }
  //}
});

module.exports = router; //export router
