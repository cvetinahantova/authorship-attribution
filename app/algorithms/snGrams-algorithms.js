var fs = require('fs');
var transform = require('../utils/liner');
var fileUtils = require('../utils/files-utils.js');

var parseDependencyTree = function(filename, done){

    var liner = transform.createTransform();

    var source = fs.createReadStream(filename);

    source.pipe(liner)
            .on('finish', function(){
                var snGramsFrequency = calculateSnGramsFrequency(snGrams);
                done(snGramsFrequency);
            });

    var tree = {};
    var snGrams = [];

    liner.on('readable', function () {
        var line;
        while (line = liner.read()) {

            var splitLine = line.split(/[\(),-\s]/).filter(function(e){return e;});

             if(splitLine.length > 0){

                var relation = splitLine[0];
                var head = splitLine[1];
                var dependent = splitLine[3];

                if(head in tree){
                    tree[head].push([dependent, relation]);
                }
                else {
                    tree[head] = [
                        [dependent, relation]
                    ];
                }
            }
            else{

                 for(var node in tree){
                     if(node!="ROOT"){
                         //TODO parametrize depth
                         var paths = DFS(node, 2, "", tree);

                         if(paths)
                         {
                             snGrams.push.apply(snGrams, paths);
                         }
                     }
                 }

                 tree = {};
             }
        }
    });

};

module.exports.parseDependencyTree = parseDependencyTree;

module.exports.parseAllDependencyTrees = function(directory, done){
    var groupedsnGrams = [];
    var authorsList = [];
    var allsnGrams = [[],[]];

    fileUtils.convertAuthorsFileToDictionary(directory + '/authors/authors', function(authors){
        fileUtils.traverse(directory, function(file, callback){
                parseDependencyTree(directory + '/' + file, function(snGramsFrequency){

                    //union of the sn grams in all documents
                    for(var i = 0; i<snGramsFrequency[0].length;i++){
                        var index = allsnGrams[0].indexOf(snGramsFrequency[0][i]);

                        if(index == -1){
                            allsnGrams[0].push(snGramsFrequency[0][i]);
                            allsnGrams[1].push(snGramsFrequency[1][i]);
                        }
                        else{
                            allsnGrams[1][index] += snGramsFrequency[1][i];
                        }
                    }

                    authorsList.push(authors[file]);
                    groupedsnGrams.push(snGramsFrequency);

                    callback();
                });
            },
            function(){

                //zip all sn grams, sort by frequency, get top N
                //TODO: parametrize slice
                var sortedsnGrams = zip(allsnGrams).sort(function(a, b){
                    a = a[1];
                    b = b[1];

                    return a < b ? -1 : (a > b ? 1 : 0);
                }).slice(0, 400).map(function(snGram){
                    return snGram[0];
                });

                // add sn grams that are part of the selected sn grams but do not exist in some of the documents
                for(var i=0;i<sortedsnGrams.length;i++){
                    groupedsnGrams.map(function(snGramsDoc){
                        if(snGramsDoc[0].indexOf(sortedsnGrams[i]) == -1){
                            snGramsDoc[0].push(sortedsnGrams[i]);
                            snGramsDoc[1].push(0);
                        }
                    });
                }

                // zip the arrays of the documents sn grams
                groupedsnGrams = groupedsnGrams.map(function(snGramsDoc){
                    return zip(snGramsDoc);
                });

                // construct frequencies of the selected sn grams for each document
                groupedsnGrams = groupedsnGrams
                    .map(function(snGramsDoc, index){
                        return [snGramsDoc.filter(function(snGram){
                            return sortedsnGrams.indexOf(snGram[0]) > 0;
                        }).sort(function(a, b){
                            a = a[0];
                            b = b[0];
                            return a < b ? -1 : (a > b ? 1 : 0);
                        }).map(function(snGram){
                            return snGram[1];
                        }), authorsList[index]];
                    });

                done(groupedsnGrams);
            });
    });
};

var DFS = function(node, depth, path, tree){

    var paths = [];

    if(depth == 0){
        paths.push(path);
        return paths;
    }

    var children = tree[node];

    if(children){

        for(var i=0; i<children.length;i++){
            var newPath = path.concat((children[i])[1] + " ");

            var shorterPaths = DFS((children[i])[0], depth-1, newPath, tree);

            if(shorterPaths) {
                paths.push.apply(paths, shorterPaths);
            }
        }
    }
    return paths;

};

var calculateSnGramsFrequency = function(snGrams){
    //map reduce
    var snGramFrequencies = snGrams
        .reduce(function(last, now){
        var index = last[0].indexOf(now);

        if(index===-1){
            last[0].push(now);
            last[1].push(1);
        }
        else
        {
            last[1][index]+=1;
        }
        return last;
    }, [[], []]);

    return snGramFrequencies;
};

var zip = function(arrays){
   return arrays.reduce(function(last, now, index, context){
        var zip = [];
        last.forEach(function(ngram, i){
            zip.push([ngram, context[1][i]]);
        });
        return zip;
    });
}
