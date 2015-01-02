var fs = require('fs');
var fileUtils = require('../../utils/files-utils.js');
var _ = require('underscore');

// ============= novels ============================

var baseNovelsPath = './app/data/blogs/';
var corpusStats = {};
var novelsPerAuthor = {};
var authorsCount = 0;

fileUtils.convertAuthorsFileToDictionary(baseNovelsPath + 'authors/authors', function(authors) {
    fs.readFile(baseNovelsPath + 'sets/big_limited', 'utf8', function(err, data){
        if(!err) {
            var files = data.split('\n');
            for (var i = 0; i < files.length; i++) {
                var author = authors[files[i]];
                if (!corpusStats[author]) {
                    authorsCount++;
                    corpusStats[author] = [];
                    novelsPerAuthor[author] = 1;
                }
                else {
                    corpusStats[author].push(files[i]);
                    novelsPerAuthor[author]++;
                }
            }
        }
        fs.writeFile('./app/corpora-stats/education-big-limited.txt', JSON.stringify(novelsPerAuthor), function(err) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("Authors count: " + authorsCount);
            }
        });
      });
  });

