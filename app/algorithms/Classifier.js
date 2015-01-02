var svm = require('./svm-algorithms');
var fs = require('fs');
var path = require('path');
var uuid = require('node-uuid');

var CorpusStatistic = require('../models/CorpusStatistic.js');

var FeaturesExtractionMethods = {
    SN_GRAMS : 0,
    NFZ_WD : 1,
    N_GRAMS: 2
};
module.exports.FeaturesExtractionMethods = FeaturesExtractionMethods;

function Classifier(corpusDirectory, corpusSize, featuresExtractionMethod, featuresExtactionFunction){

    console.log("Classifier created " + corpusDirectory);

    this.corpusSize = corpusSize;
    this.corpusDirectory = corpusDirectory;

    var pathSegments = corpusDirectory.split('/');
    this.corpusName = pathSegments[pathSegments.length - 1];

    this.featuresExtractionMethod = featuresExtractionMethod;
    this.featuresExtactionFunction = featuresExtactionFunction;

}

Classifier.prototype.constructAllFeatureSets = function(options, done){
    console.log("Construct feature sets.");

    var self = this;
    self.options = options;

    var specificCorpusDirectory;

    if(self.featuresExtractionMethod === FeaturesExtractionMethods.SN_GRAMS){
        specificCorpusDirectory = self.corpusDirectory + '/trees';
    }
    else{
        specificCorpusDirectory = self.corpusDirectory + '/all';
    }

    self.featuresExtactionFunction(specificCorpusDirectory, self.corpusDirectory + '/sets/' + self.corpusSize, self.corpusDirectory + '/authors/authors',  options, function(data){
        console.log("Feature sets constructed.");

        self.featureSets = data;
        done(self.featureSets);
    });
};

Classifier.prototype.constructFeatureSet = function(filename){

};

Classifier.prototype.trainSVM = function(data, done){
    console.log("SVM train");

    var self = this;

    svm.svmTrain(data, function(report, svm){

        self.SVM = svm;
        self.report = report;

        console.log(report);
        done(report, svm);
    });
};

Classifier.prototype.train = function(options, done){
    var self = this;
    self.constructAllFeatureSets(options, function(data) {
        self.trainSVM(data, function(report, svm){
            done(report, svm);
        });
    });
};

Classifier.prototype.save = function(done){
    console.log("Save model file");
    //save svm model file
    var modelFilename = uuid.v1();
    var self = this;
    //this.SVM.saveToFile(path.join(__dirname, '../../app/svm-models/' + self.corpusName + '/' + modelFilename + '.model'));

    //save to database
    console.log("Save to database");
    var statistics = new CorpusStatistic();

    statistics.corpusName = self.corpusName;
    statistics.corpusSize = self.corpusSize;
    statistics.featuresExtractionMethod = self.featuresExtractionMethod;

    statistics.params = self.options;
    //statistics.modelFilePath = self.corpusName + '/' + modelFilename + '.model';
    statistics.report = self.report;

    statistics.save(function(err){
        console.log("Saved");
        done(err);
    });
};

Classifier.prototype.trainAndSave = function(options, done){
    var self = this;
    self.train(options, function(){
        self.save(function(err){
                done(err);
        });
    });
};

Classifier.prototype.classify = function(featureset){

};

module.exports.Classifier = Classifier;