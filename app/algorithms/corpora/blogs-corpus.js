// Convert blogs xmls to separate files
// var blogsProcess = require('../../utils/blogs-proccess');
// blogsProcess.processBlogs('./app/data/education/education-xml');

var fs = require('fs');
var fileUtils = require('../../utils/files-utils.js');

var baseNovelsPath = './app/data/education/';
var corpusStats = {};
var filesSet = [];

var authorsCount = 0;
var authorsSetSize = 150;
var dataSetSize = 0;

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
        fs.writeFile('./app/data/education/sets/big_unbalanced', files, function(err) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(authorsCount);
            }
        });
    });
});


