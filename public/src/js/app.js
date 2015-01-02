(function() {
    'use strict';

    /*We need to manually start angular as we need to
     wait for the google charting libs to be ready*/
    google.setOnLoadCallback(function () {
        angular.bootstrap(document.body, ['angular-app']);
    });
    google.load("visualization", "1.1", {packages:["corechart"]});

    angular.module('angular-app', ['ngRoute', 'ngAnimate', 'appRoutes', 'MainController', 'AuthorshipAttributionService', 'google-chart']);
}());