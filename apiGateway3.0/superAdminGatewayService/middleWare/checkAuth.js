/*************************************************************
 * Name         :   checkAuth.js 
 * Author       :   Murli 
 * Description  :   Creates a unique token whenever user logins
 *                  in, which is valid for 2 hrs with 
 *                  error handling       
 *************************************************************/

const jwt = require('jsonwebtoken');
const errorConfig = require('../errorConfig/errorConfig');

module.exports = (req, res, next) => {

    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(
            token,
            process.env.SECRET_KEY
        );
        req.userData = decoded;
        //console.log(decoded);
        const now = Math.floor(Date.now() / 1000);
        //console.log("Now: " + now);
	    console.log('Authorized')

        if (now > decoded.exp) {
            return res.status(errorConfig.successMessageCode).json({ responseCode : errorConfig.generalDbErrorCode, responseDescription: 'Token expired'});
        }
        next();
    }
    catch (err) {
        return res.status(errorConfig.generalDbErrorCode).json({ responseCode : errorConfig.generalDbErrorCode, responseDescription: 'Auth failed'});
    }

};