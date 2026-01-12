/*************************************************************
 * Name         :   role.js 
 * Author       :   Pooja Seethur 
 * Description  :   Manages role functionality requests        
 *************************************************************/

/**********Include library***********/

const Role = require('../model/adminModel/role');
const User = require('../model/adminModel/user');
const userRole = require('../model/adminModel/userRoleMap');
const express = require('express');
const mongoose = require('mongoose');
const checkAuth = require('../middleWare/checkAuth');
const axios = require('axios');
const router = express.Router();
const errorConfig = require('../errorConfig/errorConfig');

/***************************************************************
 * name : add 
 * description: creates new role, pushes role details to DB
 ***************************************************************/

router.post('/add', checkAuth, (req, res, next) => {

    if ((req.body.roleName === "") || (req.body.roleName === null) || (req.body.description === "") || (req.body.description === null)) {
        return res.status(errorConfig.successMessageCode).json({ responseCode: errorConfig.badRequestCode, responseDescription: errorConfig.badRequestMsg });
    }
    else {

        const roles = new Role({
            _id: new mongoose.Types.ObjectId(),
            roleName: req.body.roleName,
            description: req.body.description
        });
        roles.save()
            .then(result => {
                console.log("Role added to role collection: " + result);
                res.status(errorConfig.successMessageCode).json({
                    responseCode: errorConfig.createdCode,
                    responseDescription: "Role added",
                    responseObject: {
                        roleId: result._id,
                        roleName: result.roleName,
                        status: "Role added"
                    }
                });
            })
            .catch(err => {
                console.log(err);
                if (err.code === 11000) {
                    return res.status(errorConfig.successMessageCode).json({ responseCode: errorConfig.dataDuplicationErrorCode, responseDescription: errorConfig.dataDuplicationErrorMsg, keyValue: err.keyValue });
                }
                else {
                    return res.status(errorConfig.generalDbErrorCode).json({ responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg });
                }
            })
    }

});

/***************************************************************
 * name : delete
 * description: deletes role details from role collection and 
 *              user-role map collection
 ***************************************************************/

router.post('/delete', checkAuth, (req, res) => {

    //remove role from role collection

    Role.deleteOne({ _id: req.body.roleId })
        .then((result) => {

            let roleDeletion = result.deletedCount;
            console.log("Role deleted from role collection: " + roleDeletion);

            //remove role from user collection

            //EndPointRole.deleteMany({ roleId: req.body.roleId })
            //  .then((result) => {

            //    let endPointRoleDeletion = result.deletedCount;
            //                    console.log("Role deleted from end point-role map collection: " + endPointRoleDeletion);

            //removes role from user-role map collection  

            userRole.deleteMany({ roleId: req.body.roleId })
                .then((result) => {

                    let userRoleDeletion = result.deletedCount;
                    console.log("Role deleted from user-role map collection: " + userRoleDeletion);

                    if ((roleDeletion != 0) && (userRoleDeletion != 0)) {
                        return res.status(errorConfig.successMessageCode).json({
                            responseCode: errorConfig.successMessageCode,
                            responseDescription: "Role deleted from all collections"
                        })
                    }
                    else if ((roleDeletion === 0) && (userRoleDeletion === 0)) {
                        return res.status(errorConfig.successMessageCode).json({ responseCode: errorConfig.notFoundErrorCode, responseDescription: errorConfig.notFoundErrorMsg })
                    }
                    else if ((roleDeletion != 0) && (userRoleDeletion === 0)) {
                        return res.status(errorConfig.successMessageCode).json({
                            responseCode: errorConfig.successMessageCode,
                            responseDescription: "Role deleted from role collection"
                        })
                    }
                    else {
                        return res.status(errorConfig.successMessageCode).json({
                            responseCode: errorConfig.successMessageCode,
                            responseDescription: "Role deleted from existing collections"
                        })
                    }

                })
                .catch((err) => {
                    console.log(err);
                    return res.status(errorConfig.generalDbErrorCode).json({ responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg });
                })
            // })
            // .catch((err) => {
            //     console.log(err);
            //     return res.status(errorConfig.generalDbErrorCode).json({responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg});
            // })
        })
        .catch((err) => {
            console.log(err);
            return res.status(errorConfig.generalDbErrorCode).json({ responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg });
        })

});

