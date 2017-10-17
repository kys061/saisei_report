reportApp.controller('MainCtrl', function MainCtrl($scope, $log, $route, $templateCache, $location, $window, SharedData) {
    var from;
    var until;
    var today = new $window.Sugar.Date(new Date());
    $scope.select2model = [];
    $scope.select2data = [
        {
            id: 1,
            label: "인터페이스 트래픽"
        },
        {
            id: 2,
            label: "사용자 트래픽"
        },
        {
            id: 3,
            label: "사용자-어플리케이션 트래픽"
        }
    ];
    $scope.select2settings = {};
    // $scope.currentState = SharedData.getCurrentState();
    $scope.currentState = true;
    $scope.currentDurationState = SharedData.currentDurationState;
    $scope.$watch('date_from', function(val) {
        from = val;
        console.log(val);
        // $scope.from = new Date(val);
    });
    $scope.$watch('date_until', function(val) {
        until = val;
        console.log(val);
        // $scope.until = new Date(val);
    });

    $scope.sendDate = function() {
        var duration = $window.Sugar.Date.range(from, until).every('days').length;
        console.log(duration);
        var _until = new $window.Sugar.Date(until);
        var _from = new $window.Sugar.Date(from);
        console.log("from : until -> " + _from.raw + ':' + _until.raw);
        if (from === undefined || until === undefined) {
            notie.alert({
                type: 'error',
                text: '리포트 기간을 넣어주세요!!!'
            })
        } else if (duration > 31) {
            notie.alert({
                type: 'error',
                text: '리포트 기간은 최대 한달까지 가능합니다!!'
            })
        } else if (_until.isFuture().raw) {
            notie.alert({
                type: 'error',
                text: '리포트 종료 시점은 현재보다 미래로 설정할 수 없습니다!!'
            })
        } else if (_from.isFuture().raw) {
            notie.alert({
                type: 'error',
                text: '리포트 시작 시점은 현재보다 미래로 설정할 수 없습니다!!'
            })
        } else {
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
});