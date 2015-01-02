var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CorpusStatistic = new Schema({
    corpusName : String,
    corpusSize : String,
    featuresExtractionMethod : Number,
    params : {
        n : Number,
        snGramsCount : Number,
        partitionFunction : Number
    },
    modelFilePath : String,
    report : JSON
});

CorpusStatistic.statics.getCorpusStatistics = function(corpusName, corpusSize, featuresExtractionMethod, done){
    console.log(corpusSize);
    this.aggregate([
        {
            $match : {
                corpusName : corpusName,
                corpusSize : corpusSize,
                featuresExtractionMethod : Number(featuresExtractionMethod)
            }
        },
        {
          $group : {
              _id : {
                  n :  "$params.n",
                  snGramsCount : "$params.snGramsCount",
                  partitionFunction : "$params.partitionFunction"
              },
              accuracy : { $max : "$report.accuracy"}
          }
        },
        {
            $project : {
                _id : 0,
                n : "$_id.n",
                snGramsCount : "$_id.snGramsCount",
                partitionFunction : "$_id.partitionFunction",
                accuracy : "$accuracy"
            }
        },
        {
            $sort : {
                n : 1, snGramsCount : 1, partitionFunction : 1
            }
        }]).exec(function(err, statistics){
            if(err){
                done(err, null);
            }
            else{
                console.log(statistics);
                done(null, statistics);
            }
    });
};

module.exports = mongoose.model('CorpusStatistic', CorpusStatistic);