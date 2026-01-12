/**
 * @name: authorizeToken.js
 * @author: Pooja seethur
 * @version: 1.0.0
 * @description: This is a wrapper code which verifies JWT token and authorizes request
 */

/** 
 * @description: Include libraries and declare variables */

const jwt = require('jsonwebtoken');
//const errorConfig = require('../errorConfig/errorConfig');

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
module.exports = (req, res, next) => {

    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(
            token,
            'secret1234'
        );
        req.userData = decoded;
        const now = Math.floor(Date.now() / 1000);
        console.log('Authorized')

        if (now > decoded.exp) {
            return res.status(errorConfig.successMessageCode).json({ responseCode: errorConfig.generalDbErrorCode, responseDescription: 'Token expired' });
        }
        next();
    }
    catch (err) {
        return res.status(errorConfig.generalDbErrorCode).json({ responseCode: errorConfig.generalDbErrorCode, responseDescription: 'Auth failed' });
    }

};