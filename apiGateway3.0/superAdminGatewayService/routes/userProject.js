/*************************************************************
 * Name         :   userProjects.js
 * Author       :   Pooja Seethur
 * Description  :   handles all the APIs related to projectUser info
 *************************************************************/

/**********Include library***********/

const projectsDetail = require("../model/project");
const projectUserDetail = require("../model/projectUserMap");
const checkAuth = require("../middleWare/checkAuth");
const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const router = express.Router();
const errorConfig = require("../errorConfig/errorConfig");

/**
 * @name {*} mapProjectsToUser
 * @description {*} Map the projects to user
 */

router.post("/mapProjectsToUser", checkAuth, (req, res) => {
  console.log(req.body);

  if (
    // req.body.userId === "" ||
    // req.body.userId === null ||
    req.body.length === 0
  ) {
    return res.status(errorConfig.successMessageCode).json({
      responseCode: errorConfig.badRequestCode,
      responseDescription: errorConfig.badRequestMsg,
    });
  } else {
    let incomingProjectsArray = req.body;
    let outGoingProjectsArray = [];
    let addCount = 0;

    for (addCount = 0; addCount < incomingProjectsArray.length; addCount++) {
      const projectRoleMaps = new projectUserDetail({
        _id: new mongoose.Types.ObjectId(),
        projectName: incomingProjectsArray[addCount].projectName,
        projectCode: incomingProjectsArray[addCount].projectCode,
        userRole: incomingProjectsArray[addCount].userRole,
        userName: incomingProjectsArray[addCount].userName,
        userId: incomingProjectsArray[addCount].userId,
      });
      projectRoleMaps
        .save()
        .then((result) => {
          outGoingProjectsArray.push({
            projectUserMap: result._id,
            projectName: result.projectName,
            // projectId: result.projectId,
            projectCode: result.projectCode,
          });

          if (outGoingProjectsArray.length === incomingProjectsArray.length) {
            return res.status(errorConfig.successMessageCode).json({
              userId: req.body.userId,
              projects: outGoingProjectsArray,
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
  }
});

/***************************************************************
 * name : modifyProjectsOfUser
 * description: modifies projects mapped to the user
 ***************************************************************/

router.post("/modifyProjectsOfUser", checkAuth, (req, res) => {
  //delete all the roles mapped with userId

  console.log(JSON.stringify(req.body));

  projectUserDetail
    .deleteMany({ userId: req.body.userId })
    .then((result) => {
      if (result.deletedCount === 0) {
        console.log("no documents");
        return res.status(errorConfig.successMessageCode).json({
          responseCode: errorConfig.notFoundErrorCode,
          responseDescription: errorConfig.notFoundErrorMsg,
        });
      }
    })
    .catch((err) => {
      //console.log(err);
      return res.status(errorConfig.generalDbErrorCode).json({
        responseCode: errorConfig.generalDbErrorCode,
        responseDescription: errorConfig.generalDbErrorMsg,
      });
    });

  // Send a POST request to addProject API after deleting projects in order to rewrite them

  if (
    req.body.userId === "" ||
    req.body.userId === null ||
    req.body.projects.length === 0
  ) {
    return res.status(errorConfig.successMessageCode).json({
      responseCode: errorConfig.badRequestCode,
      responseDescription: errorConfig.badRequestMsg,
    });
  } else {
    axios({
      method: "post",
      url: process.env.API_BASE_URL + "/project/mapProjectsToUser",
      data: {
        userId: req.body.userId,
        projects: req.body.projects,
      },
      headers: { Authorization: req.headers.authorization },
    })
      .then((response) => {
        console.log("Made request to map project: " + response.request);
        return res.status(errorConfig.successMessageCode).json({
          responseCode: errorConfig.successMessageCode,
          responseDescription: "Modified projects mapped to user",
          responseObject: response.data,
        });
      })
      .catch((err) => {
        //console.log(err);
        return res.status(errorConfig.generalDbErrorCode).json({
          responseCode: errorConfig.generalDbErrorCode,
          responseDescription: errorConfig.generalDbErrorMsg,
        });
      });
  }
});

router.post("/getProjectsOfUser", checkAuth, async (req, res) => {
  let resData = await projectUserDetail.find({ userId: req.body.userId });
  if (resData.length === 0) {
    console.log("No projects mapped");
    return res.status(errorConfig.successMessageCode).json({
      responseCode: errorConfig.notFoundErrorCode,
      responseDescription: "No projects mapped to given user",
    });
  } else {
    return res.status(errorConfig.successMessageCode).json({
      responseCode: errorConfig.successMessageCode,
      responseDescription: "Projects mapped to given user",
      responseObject: resData,
    });
  }
});

//Make one more to unmap

module.exports = router; //export router
