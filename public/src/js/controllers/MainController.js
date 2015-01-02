// js/controllers/main.js

angular.module('MainController', [])
    .controller('MainController', ["$scope", "$http", "AuthorshipAttribution", function($scope, $http, AuthorshipAttribution){

        $scope.corpora = [
            { id: "federalist-data",  label: "Federalist Data"},
            { id: "novels",  label: "English novels"},
            { id: "education",  label: "Education blogs"}
        ];
        $scope.selectedCorpus = $scope.corpora[0];

        $scope.authorsSetSizes = [
            { id: "small", label: "Small"},
            { id: "medium", label: "Medium"},
            { id: "big", label: "Big"}
        ];
        $scope.selectedAuthorsSetSize = $scope.authorsSetSizes[2];

        $scope.dataSetSizes = [
            { id: "limited", label: "Limited"},
            { id: "balanced", label: "Balanced"},
            { id: "unbalanced", label: "Unbalanced"}
        ];
        $scope.selectedDataSetSize = $scope.dataSetSizes[2];

       $scope.nfzStatistics = [];
       $scope.nfzChartConfig = {
           title : 'Natural Frequency Zoned Word Distribution Analysis - ' + $scope.selectedCorpus.label,
           legend: { position: 'none' },
           hAxis: { title: 'Partition Function'}
       };

       $scope.snGramsStatistics = [];
       $scope.snGramsChartConfig = {
           title : 'SN-Grams Analysis - ' + $scope.selectedCorpus.label,
           hAxis: { title: 'SN-Gram Length'}
       };

       $scope.isProgressBarVisible = false;
       $scope.areOptionsDisabled = true;

       $scope.getCorpusStatistics = function(){
         console.log($scope.selectedCorpus.id + " " + $scope.selectedAuthorsSetSize.id + " " + $scope.selectedDataSetSize.id);
           $scope.isProgressBarVisible = true;
         AuthorshipAttribution.getCorpusAlgorithmsReports($scope.selectedCorpus.id, $scope.selectedAuthorsSetSize.id + '_' + $scope.selectedDataSetSize.id)
             .success(function(data){
                     console.log(data[0]);
                     console.log(data[1]);

                     $scope.nfzChartConfig.title = 'Natural Frequency Zoned Word Distribution Analysis - ' + $scope.selectedCorpus.label;
                     $scope.nfzStatistics = data[1];

                     $scope.snGramsChartConfig.title = 'SN-Grams Analysis - ' + $scope.selectedCorpus.label;
                     $scope.snGramsStatistics = data[0];

                     $scope.isProgressBarVisible = false;
         }).error(function(err){
                 console.log(err);
                 $scope.isProgressBarVisible = false;
             });
       };

       $scope.selectCorpus = function(){
           if($scope.selectedCorpus.id == 'federalist-data'){
              $scope.areOptionsDisabled = true;
              $scope.selectedDataSetSize = $scope.dataSetSizes[2];
              $scope.selectedAuthorsSetSize = $scope.authorsSetSizes[2];

              $scope.getCorpusStatistics();
           }
           else{
              $scope.areOptionsDisabled = false;
           }
       };

       $scope.getCorpusStatistics();

        /* LEGACY */
       $scope.getSNgramsReport = function(){
           AuthorshipAttribution.getSNgramsReport()
               .success(function(data){
                   var dataTable = google.visualization.arrayToDataTable(data);

                  $scope.statistics = {};
                  $scope.statistics.dataTable = dataTable;
                  $scope.statistics.title = "Federalist Articles - sn-grams";
                  $scope.statistics.subtitle = "SN-grams statistics";
               });
       };

       $scope.getNFZReport = function(){
            AuthorshipAttribution.getNFZReport()
                .success(function(data){
                    var dataTable = google.visualization.arrayToDataTable(data);

                    $scope.statistics = {};
                    $scope.statistics.dataTable = dataTable;
                    $scope.statistics.title = "Federalist Articles - NFZ";
                    $scope.statistics.subtitle = "NFZ statistics";
                });
        };
    }]);