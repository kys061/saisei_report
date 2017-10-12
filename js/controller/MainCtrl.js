'use strict';

reportApp.controller('MainCtrl', function MainCtrl($scope, $log, $route, $templateCache, $location, $window, SharedData) {
        var from;
        var until;
        var today = new $window.Sugar.Date(new Date());

        // $scope.currentState = SharedData.getCurrentState();
        $scope.currentState = true;
        $scope.currentDurationState = SharedData.currentDurationState;
        $scope.$watch('date_from', function(val) {
            from = val;
            // $scope.from = new Date(val);
        });
        $scope.$watch('date_until', function(val) {
            until = val;
            // $scope.until = new Date(val);
        });

        $scope.sendDate = function() {
            var duration = $window.Sugar.Date.range(from, until).every('days').length;
            var _until = new $window.Sugar.Date(until);
            var _from = new $window.Sugar.Date(from);
            console.log(_until.isFuture());
            if (from === undefined || until === undefined){
                // $window.$('#myModal').modal('show');
                alert('리포트 기간을 넣어주세요!!!');
            } else if (duration > 31) {
                alert('리포트 기간은 최대 30일 까지 가능합니다!!');
            } else if (_until.isFuture().raw) {
                alert('리포트 종료 시점은 현재보다 미래로 설정할 수 없습니다!!');
            } else if (_from.isFuture().raw) {
                alert('리포트 시작 시점은 현재보다 미래로 설정할 수 없습니다!!');
            }
            else {
                // $scope.currentState = SharedData.setCurrentState(false);
                // $scope.currentState = SharedData.getCurrentState();
                $scope.currentState = false;
                $scope.currentDurationState = false;
                SharedData.setFrom(from);
                SharedData.setUntil(until);
                $location.path('/report');
            }
            // var currentPageTemplate = $route.current.templateUrl;
            // $templateCache.remove(currentPageTemplate);
            // $route.reload();
        };

        // $log.info("test!!!");
    });
