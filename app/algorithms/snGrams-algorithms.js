var fs = require('fs');
var transform = require('../utils/liner');
var fileUtils = require('../utils/files-utils.js');

var natural = require('natural');
var NGrams = natural.NGrams;

var parseDependencyTree = function(filename, options, done){

    var n = options['n'];

    var liner = transform.createTransform();

    var source = fs.createReadStream(filename);

    source.pipe(liner)
            .on('finish', function(){
                var snGramsFrequency = calculateNGramsFrequency(snGrams);
                done(snGramsFrequency);
            });

    var tree = {};
    var snGrams = [];

    liner.on('readable', function () {
        var line;
        while (line = liner.read()) {

            var splitLine = line.split(/[-\s,()]/).filter(function(e){return e;});

             if(splitLine.length > 0){

                var relation = String(splitLine[0]);
                var head = String(splitLine[1]);
                var dependent = String(splitLine[3]);

                if(tree.hasOwnProperty(head)){
                    tree[head].push([dependent, relation]);
                }
                else {
                    tree[head] = [
                        [dependent, relation]
                    ];
                }
            }
            else{
                 //console.log("DFS for the tree");
                 for(var node in tree){
                     if(tree.hasOwnProperty(node) && node != "ROOT"){
                         var paths = DFS(node, n, "", tree);

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

module.exports.parseAllDependencyTrees = function(directory, filesInventory, authorsFile, options, done){

    console.log("ParseAllDependencyTrees " + directory);
    var n = options['n'];

    var count = options['snGramsCount'];
    console.log("Count: " + count);

    var isSyntactic = options['isSyntactic'];

    var groupedsnGrams = [];
    var authorsList = [];
    var allsnGrams = [[],[]];

    fileUtils.convertAuthorsFileToDictionary(authorsFile, function(authors){

        var parseDocument;
        if(isSyntactic){
            console.log("SNGrams");
            parseDocument = parseDependencyTree;
        }
        else{
            console.log("NGrams");
            parseDocument = constructNGrams;
        }
        fs.readFile(filesInventory, 'utf8', function(err, data){
            if(!err) {
                var inventory = data.split('\n');
                fileUtils.traverse(directory, function (file, callback) {
                        if(inventory.indexOf(file) > -1) {
                            parseDocument(directory + '/' + file, options, function (snGramsFrequency) {

                                //union of the sn grams in all documents
                                for (var i = 0; i < snGramsFrequency[0].length; i++) {
                                    var index = allsnGrams[0].indexOf(snGramsFrequency[0][i]);

                                    if (index == -1) {
                                        allsnGrams[0].push(snGramsFrequency[0][i]);
                                        allsnGrams[1].push(snGramsFrequency[1][i]);
                                    }
                                    else {
                                        allsnGrams[1][index] += snGramsFrequency[1][i];
                                    }
                                }

                                authorsList.push(authors[file]);
                                groupedsnGrams.push(snGramsFrequency);
                            });
                        }
                        callback();
                    },
                    function () {

                        console.log("Authors list");
                        console.log(authorsList);

                        //zip all sn grams, sort by frequency, get top N
                        //TODO: parametrize slice
                        var sortedsnGrams = zip(allsnGrams).sort(function (a, b) {
                            a = a[1];
                            b = b[1];

                            return a < b ? -1 : (a > b ? 1 : 0);
                        }).slice(0, count + 1).map(function (snGram) {
                            return snGram[0];
                        });
                        console.log(sortedsnGrams.length);

                        // add sn grams that are part of the selected sn grams but do not exist in some of the documents
                        for (var i = 0; i < sortedsnGrams.length; i++) {
                            (function(i){
                                groupedsnGrams.map(function (snGramsDoc) {
                                    if (snGramsDoc[0].indexOf(sortedsnGrams[i]) == -1) {
                                        snGramsDoc[0].push(sortedsnGrams[i]);
                                        snGramsDoc[1].push(0);
                                    }
                            })})(i);
                        }

                        // zip the arrays of the documents sn grams
                        groupedsnGrams = groupedsnGrams.map(function (snGramsDoc) {
                            return zip(snGramsDoc);
                        });

                        // construct frequencies of the selected sn grams for each document
                        groupedsnGrams = groupedsnGrams
                            .map(function (snGramsDoc, index) {
                                return [snGramsDoc.filter(function (snGram) {
                                    return sortedsnGrams.indexOf(snGram[0]) > 0;
                                }).sort(function (a, b) {
                                    a = a[0];
                                    b = b[0];
                                    return a < b ? -1 : (a > b ? 1 : 0);
                                }).map(function (snGram) {
                                    return snGram[1];
                                }), authorsList[index]];
                            });

                        done(groupedsnGrams);
                    });
            }
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
            if(children[i])
            {
                var newPath = path.concat((children[i])[1] + " ");

                var shorterPaths = DFS((children[i])[0], depth-1, newPath, tree);

                if(shorterPaths) {
                    paths.push.apply(paths, shorterPaths);
                }
            }
        }
    }
    return paths;

};

var calculateNGramsFrequency = function(snGrams){
    //map reduce
    snGramFrequencies = snGrams
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
};
