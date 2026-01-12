/*************************************************************
 * Name         :   userRoleMap.js 
 * Author       :   Pooja Seethur 
 * Description  :   Creates a map details for user & role schema         
 *************************************************************/

/**********Include mongoose library***********/

const mongoose = require('mongoose');

/*****Create schema*****/

let userRoleSchema = new mongoose.Schema({
    _userRoleId: mongoose.Schema.Types.ObjectId,
    userId: {type: String, required: true},
    roleId: {type: String, required: true}
});

/*****Export model*****/

module.exports = mongoose.model('userRole', userRoleSchema);