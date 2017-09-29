
reportApp.factory('ReportData', function ($http, $log, $base64, $window) {
    var from;
    var until;
    // was setting
    $.getJSON("./config/report-config.json", function(config) {
        console.log(config);
    });
    // var data = ReportConfig.promiseToHaveData();
    // console.log("promise data : " + data);
    var auth = $base64.encode("admin:admin");
    var headers = {"Authorization": "Basic " + auth};
    var rest_ip = 'http://10.161.147.55:';
    var rest_port = '5000';
    var rest_path = '/rest/nhntestserver/configurations/running/';
   return {
       setFrom: function(val){
           from = val;
       },
       setUntil: function(val){
            until = val;
       },
       getUserdata: function(successcb) {
           rest_ip = 'http://10.161.147.55:';
           rest_port = '5000';
           rest_path = '/rest/nhntestserver/configurations/running/';
           // rest_section = 'users/';
           // rest_qstring = '?token=1&order=<total_rate&start=0&limit=50&select=name,total_rate,active_flows';
           rest_section = 'interfaces/p1p1-ext1';
           rest_attr = 'receive_rate';
           // var rest_from = '08:26:18_20170919'; //GMT
           // var rest_until = '08:26:18_20170920'; //GMT
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
           $log.info("ReportData's getintrcvdata : "+from+" : "+until);
           from = new Date(from);
           until = new Date(until);
           // test = test.toUTCString();
           $log.info("local : " + from+" : "+until);
           $log.info("utc : " + moment(from).utc()+" : "+ moment(until.toUTCString()).utc());
           _from_yy = moment(from.toUTCString()).utc().format('YYYY');
           _from_mm = moment(from.toUTCString()).utc().format('MM');
           _from_dd = moment(from.toUTCString()).utc().format('DD');
           _from_hh = moment(from.toUTCString()).utc().format('HH');
           _from_min = moment(from.toUTCString()).utc().format('mm');
           _from_sec = moment(from.toUTCString()).utc().format('ss');
           // _from_yy = from.substring(0, 4);
           // _from_mm = from.substring(5, 7);
           // _from_dd = from.substring(8, 10);
           // _from_hh = from.substring(11, 13);
           // _from_min = from.substring(14, 16);
           // _from_sec = from.substring(17, 19);
           $log.info("date parse : "+_from_yy+ ":"+_from_mm+ ":"+_from_dd+ ":"+_from_hh+ ":"+_from_min+ ":"+_from_sec);
           _until_yy = moment(until.toUTCString()).utc().format('YYYY');
           _until_mm = moment(until.toUTCString()).utc().format('MM');
           _until_dd = moment(until.toUTCString()).utc().format('DD');
           _until_hh = moment(until.toUTCString()).utc().format('HH');
           _until_min = moment(until.toUTCString()).utc().format('mm');
           _until_sec = moment(until.toUTCString()).utc().format('ss');
           // _until_yy = until.substring(0, 4);
           // _until_mm = until.substring(5, 7);
           // _until_dd = until.substring(8, 10);
           // _until_hh = until.substring(11, 13);
           // _until_min = until.substring(14, 16);
           // _until_sec = until.substring(17, 19);
           // rest_section = 'users/';
           // rest_qstring = '?token=1&order=<total_rate&start=0&limit=50&select=name,total_rate,active_flows';
           rest_section = 'interfaces/p1p1-ext1';
           rest_attr = 'receive_rate';
           today = moment();
           year = today.format('YYYY');
           month = today.format('MM');
           day = today.format('DD');
           _day = moment().add(-7, 'days').format('DD');
           var rest_from = '15:00:00_'+year+month+_day; //GMT
           var rest_until = '14:59:59_'+year+month+day; //GMT
           var _rest_from = _from_hh+':'+_from_min+':'+_from_sec+'_'+_from_yy+_from_mm+_from_dd; //GMT
           var _rest_until = _until_hh+':'+_until_min+':'+_until_sec+'_'+_until_yy+_until_mm+_until_dd; //GMT
           $log.info(rest_from +":"+ rest_until);
           rest_operation = 'raw';
           rest_hist_point = 'true';
           rest_token = '%2Frest%2Fnhntestserver%2Fconfigurations%2Frunning%2Finterfaces%2Fp1p1-ext1';
           rest_qstring = '?select='+rest_attr+'&from='+_rest_from+'&operation='+rest_operation+'&history_points='+rest_hist_point+'&token='+rest_token+'&until='+_rest_until;

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
                       alert("ERROR!!!");
                   }
               })

       },
       getIntTrsData: function(successcb) {
           from = new Date(from);
           until = new Date(until);
           _from_yy = moment(from.toUTCString()).utc().format('YYYY');
           _from_mm = moment(from.toUTCString()).utc().format('MM');
           _from_dd = moment(from.toUTCString()).utc().format('DD');
           _from_hh = moment(from.toUTCString()).utc().format('HH');
           _from_min = moment(from.toUTCString()).utc().format('mm');
           _from_sec = moment(from.toUTCString()).utc().format('ss');

           _until_yy = moment(until.toUTCString()).utc().format('YYYY');
           _until_mm = moment(until.toUTCString()).utc().format('MM');
           _until_dd = moment(until.toUTCString()).utc().format('DD');
           _until_hh = moment(until.toUTCString()).utc().format('HH');
           _until_min = moment(until.toUTCString()).utc().format('mm');
           _until_sec = moment(until.toUTCString()).utc().format('ss');
           // rest_section = 'users/';
           // rest_qstring = '?token=1&order=<total_rate&start=0&limit=50&select=name,total_rate,active_flows';
           rest_section = 'interfaces/p1p1-ext1';
           rest_attr = 'transmit_rate';
           var rest_from = '15:00:00_'+year+month+_day; //GMT
           var rest_until = '14:59:59_'+year+month+day; //GMT
           var _rest_from = _from_hh+':'+_from_min+':'+_from_sec+'_'+_from_yy+_from_mm+_from_dd; //GMT
           var _rest_until = _until_hh+':'+_until_min+':'+_until_sec+'_'+_until_yy+_until_mm+_until_dd; //GMT
           // var rest_from = '15:00:00_20170912'; //GMT
           // var rest_until = '14:59:59_20170920'; //GMT
           rest_operation = 'raw';
           rest_hist_point = 'true';
           rest_token = '%2Frest%2Fnhntestserver%2Fconfigurations%2Frunning%2Finterfaces%2Fp1p1-ext1';
           rest_qstring = '?select='+rest_attr+'&from='+_rest_from+'&operation='+rest_operation+'&history_points='+rest_hist_point+'&token='+rest_token+'&until='+_rest_until;

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
               function (data, status, headers, config){
                   $log.warn(data, status, headers, config);
               })

       }
   };
});