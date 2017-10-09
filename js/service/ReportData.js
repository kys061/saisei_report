
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

    console.log(config.config.common.id);

    return {
        setFrom: function(val){
            from = val;
            from = new Date(from);
            _from_yy = moment(from.toUTCString()).utc().format('YYYY');
            _from_mm = moment(from.toUTCString()).utc().format('MM');
            _from_dd = moment(from.toUTCString()).utc().format('DD');
            _from_hh = moment(from.toUTCString()).utc().format('HH');
            _from_min = moment(from.toUTCString()).utc().format('mm');
            _from_sec = moment(from.toUTCString()).utc().format('ss');
        },
        setUntil: function(val){
            until = val;
            until = new Date(until);
            _until_yy = moment(until.toUTCString()).utc().format('YYYY');
            _until_mm = moment(until.toUTCString()).utc().format('MM');
            _until_dd = moment(until.toUTCString()).utc().format('DD');
            _until_hh = moment(until.toUTCString()).utc().format('HH');
            _until_min = moment(until.toUTCString()).utc().format('mm');
            _until_sec = moment(until.toUTCString()).utc().format('ss');
        },
        getUserdata: function(successcb) {

           rest_section = 'interfaces/p1p1-ext1';
           rest_attr = 'receive_rate';

           rest_operation = 'raw';
           rest_hist_point = 'true';
           rest_token = '%2Frest%2Fnhntestserver%2Fconfigurations%2Frunning%2Finterfaces%2Fp1p1-ext1';
           rest_qstring = '?select='+rest_attr+'&from='+rest_from+'&operation='+rest_operation+'&history_points='+rest_hist_point+'&token='+rest_token+'&until='+rest_until;

           rest_url = rest_ip+rest_port+rest_path+rest_section+rest_qstring;

           $http({
               method: 'GET',
               url: rest_url,
               headers: headers
           }).
            then(function (data, status, headers, config) {
                successcb(data);
                // successcb(data['data']['collection'][0]);
                $log.info(data['data']['collection'][0]['_history_length_receive_rate']);
                $log.info(data['data']['collection'][0]['_history_receive_rate']);

                // $moment(data['data']['collection'][0]['_history_receive_rate'][0][0], "dd.mm.yyyy hh:MM:ss");
                var t = new Date( data['data']['collection'][0]['_history_receive_rate'][0][0] );
                receive_time = t.toLocaleString();
                // receive_time = $moment(data['data']['collection'][0]['_history_receive_rate'][0][0], "dd.mm.yyyy hh:MM:ss").fromNow();
                receive_rate = data['data']['collection'][0]['_history_receive_rate'][0][0];
                $log.info(receive_time, receive_rate)
           },
            function (data, status, headers, config){
                $log.warn(data, status, headers, config);
           })
        },

        getIntRcvData: function(successcb) {

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
                // successcb(data['data']['collection'][0]);
                $log.info(data['data']['collection'][0]['_history_length_receive_rate']);
                $log.info(data['data']['collection'][0]['_history_receive_rate']);

                // $moment(data['data']['collection'][0]['_history_receive_rate'][0][0], "dd.mm.yyyy hh:MM:ss");
                // var t = new Date( data['data']['collection'][0]['_history_receive_rate'][0][0] );
                // receive_time = t.toLocaleString();
                // // receive_time = $moment(data['data']['collection'][0]['_history_receive_rate'][0][0], "dd.mm.yyyy hh:MM:ss").fromNow();
                // receive_rate = data['data']['collection'][0]['_history_receive_rate'][0][0];
                // $log.info(receive_time, receive_rate)
            },
            function onError(response){
                // $log.warn(data, status, headers, config);
                $log.info(response);
                $log.warn("ERROR!!!");
                if (response.status < 0){
                    alert("ERROR! - 데이터가 존재하지 않습니다.");
                }
            })
        },
        getIntTrsData: function(successcb) {
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
                   // successcb(data['data']['collection'][0]);
                   $log.info(data['data']['collection'][0]['_history_length_receive_rate']);
                   $log.info(data['data']['collection'][0]['_history_receive_rate']);

                   // $moment(data['data']['collection'][0]['_history_receive_rate'][0][0], "dd.mm.yyyy hh:MM:ss");
                   // var t = new Date( data['data']['collection'][0]['_history_receive_rate'][0][0] );
                   // receive_time = t.toLocaleString();
                   // // receive_time = $moment(data['data']['collection'][0]['_history_receive_rate'][0][0], "dd.mm.yyyy hh:MM:ss").fromNow();
                   // receive_rate = data['data']['collection'][0]['_history_receive_rate'][0][0];
                   // $log.info(receive_time, receive_rate)
               },
                function onError(response){
                    // $log.warn(data, status, headers, config);
                    $log.info(response);
                    $log.warn("ERROR!!!");
                    if (response.status < 0){
                        alert("ERROR! - 데이터가 존재하지 않습니다.");
                    }
                })
        }
    };
});