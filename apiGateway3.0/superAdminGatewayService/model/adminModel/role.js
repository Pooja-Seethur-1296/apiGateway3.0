/*************************************************************
 * Name         :   role.js 
 * Author       :   Pooja Seethur 
 * Description  :   Creates a role schema         
 *************************************************************/

/**********Include mongoose library***********/

const mongoose = require('mongoose');

/*****Create schema*****/

let roleSchema = new mongoose.Schema({
    _roleUniqueId: mongoose.Schema.Types.ObjectId,
    roleName: {type: String, required: true, unique: true},
    description: {type: String, required: true}
});

/*****Export model*****/

module.exports = mongoose.model('Role', roleSchema);  