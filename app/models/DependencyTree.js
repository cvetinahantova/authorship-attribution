var mongoose = require('mongoose');

module.exports = mongoose.model('DependencyTree', {
    _id: String,
    dependencyTree: String
});