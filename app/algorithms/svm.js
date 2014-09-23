var nodesvm = require('node-svm');
var nfzAlg = require('./naturalFrequencyZonedWordDistribution');
var fileUtils = require('../utils/files-utils');

var FeatureSet = require('../models/FeatureSet.js');

var fs = require('fs');
var hd = require("humanize-duration");
var start = new Date();

var svmTrain = function (data, done) {

    var svm = new nodesvm.CSVC({
        kernelType: nodesvm.KernelTypes.RBF,
        gamma: [8, 2, 0.5],
        C: [0.5, 2, 8],
        nFold: 3,
        normalize: false,
        reduce: false, // default value
        retainedVariance: 0.99 // default value
    });
    svm.on('training-progressed', function (progressRate, remainingTime){
        console.log('%d% - %s remaining...', progressRate * 100, hd(remainingTime));
    });
//    svm.once('dataset-reduced', function(oldDim, newDim, retainedVar){
//        console.log('Dataset dimensions reduced from %d to %d features using PCA.', oldDim, newDim);
//        console.log('%d% of the variance have been retained.', retainedVar* 100);
//    });
    svm.once('trained', function(report){
        console.log('SVM trained. report :\n%s', JSON.stringify(report, null, '\t'));
        console.log('Total training time : %s', hd(new Date() - start));

        FeatureSet.findOne({_id : "./app/data/federalist-data/paper14"}, function(err, featureSet){
            var prediction = svm.predict(featureSet.features);
            console.log("The prediction for paper14 is " + prediction);
            done(report);
        });


    });
    console.log('Start training. May take a while...');
    svm.train(data);

};
module.exports.svmTrain = svmTrain;

module.exports.svm = function(directory, done) {
    fileUtils.convertAuthorsFileToDictionary(directory + '/authors', function(authors){
        console.log(authors);

        traverse(directory, authors, function(data){
            svmTrain(data, function(report){
                done(report);
            });
        });
    });
};

module.exports.svmFederalistData = function(done){
    FeatureSet.find().exec(function(err, features){
        var parsedFeatures = features.map(function(feature){
            var author = null;
            if(feature.author == "H")
                author = 1;
            else if(feature.author == "J"){
                author = 2;
            }
            else if(feature.author == "M"){
                author = 3;
            }
            else if(feature.author == "?"){
                author = 3;
            }
            return [feature.features, author];
        });

        svmTrain(parsedFeatures, function(report){
            done(report);
        });
    });
}

//Go through all files in the folder
var traverse = function (dir, authors, done) {
        console.log("traverse");
        var documents = [];

        fs.readdir(dir, function (error, list) {
            if (error) {
                return done(error);
            }

            var i = 0;

            (function next () {
                var file = list[i++];

                if (!file) {
                    return done(documents);
                }

                var author = authors[file];
                file = dir + '/' + file;
                fs.stat(file, function (error, stat) {
                    if (stat && stat.isDirectory()) {
                        traverse(file, function (error) {
                            next();
                        });
                    } else {

                        // Open file, construct feature set
                        nfzAlg.constructFeatureSet(file, function(err, featureSet){

                            if(err){
                                console.log(err);
                            }
                            else {
                                var features = new FeatureSet();
                                features._id = file;
                                features.features = featureSet;
                                features.author = author;

                                FeatureSet.create(features);

                                documents.push([featureSet, authors[file]]);
                            }
                        });


                        next();
                    }
                });
            })();
        });
    };