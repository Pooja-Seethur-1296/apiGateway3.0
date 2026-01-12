/**
 * @name : index.js
 * @author: Pooja Seethur
 */

/**
 * Include libraries and modules
 */
const mongoose = require('mongoose');

/**
 * Define schema
 */
const endPointListSchema = new mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    endPoint: {type: String, required: true},
    endPointToken: {type: String, required: true},
    projectCode: {type: String, required: true},
    requestType: {type: String, required: true},
    sampleRequestSchema: {type: String},
    description: {type: String}
});

/**
 * export model
 */
module.exports = mongoose.model('endPointsList', endPointListSchema);