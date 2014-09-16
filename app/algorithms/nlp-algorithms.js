var natural = require('natural');

module.exports.tokenizeText = function(text) {

    tokenizer = new natural.WordTokenizer();

    return tokenizer.tokenize(text);
}
