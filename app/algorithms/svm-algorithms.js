var nodesvm = require('node-svm');

var fs = require('fs');

var nfzAlg = require('./nfz-algorithms');
var snGrams = require('./snGrams-algorithms');

var FeatureSet = require('../models/FeatureSet.js');

var hd = require("humanize-duration");
var start = new Date();

var svmTrain = function (data, done) {

    var svm = new nodesvm.CSVC({
        kernelType: nodesvm.KernelTypes.RBF,
//        degree: [2, 3, 4],
        gamma: [2, 5], //0.5
//        r: [0.125, 0.5, 2],
        C: [2, 5], //2
        nFold: 3,
        normalize: true,
        cacheSize: 3500, // MB
        reduce: false, // default value - true
        retainedVariance: 0.99 // default value
    });
    svm.on('training-progressed', function (progressRate, remainingTime){
        console.log('%d% - %s remaining...', progressRate * 100, hd(remainingTime));
    });
    svm.once('dataset-reduced', function(oldDim, newDim, retainedVar){
        console.log('Dataset dimensions reduced from %d to %d features using PCA.', oldDim, newDim);
        console.log('%d% of the variance have been retained.', retainedVar* 100);
    });
    svm.once('trained', function(report){

        console.log('SVM trained. report :\n%s', JSON.stringify(report, null, '\t'));
        console.log('Total training time : %s', hd(new Date() - start));

//  prediction
//        FeatureSet.findOne({_id : "./app/data/federalist-data/paper14"}, function(err, featureSet){
//            var prediction = svm.predict(featureSet.features);
//            console.log("The prediction for paper14 is " + prediction);
//
//        });

        done(report, svm);
    });
    console.log('Start training. May take a while...');
    svm.train(data);

};
module.exports.svmTrain = svmTrain;

module.exports.svmNFZ = function(directory, done) {
    console.log("Construct all feature sets for directory " + directory);
    nfzAlg.constructAllFeatureSets(directory, function(data){
        svmTrain(data, function(report) {
            done(report);
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
};

module.exports.svmSNgrams = function(directory, done){
    snGrams.parseAllDependencyTrees(directory, function(features){

        var parsedFeatures = features.map(function(feature){

            if(feature[1] == "H")
                feature[1] = 1;
            else if(feature[1] == "J"){
                feature[1] = 2;
            }
            else if(feature[1] == "M"){
                feature[1] = 3;
            }
            else if(feature[1] == "?"){
                feature[1] = 3;
            }
            return feature;
        });

        svmTrain(parsedFeatures, function(report){
            done(report);
        });
    });
};