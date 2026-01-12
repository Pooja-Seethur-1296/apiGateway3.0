/**
 * @name: authorizeToken.js
 * @author: Pooja seethur
 * @version: 1.0.0
 * @description: This is a wrapper code which verifies JWT token and authorizes request
 */

/** 
 * @description: Include libraries and declare variables */

const jwt = require('jsonwebtoken');

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
            console.log('Decoded the authorization request')
            return res.status(200).json({ responseCode: 401, responseDescription: 'Token expired' });
        }
        next();
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ responseCode: 500, responseDescription: 'Auth failed' });
    }

};