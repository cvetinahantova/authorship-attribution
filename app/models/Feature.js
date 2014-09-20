var mongoose = require('mongoose');

module.exports = mongoose.model('Feature', {
    nfZone : Number,
    variance: Number,
    expectation: Number
});