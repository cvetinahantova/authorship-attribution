var createSNGramsTemplate = function(statistics){
    var columnHeaders = ['n'];

    var previousN;
    //var previousSNGramsCount;

    var table=[];
    table.push(columnHeaders);

    var row = [];
    statistics.map(function(stat){
        if(columnHeaders.indexOf(String(stat.snGramsCount) + ' words') == -1) {
            //previousSNGramsCount = stat.snGramsCount;
            columnHeaders.push(String(stat.snGramsCount) + ' words');
        }

        if(stat.n != previousN) {
            previousN = stat.n;
            row.push(String(stat.n));

            if(row){
                table.push(row);
            }
            row = [];
        }
    });

    return table;
};

var createNFZTemplate = function(statistics) {
    var columnHeaders = ['Partition function', "Accuracy"];

    var table = [];
    table.push(columnHeaders);
    table.push(['Linear']);
    table.push(['Radix']);
    table.push(['Logarithmic']);

    return table;
};

module.exports.createSNGramsTemplate = createSNGramsTemplate;
module.exports.createNFZTemplate = createNFZTemplate;
module.exports.constructColumnChartData = function(statistics, template){

    var currentRow = 1;

    statistics.map(function(stat){
        if(template[currentRow].length > (template[0].length - 1)){
            currentRow++;
        }
        template[currentRow].push(stat.accuracy);
    });
    return template;
};