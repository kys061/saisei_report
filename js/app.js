'use strict';

var reportApp = angular.module('reportApp', ['base64', 'chart.js', 'angular-momentjs', 'angular-loading-bar', 'angularPromiseButtons']).config(function($momentProvider){
    $momentProvider
        .asyncLoading(false)
        .scriptUrl('./lib/moment.min.js');
});

// 'htmlToPdfSave',