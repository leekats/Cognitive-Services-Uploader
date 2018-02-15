var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = new Schema({
    picId: { type: String },
    personId: { type: String }
});