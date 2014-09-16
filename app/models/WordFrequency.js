var mongoose = require('mongoose');

module.exports = mongoose.model('WordFrequency', {
    word: String,
    frequency: Number,
    pos: String,
    filesNumber: Number

});