/***************************************************************
 * name : modify 
 * description: renames the rolename and description in mongodb
 ***************************************************************/

router.post('/modify', checkAuth, (req, res) => {

    if ((req.body.roleName === "") || (req.body.roleName === null) || (req.body.description === "") || (req.body.description === null)) {
        return res.status(errorConfig.successMessageCode).json({ responseCode: errorConfig.badRequestCode, responseDescription: errorConfig.badRequestMsg });
    }

    else {
        axios({ method: 'post', url: process.env.API_BASE_URL + '/role/getDetails', data: { roleId: req.body.roleId }, headers: { Authorization: req.headers.authorization } })
            .then(response => {
                try {
                    if (response.length === null) {
                        return res.status(errorConfig.successMessageCode).json({ responseCode: errorConfig.notFoundErrorCode, responseDescription: errorConfig.notFoundErrorMsg });
                    }
                    else {
                        Role.findByIdAndUpdate(req.body.roleId,
                            {
                                roleName: req.body.roleName,
                                description: req.body.description

                            }, { returnDocument: 'after' })
                            .then((result) => {
                                console.log("Roles modified in roles collection: " + result);
                                res.status(errorConfig.successMessageCode).json({
                                    responseCode: errorConfig.successMessageCode,
                                    responseDescription: "role details modified",
                                    responseObject: {
                                        roleId: result._id,
                                        roleName: result.roleName,
                                        description: result.description
                                    }
                                });
                            })
                            .catch((err) => {
                                console.log(err);
                                if (err.code === 11000) {
                                    return res.status(errorConfig.successMessageCode).json({ responseCode: errorConfig.dataDuplicationErrorCode, responseDescription: errorConfig.dataDuplicationErrorMsg, keyValue: err.keyValue });
                                }
                                else {
                                    return res.status(errorConfig.generalDbErrorCode).json({ responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg });
                                }
                            })
                    }

                }
                catch (err) {
                    return res.status(errorConfig.generalDbErrorCode).json({ responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg });
                }
            })
            .catch(err => {
                return res.status(errorConfig.generalDbErrorCode).json({ responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg });
            })
    }

});

/***************************************************************
 * name : getDetails
 * description: gets the details for a given rolename.              
 ***************************************************************/

router.post('/getDetails', checkAuth, (req, res) => {

    Role.findOne({ _id: req.body.roleId })
        .then((result) => {
            console.log("request to get role details: " + result);
            if (result === null) {
                return res.status(errorConfig.successMessageCode).json({ responseCode: errorConfig.notFoundErrorCode, responseDescription: errorConfig.notFoundErrorMsg });;
            }
            else {
                res.status(errorConfig.successMessageCode).json({
                    responseCode: errorConfig.successMessageCode,
                    responseDescription: "Details of the request",
                    responseObject: { result }
                });
            }
        })
        .catch((err) => {
            console.log(err);
            return res.status(errorConfig.generalDbErrorCode).json({ responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg });
        })
});

/***************************************************************
 * name : modifyUsers ??
 * description: updates or adds the users for a role
 ***************************************************************/

// router.post('/modifyUsers', checkAuth, (req, res) => {

//     //delete all the users mapped with particular roleId

//     userRole.deleteMany({ roleId: req.body.roleId })
//         .then((result => {
//             console.log(result);
//             if (result.deletedCount === 0) {
//                 return res.status(errorConfig.successMessageCode).json({responseCode: errorConfig.notFoundErrorCode, responseDescription: errorConfig.notFoundErrorMsg});
//             }
//         }))
//         .catch(err => {
//             console.log(err);
//             return res.status(errorConfig.generalDbErrorCode).json({responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg});
//         });

//     //if any updated users array is present, update

//     if ((req.body.userId === "") || (req.body.userId === null) || (req.body.roleId === "") || (req.body.roleId === null)) {
//         return res.status(errorConfig.successMessageCode).json({responseCode: errorConfig.badRequestCode, responseDescription: errorConfig.badRequestMsg});
//     }

