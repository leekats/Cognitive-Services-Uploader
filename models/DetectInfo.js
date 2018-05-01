var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = new Schema({
    imgId: { type: String },
    personId: { type: String },
    conf: { type: String }
});