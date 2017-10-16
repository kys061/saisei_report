
reportApp.factory('ReportData', function ($http, $log, $base64, $window) {
    var from;
    var until;
    var rest_id;
    var rest_ip;
    var rest_passwd;
    var rest_port;
    var rest_path;
    var auth;
    var headers;

    // open sync
    $.ajaxSetup({
        async: false
    });
    // get config
    var config = (function() {
        // var result;
        $.getJSON("./config/report-config.json", function (d) {
            console.log(d);
            result = d;
        });
        return result;
    })();
    // close sync
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
    /*
     *   set from date
     */
    function setFrom(val){
        from = val;
        from = new Date(from);
        console.log("from of reportdata : "+from);
        _from_yy = moment(from.toUTCString()).utc().format('YYYY');
        _from_mm = moment(from.toUTCString()).utc().format('MM');
        _from_dd = moment(from.toUTCString()).utc().format('DD');
        _from_hh = moment(from.toUTCString()).utc().format('HH');
        _from_min = moment(from.toUTCString()).utc().format('mm');
        _from_sec = moment(from.toUTCString()).utc().format('ss');
    }
    /*
     *   set until date
     */
    function setUntil(val){
        until = val;
        until = new Date(until);
        console.log("until of reportdata : "+until);
        _until_yy = moment(until.toUTCString()).utc().format('YYYY');
        _until_mm = moment(until.toUTCString()).utc().format('MM');
        _until_dd = moment(until.toUTCString()).utc().format('DD');
        _until_hh = moment(until.toUTCString()).utc().format('HH');
        _until_min = moment(until.toUTCString()).utc().format('mm');
        _until_sec = moment(until.toUTCString()).utc().format('ss');
    }
    /*
     *   get user's total rate
     */
    function getUserdata(successcb) {
        // get json data
        var rest_section = config.config.users_tr.section;
        var rest_attr = config.config.users_tr.attr;
        var rest_order = config.config.users_tr.order;
        var rest_limit = config.config.users_tr.limit;
        var rest_with = config.config.users_tr.with;
        var _rest_from = _from_hh+':'+_from_min+':'+_from_sec+'_'+_from_yy+_from_mm+_from_dd; //GMT
        var _rest_until = _until_hh+':'+_until_min+':'+_until_sec+'_'+_until_yy+_until_mm+_until_dd; //GMT
        // http:10.161.147.55:5000/rest/nhntestserver/configurations/running/users/
        //     // ?select=total_rate&order=<total_rate&limit=10&with=total_rate>=0.01&from=15:00:00_20170930&until=15:00:00_20171007
        var rest_qstring = '?select='+rest_attr+'&order='+rest_order+'&limit='+rest_limit+'&with='+rest_with+'&from='+_rest_from+'&until='+_rest_until;
        var rest_url = rest_ip+rest_port+rest_path+rest_section+rest_qstring;
        console.log(rest_url);
        $http({
            method: 'GET',
            url: rest_url,
            headers: headers
        }).
        then(function (data, status, headers, config) { successcb(data); },
            function onError(response){
                if (response.status < 0){
                    notie.alert({ type: 'error', stay: 'true', time: 3600, text: 'ERROR - 데이터가 존재하지 않습니다.' });
                    //alert("ERROR! - 데이터가 존재하지 않습니다.");
                }
            })
    }
    /*
     *   get interface rcv rate
     */
    function getIntRcvData(successcb) {
        $log.info("local : " + from+" : "+until);
        $log.info("utc : " + moment(from).utc()+" : "+ moment(until.toUTCString()).utc());
        $log.info("date parse : "+_from_yy+ ":"+_from_mm+ ":"+_from_dd+ ":"+_from_hh+ ":"+_from_min+ ":"+_from_sec);
        // get json data
        var rest_section = config.config.interface_rcv.section;
        var rest_attr = config.config.interface_rcv.attr;
        var rest_operation = config.config.interface_rcv.operation;
        var rest_hist_point = config.config.interface_rcv.hist_point;
        // make duration
        var _rest_from = _from_hh+':'+_from_min+':'+_from_sec+'_'+_from_yy+_from_mm+_from_dd; //GMT
        var _rest_until = _until_hh+':'+_until_min+':'+_until_sec+'_'+_until_yy+_until_mm+_until_dd; //GMT
        var rest_qstring = '?select='+rest_attr+'&from='+_rest_from+'&operation='+rest_operation+'&history_points='+rest_hist_point+'&until='+_rest_until;
        console.log(rest_ip);
        var rest_url = rest_ip+rest_port+rest_path+rest_section+rest_qstring;
        console.log(rest_url);
        $http({
            method: 'GET',
            url: rest_url,
            headers: headers
        }).
        then(function (data, status, headers, config) {
                successcb(data);
            },
            function onError(response){
                console.log(response);
                if (response.status < 0){
                    notie.alert({ type: 'error', text: 'ERROR - 데이터가 존재하지 않습니다.' });
                    //alert("ERROR! - 데이터가 존재하지 않습니다.");
                }
            })
    }
    /*
     *   get interface trs rate
     */
    function getIntTrsData(successcb) {
        // get json data
        var rest_section = config.config.interface_trs.section;
        var rest_attr = config.config.interface_trs.attr;
        var rest_operation = config.config.interface_trs.operation;
        var rest_hist_point = config.config.interface_trs.hist_point;

        var _rest_from = _from_hh+':'+_from_min+':'+_from_sec+'_'+_from_yy+_from_mm+_from_dd; //GMT
        var _rest_until = _until_hh+':'+_until_min+':'+_until_sec+'_'+_until_yy+_until_mm+_until_dd; //GMT


        rest_qstring = '?select='+rest_attr+'&from='+_rest_from+'&operation='+rest_operation+'&history_points='+rest_hist_point+'&until='+_rest_until;
        rest_url = rest_ip+rest_port+rest_path+rest_section+rest_qstring;

        $http({
            method: 'GET',
            url: rest_url,
            headers: headers
        }).
        then(function (data, status, headers, config) {
                successcb(data);
                $log.info(data['data']['collection'][0]['_history_length_receive_rate']);
                $log.info(data['data']['collection'][0]['_history_receive_rate']);
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
        getUserdata: getUserdata,
        getIntRcvData: getIntRcvData,
        getIntTrsData: getIntTrsData
    };
});