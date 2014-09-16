var fs = require("fs");

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