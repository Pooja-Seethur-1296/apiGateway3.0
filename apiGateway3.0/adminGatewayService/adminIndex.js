/**
 * @name {*} index.js
 * @author {*} Pooja Seethur
 * @version : 1.1.0
 */

/**
 * Include libraries and modules
 */

const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const configFunc = require("./config/functionalities");
const app = express();
const redis = require("redis");
const REDIS_PORT = 6379;
const db = require("./config/connectToDb");
const authorize = require("./config/authorize");
const endPointSchema = require("./model/endPointList");
const Users = require("./model/user");
const projectUsers = require("./model/projectUsers");
const cors = require("cors");
const { promisify } = require("util");

/**
 * connect to mongo db
 */

db.connect();

// Configure CORS for a specific origin
app.use(
  cors({
    origin: "*",
  }),
);

/**
 * Include middlewares
 */

const client = createClient({
  url: "redis://:xuRedOts78D!@cache_database:6379",
});
const hgetAsync = promisify(client.hget).bind(client);
// const client = createClient({
//   url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST_NAME}:6379`,
// });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Create redis client
 */
client.on("connect", () => {
  console.log("Connected!");
});

/**
 * Store the uploaded file in uploads folder
 */

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

var upload = multer({ storage: storage });

/**
 * @name {*} uploadXLSX
 * @description {*} Handle the contents of excel file, and upload to mongo database
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */

