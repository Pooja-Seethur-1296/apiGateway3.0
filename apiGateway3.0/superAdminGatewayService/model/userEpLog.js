/*************************************************************
 * Name         :   userEpLog.js 
 * Author       :   Pooja Seethur 
 * Description  :   Creates a map details for user log schema         
 *************************************************************/

/**********Include mongoose library***********/

const mongoose = require('mongoose');

/*****Create schema*****/

let userEpLogSchema = new mongoose.Schema({
    _userRoleId: mongoose.Schema.Types.ObjectId,
    userId: {type: String, required: true},
    endPointPath: {type: String, required: true}
}, { timestamps: true });

/*****Export model*****/

module.exports = mongoose.model('userEpLog', userEpLogSchema);