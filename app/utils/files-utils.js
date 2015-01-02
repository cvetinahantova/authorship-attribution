var fs = require("fs");
var transform = require('../utils/liner');

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
};

module.exports.saveFrequencyDictionary = function(filename)
{
    var wordFrequency = new WordFrequency();

    var liner = transform.createTransform();

    var source = fs.createReadStream(filename);

    source.pipe(liner)
        .on('finish', function(){

        });

    liner.on('readable', function () {

        var line;
        while (line = liner.read()) {
            var splitLine = line.split(" ");

            wordFrequency = new WordFrequency();
            wordFrequency.frequency = splitLine[0];
            wordFrequency.word = splitLine[1];
            wordFrequency.pos = splitLine[2];
            wordFrequency.filesNumber = splitLine[3];

            WordFrequency.create(wordFrequency, function (err, word) {
            });
        }
    });
};

module.exports.convertAuthorsFileToDictionary = function(filename, done){
    var authors = {};

    var liner = transform.createTransform();

    var source = fs.createReadStream(filename);

    source.pipe(liner)
        .on('finish', function(){
            done(authors);
        });

    liner.on('readable', function (){
        var line;
        while (line = liner.read()) {
            var splitLine = line.split(/[\s\r\n]/).filter(function(e){return e;});
            authors[splitLine[0]] = Number(splitLine[1]);
        }
        });
};

//Go through all files in the folder
var traverse = function (dir, action, done) {

    fs.readdir(dir, function (error, list) {
        if (error) {
            return done(error);
        }

        var i = 0;

        (function next () {
            var file = list[i++];

            if (!file) {
                return done();
            }

            var filename = file;
            file = dir + '/' + file;
            //console.log(file);
            fs.stat(file, function (error, stat) {

                if (stat && stat.isDirectory()) {
                    //traverse inner directories
                    //traverse(file, function (error) {
                    next();
                //});
                } else {
                    //console.log(filename);
                    // Open file, construct feature set
                    action(filename, function(){
                        next();
                    });
                }
            });
        })();
    });
};
module.exports.traverse = traverse;