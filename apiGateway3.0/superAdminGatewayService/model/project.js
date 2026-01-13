/*************************************************************
 * Name         :   project.js 
 * Author       :   Pooja Seethur 
 * Description  :   Creates a project schema         
 *************************************************************/

/**********Include mongoose library***********/

const mongoose = require('mongoose');

/*****Create schema*****/

let projectSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    projectName: {type: String, required: true},
    description: {type: String, required: true},
    projectCode: {type: String, required: true, unique: true}
});

/*****Export model*****/

module.exports = mongoose.model('projectDetails', projectSchema);  

