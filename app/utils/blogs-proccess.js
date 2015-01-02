var fs = require('fs');
var fileUtils = require('./files-utils');
var xml2js = require('xml2js');

var parser = new xml2js.Parser();

module.exports.processBlogs = function(dir){
    console.log(dir);
    fileUtils.traverse(dir, function(file, callback){
       fs.readFile(dir + '/' + file, function(err, data){
           console.log(file);
           if(err){
               console.log(err);
           }
           parser.parseString(data, function(err, result){

               if(result) {
                   for (var i in result["Blog"]["post"]) {
                       if(result["Blog"]["post"].hasOwnProperty(i)) {
                           var newFilename = 'post_' + file.split(".")[0] + '_' + i;

                           //write blog pos to file
                           fs.writeFile('./app/data/education/education/' + newFilename, result["Blog"]["post"][i].trim(), function (err) {
                               if (err) {
                                   console.log(err);
                               }
                           });

                           //add post->authors relation
                           fs.appendFile('./app/data/education/authors/authors', newFilename + " " + file.split(".")[0] + '\n', function (err) {
                               if (err) {
                                   console.log(err);
                               }
                           });
                       }
                   }
               }
                callback();
           });
       });
    }, function(error){
        console.log(error);
        console.log("Finished");
    });
};