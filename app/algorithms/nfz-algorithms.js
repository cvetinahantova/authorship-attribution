var WordFrequency = require('../models/WordFrequency.js');
var FeatureSet = require('../models/FeatureSet.js');

var nlpAlg = require("./nlp-algorithms");

var fs = require("fs");
var fileUtils = require('../utils/files-utils');

var config = require('./config');

var PartitionFunctions = {
  LINEAR : 0,
  RADIX : 1,
  LOGARITHMIC : 2
};
module.exports.PartitionFunctions = PartitionFunctions;

// Keeps the natural words frequencies
var wordsDictionary;

// Loads the natural words frequencies
var getWordsFrequencies = function(done){
        console.log("Loads natural words frequencies");

        WordFrequency.aggregate([{
                                $group : {_id : "$word", frequency : { $max : "$frequency"}, filesNumber : { $max : "$filesNumber"}}
                            }])
                      .exec(function(err, wordFrequencies){

                            if(!err){
                                var words = {};
                                wordFrequencies.map(function(word){
                                    return words[word._id] = word.frequency;
                                });
                                done(null, words);
                            }
                            else{
                                done(err, null);
                            }
                       });

};

// Constructs the array of the natural frequencies of the tokens
var constructNaturalFrequencyArray = function(tokens, done)
{
    var wordFrequencies = [];

    tokens.forEach(function(value, index){

        var wordFrequency =  wordsDictionary[value.toLowerCase()];

        if(wordFrequency) {
            wordFrequencies[index] = wordFrequency;
        }
        else{
            wordFrequencies[index] = 0;
        }
    });
    done(wordFrequencies);
};

var calculateOccurrenceDistanceExpectation = function(zoneWords){

    if(zoneWords){
        return 1/zoneWords.length;
    }
    else{
        return 0;
    }
};

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
};

// ======= Partition functions =======
var linearPartition = function(frequency){
    return Math.floor(frequency/config.L);
};

var radixPartition = function(frequency){
    var B = linearPartition(frequency);
    var E = Math.floor(Math.log(B, config.R));

    if(B < config.R){
        return B;
    }
    else{
        return (config.R - 1)*E + Math.floor(B/(Math.pow(config.R, E)));
    }

};

var logarithmPartition = function(frequency){
    if(frequency == 0){
        return 0;
    }
    else{
        return Math.floor(Math.log(frequency, config.r));
    }
};

var getPartitionFunction = function(partition){

    var partitionFunction;

    if(partition === PartitionFunctions.LINEAR){
        partitionFunction = linearPartition;
    }
    else if(partition === PartitionFunctions.RADIX){
        partitionFunction = radixPartition;
    }
    else if(partition === PartitionFunctions.LOGARITHMIC){
        partitionFunction = logarithmPartition;
    }
    return partitionFunction;
};

var partitionFunctionToString = function(partition){
    var partitionFunctionString;

    if(partition === PartitionFunctions.LINEAR){
        partitionFunctionString = "LINEAR";
    }
    else if(partition === PartitionFunctions.RADIX){
        partitionFunctionString = "RADIX";
    }
    else if(partition === PartitionFunctions.LOGARITHMIC){
        partitionFunctionString = "LOGARITHMIC";
    }
    return partitionFunctionString;
};
module.exports.partitionFunctionToString = partitionFunctionToString;
// ====================================

// Represents the tokenized text with the arrays of natural frequency zones and the words occurrences
var NFZPartition = function(tokenizedText, wordFrequencies, partitionFunction){

    var naturalFrequencyZones = [];
    var wordNormalizedOccurrences = [];

    // NFZ Partition
    for(var i=0; i<tokenizedText.length;i++){
        var currentWord = tokenizedText[i];

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
};

var constructFeatureSet = function(filename, options, done){

    var partitionFunction = getPartitionFunction(options['partitionFunction']);

    fs.readFile(filename, "utf8", function(err, data){

        if(!err) {

            // tokenize the text
            var tokenizedText = nlpAlg.tokenizeText(data);

            // retrieve NF for each word in the text
            constructNaturalFrequencyArray(tokenizedText, function(wordFrequencies){

               // NFZ partition
               var partition = NFZPartition(tokenizedText, wordFrequencies, partitionFunction);
               var naturalFrequencyZones = partition[0];
               var wordNormalizedOccurrences = partition[1];

                // Text style computation
                var textFeatures = {};

                for(var key in naturalFrequencyZones){
                    if(naturalFrequencyZones.hasOwnProperty(key))
                    {
                        var expectation = calculateOccurrenceDistanceExpectation(naturalFrequencyZones[key]);
                        var variance = calculateOccurrenceDistanceVariance(naturalFrequencyZones[key], wordNormalizedOccurrences[key]);
                        textFeatures[key] = [expectation, variance];
                    }
                }

                done(null, textFeatures);
            });
        }
        else{
            done(err, null);
        }
    });
};
module.exports.constructFeatureSet = constructFeatureSet;

module.exports.constructAllFeatureSets = function(directory, filesInventory,  authorsFile, options, done){

    // Load natural word frequencies
    getWordsFrequencies(function(err, words){
        if(!err){

            console.log("Frequency Dictionary Loaded");
            wordsDictionary = words;

            // all texts' feature sets and their corresponding authors
            var documents = [];

            var allNFZ = [];

            // Loads authors of the texts
            fileUtils.convertAuthorsFileToDictionary(authorsFile, function(authors){
                fs.readFile(filesInventory, 'utf8', function(err, data){
                    if(!err) {
                        var inventory = data.split('\n');

                        console.log(directory);
                        // Go through all files in the corpus and construct their feature sets
                        fileUtils.traverse(directory, function (file, callback) {
                            if(inventory.indexOf(file) > -1) {
                                console.log(file);
                                constructFeatureSet(directory + '/' + file, options, function (err, featureSet) {
                                    if (err) {
                                        console.log(err);
                                    }
                                    else {
                                        var currentNaturalFrequencyZones = Object.keys(featureSet);
                                        currentNaturalFrequencyZones.forEach(function (zone) {
                                            if (allNFZ.indexOf(zone) == -1) {
                                                allNFZ.push(zone);
                                            }
                                        });


                                        documents.push([featureSet, authors[file]]);
                                    }
//                                    callback();
                                });
                            }
                            callback();

                        }, function () {

                            //add missing zones
                            allNFZ.forEach(function (zone) {
                                documents.forEach(function (doc) {
                                    if (!doc[0].hasOwnProperty(zone)) {
                                        doc[0][zone] = [0, 0];
                                    }
                                });
                            });

                            //flatten the feature set
                            var mappedDocs = documents.map(function (doc) {
                                var features = [];
                                for (var key in doc[0]) {
                                    if (doc[0].hasOwnProperty(key)) {
                                        features.push(doc[0][key][0]);
                                        features.push(doc[0][key][1]);
                                    }
                                }
                                return [features, doc[1]];
                            });

                            done(mappedDocs);
                        });
                    }});
            });
        }
        else{
            console.log(err);
        }
    });
};
