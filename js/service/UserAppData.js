reportApp.factory('UserAppData', function ($http, $log, $base64, $window) {
    var from;
    var until;
    var rest_id;
    var rest_ip;
    var rest_passwd;
    var rest_port;
    var rest_path;
    var auth;
    var headers;

    // was setting
    $.ajaxSetup({
        async: false
    });
    var config = (function() {
        // var result;
        $.getJSON("./config/report-config.json", function (d) {
            console.log(d);
            result = d;
        });
        return result;
    })();
    $.ajaxSetup({
        async: true
    });

    rest_id = config.config.common.id;
    rest_ip = config.config.common.ip;
    rest_passwd = config.config.common.passwd;
    rest_port = config.config.common.port;
    rest_path = config.config.common.path;
    auth = $base64.encode(rest_id + ":" + rest_passwd);
    headers = {"Authorization": "Basic " + auth};

    function setFrom(val) {
        from = val;
        from = new Date(from);
        _from_yy = moment(from.toUTCString()).utc().format('YYYY');
        _from_mm = moment(from.toUTCString()).utc().format('MM');
        _from_dd = moment(from.toUTCString()).utc().format('DD');
        _from_hh = moment(from.toUTCString()).utc().format('HH');
        _from_min = moment(from.toUTCString()).utc().format('mm');
        _from_sec = moment(from.toUTCString()).utc().format('ss');
    }

    function setUntil(val) {
        until = val;
        until = new Date(until);
        _until_yy = moment(until.toUTCString()).utc().format('YYYY');
        _until_mm = moment(until.toUTCString()).utc().format('MM');
        _until_dd = moment(until.toUTCString()).utc().format('DD');
        _until_hh = moment(until.toUTCString()).utc().format('HH');
        _until_min = moment(until.toUTCString()).utc().format('mm');
        _until_sec = moment(until.toUTCString()).utc().format('ss');
    }

    function getUserAppData(userid) {
        // get json data
        var rest_section = config.config.user_app.section.replace(':userID', userid);
        var rest_attr = config.config.user_app.attr;
        var rest_order = config.config.user_app.order;
        var rest_limit = config.config.user_app.limit;
        var rest_with = config.config.user_app.with;
        var _rest_from = _from_hh+':'+_from_min+':'+_from_sec+'_'+_from_yy+_from_mm+_from_dd; //GMT
        var _rest_until = _until_hh+':'+_until_min+':'+_until_sec+'_'+_until_yy+_until_mm+_until_dd; //GMT

        var rest_qstring = '?select='+rest_attr+'&order='+rest_order+'&limit='+rest_limit+'&with='+rest_with+'&from='+_rest_from+'&until='+_rest_until;
        var rest_url = rest_ip+rest_port+rest_path+rest_section+rest_qstring;

        return $http({
            method: 'GET',
            url: rest_url,
            headers: headers
        }).
        then(function (data, status, headers, config) {
                return data;
            },
            function onError(response){
                if (response.status < 0){
                    notie.alert({ type: 'error', text: 'ERROR - 데이터가 존재하지 않습니다.' });
                    //alert("ERROR! - 데이터가 존재하지 않습니다.");
                }
            })

    }

    return {
        setFrom: setFrom,
        setUntil: setUntil,
        getUserAppData: getUserAppData
    };
});