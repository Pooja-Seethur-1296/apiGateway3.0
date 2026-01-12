/**
 * @name {*} reroute.js
 * @description {*} wrapper to reroute the requests from user to appropriate client application servers
 * @version : 1.0.0
 */

/**
 * Include node modules
 */

const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {

    /**
     * @name  {*} redirect
     * @param {*} requestBody 
     * @param {*} requestType 
     * @param {*} apiUrl 
     * @param {*} authorizationToken 
     * @param {*} callback 
     */

    redirect: function (requestBody, requestType, apiUrl, authorizationToken, callback) {
        
        let apiRequestBody;
        if(requestType === 'GET'){
            apiRequestBody = null
        }else if(requestType === 'POST'){
            apiRequestBody = requestBody
        }
        let configOptions = {
            method: requestType,
            httpsAgent: agent,
            url: apiUrl,
            data: apiRequestBody, 
            headers: { Authorization: authorizationToken }
        }

        axios(configOptions)
            .then((response) => {
                console.log(response.data)
                callback(response.data)
                return
            })
            .catch((error) => {
                if (error.response) {
                  // The request was made and the server responded with a status code
                  // that falls out of the range of 2xx
                  console.log(error.response.data);
                  console.log(error.response.status);
                  console.log(error.response.headers);
                } else if (error.request) {
                  // The request was made but no response was received
                  // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                  // http.ClientRequest in node.js
                  console.log(error.request);
                } else {
                  // Something happened in setting up the request that triggered an Error
                  console.log('Error', error.message);
                  callback(error.response.data)
                }
                console.log(error);
            })
     
    }
}