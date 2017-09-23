'use strict';

reportApp.controller('ReportController',
    function ReportController($scope, $log, $route, $templateCache, $location, SharedData) {
        $scope.from;
        $scope.until;
        $scope.currentState = true;

        $scope.currentDurationState = SharedData.currentDurationState;

        $scope.$watch('date_from', function(val) {
            $scope.from = val;
            // $scope.from = new Date(val);
        });
        $scope.$watch('date_until', function(val) {
            $scope.until = val;
            // $scope.until = new Date(val);
        });

        $scope.sendDate = function() {
            $log.info("reportcontroller: "+$scope.from+" : "+ $scope.until);
            $scope.currentState = false;
            $scope.currentDurationState = false;

            SharedData.setFrom($scope.from);
            SharedData.setUntil($scope.until);
            // var currentPageTemplate = $route.current.templateUrl;
            // $templateCache.remove(currentPageTemplate);
            // $route.reload();
        };

        // $log.info("test!!!");
    });
