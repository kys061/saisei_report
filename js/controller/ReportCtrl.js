'use strict';

reportApp.controller('ReportCtrl', function ReportCtrl($rootScope, $scope, $log, ReportData, SharedData, UserAppData, $location, $route, $window) {
    var from = SharedData.getFrom();
    var until = SharedData.getUntil();
    $log.info("ReportCtrl: "+from+" : "+until);
    //get div size init
    var size = {};
    size.first_page = {};
    size.second_page = {};
    size.third_page = {};
    // set date
    ReportData.setFrom(from);
    ReportData.setUntil(until);
    UserAppData.setFrom(from);
    UserAppData.setUntil(until);
    console.log(from);
    var _from = new Date(from);
    var _until = new Date(until);
    //
    $scope.from = _from.toLocaleString();
    $scope.until = _until.toLocaleString();
    /*for rcv var*/
    $scope.label = [];
    $scope.raw_label = [];
    $scope.data_rcv_rate = [];
    $scope.raw_data_rcv_rate = [];
    // init date vars
    $scope.int_date = [];
    $scope.int_cmp_date = [];
    // init rcv data vars
    $scope.int_rcv_avg = [];
    $scope.rcv_tot = [];
    $scope.rcv_len = [];
    /*for trs var*/
    $scope.data_trs_rate = [];
    $scope.raw_data_trs_rate = [];
    // init trs data vars
    $scope.int_trs_avg = [];
    $scope.trs_tot = [];
    $scope.trs_len = [];
    // setting interface data for table
    $scope.int_data = [];

    // for users data
    $scope._users_label = [];
    $scope._users_from = [];
    $scope._users_until = [];
    $scope._users_series = ['총사용량(단위:Mbit/s)', '다운로드 사용량(단위:Mbit/s)', '업로드 사용량(단위:Mbit/s)'];
    $scope._users_total = [];
    $scope._users_download = [];
    $scope._users_upload = [];
    $scope._users_tb_data = [];
    // for users app data
    $scope._users_app = [];
    $scope._users_app_top1 = [];
    $scope._users_app_top2 = [];
    $scope._users_app_top3 = [];
    $scope._users_app_data = [];
    $scope._users_appName_top1 = [];
    $scope._users_appName_top2 = [];
    $scope._users_appName_top3 = [];
    $scope._users_app_label = [];
    $scope._users_app_series = [];
    $scope._users_app_option = [];
    //
    var duration = $window.Sugar.Date.range(from, until).every('days').length;
    console.log("duration : "+duration);
    // $("#export").click(function() {
    //     var $btn = $(this);
    //     $btn.button('loading');
    //     // simulating a timeout
    //     setTimeout(function () {
    //         $btn.button('reset');
    //     }, 10000);
    // });
    $scope.back = function () {
        $log.info("back!!");
        $window.location.reload();
        // $route.reload();
        // $location.path('/saisei_report/');
    };
    $scope.export_xls = function(){
            // $(".table2excel").table2excel({
            //     exclude: ".noExl",
            //     name: "Excel Document Name",
            //     filename: "myFileName" + new Date().toISOString().replace(/[\-\:\.]/g, ""),
            //     fileext: ".xls",
            //     exclude_img: true,
            //     exclude_links: true,
            //     exclude_inputs: true
            // });
        var data1 = alasql('SELECT * FROM HTML("#table1",{headers:true})');
        var data2 = alasql('SELECT * FROM HTML("#table2",{headers:true})');
        console.log(data2);
        var data = data1.concat(data2);
        console.log(data);
        alasql('SELECT * INTO CSV("interface.csv",{headers:true, separator:","}) FROM ?', [data1]);
        alasql('SELECT * INTO CSV("user_traffic.csv",{headers:true, separator:","}) FROM ?', [data2]);

        // $("table").tableExport({
        //        headers: true,
        //        footers: false,
        //        formats: ['xlsx'],
        //        filename: 'id',
        //        bootstrap: true,
        //        exportButtons: false,
        //        position: 'bottom',
        //        ignoreRows: null,
        //        ignoreCols: null,
        //        ignoreCSS: '.tableexport-ignore',
        //        emptyCSS: '.tableexport-empty',
        //        trimWhitespace: false
        //    });
    };


    $scope.export = function() {
        // html2canvas(document.getElementById('page_header'), {
        //     onrendered: function (canvas) {
        //         // document.body.appendChild(canvas);
        //         $scope.page_header = canvas.toDataURL();
        //     }
        //     // width: 1200
        // });
        //
        // html2canvas(document.getElementById('int_grp'), {
        //     onrendered: function (canvas) {
        //         // document.body.appendChild(canvas);
        //         $scope.int_grp = canvas.toDataURL();
        //     }
        //     // width: 1200
        // });

        html2canvas(document.getElementById('first_page'), {
            onrendered: function (canvas) {
                // document.body.appendChild(canvas);
                $scope.first_page = canvas.toDataURL();
            }
            // width: 1200
        });
        html2canvas(document.getElementById('second_page'), {
            onrendered: function (canvas) {
                // document.body.appendChild(canvas);
                $scope.second_page = canvas.toDataURL();
            }
        });
        html2canvas(document.getElementById('third_page'), {
            onrendered: function (canvas){
                $scope.third_page = canvas.toDataURL();
                size.first_page.width = $('#first_page').width();
                size.first_page.height = $('#first_page').height();
                size.second_page.width = $('#second_page').width();
                size.second_page.height = $('#second_page').height();
                size.third_page.width = $('#third_page').width();
                size.third_page.height = $('#third_page').height();
                // var first_page_width = Math.ceil(size.first_page.width / ratio);
                // var first_page_height = Math.ceil((size.first_page.height / size.first_page.width) * first_page_width);
                // var second_page_width = Math.ceil(size.second_page.width / ratio);
                // var second_page_height = Math.ceil((size.second_page.height / size.second_page.width) * second_page_width);

                console.log(size.first_page.width+" : "+size.first_page.height+" : "+size.second_page.height+" : "+size.second_page.height);
                // (original height / original width) x new_width = new_height
                if (duration >= 20) {
                   var ratio = 3.2;
                } else if ( 10 < duration && duration < 20) {
                   var ratio = 2.8;
                } else {
                   var ratio = 2.5;
                }
                $scope.docConfig = {
                    content: [
                        {
                            image: $scope.first_page,
                            width: Math.ceil(size.first_page.width / ratio),
                            height: Math.ceil((size.first_page.height / size.first_page.width) * Math.ceil(size.first_page.width / ratio)),
                            // margin: [left, top, right, bottom]
                            margin: [0, 20, 0, 0],
                            pageBreak: 'after'
                        },
                        {
                            image: $scope.second_page,
                            width: Math.ceil(size.second_page.width / ratio),
                            height: Math.ceil((size.second_page.height / size.second_page.width) * Math.ceil(size.second_page.width / ratio)),
                            margin: [0, 5, 0, 0],
                            pageBreak: 'after'
                        },
                        {
                            image: $scope.third_page,
                            width: Math.ceil(size.third_page.width / ratio),
                            height: Math.ceil((size.third_page.height / size.third_page.width) * Math.ceil(size.third_page.width / ratio)),
                            margin: [0, 5, 0, 0]
                        }
                    ]
                };
                console.log("ratio : " + ratio);
                pdfMake.createPdf($scope.docConfig).download("test.pdf",function() { alert('pdf 다운로드가 완료 되었습니다!'); });
            }
        });
    };

    ReportData.getIntRcvData(function(data){

        $scope._history_length_rcv_rate = data['data']['collection'][0]['_history_length_receive_rate'];
        $scope._history_rcv = data['data']['collection'][0]['_history_receive_rate'];
        // $log.info(data['data']['collection'][0]);
        // $log.info(data['data']['collection'][0]['name']);

        $scope.int_name = data['data']['collection'][0]['name'];
        // $scope.t = new Date( _history_rcv_rate[0] );
        // $scope.receive_time = t.toLocaleString();
        // // receive_time = $moment(data['data']['collection'][0]['_history_receive_rate'][0][0], "dd.mm.yyyy hh:MM:ss").fromNow();
        // $scope.receive_rate = _history_rcv_rate[1];

        // var start_day = moment(_from).format('DD');
        // var end_day = moment(_until).format('DD');

        // set date with from
        var from_date = new $window.Sugar.Date(from);
        var _from_date = new $window.Sugar.Date(from);

        // add date
        $scope.int_date.push(from_date.format("%F"));
        $scope.int_cmp_date.push(_from_date.format("%m-%d"));

        // add date to array
        for (var j = 0; j < duration-1; j++) {
            // $log.info(from_date.addDays(1).format("%F"));
            // $log.info(_from_date.addDays(1).format("%m-%d"));
            $scope.int_date.push(from_date.addDays(1).format("%F").raw);
            $scope.int_cmp_date.push(_from_date.addDays(1).format("%m-%d"));
            // $log.info($window.Sugar.Date.create(from).addDays(j).format("%d") );
            // $scope.int_date.push(moment(_until).format('DD'));
            // console.log(moment().add(j, 'days').format('DD'));
        }

        for(var i = 0; i < $scope._history_length_rcv_rate; i++){
            if (i % 100 === 0) {
                $scope.t = new Date($scope._history_rcv[i][0]);
                $scope.label.push($scope.t.toLocaleString());
                $scope.data_rcv_rate.push(Math.round($scope._history_rcv[i][1]*0.001));
            }
            $scope.raw_label.push($scope._history_rcv[i][0]);
            $scope.raw_data_rcv_rate.push($scope._history_rcv[i][1]);
        }

        // init array
        for (var j = 0; j < duration; j++) {
            $scope.rcv_tot.push(0);
            $scope.rcv_len.push(0);
        }
        // calculate total rcv of interface
        for (var j = 0; j < duration; j++) {
            for (var i = 0; i < $scope._history_length_rcv_rate; i++) {
                if ($scope.int_cmp_date[j].raw === moment($scope._history_rcv[i][0]).format('MM-DD')) {
                    $scope.rcv_tot[j] += $scope._history_rcv[i][1];
                    $scope.rcv_len[j] += 1;
                }
            }
            // console.log($scope.rcv_tot[j]);
            // console.log($scope.rcv_len[j]);
        }

        for (var j = 0; j < duration; j++) {
            $scope.int_rcv_avg.push($scope.rcv_tot[j] / $scope.rcv_len[j]);
        }
        $log.info("length of today : " + $scope.add_rcv_length);

        ReportData.getIntTrsData(function(data){
            $scope._history_length_trs_rate = data['data']['collection'][0]['_history_length_transmit_rate'];
            $scope._history_trs = data['data']['collection'][0]['_history_transmit_rate'];

            for(var i = 0; i < $scope._history_length_trs_rate; i++){
                if (i % 100 === 0) {
                    // $scope.t = new Date($scope._history_trs[i][0]);
                    // $scope.labels.push($scope.t.toLocaleString());
                    $scope.data_trs_rate.push(Math.round($scope._history_trs[i][1]*0.001));
                }
                $scope.raw_data_trs_rate.push($scope._history_trs[i][1]);
            }

            for (var j = 0; j < duration; j++) {
                $scope.trs_tot.push(0);
                $scope.trs_len.push(0);
            }
            // get tot of trs of interface
            for (var j = 0; j < duration; j++) {
                for (var i = 0; i < $scope._history_length_trs_rate; i++) {
                    if ($scope.int_cmp_date[j].raw === moment($scope._history_trs[i][0]).format('MM-DD')) {
                        $scope.trs_tot[j] += $scope._history_trs[i][1];
                        $scope.trs_len[j] += 1;
                    }
                }
            }
            // get avg of trs of interfaces
            for (var j = 0; j < duration; j++) {
                $scope.int_trs_avg.push($scope.trs_tot[j] / $scope.trs_len[j]);
            }

            // $scope.int_data =[{
            //     "date": $scope.int_date,
            //     "rcv_avg": $scope.int_rcv_avg,
            //     "trs_avg": $scope.int_trs_avg
            // }];
            // $scope.int_data =[
            //     $scope.int_date,
            //     $scope.int_rcv_avg,
            //     $scope.int_trs_avg
            // ];


            for (var k = 0; k < $scope.int_date.length; k++){
                $scope.int_data.push({
                    date : $scope.int_date[k],
                    rcv_avg : Math.round($scope.int_rcv_avg[k]*0.001),
                    trs_avg : Math.round($scope.int_trs_avg[k]*0.001)
                });
            }

            // setting interface data for graph
            $scope.data = [
                $scope.data_rcv_rate,
                $scope.data_trs_rate
            ];
            // get max
            $scope.int_rcv_max = Math.max.apply(null, $scope.data_rcv_rate);
            $scope.int_trs_max = Math.max.apply(null, $scope.data_trs_rate);
            $scope.int_max = Math.max.apply(null, [$scope.int_rcv_max, $scope.int_trs_max]);
            $scope.options = {
                scales: {
                    yAxes: [
                        {
                            id: 'y-axis-1',
                            type: 'linear',
                            display: true,
                            position: 'left',
                            scaleLabel: {
                                display: true,
                                fontSize: 20,
                                labelString: '수신(Mbit/s)'
                            },
                            ticks: {
                                max: Math.ceil($scope.int_max*0.001)*1000,
                                min: 0,
                                beginAtZero: true
                            }
                        },
                        {
                            id: 'y-axis-2',
                            type: 'linear',
                            display: true,
                            position: 'right',
                            scaleLabel: {
                                display: true,
                                fontSize: 20,
                                labelString: '송신(Mbit/s)'
                            },
                            ticks: {
                                max: Math.ceil($scope.int_max*0.001)*1000,
                                min: 0,
                                beginAtZero: true
                            }
                        }
                    ]
                }
            };
            console.log("int-max : "+$scope.int_rcv_max+" , "+$scope.int_trs_max+" , "+$scope.int_max);
            ReportData.getUserdata(function(data) {
                console.log(data);
                var _users = data['data']['collection'];

                for (var i = 0; i < _users.length; i++) {
                    $scope._users_label.push(_users[i]['name']);
                    var user_from = new Date(_users[i]['from']);
                    user_from.setHours(user_from.getHours()+9);
                    // console.log(t_from.toLocaleString());
                    $scope._users_from.push(user_from.toLocaleString());
                    var user_until = new Date(_users[i]['until']);
                    // user_until.setHours(user_until.getHours()+9);
                    $scope._users_until.push(user_until.setHours(user_until.getHours()+9));
                    $scope._users_total.push(Math.round(_users[i]['total_rate']*0.001));
                    $scope._users_download.push(Math.round(_users[i]['dest_smoothed_rate']*0.001));
                    $scope._users_upload.push(Math.round(_users[i]['source_smoothed_rate']*0.001));

                    //
                    $scope._users_tb_data.push({
                        name : _users[i]['name'],
                        from : user_from.toLocaleString(),
                        until : user_until.toLocaleString(),
                        total : Math.round(_users[i]['total_rate']*0.001),
                        down : Math.round(_users[i]['dest_smoothed_rate']*0.001),
                        up : Math.round(_users[i]['source_smoothed_rate']*0.001)
                    });
                }
                $scope._users_data = [$scope._users_total, $scope._users_download, $scope._users_upload];

                $scope._users_option = {
                    scales: {
                        yAxes: [
                            {
                                scaleLabel: {
                                    display: true,
                                    fontSize: 20,
                                    labelString: '내부사용자'
                                }
                            }
                        ],
                        xAxes: [
                            {
                                scaleLabel: {
                                    display: true,
                                    fontSize: 20,
                                    labelString: '사용량(Mbit/s)'
                                }
                            }
                        ]
                    }
                };

                // for (var i = 0; i < _users.length; i++) {
                //
                // }
                console.log($scope._users_tb_data);
                for (var i = 0; i < $scope._users_label.length; i++) {
                    // $scope._users_app_username.push($scope._users_label[i]);
                    // console.log($scope._users_app_username);
                    UserAppData.getUserAppData($scope._users_label[i]).then(function(data){
                        var top1_from = new Date(data['data']['collection'][0]['from']);
                        top1_from.setHours(top1_from.getHours()+9);
                        var top1_until = new Date(data['data']['collection'][0]['until']);
                        top1_until.setHours(top1_until.getHours()+9);
                        var top2_from = new Date(data['data']['collection'][1]['from']);
                        top2_from.setHours(top2_from.getHours()+9);
                        var top2_until = new Date(data['data']['collection'][1]['until']);
                        top2_until.setHours(top2_until.getHours()+9);
                        var top3_from = new Date(data['data']['collection'][2]['from']);
                        top3_from.setHours(top3_from.getHours()+9);
                        var top3_until = new Date(data['data']['collection'][2]['until']);
                        top3_until.setHours(top3_until.getHours()+9);
                        // console.log(data['data']['collection'][0].link.href.split('/')[6]);
                        $scope._users_app.push({
                            "user_name": data['data']['collection'][0].link.href.split('/')[6],
                            // "from": t_from.toLocaleString(),
                            // "until": t_until.toLocaleString(),
                            "top1_app_name": data['data']['collection'][0]['name'],
                            "top1_app_total": Math.round(data['data']['collection'][0]['total_rate'] * 0.001),
                            "top1_app_from": top1_from.toLocaleString(),
                            "top1_app_until": top1_until.toLocaleString(),
                            "top2_app_name": data['data']['collection'][1]['name'],
                            "top2_app_total": Math.round(data['data']['collection'][1]['total_rate'] * 0.001),
                            "top2_app_from": top2_from.toLocaleString(),
                            "top2_app_until": top2_until.toLocaleString(),
                            "top3_app_name": data['data']['collection'][2]['name'],
                            "top3_app_total": Math.round(data['data']['collection'][2]['total_rate'] * 0.001),
                            "top3_app_from": top3_from.toLocaleString(),
                            "top3_app_until": top3_until.toLocaleString()
                        });
                        $scope._users_app.sort(function(a, b) { // 내림차순
                            return b['top1_app_total'] - a['top1_app_total'];
                        });
                        $scope._users_app_top1.push(Math.round(data['data']['collection'][0]['total_rate'] * 0.001));
                        $scope._users_app_top2.push(Math.round(data['data']['collection'][1]['total_rate'] * 0.001));
                        $scope._users_app_top3.push(Math.round(data['data']['collection'][2]['total_rate'] * 0.001));
                        $scope._users_appName_top1.push(data['data']['collection'][0]['name']);
                        $scope._users_appName_top2.push(data['data']['collection'][1]['name']);
                        $scope._users_appName_top3.push(data['data']['collection'][2]['name']);
                        $rootScope._users_app_top1 = $scope._users_app_top1;
                        $scope._users_app_label.push(data['data']['collection'][0].link.href.split('/')[6]+"("
                            +"1."+ data['data']['collection'][0]['name']+","
                            +"2."+ data['data']['collection'][1]['name']+","
                            +"3."+ data['data']['collection'][2]['name']+")"
                        );

                    })
                }
                console.log($scope._users_app);
                // for (var k = 0; k < $scope._users_app.length; k++) {
                //     // console.log("forforforfordaslkjlkdsajflkjsdalkfjlksdaf");
                //     console.log($scope._users_app[k]);
                //     $scope._users_app_top1.push($scope._users_app[k].top1_app_total);
                //     // $scope._users_app_top2.push(Math.round(data['data']['collection'][1]['total_rate'] * 0.001));
                //     // $scope._users_app_top3.push(Math.round(data['data']['collection'][2]['total_rate'] * 0.001));
                //     // $scope._users_appName_top1.push(data['data']['collection'][0]['name']);
                //     // $scope._users_appName_top2.push(data['data']['collection'][1]['name']);
                //     // $scope._users_appName_top3.push(data['data']['collection'][2]['name']);
                //     // $rootScope._users_app_top1 = $scope._users_app_top1;
                //     // $scope._users_app_label.push(data['data']['collection'][0].link.href.split('/')[6]);
                // }
                // console.log($scope._users_app_top1);

                $scope._users_app_data = [
                    $scope._users_app_top1,
                    $scope._users_app_top2,
                    $scope._users_app_top3
                ];
                // $scope._users_app_series= [
                //     $scope._users_appName_top1,
                //     $scope._users_appName_top2,
                //     $scope._users_appName_top3
                // ];
                $scope._users_app_series= ["TOP APP 1", "TOP APP 2", "TOP APP 3"];
                $scope._users_app_option = {
                    scales: {
                        xAxes: [
                            {
                                scaleLabel: {
                                    display: true,
                                    fontSize: 14,
                                    labelString: 'APP 사용량(Mbit/s)'
                                }
                            }
                        ],
                        yAxes: [
                            {
                                scaleLabel: {
                                    display: true,
                                    fontSize: 14,
                                    labelString: '사용자(Top1,Top2,Top3)'
                                }
                            }
                        ]
                    }
                };
                console.log($scope._users_app_data, $scope._users_app_series, $scope._users_app_label);
                // console.log($scope._users_app);
            });
            console.log($scope._users_label);

        });

        // for interface graph
        $scope.labels = $scope.label;
        $scope.series = ['수신(단위:Mbit/s)', '송신(단위:Mbit/s)'];
        $scope.colors = ['#ff6384', '#45b7cd', '#ffe200'];
        $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
    });
    console.log($scope._users_label);

});