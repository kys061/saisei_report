
reportApp.factory('ReportData', function ($http, $log, $base64, $moment, SharedData) {
    var from;
    var until;
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
           var rest_from = '08:26:18_20170919'; //GMT
           var rest_until = '08:26:18_20170920'; //GMT
           rest_operation = 'raw';
           rest_hist_point = 'true';
           rest_token = '%2Frest%2Fnhntestserver%2Fconfigurations%2Frunning%2Finterfaces%2Fp1p1-ext1';
           rest_qstring = '?select='+rest_attr+'&from='+rest_from+'&operation='+rest_operation+'&history_points='+rest_hist_point+'&token='+rest_token+'&until='+rest_until;

           rest_url = rest_ip+rest_port+rest_path+rest_section+rest_qstring;
           var auth = $base64.encode("admin:admin");
           headers = {"Authorization": "Basic " + auth};
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
           $log.info("ReportData's getintrcvdata : "+from+" : "+until)
           rest_ip = 'http://10.161.147.55:';
           rest_port = '5000';
           rest_path = '/rest/nhntestserver/configurations/running/';
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
           $log.info(rest_from +":"+ rest_until);
           rest_operation = 'raw';
           rest_hist_point = 'true';
           rest_token = '%2Frest%2Fnhntestserver%2Fconfigurations%2Frunning%2Finterfaces%2Fp1p1-ext1';
           rest_qstring = '?select='+rest_attr+'&from='+rest_from+'&operation='+rest_operation+'&history_points='+rest_hist_point+'&token='+rest_token+'&until='+rest_until;

           rest_url = rest_ip+rest_port+rest_path+rest_section+rest_qstring;
           var auth = $base64.encode("admin:admin");
           headers = {"Authorization": "Basic " + auth};
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

       },
       getIntTrsData: function(successcb) {
           rest_ip = 'http://10.161.147.55:';
           rest_port = '5000';
           rest_path = '/rest/nhntestserver/configurations/running/';
           // rest_section = 'users/';
           // rest_qstring = '?token=1&order=<total_rate&start=0&limit=50&select=name,total_rate,active_flows';
           rest_section = 'interfaces/p1p1-ext1';
           rest_attr = 'transmit_rate';
           var rest_from = '15:00:00_'+year+month+_day; //GMT
           var rest_until = '14:59:59_'+year+month+day; //GMT
           // var rest_from = '15:00:00_20170912'; //GMT
           // var rest_until = '14:59:59_20170920'; //GMT
           rest_operation = 'raw';
           rest_hist_point = 'true';
           rest_token = '%2Frest%2Fnhntestserver%2Fconfigurations%2Frunning%2Finterfaces%2Fp1p1-ext1';
           rest_qstring = '?select='+rest_attr+'&from='+rest_from+'&operation='+rest_operation+'&history_points='+rest_hist_point+'&token='+rest_token+'&until='+rest_until;

           rest_url = rest_ip+rest_port+rest_path+rest_section+rest_qstring;
           var auth = $base64.encode("admin:admin");
           headers = {"Authorization": "Basic " + auth};
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