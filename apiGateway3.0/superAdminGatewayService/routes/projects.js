/*************************************************************
 * Name         :   projects.js
 * Author       :   Pooja Seethur
 * Description  :   handles all the APIs related to project info
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

/***************************************************************
 * name : add
 * description: creates new project details, pushes to DB
 ***************************************************************/

router.post("/addProject", checkAuth, (req, res, next) => {
  console.log(req.body);
  if (
    req.body.projectName === "" ||
    req.body.projectName === null ||
    req.body.projectCode === "" ||
    req.body.projectCode === null
  ) {
    return res.status(errorConfig.successMessageCode).json({
      responseCode: errorConfig.badRequestCode,
      responseDescription: errorConfig.badRequestMsg,
    });
  } else {
    const projectsDetails = new projectsDetail({
      _id: new mongoose.Types.ObjectId(),
      projectName: req.body.projectName,
      projectCode: req.body.projectCode,
      description: req.body.description,
    });
    projectsDetails
      .save()
      .then((result) => {
        res.status(errorConfig.successMessageCode).json({
          responseCode: errorConfig.successMessageCode,
          responseDescription: "New project created",
          responseObject: {
            projectId: result._id,
            projectName: result.projectName,
            projectCode: result.projectCode,
            description: result.description,
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

/***************************************************************
 * name : delete
 * description: deletes projects from all collections
 ***************************************************************/

router.post("/deleteProject", checkAuth, (req, res, next) => {
  //remove ss from ss collection

  projectsDetail
    .deleteOne({ projectCode: req.body.projectCode })
    .then((result) => {
      let projectDeletion = result.deletedCount;
      console.log("Project is getting deleted: " + projectDeletion);
      if (projectDeletion != 0) {
        return res.status(errorConfig.successMessageCode).json({
          responseCode: errorConfig.successMessageCode,
          responseDescription:
            "Record deleted from project collection, but not deleted from project-user map user collection",
        });
      }

      //removes user from ep-ss map collection delete from other stuffs

      // projectUserDetail
      //   .deleteMany({ projectId: req.body.projectId })
      //   .then((result) => {
      //     let proUserMapDeletion = result.deletedCount;
      //     console.log(
      //       "source server collection deletion: " + proUserMapDeletion
      //     );

      //     if (projectDeletion === 0 && proUserMapDeletion === 0) {
      //       return res.status(errorConfig.successMessageCode).json({
      //         responseCode: errorConfig.notFoundErrorCode,
      //         responseDescription: errorConfig.notFoundErrorMsg,
      //       });
      //     } else if (projectDeletion === 0 && proUserMapDeletion != 0) {
      //       return res.status(errorConfig.successMessageCode).json({
      //         responseCode: errorConfig.successMessageCode,
      //         responseDescription:
      //           "Record deleted from project-user map collection, but not deleted from project collection",
      //       });
      //     } else if (projectDeletion != 0 && proUserMapDeletion === 0) {
      //       return res.status(errorConfig.successMessageCode).json({
      //         responseCode: errorConfig.successMessageCode,
      //         responseDescription:
      //           "Record deleted from project collection, but not deleted from project-user map user collection",
      //       });
      //     } else if (projectDeletion != 0 && proUserMapDeletion != 0) {
      //       return res.status(errorConfig.successMessageCode).json({
      //         responseCode: errorConfig.successMessageCode,
      //         responseDescription: "Record deleted from all collections",
      //       });
      //     }
      //   })
      //   .catch((err) => {
      //     console.log(err);
      //     return res.status(errorConfig.generalDbErrorCode).json({
      //       responseCode: errorConfig.generalDbErrorCode,
      //       responseDescription: errorConfig.generalDbErrorMsg,
      //     });
      //   });
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
 * name : getList
 * description: gets the list of all projects
 ***************************************************************/

router.get("/getProjectList", checkAuth, (req, res) => {
  console.log("Get project list");
  projectsDetail
    .find()
    .then((result) => {
      if (result === null) {
        return res.status(errorConfig.successMessageCode).json({
          responseCode: errorConfig.notFoundErrorCode,
          responseDescription: errorConfig.notFoundErrorMsg,
        });
      } else {
        res.status(errorConfig.successMessageCode).json({
          responseCode: errorConfig.successMessageCode,
          responseDescription: "Details of the request",
          responseObject: { projects: result },
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
 * name : getProjectDetails
 * description: gets the project details for a given project
 ***************************************************************/

router.post("/getProjectDetails", checkAuth, (req, res) => {
  projectsDetail
    .findOne({ _id: req.body.projectId })
    .then((result) => {
      if (result === null) {
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
 * name : modify
 * description: renames the project name,code and description in mongodb
 ***************************************************************/

router.post("/modifyProject", checkAuth, (req, res) => {
  if (
    req.body.projectName === "" ||
    req.body.projectName === null ||
    req.body.projectCode === "" ||
    req.body.projectCode === null
  ) {
    return res.status(errorConfig.successMessageCode).json({
      responseCode: errorConfig.badRequestCode,
      responseDescription: errorConfig.badRequestMsg,
    });
  } else {
    projectsDetail
      .findOneAndUpdate(
        { projectCode: req.body.projectCode },
        {
          projectName: req.body.projectName,
          description: req.body.description,
          projectCode: req.body.projectCode,
        },
        { returnDocument: "after" }
      )
      .then((result) => {
        console.log("Project details updated: " + result);
        res.status(errorConfig.successMessageCode).json({
          responseCode: errorConfig.successMessageCode,
          responseDescription: "Project details modified",
          responseObject: {
            projectName: result.projectName,
            description: result.description,
            projectCode: result.projectCode,
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

/**
 * @name {*} mapProjectsToUser
 * @description {*} Map the projects to user
 */

router.post("/mapProjectsToUser", checkAuth, (req, res) => {
  console.log(req.body);

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
    let incomingProjectsArray = req.body.projects;
    let outGoingProjectsArray = [];
    let addCount = 0;

    for (addCount = 0; addCount < incomingProjectsArray.length; addCount++) {
      const projectRoleMaps = new projectUserDetail({
        _id: new mongoose.Types.ObjectId(),
        projectName: incomingProjectsArray[addCount].projectName,
        projectId: incomingProjectsArray[addCount].projectId,
        projectCode: incomingProjectsArray[addCount].projectCode,
        userId: req.body.userId,
      });
      projectRoleMaps
        .save()
        .then((result) => {
          outGoingProjectsArray.push({
            projectUserMap: result._id,
            projectName: result.projectName,
            projectId: result.projectId,
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

module.exports = router; //export router
