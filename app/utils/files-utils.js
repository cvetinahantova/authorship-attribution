var fs = require("fs");
var readline = require("readline");
var stream = require("stream");

var WordFrequency = require('../models/WordFrequency.js');

module.exports.readFile = function(filename){
    fs.exists(filename, function(exists){
        if(exists){
            fs.stat(filename, function(error, stat){
               fs.read(filename,"r", function(error, fd){
                  var buffer = new Buffer(stat.size);

                   fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buf){
                   var data = buffer.toString("utf8", 0, buffer.length);
                       fs.close(fd);
                   return data;
                   });
               });
            });
        }
    });
}

module.exports.saveFrequencyDictionary = function(filename)
{
    var wordFrequencies = new Array();
    var wordFrequency = new WordFrequency();

    var outstream = new stream;
    var instream = fs.createReadStream(filename);

    var readstream = readline.createInterface(instream, outstream);

    readstream.on('line', function(line){
        var splitLine = line.split(" ");

        wordFrequency = new WordFrequency();
        wordFrequency.frequency = splitLine[0];
        wordFrequency.word = splitLine[1];
        wordFrequency.pos = splitLine[2];
        wordFrequency.filesNumber = splitLine[3]

        WordFrequency.create(wordFrequency, function(err, word) {
        });
    });
}