//     else {

//         let incomingUserIdArray = req.body.userIds;
//         let outGoingUserArray = [];
//         let addCount = 0;

//         for (addCount = 0; addCount < incomingUserIdArray.length; addCount++) {

//             const userRoleMaps = new userRole({
//                 _id: new mongoose.Types.ObjectId(),
//                 roleId: req.body.roleId,
//                 userId: incomingUserIdArray[addCount]
//             });
//             userRoleMaps.save()
//                 .then(result => {
//                     outGoingUserArray.push({
//                         userRoleMapId: result._id,
//                         userIds: result.userId
//                     });

//                     if (outGoingUserArray.length === incomingUserIdArray.length) {
//                         res.status(errorConfig.successMessageCode).json({
//                             responseCode: errorConfig.successMessageCode,
//                             responseDescription: "users modified for the role",
//                             responseObject: {
//                                 roleId: req.body.roleId,
//                                 userId: outGoingUserArray
//                             }
//                     });
//                     }

//                 })
//                 .catch(err => {
//                     console.log(err);
//                     return res.status(errorConfig.generalDbErrorCode).json({responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg});
//                 })
//         }
//     }

// });

/***************************************************************
 * name : modifyEndPoints 
 * description: updates or adds the users for an endpoint
 ***************************************************************/

// router.post('/modifyEndPoints', checkAuth, (req, res) => {

//     //delete all the EP mapped with particular roleId

//     EndPointRole.deleteMany({ roleId: req.body.roleId })
//         .then(result => {
//             console.log(result);
//             if (result.deletedCount === 0) {
//                 return res.status(errorConfig.successMessageCode).json({responseCode: errorConfig.notFoundErrorCode, responseDescription: errorConfig.notFoundErrorMsg});
//             }
//         })
//         .catch(err => {
//             console.log(err);
//             return res.status(errorConfig.generalDbErrorCode).json({responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg});
//         });

//     //if any updated EP array is present, update

//     if ((req.body.endPointId === "") || (req.body.endPointId === null) || (req.body.roleId === "") || (req.body.roleId === null)) {
//         return res.status(errorConfig.successMessageCode).json({responseCode: errorConfig.badRequestCode, responseDescription: errorConfig.badRequestMsg});
//     }

//     else {
//         let incomingEndPointIdArray = req.body.endPointId;
//         let addCount = 0;

//         for (addCount = 0; addCount < incomingEndPointIdArray.length; addCount++) {

//             const endPointsRoleMaps = new EndPointRole({
//                 _id: new mongoose.Types.ObjectId(),
//                 roleId: req.body.roleId,
//                 endPointId: incomingEndPointIdArray[addCount]
//             });
//             endPointsRoleMaps.save()
//                 .then(result => {

//                     if (addCount === incomingEndPointIdArray.length) {
//                         res.status(errorConfig.successMessageCode).json({
//                             responseCode: errorConfig.successMessageCode,
//                             responseDescription: "End points modified for role",
//                             responseObject: {
//                             roleId: req.body.roleId,
//                             endPointId: incomingEndPointIdArray
//                         }
//                     });
//                     }
//                 })
//                 .catch(err => {
//                     console.log(err);
//                     return res.status(errorConfig.generalDbErrorCode).json({responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg});
//                 })
//         }
//     }
// });

/***************************************************************
 * name : deleteUser
 * description: Deletes an user from a role           
 ***************************************************************/

// router.post('/deleteUser', checkAuth, (req, res) => {

//     userRole.deleteOne({userId: req.body.userId, roleId: req.body.roleId})
//         .then((result) => {
//             console.log(result);
//             if (result.deletedCount === 0) {
//                 return res.status(errorConfig.successMessageCode).json({responseCode: errorConfig.notFoundErrorCode, responseDescription: errorConfig.notFoundErrorMsg});
//             }
//             else {
//                 res.status(errorConfig.successMessageCode).json({
//                     responseCode: errorConfig.successMessageCode,
//                     responseDescription: "User deleted for role",
//                     responseObject:{roleId: req.body.roleId}
//                 });
//             }
//         })
//         .catch((err) => {
//             console.log(err);
//             return res.status(errorConfig.generalDbErrorCode).json({responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg});
//         })

