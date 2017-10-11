reportApp.service('SharedData', function () {
    var sharedData = {};
    sharedData.currentDurationState = true;
    sharedData.currentBtnState = false;
    sharedData.from;
    sharedData.until;
    return {
        setBtnCurrentState: function() {
            sharedData.currentBtnState = true;
        },
        getBtnCurrentState: function() {
            return sharedData.currentBtnState;
        },
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