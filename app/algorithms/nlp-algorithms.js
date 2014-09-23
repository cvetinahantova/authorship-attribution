var natural = require('natural');
var NLP = require('stanford-corenlp')

var fs = require("fs");


var coreNLP = null;
var config = {"nlpPath":"./app/algorithms/stanford-core-nlp","version":"3.4", "annotators":"['ner','ssplit']"};

module.exports.tokenizeText = function(text) {

    tokenizer = new natural.WordTokenizer();

    return tokenizer.tokenize(text);
}

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
}

var processText = function(text, callback){
        coreNLP.process(text, function(err, result) {
            console.log("Text processed");
            if(err){
                console.log(err);
            }
            callback(JSON.stringify(result));
        });
}
module.exports.processText = processText;

module.exports.processTextFromFile = function(filename, callback){
    console.log("Process text from file");
    fs.readFile(filename, "utf8", function(err, text){
        console.log("File read");
        if(!err) {
            processText(text, callback);
        }
        else{
            done(err, null);
        }
    });
};