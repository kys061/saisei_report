reportApp.service('ReportConfig', function() {
    var Config = function() {
        var self = this;
        var result
        this.getConfig = function() {
            $.getJSON("./config/report-config.json", function (d) {
                result = d.config;
            });
            return result;
        };
    };

    return Config;
});