'use strict';

var reportApp = angular.module('reportApp', ["ngRoute", 'base64', 'chart.js', 'angular-momentjs',  'angular-loading-bar', 'angularPromiseButtons', 'angularjs-datetime-picker', 'ngTableToCsv'])    .config(function($routeProvider, $locationProvider, $momentProvider){
    $momentProvider
        .asyncLoading(false)
        .scriptUrl('./lib/moment.min.js');
    $routeProvider
        // .when('/', {
        //     templateUrl: "index.html",
        //     controller: "ReportController"
        // })
        .when('/report', {
            templateUrl : "templates/report.html",
            controller: "ReportCtrl"
        });

    $locationProvider.html5Mode(true);
    })
    .config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
        cfpLoadingBarProvider.latencyThreshold = 500;
        // console.log("loading bar LOGGG!!!");
    }]).run(function($rootScope) {
        $rootScope.users_app_top1 = [];
    });

// 'htmlToPdfSave',