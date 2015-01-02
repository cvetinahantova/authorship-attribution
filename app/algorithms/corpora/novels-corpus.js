var fs = require('fs');
var fileUtils = require('../../utils/files-utils.js');

var baseNovelsPath = './app/data/novels/';
var corpusStats = {};
var filesSet = [];

var authorsCount = 0;
var authorsSetSize = 25;
var dataSetSize = 3;

fileUtils.convertAuthorsFileToDictionary(baseNovelsPath + 'authors/authors', function(authors) {
    fileUtils.traverse(baseNovelsPath + 'trees/', function (file, callback) {
        var author = authors[file];
        if(!corpusStats[author]){
            corpusStats[author] = [];
        }
        corpusStats[author].push(file);
        callback();
    }, function(){
       for(var authorId in corpusStats) {
           if(corpusStats.hasOwnProperty(authorId)) {
               if (corpusStats[authorId].length >= dataSetSize) {
                   authorsCount++;
                   filesSet.push.apply(filesSet, corpusStats[authorId].slice(0, dataSetSize));
               }
               if (authorsCount >= authorsSetSize) {
                   break;
               }
           }
       }
       var files = filesSet.join('\n');
        fs.writeFile('./app/data/novels/sets/big_limited', files, function(err) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(authorsCount);
            }
        });
    });
});

