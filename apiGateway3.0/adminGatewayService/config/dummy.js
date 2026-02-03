/**
 * @name {*} index.js
 * @author {*} Pooja Seethur
 * @version : 1.1.0
 */

/**
 * Include libraries and modules
 */

const express = require("express");
const app = express();
const redis = require("redis");

/**
 * Include middlewares also install redis/json
 */

const client = redis.createClient(6379);
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

(async function main() {
  //retrieve from project users, also retrieve the role
  let userId = "6980466e21bc88190afd7605";

  let endPoints = [
    {
      endPoint: "https://api.evenkart.in:8443/ots/api/v18_1/users/addNewUser",
      endPointToken: "EVEN00185617",
      projectCode: "EVEN001",
      requestType: "POST",
      sampleRequestSchema:
        "{requestData:{type:String},firstName:{type:String},lastName:{type:String},emailId:{type:String},usrStatus:{type:String},usrPassword:{type:String},contactNo:{type:Number},address1:{type:String},address2:{type:String},pincode:{type:String},registrationId:{type:String},mappedTo:{type:String},userAdminFlag:{type:String},userLat:{type:String},userLong:{type:String},deviceId:{type:String},userRoleId :{type:String},createdUser:{type:String},userImage:{type:String},faceBookId:{type:String},googleId:{type:String}}",
      description: "Register page",
    },
    {
      endPoint:
        "https://api.evenkart.in:8443/ots/api/v18_1/users/otsLoginAuthentication",
      endPointToken: "EVEN00129080",
      projectCode: "EVEN001",
      requestType: "POST",
      sampleRequestSchema:
        "{requestData:{type:String},phoneNumber: {type:String},deviceId:{type:string},password:{type:String}}\r\n",
      description: "Login Page",
    },
    {
      endPoint:
        "https://api.evenkart.in:8443/ots/api/v18_1/users/getUserDetails",
      endPointToken: "EVEN00163139",
      projectCode: "EVEN001",
      requestType: "POST",
      sampleRequestSchema:
        "{requestData:{type:String},searchKey:{type:String},searchvalue:{type:String},distributorId:{type:String},userLat:{type:String},userLong:{type:String},createdUser: {type:String}}\r\n",
      description: "get user details",
    },
    {
      endPoint:
        "https://api.evenkart.in:8443/ots/api/v18_1/order/getOrderByStatusAndDistributor",
      endPointToken: "EVEN00164301",
      projectCode: "EVEN001",
      requestType: "POST",
      sampleRequestSchema:
        "{request:{type:String},status:{type:string},distrubitorId:{type:String}}\r\n",
      description: "getOrderByStatusAndDistributor",
    },
    {
      endPoint:
        "https://api.evenkart.in:8443/ots/api/v18_1/users/getDistributorByCreatedUser",
      endPointToken: "EVEN00168470",
      projectCode: "EVEN001",
      requestType: "GET",
      sampleRequestSchema: "{CreatedUser:{type:String}}",
      description: "getDistributorByCreatedUser",
    },
    {
      endPoint:
        "https://api.evenkart.in:8443/ots/api/v18_1/order/getListOfOrderByDate",
      endPointToken: "EVEN00180437",
      projectCode: "EVEN001",
      requestType: "POST",
      sampleRequestSchema:
        "{request:{type:String},status:{type:String},role:{type:String},userId:{type:String},startDate:{type:String},endDate:{type:String}}\r\n" +
        " ",
      description: "List of order by Dates",
    },
    {
      endPoint:
        "https://api.evenkart.in:8443/ots/api/v18_1/order/insertOrderAndProduct",
      endPointToken: "EVEN00181173",
      projectCode: "EVEN001",
      requestType: "POST",
      sampleRequestSchema:
        "{request:{type:String},address:{type:String},customerId:{type:String},customerName:{type:String},orderCost:{type:String},orderStatus:{type:String},paymentFlowStatus:{type:String},customerChangeAddressId:{type:String},userLat:{type:String},userLong:{type:String},customerLat:{type:String},productList:[{type:Object}\r\n" +
        "{orderedQty:{type:String},ots_delivered_qty:{type:String},productCost:{type:String},productId:{type:String},productStatus:{type:String}}],{orderDate:{type:String}},{couponId:{type:String}}",
      description: "Insert order and product",
    },
    {
      endPoint:
        "https://api.evenkart.in:8443/ots/api/v18_1/product/getProductStock",
      endPointToken: "EVEN00121752",
      projectCode: "EVEN001",
      requestType: "POST",
      sampleRequestSchema:
        "{requestData:{type:String},productId:{type:String},distributorId:{type:String}}\r\n" +
        " ",
      description: "Get product stock",
    },
  ];

  let jsonToBeAppended = endPoints.map((item) => {
    return {
      url: item.endPoint,
      token: item.endPointToken,
      requestType: item.requestType,
    };
  });
  //store in redis
  client.hset(userId, jsonToBeAppended, (success, setError) => {
    if (setError) {
      console.log("setting data in redis error ");
      console.log(setError);
    } else {
      res.status(200).send({ responseCode: 200, updatedDataInRedis: data });
    }
  });
})();
