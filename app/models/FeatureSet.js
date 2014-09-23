var mongoose = require('mongoose');

module.exports = mongoose.model('FeatureSet', {
    _id : String,
    features: [Number],
    author: String
});