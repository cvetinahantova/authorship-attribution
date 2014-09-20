var nfzAlg = require("../app/algorithms/naturalFrequencyZonedWordDistribution");
var svm = require("../app/algorithms/svm");

module.exports = function (app) {
    //fileUtils.saveFrequencyDictionary('./app/data/frequency-dictionary-bnc.txt');
    //WordFrequency.find({frequency:3}).remove().exec(function(err, data){
    //      console.log('ready');
    //  });
    svm.svmTrain();


    // Test routes
    app.get('/features', function (req, res) {
        nfzAlg.constructFeatureSet("./app/data/federalist-data/basicTest.txt", function (err, textFeatures) {
            if (!err) {
                res.send(textFeatures);
            }
        });
    });
}