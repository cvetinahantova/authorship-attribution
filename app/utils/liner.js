var stream = require('stream');

module.exports.createTransform = function(){

    var liner = new stream.Transform( { objectMode: true } );

    liner._transform = function (chunk, encoding, done) {
        var data = chunk.toString();
        if (this._lastLineData) data = this._lastLineData + data;

        var lines = data.split('\n').map(function(el){
            if(el===""){
                return '\n';
            }
            else{
                return el;
            }
        });
        this._lastLineData = lines.splice(lines.length-1,1)[0];

        lines.forEach(this.push.bind(this));
        done()
    };

    liner._flush = function (done) {
        if (this._lastLineData) this.push(this._lastLineData);
        this._lastLineData = null;
        done()
    };

    return liner;
};