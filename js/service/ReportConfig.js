reportApp.service('ReportConfig', function($http, $q) {
    var _this = this;

    this.promiseToHaveData = function() {
        var defer = $q.defer();

        $http.get('../../config/report-config.json')
            .then(function onSuccess(response) {
            angular.extend(_this, response);
            defer.resolve();
        })
            .catch(function onError(response) {
            console.log(response);
        });

        return defer.promise;
    }
});