// });

// /***************************************************************
//  * name : deleteEndPoint 
//  * description: Deletes an endpoint from role             
//  ***************************************************************/

// router.post('/deleteEndPoint', checkAuth, (req, res) => {

//     EndPointRole.deleteOne({ roleId: req.body.roleId, endPointId: req.body.endPointId })
//         .then((result) => {
//             console.log(result);
//             if (result.deletedCount === 0) {
//                 return res.status(errorConfig.successMessageCode).json({ errorMessage: errorConfig.notFoundErrorMsg });
//             }
//             else {
//                 res.status(errorConfig.successMessageCode).json({
//                     responseCode: errorConfig.successMessageCode,
//                     responseDescription: "endPoint deleted for user",
//                     responseObject:{roleId: req.body.roleId}
//                 })
//             }
//         })
//         .catch((err) => {
//             console.log(err);
//             return res.status(errorConfig.generalDbErrorCode).json({responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg});
//         })

// });

/***************************************************************
 * name : getList
 * description: gets the list of all roles in role collection.              
 ***************************************************************/

router.get('/getList', checkAuth, (req, res) => {

    Role.find()
        .then((result) => {
            console.log("List of roles: " + result);
            res.status(errorConfig.successMessageCode).json({
                responseCode: errorConfig.successMessageCode,
                responseDescription: "List of roles",
                responseObject: { roles: result }
            });
        })
        .catch((err) => {
            console.log(err);
            return res.status(errorConfig.generalDbErrorCode).json({ responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg });
        })

});


/***************************************************************
 * name : getUsers ?? 
 * description: Gets complete list of users for a given role            
 ***************************************************************/

// router.post('/getUsers', checkAuth, (req, res) => {

//     if ((req.body.roleId === "") || (req.body.roleId === null)) {
//         return res.status(errorConfig.successMessageCode).json({responseCode: errorConfig.badRequestCode, responseDescription: errorConfig.badRequestMsg});
//     }

//     else{

//         userRole.find({ roleId: req.body.roleId }, (err, data) => {
//             if (err) {
//                 return res.status(errorConfig.generalDbErrorCode).json({responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg});
//             }
//             else {
//                 if (data.length === 0) {
//                     return res.status(errorConfig.successMessageCode).json({ responseCode: errorConfig.notFoundErrorCode, responseDescription: errorConfig.notFoundErrorMsg });
//                 }
//                 else {

//                     let returnedArray = data;
//                     let userNameArray = [];
//                     let counter = 0;
//                     let falseArray = [];
//                     let nullDocFlag = false;

//                     for (counter = 0; counter < returnedArray.length; counter++) {

//                         let userId = returnedArray[counter].userId;

//                         User.findOne({ _id: userId }, (err, data) => {
//                             if (err) {
//                                 console.log(err);
//                                 return res.status(errorConfig.generalDbErrorCode).json({responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg});
//                             }
//                             else {
//                                 console.log(data)
//                                 if (data === null) {
//                                     nullDocFlag = true;
//                                     falseArray.push("aaa");
//                                 }
//                                 else {
//                                     let newItem = {
//                                         userName: data.userName,
//                                         userId: userId
//                                     };
//                                     userNameArray.push(newItem)
//                                 }
//                             }

//                             if (userNameArray.length === returnedArray.length) {
//                                 res.status(errorConfig.successMessageCode).json({
//                                     responseCode: errorConfig.successMessageCode,
//                                     responseDescription: "users for particular role",
//                                     responseObject: {
//                                         roleId: req.body.roleId,
//                                         users: userNameArray
//                                     }
//                                 });
//                             }
//                             else if (((falseArray.length + userNameArray.length) === returnedArray.length) && (nullDocFlag === true)) {
//                                 return res.status(errorConfig.successMessageCode).json({ responseCode: errorConfig.notFoundErrorCode, responseDescription: errorConfig.notFoundErrorMsg });
//                             }
//                         });

//                     }
//                 }

//             }
//         });
//     }
// });

