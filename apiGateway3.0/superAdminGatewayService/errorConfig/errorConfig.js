/*************************************************************
 * Name         :   errorHandler.js 
 * Author       :   Pooja Seethur 
 * Description  :   function wrapper for error handling of the 
 *                  APIs        
 *************************************************************/

module.exports = {
    successMessageCode : 200,
    createdCode : 200, 
    dataDuplicationErrorCode : 409,
    notFoundErrorCode : 404,
    generalDbErrorCode : 500,
    badRequestCode : 400,
    unAuthorizedCode : 401,
    unAuthorizedMsg : "Auth failed",
    badRequestMsg : "Bad request",
    notFoundErrorMsg : "Record not found",
    dataDuplicationErrorMsg : "Record already exits",
    generalDbErrorMsg : "General mongoDB error: Could not process the request by DB"
}