'use strict';

var reportApp = angular.module('reportApp', ["ngRoute", 'base64', 'chart.js', 'angular-momentjs',  'angular-loading-bar', 'angularPromiseButtons', 'angularjs-datetime-picker', 'ngTableToCsv'])    .config(function($routeProvider, $locationProvider, $momentProvider){
    $momentProvider
        .asyncLoading(false)
        .scriptUrl('./lib/moment.min.js');
    $routeProvider
        // .when('/', {
        //     templateUrl: "index.html",
        //     controller: "MainCtrl"
        // })
        .when('/report', {
            templateUrl : "templates/report.html",
            controller: "ReportCtrl"
        })
        .otherwise({redirectTo: '/'});

    $locationProvider.html5Mode(true);
    })
    .config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
        cfpLoadingBarProvider.latencyThreshold = 900;
    }]).run(function($rootScope) {
        $rootScope.users_app_top1 = [];
    });

// 'htmlToPdfSave',