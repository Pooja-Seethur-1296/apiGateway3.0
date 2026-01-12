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
const XLSX = require('xlsx');
const configFunc = require("./config/functionalities");
const app = express();
const redis = require('redis');
const REDIS_PORT = 6379;
const db = require('./config/connectToDb');
const authorize = require('./config/authorize');


/**
 * connect to mongo db
 */

db.connect();

/**
 * Include middlewares
 */

const client = redis.createClient(REDIS_PORT);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
* Create redis client
*/
client.on('connect', () => {
    console.log('Connected!');
});

/**
 * Store the uploaded file in uploads folder
 */

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

var upload = multer({ storage: storage })

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
        //read contents of excel file

        var filePath = './uploads/test.xlsx';
        var workbook = XLSX.readFile(filePath);
        var sheet_name_list = workbook.SheetNames;
        let jsonData = XLSX.utils.sheet_to_json(
            workbook.Sheets[sheet_name_list[0]]
        );

        //call feed to mongo function to dump data to database

        configFunc.feedToMongoDb(jsonData, (result) => {
            
            if (result.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "xml sheet has no data",
                });
            }

            //delete file after successful operation

            configFunc.deleteFile((operationResult) => {
                if(operationResult === 'success'){
                    res.status(201).json({
                        success: true,
                        message: result,
                    });
                }else if(operationResult === 'error'){
                    res.status(201).json({
                        success: true,
                        message: 'Data fed to mongodb, some error in handling file',
                    });
                }
            });
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @name {*} uploadFile
 * @description {*} Uploads excel file, extracts data and stores them in mongo DB
 */

app.post("/uploadFile", authorize, upload.single('myFile.xlsx'), uploadXLSX);

/**
 * @name {*} mapUserEndPoints
 * @description {*} Extracts stored data from mongo DB, based on project code and updates in redis
 */

app.post('/mapUserEndPoints', authorize, (req, res) => {

    console.log(req.body.projectCode, req.body.userId)
    configFunc.mongoAggregate(req.body.projectCode, req.body.userId, (data, error) => {
        if (error) {
            res.status(400).send('error in retrieving data')
        } else {
            client.hset(req.body.userId, data, (success, setError) => {
                if(setError){
                    console.log('setting data in redis error ')
                    console.log(setError)
                }else{
                    res.status(200).send({responseCode: 200, updatedDataInRedis: data})
                }
            });
        }
    })
});

/**
 * @name {*} flushRedis
 * @description {*} Caution: erases all the data in redis database. Perform with secret key only
 */

app.post("/flushRedis", authorize, (req, res) => {

    if(req.body.secretKey === 'redisDataClearMadro'){
        client.del(req.body.userId, (err, succeeded) => {
            console.log(succeeded); // will be true if successfull
            if (err){
                return res.status(500).json({
                    responseCode: 500,
                    responseDescription: "Error in deleting data in redis"
                })
            }
            res.status(200).json({
                responseCode: 200,
                responseDescription: "Deleted all data in redis"
            })
        });
    }
});

/**
 * @name {*} apiAccessCountReset
 * @description {*} redis apiAccessCount re-set
 */

app.post('/apiAccessCountReset', authorize, (req, res) => {
    console.log(`Request received to renew access count: ${req.body.userId} Project code: ${req.body.projectCode}`);

    //call function to get endpoints

    configFunc.getEpTokensOfProject(req.body.projectCode, (apiTokenData) => {

        for(let tokenDataIter = 0; tokenDataIter < apiTokenData.length; tokenDataIter++){

            //set to 0 or reset

            client.hset(req.body.userId, apiTokenData[tokenDataIter], 0, (error, success) => {
                try{
                    if(tokenDataIter === (apiTokenData.length-1)){
                        res.status(200).json({
                            responseCode: 200,
                            responseDescription: "Successfully set API access counter"
                        })
                    }
                }catch(error){
                    return res.send('error in resetting data')
                }
            })
        }
    })
});

/**
 * start express server at port 2001
 */
app.listen(2001, () => {
    console.log(`Server started... at port 2001`);
});