/***************************************************************
 * name : getEndPoints ??
 * description: Gets list of endpoints for a given role            
 ***************************************************************/

// router.post('/getEndPoints', checkAuth, (req, res) => {

//     if ((req.body.roleId === "") || (req.body.roleId === null)) {
//         return res.status(errorConfig.successMessageCode).json({responseCode: errorConfig.badRequestCode, responseDescription: errorConfig.badRequestMsg});
//     }

//     else {

//         EndPointRole.find({ roleId: req.body.roleId }, (err, data) => {
//             try {
//                 if (data.length === 0){
//                     return res.status(errorConfig.successMessageCode).json({ responseCode: errorConfig.notFoundErrorCode, responseDescription: errorConfig.notFoundErrorMsg });
//                 }
//                 else{

//                     let returnedArray = data;
//                     let endPointArray = [];
//                     let counter = 0;
//                     let falseArray = [];
//                     let nullDocFlag = false;

//                     for (counter = 0; counter < returnedArray.length; counter++) {

//                         let endPointId = returnedArray[counter].endPointId;

//                         EndPoint.findOne({ _id: endPointId }, (err, data) => {
//                             if (err) {
//                                 console.log(err);
//                                 if (err.code === 11000) {
//                                     return res.status(errorConfig.successMessageCode).json({
//                                         responseCode: errorConfig.dataDuplicationErrorCode,
//                                         responseDescription: errorConfig.dataDuplicationErrorMsg,
//                                         keyValue: err.keyValue
//                                     });
//                                 }
//                                 else{
//                                     return res.status(errorConfig.generalDbErrorCode).json({responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg});
//                                 }                     
//                             }
//                             else {
//                                 if(data === null){
//                                     nullDocFlag = true;
//                                     falseArray.push("aaa");
//                                 }
//                                 else{
//                                     let newItem = {
//                                         endPointId: endPointId,
//                                         endPointPath: data.endPointPath
//                                     };
//                                     endPointArray.push(newItem)
//                                 }
//                             }
//                             if (endPointArray.length === returnedArray.length) {
//                                 res.status(errorConfig.successMessageCode).json({
//                                     responseCode: errorConfig.successMessageCode,
//                                     responseDescription: "End points for particular role",
//                                     responseObject: {
//                                         roleId: req.body.roleId,
//                                         endPoints: endPointArray
//                                     }
//                                 });
//                             }
//                             else if (((falseArray.length + endPointArray.length) === returnedArray.length) && (nullDocFlag === true)) {
//                                 return res.status(errorConfig.successMessageCode).json({ responseCode: errorConfig.notFoundErrorCode, responseDescription: errorConfig.notFoundErrorMsg });
//                             }
//                         });

//                     }
//                 }
//             }
//             catch (err) {
//                 return res.status(errorConfig.generalDbErrorCode).json({responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg});
//             }
//         });
//     }
// });

/***************************************************************
 * name : modifySourceServers ??
 * description: updates or adds the source servers for a role
 ***************************************************************/

// router.post('/modifySourceServers', checkAuth, (req, res) => {

//     //delete all the users mapped with particular roleId

//     roleSourceServer.deleteMany({ roleId: req.body.roleId })
//         .then((result => {
//             console.log(result);
//             if (result.deletedCount === 0) {
//                 //return res.status(errorConfig.successMessageCode).json({responseCode: errorConfig.notFoundErrorCode, responseDescription: errorConfig.notFoundErrorMsg});
//             }
//         }))
//         .catch(err => {
//             console.log(err);
//             return res.status(errorConfig.generalDbErrorCode).json({responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg});
//         });

//     //if any updated users array is present, update

//     if ((req.body.sourceServerIds === "") || (req.body.sourceServerIds === null) || (req.body.roleId === "") || (req.body.roleId === null)) {
//         return res.status(errorConfig.successMessageCode).json({responseCode: errorConfig.badRequestCode, responseDescription: errorConfig.badRequestMsg});
//     }

//     else {

//         let incomingSSIdArray = req.body.sourceServerIds;
//         let outGoingSSArray = [];
//         let addCount = 0;

//         for (addCount = 0; addCount < incomingSSIdArray.length; addCount++) {