const uploadXLSX = async (req, res, next) => {
  try {
    console.log("Got request");
    //read contents of excel file

    var filePath = "./uploads/test.xlsx";
    var workbook = XLSX.readFile(filePath);
    var sheet_name_list = workbook.SheetNames;
    let jsonData = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheet_name_list[0]],
    );

    //call feed to mongo function to dump data to database

    configFunc.feedToMongoDb(jsonData, (result) => {
      if (result.length === 0) {
        return res.status(400).json({
          responseCode: 400,
          responseDescription: "xml sheet has no data",
        });
      }

      //delete file after successful operation

      configFunc.deleteFile((operationResult) => {
        if (operationResult === "success") {
          res.status(201).json({
            responseCode: 201,
            responseDescription: "Data fed to database successfully",
            responseObject: result,
          });
        } else if (operationResult === "error") {
          res.status(500).json({
            responseCode: 500,
            responseDescription:
              "Data fed to mongodb, some error in handling file",
          });
        }
      });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @name {*} uploadFile
 * @description {*} Uploads excel file, extracts data and stores them in mongo DB
 */

app.post("/uploadFile", upload.single("myFile.xlsx"), uploadXLSX);

/**
 * @name {*} mapUserEndPoints
 * @description {*} Extracts stored data from mongo DB, based on project code and updates in redis
 */

app.post("/mapUserEndPoints", async (req, res) => {
  let allUsers = await projectUsers.find({ projectCode: req.body.projectCode });

  allUsers.map((items) => {
    configFunc.mongoAggregate(
      req.body.projectCode,
      items.userId,
      (data, error) => {
        if (error) {
          return res.status(400).send("error in retrieving data");
        } else {
          client.hset(items.userId, data, (success, setError) => {
            if (setError) {
              console.log("setting data in redis error ");
              console.log(setError);
              return res
                .status(200)
                .send({ responseCode: 200, updatedDataInRedis: setError });
            } else {
              return res
                .status(200)
                .send({ responseCode: 200, updatedDataInRedis: data });
            }
          });
        }
      },
    );
  });
});

/**
 * @name {*} flushRedis
 * @description {*} Caution: erases all the data in redis database. Perform with secret key only
 */

app.post("/flushRedis", async (req, res) => {
  console.log(req.body.userId);
  let userSecretKey = await Users.find(
    { _id: req.body.userId },
    { secretKey: 1 },
  );
  console.log(userSecretKey);
  if (req.body.secretKey === userSecretKey[0].secretKey) {
    client.del(req.body.userId, (err, succeeded) => {
      console.log(succeeded); // will be true if successfull
      if (err) {
        return res.status(500).json({
          responseCode: 500,
          responseDescription: "Error in deleting data in redis",
        });
      }
      res.status(200).json({
        responseCode: 200,
        responseDescription: "Deleted all data in redis",
      });
    });
  } else {
    return res.status(404).json({
      responseCode: 404,
      responseDescription: "Wrong secret key",
    });
  }
});

/**
 * @name {*} apiAccessCountReset
 * @description {*} redis apiAccessCount re-set
 */

app.post("/apiAccessCountReset", authorize, (req, res) => {
  console.log(
    `Request received to renew access count: ${req.body.userId} Project code: ${req.body.projectCode}`,
  );

  //call function to get endpoints

  configFunc.getEpTokensOfProject(req.body.projectCode, (apiTokenData) => {
    for (
      let tokenDataIter = 0;
      tokenDataIter < apiTokenData.length;
      tokenDataIter++
    ) {
      //set to 0 or reset

      client.hset(
        req.body.userId,
        apiTokenData[tokenDataIter],
        0,
        (error, success) => {
          try {
            if (tokenDataIter === apiTokenData.length - 1) {
              res.status(200).json({
                responseCode: 200,
                responseDescription: "Successfully set API access counter",
              });
            }
          } catch (error) {
            return res.send("error in resetting data");
          }
        },
      );
    }
  });
});

/**
 * @name: getEndpointsOfProjects
 * @description: gets all the endpoints mapped to the user
 */
app.post("/getEndpointsOfProjects", async (req, res) => {
  var query = {};
  if (req.body.projectCode) {
    query = {
      projectCode: req.body.projectCode,
    };
  } else {
    query = {};
  }
  console.log(req.body.projectCode);
  console.log("Got list getEndpointsOfProjects");
  let projectEndPoints = await endPointSchema.find(query);
  console.log(projectEndPoints);
  try {
    if (projectEndPoints.length === 0) {
      return res.status(200).json({
        responseCode: 404,
        responseDescription:
          "No endpoints are mapped, please upload the excel file",
      });
    } else {
      return res.status(200).json({
        responseCode: 200,
        responseDescription: "Endpoints of the project ",
        responseObject: projectEndPoints,
      });
    }
  } catch (err) {}
});

/**
 * Get API access count per endpoints per user
 */

app.post("/getApiAccessCount", async (req, res) => {
  let endpointsListOfUser = await endPointSchema.find(
    {
      projectCode: req.body.projectCode,
    },
    { endPoint: 1, endPointToken: 1 },
  );

  const finalData = await Promise.all(
    endpointsListOfUser.map(async (item) => {
      const val = await hgetAsync(
        req.body.userId,
        `${item.endPoint}apiAccessCount`,
      );

      return {
        endPoint: item.endPoint,
        apiToken: item.endPointToken,
        apiAccessCount: Number(val) || 0,
      };
    }),
  );

  console.log(finalData);
  res.status(200).send({
    responseCode: 200,
    responseDescription: "Api access statistics per user",
    responseObject: finalData,
  });
});

//super admin functionality

/**
 * Get API access count per endpoints per user
 */

app.post("/getApiCountForAllProjects", async (req, res) => {
  console.log("req bantu");
  let allUsers = await projectUsers.find({}, { userId: 1, projectCode: 1 });

  let allEpAccess = (
    await Promise.all(
      allUsers.map(async (element) => {
        let epOfUsers = await endPointSchema.find(
          { projectCode: element.projectCode },
          { endPoint: 1, endPointToken: 1, projectCode: 1 },
        );

        const finalData = await Promise.all(
          epOfUsers.map(async (item) => {
            const val = await hgetAsync(
              element.userId,
              `${item.endPoint}apiAccessCount`,
            );

            return {
              projectCode: item.projectCode,
              apiAccessCount: Number(val) || 0,
            };
          }),
        );
        return finalData;
      }),
    )
  ).flat();
  console.log(JSON.stringify(allEpAccess));

  res.status(200).send({
    responseCode: 200,
    responseDescription: "Total API access statistics",
    responseObject: allEpAccess,
  });
});
/**
 * start express server at port 2001
 */
app.listen(2001, () => {
  console.log(`Server started... at port 2001`);
});
