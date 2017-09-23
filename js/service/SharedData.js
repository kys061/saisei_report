reportApp.service('SharedData', function () {
    var sharedData = {};
    sharedData.currentDurationState = true;
    sharedData.from;
    sharedData.until;
    return {
        getSharedData: function () {
            return sharedData;
        },
        setFrom: function(from) {
            sharedData.from = from;
        },
        setUntil: function(until) {
            sharedData.until = until;
        },
        getFrom: function() {
            return sharedData.from;
        },
        getUntil: function() {
            return sharedData.until;
        }
    };
});