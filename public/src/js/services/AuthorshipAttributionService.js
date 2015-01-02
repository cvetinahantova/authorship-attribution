angular.module('AuthorshipAttributionService', [])
    .factory('AuthorshipAttribution', ["$http", function($http){
        return {
            getCorpusAlgorithmsReports : function(corpusName, corpusSize){
                return $http.get('/statistics/' + corpusName + '/' + corpusSize);
            }
        };
    }]);