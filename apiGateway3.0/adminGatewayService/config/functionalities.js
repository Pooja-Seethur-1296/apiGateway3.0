/**
 * Include libraries and modules
 */

const endPointSchema = require("../model/endPointList");
const fs = require("fs");
const projectUsers = require("../model/projectUsers");

module.exports = {
  /**
   * @function {*} generateApiKey
   * @description {*} generates unique key for each and every api
   * @param {*} projectCode
   * @return {*} uniqueKey
   */

  generateApiKey: (projectCode) => {
    let uniqueKey = Math.floor(Math.random() * 90000) + 10000;
    return projectCode + uniqueKey;
  },

  /**
   * @function {*} feedToMongoDb
   * @description {*} Uploads the data read from excel to mongodb
   * @param {*} data
   * @param {*} callback
   */

  feedToMongoDb: async (data, callback) => {
    //map data to generate apikey

    let apiKey = data.map((obj) => ({
      ...obj,
      endPointToken: module.exports.generateApiKey(obj.projectCode),
    }));

    //check if project has already endpoints, if they have delete
    let deleteData = endPointSchema
      .deleteMany(apiKey)
      .then((result) => {
        callback(result);
      })
      .catch((error) => {
        console.log(error);
      });
    //insert to db

    endPointSchema
      .insertMany(apiKey)
      .then((result) => {
        callback(result);
      })
      .catch((error) => {
        console.log(error);
      });
  },

  /**
   * @function {*} mongoAggregate
   * @param {*} appProjectCode
   * @param {*} incomingUserId
   * @param {*} callback
   */

  mongoAggregate: (appProjectCode, userId, callback) => {
    module.exports.checkUserIsMapped(appProjectCode, userId, (docs, err) => {
      if (err) {
        console.log(err);
      } else if (docs === true) {
        console.log(docs);
        endPointSchema
          .aggregate([
            //stage one: find end points by project code
            { $match: { projectCode: appProjectCode } },
            //stage two: select only few fields
            {
              $project: {
                endPointToken: 1,
                requestType: 1,
                endPoint: 1,
              },
            },
          ])
          .then((result) => {
            console.log(result);

            let redisDataUpdate = [];
            for (let i = 0; i < result.length; i++) {
              let typeOfRequest = result[i].endPointToken + "reqType";
              let endPointKey = result[i].endPointToken;
              let apiAccessData = result[i].endPointToken + "apiAccessCount";
              redisDataUpdate.push(typeOfRequest, result[i].requestType);
              redisDataUpdate.push(endPointKey, result[i].endPoint);
              redisDataUpdate.push(apiAccessData, 0);
            }
            console.log(redisDataUpdate);
            callback(redisDataUpdate);
          })
          .catch((error) => {
            callback("error");
          });
      }
    });
  },

  /**
   * @function {*} deleteFile
   * @description {*} deletes the uploaded file in multer after operation
   * @param {*} callback
   */

  deleteFile: (callback) => {
    try {
      fs.unlinkSync("./uploads/test.xlsx");
      console.log("Successfully deleted uploaded test.xlsx");
      callback("success");
    } catch (error) {
      console.error("There was an error:", error.message);
    }
  },

  /**
   * @function {*} checkUserIsMapped
   * @param {*} appProjectCode
   * @param {*} incomingUserId
   * @param {*} callback
   */

  checkUserIsMapped: (appProjectCode, incomingUserId, callback) => {
    projectUsers
      .find({ userId: incomingUserId, projectCode: appProjectCode })
      .then((result) => {
        if (result.length === 0) {
          callback(false);
        } else {
          callback(true);
        }
      });
  },

  /**
   *
   * @param {*} appProjectCode
   * @param {*} incomingUserId
   * @param {*} callback
   */
  getEpTokensOfProject: (appProjectCode, callback) => {
    endPointSchema
      .aggregate([
        //pipepine1: match project code
        { $match: { projectCode: appProjectCode } },

        //pipeline2: get end point tokens of the project
        { $project: { endPointToken: 1 } },
      ])
      .then((result) => {
        if (result.length === 0) {
          callback("nothing");
        } else {
          //console.log(result);
          let tokenArray = [];
          for (let i = 0; i < result.length; i++) {
            tokenArray.push(result[i].endPointToken + "apiAccessCount");
          }
          console.log(tokenArray);
          callback(tokenArray);
        }
      });
  },
};
