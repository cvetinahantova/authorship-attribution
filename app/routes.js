var path = require('path');

var nfz = require("./algorithms/nfz-algorithms");
var svm = require("./algorithms/svm-algorithms");
var nlp = require("./algorithms/nlp-algorithms");
var sngrams = require('./algorithms/snGrams-algorithms');

var chartsUtils = require('./utils/charts-utils');

var CorpusStatistic = require('./models/CorpusStatistic.js');

var async = require('async');

var Classifier = require('./algorithms/Classifier');

module.exports = function (app) {

    app.get('/statistics/:corpusName/:corpusSize?', function(req, res) {
        var charts = [];
        console.log("Corpus Statistics");

        var corpusSize = 'big_unbalanced';
        if(req.params.corpusSize){
            corpusSize = req.params.corpusSize;
        }
        console.log(corpusSize);
        async.each([Classifier.FeaturesExtractionMethods.SN_GRAMS, Classifier.FeaturesExtractionMethods.NFZ_WD], function(method, callback){
            CorpusStatistic.getCorpusStatistics(req.params.corpusName, corpusSize, method, function (err, statistics) {
                if (err) {
                    callback(err);
                }

                var chartTemplate;

                if(method == Classifier.FeaturesExtractionMethods.NFZ_WD) {
                    chartTemplate = chartsUtils.createNFZTemplate(statistics);
                }
                else if(method == Classifier.FeaturesExtractionMethods.SN_GRAMS){
                    chartTemplate = chartsUtils.createSNGramsTemplate(statistics);
                }
                charts[method] = chartsUtils.constructColumnChartData(statistics, chartTemplate);
                callback();
            });
        },
        function(err){
            if(err){
                console.log(err);
            }
            console.log("Send");
            res.send(charts);
        });
    });
    /* LEGACY */
    //fileUtils.saveFrequencyDictionary('./app/data/frequency-dictionary-bnc.txt');

    app.get('/', function(req, res){
        res.send("Authorship attribution");
    });

    // Natural Frequency zoned word distribution test
    app.get('/nfz', function (req, res) {
//        svm.svmFederalistData(function(report){
//            res.send(report);
//        });

        svm.svmNFZ('./app/data/federalist-data', function(report){
            res.send(report);
        });
    });

    // sn-grams test
    app.get('/sngrams', function(req, res){
        svm.svmSNgrams('./app/data/federalist-data-tree',
        function(report){
            res.send(report);
        });
    });

    //NFZ-WDA classifier
    app.get('/classify-nfz', function(req, res){
        var classifier = new Classifier('./app/data/federalist-data', nfz.constructAllFeatureSets);
        classifier.constructAllFeatureSets({
            'partitionFunction' : nfz.PartitionFunctions.LINEAR
        }, function(data){
           classifier.train(data, function(report){
               res.send(report);
           });
        });
    });

    //SN-grams classifier
    app.get('/classify-sngrams',
        function(req, res){
        var classifier = new Classifier('./app/data/federalist-data-tree', sngrams.parseAllDependencyTrees);
        classifier.constructAllFeatureSets({
            'n' : 4,
            'sn-gram count' : 11000
        }, function(data){
            classifier.train(data, function(report, modelFilename){
                res.send(report);
            });
        });
    });

    app.get('/sn-grams-report', function(req,res){

        var classifier = new Classifier('./app/data/federalist-data-tree', sngrams.parseAllDependencyTrees);

        var sngramsCount = ['#', 400, 1000];
        var n = [2, 3];

        var results = [];
        results.push(sngramsCount);

       var i = 0;
       var j = 1;
       var row = [];
        row.push(n[i]);
        (function next(){
            console.log("n: " + n[i] + "c: " + sngramsCount[j]);
            classifier.constructAllFeatureSets({
                'n' : n[i],
                'sn-gram count' : sngramsCount[j]
            }, function(data){
                classifier.trainAndSaveModel(data, function(report){
                    row.push(report.accuracy);

                    if(j==(sngramsCount.length-1) && i==(n.length-1)){
                        results.push(row);
                        res.send(results);
                    }
                    else{

                        if(j < (sngramsCount.length-1)){
                            j++;
                        }
                        else if(i < (n.length-1)){
                            results.push(row);
                            row = [];

                            i++;
                            j=1;
                            row.push(n[i]);
                        }

                        next();
                    }
                });
            });
       })();

    });

    // test routes
    app.get('/features', function(req, res){
        nfz.constructFeatureSet("./app/data/federalist-data/paper04.txt", function (err, textFeatures) {
            if (!err) {
                res.send(textFeatures);
            }
        });
    });

    app.get('/stanford-nlp', function(req, res){
       nlp.processTextFromFile('./app/data/federalist-data/paper04.txt', function(result){
           console.log(result);
           res.send(result);
       });
    });


    // frontend routes =========================================================
    // route to handle all angular requests
    app.get('*', function(req, res) {
        console.log('resources');
        res.sendFile(path.join(__dirname,'../public','index.html')); // load our public/index.html file
    });

};