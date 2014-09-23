var nfzAlg = require("../app/algorithms/naturalFrequencyZonedWordDistribution");
var svm = require("../app/algorithms/svm");
var nlp = require("../app/algorithms/nlp-algorithms");

module.exports = function (app) {
    //fileUtils.saveFrequencyDictionary('./app/data/frequency-dictionary-bnc.txt');
    //WordFrequency.find({frequency:3}).remove().exec(function(err, data){
    //      console.log('ready');
    //  });

//    nlp.initializeStanfordNLP(function(){
//        nlp.processTextFromFile('./app/data/federalist-data/basicTest.txt', function(result){
//            console.log(result);
//        });
//    });

    app.get('/', function(req, res){
        res.send("Hello world!");
    });

    // Test routes
    app.get('/svm', function (req, res) {
//        svm.svm('./app/data/federalist-data', function(data){
//            res.send(data);
//        });
        svm.svmFederalistData(function(report){
            res.send(report);
        });
    });

    app.get('/features', function(req, res){
        nfzAlg.constructFeatureSet("./app/data/federalist-data/paper04.txt", function (err, textFeatures) {
            if (!err) {
                res.send(textFeatures);
            }
        });
    });

    app.get('/corenlp', function(req, res){
       nlp.processTextFromFile('./app/data/federalist-data/paper04.txt', function(result){
           console.log(result);
           res.send(result);
       });
    });
}