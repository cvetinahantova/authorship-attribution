var natural = require('natural');
//var NLP = require('stanford-corenlp');

var fs = require("fs");
var fileUtils = require('../utils/files-utils');

var DependencyTree = require('../models/DependencyTree.js');

var coreNLP = null;
var config = {"nlpPath":"./app/algorithms/stanford-core-nlp","version":"3.4", "annotators":"['ner','ssplit']"};

var processText = function(text, callback){
    coreNLP.process(text, function(err, result) {
        if(err){
            console.log(err);
        }
        callback(JSON.stringify(result));
    });
};

module.exports.tokenizeText = function(text) {

    var tokenizer = new natural.WordTokenizer();

    return tokenizer.tokenize(text);
};

module.exports.initializeStanfordNLP = function(callback){
    coreNLP = new NLP.StanfordNLP(config,function(err) {
        if(err){
            console.log(err);
        }
        else{
            console.log("StanfordNLP initialized");
        }
        callback(err);
    });
};

var processTextFromFile = function(filename, callback){
    console.log("Process text from " + filename);
    fs.readFile(filename, "utf8", function(err, text){
        if(!err) {
            processText(text, callback);
        }
        else{
            console.log(err);
        }
    });
};
module.exports.processTextFromFile = processTextFromFile;

module.exports.processText = processText;

module.exports.processAllDocuments = function(directory, done){
    fileUtils.traverse(directory, function(file, callback){
            processTextFromFile(directory + '/' + file, function(depTree){
                console.log(directory + '/' + file);

                var tree = new DependencyTree();
                tree._id = file;
                tree.dependencyTree = depTree;
                DependencyTree.create(tree, function(err, tree){
                    if(err){
                        console.log(err);
                    }
                });
                callback();
            });
    },
    function(){
        done();
    });
};