//             const roleSourceServerMaps = new roleSourceServer({
//                 _id: new mongoose.Types.ObjectId(),
//                 roleId: req.body.roleId,
//                 sourceServerId: incomingSSIdArray[addCount]
//             });
//             roleSourceServerMaps.save()
//                 .then(result => {
//                     outGoingSSArray.push({
//                         roleSSMapId: result._id,
//                         sourceServerIds: result.sourceServerId
//                     });

//                     if (outGoingSSArray.length === incomingSSIdArray.length) {
//                         res.status(errorConfig.successMessageCode).json({
//                             responseCode: errorConfig.successMessageCode,
//                             responseDescription: "Source servers modified for the role",
//                             responseObject: {
//                                 roleId: req.body.roleId,
//                                 sourceServerId: outGoingSSArray
//                             }
//                     });
//                     }

//                 })
//                 .catch(err => {
//                     console.log(err);
//                     return res.status(errorConfig.generalDbErrorCode).json({responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg});
//                 })
//         }
//     }

// });

/***************************************************************
 * name : getSourceServers ??
 * description: Gets list of sourceServers for a given role            
 ***************************************************************/

// router.post('/getSourceServers', checkAuth, (req, res) => {

//     if ((req.body.roleId === "") || (req.body.roleId === null)) {
//         return res.status(errorConfig.successMessageCode).json({responseCode: errorConfig.badRequestCode, responseDescription: errorConfig.badRequestMsg});
//     }

//     else {

//         roleSourceServer.find({ roleId: req.body.roleId }, (err, data) => {
//             try {
//                 if (data.length === 0){
//                     return res.status(errorConfig.successMessageCode).json({ responseCode: errorConfig.notFoundErrorCode, responseDescription: errorConfig.notFoundErrorMsg });
//                 }
//                 else{

//                     let returnedArray = data;
//                     let ssArray = [];
//                     let counter = 0;
//                     let falseArray = [];
//                     let nullDocFlag = false;

//                     for (counter = 0; counter < returnedArray.length; counter++) {

//                         let sourceServerId = returnedArray[counter].sourceServerId;

//                         sourceServerDetails.findOne({ _id: sourceServerId }, (err, data) => {
//                             if (err) {
//                                 console.log(err);
//                                 if (err.code === 11000) {
//                                     return res.status(errorConfig.successMessageCode).json({
//                                         responseCode: errorConfig.dataDuplicationErrorCode,
//                                         responseDescription: errorConfig.dataDuplicationErrorMsg,
//                                         keyValue: err.keyValue
//                                     });
//                                 }
//                                 else{
//                                     return res.status(errorConfig.generalDbErrorCode).json({responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg});
//                                 }                     
//                             }
//                             else {
//                                 if(data === null){
//                                     nullDocFlag = true;
//                                     falseArray.push("aaa");
//                                 }
//                                 else{
//                                     let newItem = {
//                                         sourceServerId: sourceServerId,
//                                         sourceServerName: data.sourceServerName,
//                                         ipAddress: data.ipAddress,
//                                         APIKey: data.APIKey
//                                     };
//                                     ssArray.push(newItem)
//                                 }
//                             }
//                             if (ssArray.length === returnedArray.length) {
//                                 res.status(errorConfig.successMessageCode).json({
//                                     responseCode: errorConfig.successMessageCode,
//                                     responseDescription: "Source servers for particular role",
//                                     responseObject: {
//                                         roleId: req.body.roleId,
//                                         sourceServers: ssArray
//                                     }
//                                 });
//                             }
//                             else if (((falseArray.length + ssArray.length) === returnedArray.length) && (nullDocFlag === true)) {
//                                 return res.status(errorConfig.successMessageCode).json({ responseCode: errorConfig.notFoundErrorCode, responseDescription: errorConfig.notFoundErrorMsg });
//                             }
//                         });

//                     }
//                 }
//             }
//             catch (err) {
//                 return res.status(errorConfig.generalDbErrorCode).json({responseCode: errorConfig.generalDbErrorCode, responseDescription: errorConfig.generalDbErrorMsg});
//             }
//         });
//     }
// });

module.exports = router;            //export router