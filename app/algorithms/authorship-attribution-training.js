var Classifier = require('./Classifier.js');
var sngrams = require('./snGrams-algorithms');
var nfz = require('./nfz-algorithms');

var async = require('async');

var mongoose = require('mongoose');
var db = require('../../config/db.js');

mongoose.connect(db.url);

//NFZ WD
//var partitionFunctions = [nfz.PartitionFunctions.LINEAR, nfz.PartitionFunctions.RADIX, nfz.PartitionFunctions.LOGARITHMIC];
//var classifier;
//var tasks = [];
//
//for(var i = 0; i< partitionFunctions.length;i++){
//
//    tasks.push((function(i){
//        return function(callback){
//                    classifier = new Classifier.Classifier('./app/data/education', 'small_balanced', Classifier.FeaturesExtractionMethods.NFZ_WD, nfz.constructAllFeatureSets);
//                    classifier.trainAndSave({
//                        partitionFunction : partitionFunctions[i]
//                    }, function(err){
//                        if(err){
//                            console.log(err);
//                        }
//                        callback(err);
//                    });
//                }
//            })(i));
//}
//async.series(tasks);

//SN grams
var snGramsCount = [700];
var n = [3];
var classifier;
var tasks = [];

for(var i = 0; i< snGramsCount.length;i++){
    for(var j = 0; j< n.length; j++){
        tasks.push((function(i, j){
            return function(callback) {
                classifier = new Classifier.Classifier('./app/data/novels', 'big_balanced', Classifier.FeaturesExtractionMethods.SN_GRAMS, sngrams.parseAllDependencyTrees);
                classifier.trainAndSave({
                    n: n[j],
                    snGramsCount: snGramsCount[i],
                    isSyntactic: true
                }, function (err) {
                    if (err) {
                        console.log(err);
                    }
                    callback();
//               console.log("Finished for n=" + n[j] + " and sn-grams count=" + snGramsCount[i]);
                });
            }})(i, j));
    }
}

async.series(tasks);
