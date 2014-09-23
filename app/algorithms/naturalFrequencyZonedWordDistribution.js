var WordFrequency = require('../models/WordFrequency.js');
var Feature = require('../models/FeatureSet.js');

var nlpAlg = require("./nlp-algorithms");
var fs = require("fs");

var config = require('./config');

var constructNaturalFrequencyArray = function(tokens, done)
{
    var wordFrequencies = [];
    var count = 0;

    tokens.forEach(function(value, index, array){
        count++;
        WordFrequency.find({'word': value.toLowerCase()}).sort({'frequency' : -1}).findOne(function(err, wordFrequency){
            count--;
            if(err)
                res.send(err);

            if(wordFrequency) {
                wordFrequencies[index] = wordFrequency.frequency;
            }
            else{
                wordFrequencies[index] = 0;
            }

            if(count == 0)
            {
                done(wordFrequencies);
            }
        });
    });

}

var calculateOccurrenceDistanceExpectation = function(zoneWords){

    if(zoneWords){
        return 1/zoneWords.length;
    }
    else{
        return 0;
    }
}

var calculateOccurrenceDistanceVariance = function(zoneWords, zoneWordsOccurrences){

    if(zoneWords) {
        var expectation = calculateOccurrenceDistanceExpectation(zoneWords);
        var variance = 0;

        for (var i = 0; i < zoneWords.length; i++) {
            var distance = 0;

            if (i == 0) {
                distance = zoneWordsOccurrences[i];
            }
            else if (i == (zoneWords.length - 1)) {
                distance = 1 - zoneWordsOccurrences[i - 1];
            }
            else {
                distance = Math.abs(zoneWordsOccurrences[i] - zoneWordsOccurrences[i - 1]);
            }

            variance = variance + Math.pow(distance - expectation, 2);
        }

        return 1 / expectation * (Math.sqrt(variance / (zoneWords.length)));
    }
    else{
        return 0;
    }
}

// Partition functions
var linearPartition = function(frequency){
    return Math.floor(frequency/config.L);
}

var radixPartition = function(frequency){
    var B = linearPartition(frequency);
    var E = Math.floor(Math.log(B, config.R));

    if(B < config.R){
        return B;
    }
    else{
        return (config.R - 1)*E + Math.floor(B/(Math.pow(config.R, E)));
    }

}

var logarithmPartition = function(frequency){
    if(frequency == 0){
        return 0;
    }
    else{
        return Math.floor(Math.log(frequency, config.r));
    }
}

var NFZPartition = function(tokenizedText, wordFrequencies, partitionFunction){
    var naturalFrequencyZones = {};
    var wordNormalizedOccurrences = {};

    // NFZ Partition
    for(var i=0; i<tokenizedText.length;i++){
        var currentWord = tokenizedText[i];

        // linear partition
        var k = partitionFunction(wordFrequencies[i]);

        if(!naturalFrequencyZones[k]){
            naturalFrequencyZones[k] = [];
        }
        naturalFrequencyZones[k].push(currentWord);

        if(!wordNormalizedOccurrences[k]){
            wordNormalizedOccurrences[k] = [];
        }
        wordNormalizedOccurrences[k].push(i/tokenizedText.length);
    }

    return [naturalFrequencyZones, wordNormalizedOccurrences];
}

module.exports.constructFeatureSet = function(filename, done){
    console.log('constructFeatureSet ' + filename);
    fs.readFile(filename, "utf8", function(err, data){

        if(!err) {

            // tokenize the text
            var tokenizedText = nlpAlg.tokenizeText(data);

            // retrieve NF for each word in the text
            constructNaturalFrequencyArray(tokenizedText, function(wordFrequencies){

               // NFZ partition
               var partition = NFZPartition(tokenizedText, wordFrequencies, radixPartition);
               var naturalFrequencyZones = partition[0];
               var wordNormalizedOccurrences = partition[1];

                // Text style computation
                var textFeatures = [];

                var featureCount = Math.max.apply(null, (Object.keys(naturalFrequencyZones)));
                console.log(featureCount);
                for(var i=0;i<featureCount; i++)
                {
                        var expectation = calculateOccurrenceDistanceExpectation(naturalFrequencyZones[i]);
                        var variance = calculateOccurrenceDistanceVariance(naturalFrequencyZones[i], wordNormalizedOccurrences[i]);

                        // push expectation
                        textFeatures.push(expectation);

                        // push variance
                        textFeatures.push(variance);

                }
                done(null, textFeatures);
            });
        }
        else{
            done(err, null);
        }
    });
}
