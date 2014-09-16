var nlpAlg = require("../app/algorithms/nlp-algorithms");
var fs = require("fs");

module.exports = function(app)
{
    // Test routes
    app.get('/tokenize', function(req, res){

        fs.readFile("./app/data/federalist-data/all_papers.txt", "utf8", function(err, data){
            if(!err) {

                var tokenizedText = nlpAlg.tokenizeText(data);

                res.send(tokenizedText);
            }
        });
    });
}