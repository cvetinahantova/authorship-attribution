(function() {
    'use strict';

    var googleChart = googleChart || angular.module("google-chart", []);

    googleChart.directive("googleChart", function () {
        return {
            restrict: "A",
            scope: {
                chartData : '=',
                chartConfig : '='
            },
            link: function ($scope, $elem, $attr) {

                var googleChart = new google.visualization[$attr.googleChart]($elem[0]);

                function getValueAt(column, dataTable, row) {
                    return dataTable.getFormattedValue(row, column);
                }


                $scope.$watch('chartData', function(newValue, oldValue){
                    var config = $scope.chartConfig;

                    if (newValue) {
                       var data = google.visualization.arrayToDataTable(newValue);
                        var formatter = new google.visualization.NumberFormat({pattern:'#.# %'});
                        for(var j=1; j<(data.getNumberOfColumns());j++) {
                            formatter.format(data, j);
                        }

                        var dataView = new google.visualization.DataView(data);

                        var columns = [0];

                        for(var i=1; i<(newValue[0].length);i++){
                            columns.push(i);
                            columns.push({
                                calc: getValueAt.bind(undefined, i),
                                sourceColumn: i,
                                type: "string",
                                role: "annotation"
                            });
                        }

                        dataView.setColumns(columns);


                        config.colors = ['#b2cedc', '#7b7b7b', '#b2cadc', '#7b7b6b', '#b2bedc', '#7b7d7b'];
                        config.min = 0;
                        config.max = 1;

                        config.vAxis = {};
                        config.vAxis.minValue = 0;
                        config.vAxis.maxValue = 1;
                        config.vAxis.title = "Accuracy";


                        googleChart.draw(dataView, config);
                    }
                }, true);
            }
        };
    });
}());