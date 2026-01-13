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
  if (
    req.body.projectName === "" ||
    req.body.projectName === null ||
    req.body.projectCode === "" ||
    req.body.projectCode === null
  ) {
    return res
      .status(errorConfig.successMessageCode)
      .json({
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

/***************************************************************
 * name : delete
 * description: deletes projects from all collections
 ***************************************************************/

router.post("/deleteProject", checkAuth, (req, res, next) => {
  //remove ss from ss collection

  projectsDetail
    .deleteOne({ _id: req.body.projectId })
    .then((result) => {
      let projectDeletion = result.deletedCount;
      console.log("source server collection deletion: " + projectDeletion);

      //removes user from ep-ss map collection delete from other stuffs

      projectUserDetail
        .deleteMany({ projectId: req.body.projectId })
        .then((result) => {
          let proUserMapDeletion = result.deletedCount;
          console.log(
            "source server collection deletion: " + proUserMapDeletion
          );

          if (projectDeletion === 0 && proUserMapDeletion === 0) {
            return res
              .status(errorConfig.successMessageCode)
              .json({
                responseCode: errorConfig.notFoundErrorCode,
                responseDescription: errorConfig.notFoundErrorMsg,
              });
          } else if (projectDeletion === 0 && proUserMapDeletion != 0) {
            return res.status(errorConfig.successMessageCode).json({
              responseCode: errorConfig.successMessageCode,
              responseDescription:
                "Record deleted from project-user map collection, but not deleted from project collection",
            });
          } else if (projectDeletion != 0 && proUserMapDeletion === 0) {
            return res.status(errorConfig.successMessageCode).json({
              responseCode: errorConfig.successMessageCode,
              responseDescription:
                "Record deleted from project collection, but not deleted from project-user map user collection",
            });
          } else if (projectDeletion != 0 && proUserMapDeletion != 0) {
            return res.status(errorConfig.successMessageCode).json({
              responseCode: errorConfig.successMessageCode,
              responseDescription: "Record deleted from all collections",
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
 * name : getList
 * description: gets the list of all projects
 ***************************************************************/

router.get("/getProjectList", checkAuth, (req, res) => {
  projectsDetail
    .find()
    .then((result) => {
      if (result === null) {
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
          responseObject: { projects: result },
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
 * name : getProjectDetails
 * description: gets the project details for a given project
 ***************************************************************/

router.post("/getProjectDetails", checkAuth, (req, res) => {
  projectsDetail
    .findOne({ _id: req.body.projectId })
    .then((result) => {
      if (result === null) {
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
    return res
      .status(errorConfig.successMessageCode)
      .json({
        responseCode: errorConfig.badRequestCode,
        responseDescription: errorConfig.badRequestMsg,
      });
  } else {
    projectsDetail
      .findOneAndUpdate(
        { _id: req.body.projectId },
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
            projectId: result._id,
            projectName: result.projectName,
            description: result.description,
            projectCode: result.projectCode,
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
    return res
      .status(errorConfig.successMessageCode)
      .json({
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
          return res
            .status(errorConfig.generalDbErrorCode)
            .json({
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
        return res
          .status(errorConfig.successMessageCode)
          .json({
            responseCode: errorConfig.notFoundErrorCode,
            responseDescription: errorConfig.notFoundErrorMsg,
          });
      }
    })
    .catch((err) => {
      //console.log(err);
      return res
        .status(errorConfig.generalDbErrorCode)
        .json({
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
    return res
      .status(errorConfig.successMessageCode)
      .json({
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
 * name : getEndPoints ??
 * description: Gets list of endpoints for a given ss
 ***************************************************************/

// router.post('/getEndPoints', checkAuth, (req, res) => {

//     if ((req.body.projectId === "") || (req.body.projectId === null)) {
//         return res.status(errorConfig.successMessageCode).json({ responseCode: errorConfig.badRequestCode, responseDescription: errorConfig.badRequestMsg });
//     }

//     else {
//         endPointSSMap.find({ projectId: req.body.projectId }, (err, data) => {
//             if (err) {
//                 console.log(err);
//                 return res.status(errorConfig.generalDbErrorCode).json({ responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg });
//             }
//             else if (data.length === 0) {
//                 return res.status(errorConfig.successMessageCode).json({ responseCode: errorConfig.notFoundErrorCode, responseDescription: errorConfig.notFoundErrorMsg });
//             }
//             else {

//                 let returnedArray = data;
//                 let endPointArray = [];
//                 let counter = 0;
//                 let falseArray = [];
//                 let nullDocFlag = false;

//                 for (counter = 0; counter < returnedArray.length; counter++) {

//                     let endPointId = returnedArray[counter].endPointId;

//                     EndPoint.findOne({ _id: endPointId }, (err, data) => {
//                         if (err) {
//                             console.log(err);
//                             return res.status(errorConfig.generalDbErrorCode).json({ responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg });
//                         }
//                         else {
//                             if (data === null) {
//                                 nullDocFlag = true;
//                                 falseArray.push("aaa");
//                             }
//                             else {
//                                 let newItem = {
//                                     endPointId: endPointId,
//                                     endPointPath: data.endPointPath
//                                 };
//                                 endPointArray.push(newItem)
//                             }
//                         }
//                         if (endPointArray.length === returnedArray.length) {
//                             res.status(errorConfig.successMessageCode).json({
//                                 responseCode: errorConfig.successMessageCode,
//                                 responseDescription: "Endpoints for particular source server",
//                                 responseObject: {
//                                     projectId: req.body.projectId,
//                                     endPoints: endPointArray
//                                 }
//                             });
//                         }
//                         else if (((falseArray.length + endPointArray.length) === returnedArray.length) && (nullDocFlag === true)) {
//                             return res.status(errorConfig.successMessageCode).json({ responseCode: errorConfig.notFoundErrorCode, responseDescription: errorConfig.notFoundErrorMsg });
//                         }
//                     });

//                 }
//             }
//         });
//     }
// });

/***************************************************************
 * name : modifyEndPoints ??
 * description: updates or adds the endpoint for ss
 ***************************************************************/

// router.post('/modifyEndPoints', checkAuth, (req, res) => {

//     //delete all the EP mapped with particular ssId

//     endPointSSMap.deleteMany({ projectId: req.body.projectId })
//         .then(result => {
//             console.log(result);
//             if (result.deletedCount === 0) {
//                 return res.status(errorConfig.successMessageCode).json({ responseCode: errorConfig.notFoundErrorCode, responseDescription: errorConfig.notFoundErrorMsg });
//             }
//         })
//         .catch(err => {
//             console.log(err);
//             return res.status(errorConfig.generalDbErrorCode).json({ responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg });
//         });

//     //if any updated EP array is present, update

//     if ((req.body.projectId === "") || (req.body.projectId === null) || (req.body.endPointId === "") || (req.body.endPointId === null)) {
//         return res.status(errorConfig.successMessageCode).json({ responseCode: errorConfig.badRequestCode, responseDescription: errorConfig.badRequestMsg });
//     }

//     else {

//         let incomingEndPointIdArray = req.body.endPointIds;
//         let addCount = 0;

//         for (addCount = 0; addCount < incomingEndPointIdArray.length; addCount++) {

//             const endPointsSSMaps = new endPointSSMap({
//                 _id: new mongoose.Types.ObjectId(),
//                 projectId: req.body.projectId,
//                 endPointId: incomingEndPointIdArray[addCount]
//             });
//             endPointsSSMaps.save()
//                 .then(result => {

//                     if (addCount === incomingEndPointIdArray.length) {
//                         res.status(errorConfig.successMessageCode).json({
//                             responseCode: errorConfig.successMessageCode,
//                             responseDescription: "End points modified for source server",
//                             responseObject: {
//                                 projectId: req.body.projectId,
//                                 endPointId: incomingEndPointIdArray
//                             }
//                         });
//                     }
//                 })
//                 .catch(err => {
//                     console.log(err);
//                     return res.status(errorConfig.generalDbErrorCode).json({ responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg });
//                 })
//         }
//     }

// });

/***************************************************************
 * name : deleteEndPoint
 * description: Deletes an endpoint from ss
 ***************************************************************/

// router.post('/deleteEndPoint', checkAuth, (req, res) => {

//     endPointSSMap.deleteOne({ projectId: req.body.projectId, endPointId: req.body.endPointId })
//         .then((result) => {
//             console.log(result);
//             if (result.deletedCount === 0) {
//                 return res.status(errorConfig.successMessageCode).json({ responseCode: errorConfig.notFoundErrorCode, responseDescription: errorConfig.notFoundErrorMsg });
//             }
//             else {
//                 res.status(errorConfig.successMessageCode).json({
//                     responseCode: errorConfig.successMessageCode,
//                     responseDescription: "End point deleted for a source server",
//                     responseObject: {
//                         projectId: req.body.projectId,
//                         endPointId: req.body.endPointId
//                     }
//                 });
//             }
//         })
//         .catch((err) => {
//             console.log(err);
//             return res.status(errorConfig.generalDbErrorCode).json({ responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg });
//         })

// });

/***************************************************************
 * name : modifyApiServers ??
 * description: updates or adds the source servers for a role
 ***************************************************************/

// router.post('/modifyApiServers', checkAuth, (req, res) => {

//     //delete all the users mapped with particular roleId

//     sourceServerAPIMap.deleteMany({ projectId: req.body.projectId })
//         .then((result => {
//             console.log(result);
//             if (result.deletedCount === 0) {
//                 //return res.status(errorConfig.successMessageCode).json({responseCode: errorConfig.notFoundErrorCode, responseDescription: errorConfig.notFoundErrorMsg});
//             }
//         }))
//         .catch(err => {
//             console.log(err);
//             return res.status(errorConfig.generalDbErrorCode).json({ responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg });
//         });

//     //if any updated users array is present, update

//     if ((req.body.projectId === "") || (req.body.projectId === null) || (req.body.apiServerIds === "") || (req.body.apiServerIds === null)) {
//         return res.status(errorConfig.successMessageCode).json({ responseCode: errorConfig.badRequestCode, responseDescription: errorConfig.badRequestMsg });
//     }

//     else {

//         let incomingASIdArray = req.body.apiServerIds;
//         let outGoingASArray = [];
//         let addCount = 0;

//         for (addCount = 0; addCount < incomingASIdArray.length; addCount++) {

//             const sourceServerAPIMaps = new sourceServerAPIMap({
//                 _id: new mongoose.Types.ObjectId(),
//                 projectId: req.body.projectId,
//                 apiServerId: incomingASIdArray[addCount]
//             });
//             sourceServerAPIMaps.save()
//                 .then(result => {
//                     outGoingASArray.push({
//                         SSASMapId: result._id,
//                         apiServerIds: result.apiServerId
//                     });

//                     if (outGoingASArray.length === incomingASIdArray.length) {
//                         res.status(errorConfig.successMessageCode).json({
//                             responseCode: errorConfig.successMessageCode,
//                             responseDescription: "API servers modified for the role",
//                             responseObject: {
//                                 projectId: req.body.projectId,
//                                 apiServerIds: outGoingASArray
//                             }
//                         });
//                     }

//                 })
//                 .catch(err => {
//                     console.log(err);
//                     return res.status(errorConfig.generalDbErrorCode).json({ responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg });
//                 })
//         }
//     }

// });

/***************************************************************
 * name : getApiServers
 * description: Gets list of apiServers for a given ss
 ***************************************************************/

// router.post('/getApiServers', checkAuth, (req, res) => {

//     if ((req.body.projectId === "") || (req.body.projectId === null)) {
//         return res.status(errorConfig.successMessageCode).json({ responseCode: errorConfig.badRequestCode, responseDescription: errorConfig.badRequestMsg });
//     }

//     else {
//         sourceServerAPIMap.find({ projectId: req.body.projectId }, (err, data) => {
//             if (err) {
//                 console.log(err);
//                 return res.status(errorConfig.generalDbErrorCode).json({ responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg });
//             }
//             else if (data.length === 0) {
//                 return res.status(errorConfig.successMessageCode).json({ responseCode: errorConfig.notFoundErrorCode, responseDescription: errorConfig.notFoundErrorMsg });
//             }
//             else {

//                 let returnedArray = data;
//                 let apiArray = [];
//                 let counter = 0;
//                 let falseArray = [];
//                 let nullDocFlag = false;

//                 for (counter = 0; counter < returnedArray.length; counter++) {

//                     let apiServerId = returnedArray[counter].apiServerId;

//                     apiServerDetails.findOne({ _id: apiServerId }, (err, data) => {
//                         if (err) {
//                             console.log(err);
//                             return res.status(errorConfig.generalDbErrorCode).json({ responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg });
//                         }
//                         else {
//                             if (data === null) {
//                                 nullDocFlag = true;
//                                 falseArray.push("aaa");
//                             }
//                             else {
//                                 let newItem = {
//                                     apiServerId: apiServerId,
//                                     apiServerName: data.apiServerName,
//                                     ipAddress: data.ipAddress,
//                                     port: data.port
//                                 };
//                                 apiArray.push(newItem)
//                             }
//                         }
//                         if (apiArray.length === returnedArray.length) {
//                             res.status(errorConfig.successMessageCode).json({
//                                 responseCode: errorConfig.successMessageCode,
//                                 responseDescription: "API servers for particular source server",
//                                 responseObject: {
//                                     projectId: req.body.projectId,
//                                     apiServerIds: apiArray
//                                 }
//                             });
//                         }
//                         else if (((falseArray.length + apiArray.length) === returnedArray.length) && (nullDocFlag === true)) {
//                             return res.status(errorConfig.successMessageCode).json({ responseCode: errorConfig.notFoundErrorCode, responseDescription: errorConfig.notFoundErrorMsg });
//                         }
//                     });

//                 }
//             }
//         });
//     }
// });

module.exports = router; //export router
