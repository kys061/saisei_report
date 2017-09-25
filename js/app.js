'use strict';

var reportApp = angular.module('reportApp', ["ngRoute", 'base64', 'chart.js', 'angular-momentjs', 'angular-loading-bar', 'angularPromiseButtons', 'angularjs-datetime-picker'])
    .config(function($routeProvider, $locationProvider, $momentProvider){
    $momentProvider
        .asyncLoading(false)
        .scriptUrl('./lib/moment.min.js');
    $routeProvider
        // .when('/', {
        //     templateUrl: "index.html",
        //     controller: "ReportController"
        // })
        .when('/week', {
            templateUrl : "templates/week.html",
            controller: "InterfaceCtrl"
        });

    $locationProvider.html5Mode(true);
});

// 'htmlToPdfSave',