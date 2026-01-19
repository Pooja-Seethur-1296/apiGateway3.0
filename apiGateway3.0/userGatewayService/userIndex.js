/**
 * @name: userGatewayIndex.js
 * @description {*} reroutes the requests from user to appropriate client application servers
 * @version: 2.0.0
 * @author : Pooja Seethur
 */

/**
 * Include node modules
 */

const express = require("express");
const redis = require("redis");
const app = express();
const bodyParser = require("body-parser");
const authorizeToken = require("./middleWare/authorizeToken");
const reroute = require("./reroute");
const REDIS_PORT = 6379;
const redisApiAccessCount = 30;
//const db = require('./config/connectToDb');

/**
 * Use middleware
 */

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/**
 * Create redis client and connect
 */

const client = redis.createClient(REDIS_PORT);

client.on("connect", function () {
  console.log("Connected!");
});

/**
 * @name {*} reRoute
 * @description {*} reRoute the incoming request from user to respective client servers
 */

app.post("/reRoute", authorizeToken, (req, res) => {
  console.log(
    `UserId: ${req.body.userId}, API key: ${req.body.apiKey}, Request body: ${req.body.requestBody}, auth token: ${req.headers.authorization}`,
  );

  let reqqType = req.body.apiKey + "reqType";
  let authorizationToken = req.headers.authorization;
  let apiAccessCount = req.body.apiKey + "apiAccessCount";

  //get api url from cache db

  client.hget(req.body.userId, req.body.apiKey, (error, apiUrlObj) => {
    if (error) {
      return res.send("Error in retrieving redis data");
    }

    //check api access stats to give access

    client.hget(
      req.body.userId,
      apiAccessCount,
      (apiAccessErr, endPointAccessCount) => {
        try {
          if (endPointAccessCount > redisApiAccessCount) {
            return res.send({
              responseCode: 401,
              responseDescription:
                "API access is restricted, renew API subscription plan again",
            });
          } else {
            //get type of request and redirect

            client.hget(req.body.userId, reqqType, (error, reqTypeObj) => {
              //call redirect function to redirect incoming request to application server

              reroute.redirect(
                req.body.requestBody,
                reqTypeObj,
                apiUrlObj,
                authorizationToken,
                (data, error) => {
                  try {
                    //increment redis APIAccessCount here
                    client.hincrby(
                      req.body.userId,
                      apiAccessCount,
                      1,
                      (incData, incErr) => {
                        if (incErr) {
                          //console.log('errrrrrrr '+incErr.body)
                        }
                        res.send(data);
                      },
                    );
                  } catch {
                    return res.send("Error in retrieving redis data" + error);
                  }
                },
              );
            });
          }
        } catch (error) {
          return res.send("Error in retrieving redis data");
        }
      },
    );
  });
});

/**
 * start express server at port 2001
 */

app.listen(2000, () => {
  console.log("Server running on 2000");
});
