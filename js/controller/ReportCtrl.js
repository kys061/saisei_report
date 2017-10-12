'use strict';

reportApp.controller('ReportCtrl', function ReportCtrl($rootScope, $scope, $log, ReportData, SharedData, UserAppData, $location, $route, $window) {

    $scope.$on('$routeChangeStart', function (scope, next, current) {
        SharedData.setCurrentState(true);
        console.log("change back");
        $location.path('/');
        $window.location.href='/saisei_report/';
        // if (next.$$route.controller != "Your Controller Name") {
        //     // Show here for your model, and do what you need**
        // }
    });
    var from = SharedData.getFrom();
    var until = SharedData.getUntil();
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
    var _from = new Date(from);
    var _until = new Date(until);
    // set local date(kr)
    $scope.from = _from.toLocaleString();
    $scope.until = _until.toLocaleString();
    /******************************************************************************************************************/
    /* 인터페이스 수신 데이터 변수
    /******************************************************************************************************************/
    $scope.label = [];
    // $scope.raw_label = [];
    $scope.data_rcv_rate = [];
    // $scope.raw_data_rcv_rate = [];
    // init date vars
    $scope.int_date = [];
    $scope.int_cmp_date = [];
    // init rcv data vars
    $scope.int_rcv_avg = [];
    $scope.rcv_tot = [];
    $scope.rcv_len = [];
    /******************************************************************************************************************/
    /* 인터페이스 송신 데이터 변수
    /******************************************************************************************************************/
    $scope.data_trs_rate = [];
    // $scope.raw_data_trs_rate = [];
    // init trs data vars
    $scope.int_trs_avg = [];
    $scope.trs_tot = [];
    $scope.trs_len = [];
    // setting interface data for table
    $scope.int_data = [];
    /******************************************************************************************************************/
    /* 사용자 전체 사용량 데이터 변수
    /******************************************************************************************************************/
    // for users data
    $scope._users_label = [];
    $scope._users_from = [];
    $scope._users_until = [];
    $scope._users_series = ['총사용량(단위:Mbit/s)', '다운로드 사용량(단위:Mbit/s)', '업로드 사용량(단위:Mbit/s)'];
    $scope._users_total = [];
    $scope._users_download = [];
    $scope._users_upload = [];
    $scope._users_tb_data = [];
    /******************************************************************************************************************/
    /* 사용자-어플리케이션 TOP3 데이터 변수
    /******************************************************************************************************************/
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

    var duration = $window.Sugar.Date.range(from, until).every('days').length;
    $scope.back = function () {
        $window.location.reload();
    };
    $scope.export_xls = function(){
        var data1 = alasql('SELECT * FROM HTML("#table1",{headers:true})');
        var data2 = alasql('SELECT * FROM HTML("#table2",{headers:true})');
    var data3 = alasql('SELECT * FROM HTML("#table3",{headers:true})');

    alasql('SELECT * INTO CSV("interface.csv",{headers:true, separator:","}) FROM ?', [data1]);
    alasql('SELECT * INTO CSV("user_traffic.csv",{headers:true, separator:","}) FROM ?', [data2]);
    alasql('SELECT * INTO CSV("user_app_traffic.csv",{headers:true, separator:","}) FROM ?', [data3]);

    notie.alert({ type: 'error', text: 'csv파일이 생성되었습니다!' });


    };


    $scope.export = function() {
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

                console.log(size.first_page.width+" : "+size.first_page.height+" : "+size.second_page.height+" : "+size.second_page.height);
                // formular : (original height / original width) x new_width = new_height
                if (duration >= 20) {
                   var ratio = 3;
                } else if ( 10 < duration && duration < 20) {
                   var ratio = 2.6;
                } else {
                   var ratio = 2.2;
                }
                $scope.docConfig = {
                    content: [
                        {
                            image: $scope.first_page,
                            width: Math.ceil(size.first_page.width / ratio),
                            height: Math.ceil((size.first_page.height / size.first_page.width) * Math.ceil(size.first_page.width / ratio)),
                            // margin: [left, top, right, bottom]
                            margin: [0, 0, 0, 0],
                            pageBreak: 'after'
                        },
                        {
                            image: $scope.second_page,
                            width: Math.ceil(size.second_page.width / ratio),
                            height: Math.ceil((size.second_page.height / size.second_page.width) * Math.ceil(size.second_page.width / ratio)),
                            margin: [0, 15, 0, 0],
                            pageBreak: 'after'
                        },
                        {
                            image: $scope.third_page,
                            width: Math.ceil(size.third_page.width / ratio),
                            height: Math.ceil((size.third_page.height / size.third_page.width) * Math.ceil(size.third_page.width / ratio)),
                            margin: [0, 15, 0, 0]
                        }
                    ]
                };
                console.log("ratio : " + ratio);
                pdfMake.createPdf($scope.docConfig).download("test.pdf",function() {
                    // alert('pdf 다운로드가 완료 되었습니다!');
                    // notie.confirm({ text: 'pdf를 다운 받으시겠습니까?' }, function() {
                        notie.alert({ type: 'error', text: 'pdf 다운로드가 완료 되었습니다!!' });
                    // });

                });
            }
        });
    };

    ReportData.getIntRcvData(function(data){
        /**********************************/
        /* RCV DATA OF INTERFACE          */
        /**********************************/
        $scope._history_length_rcv_rate = data['data']['collection'][0]['_history_length_receive_rate'];
        $scope._history_rcv = data['data']['collection'][0]['_history_receive_rate'];
        $scope.int_name = data['data']['collection'][0]['name'];

        // set date with from
        var from_date = new $window.Sugar.Date(from);
        var _from_date = new $window.Sugar.Date(from);

        // add date
        $scope.int_date.push(from_date.format("%F"));
        $scope.int_cmp_date.push(_from_date.format("%m-%d"));


        /**********************************/
        /* make date array for compare date
        /**********************************/
        for (var j = 0; j < duration-1; j++) {
            $scope.int_date.push(from_date.addDays(1).format("%F").raw);
            $scope.int_cmp_date.push(_from_date.addDays(1).format("%m-%d"));
        }
        /* make array
           1. label : date,
           2. data_rcv_rate : interface rcv,
        */

        for(var i = 0; i < $scope._history_length_rcv_rate; i++){
            if (i % 100 === 0) {
                $scope.t = new Date($scope._history_rcv[i][0]);
                $scope.label.push($scope.t.toLocaleString());
                $scope.data_rcv_rate.push(Math.round($scope._history_rcv[i][1]*0.001));
            }
            // $scope.raw_label.push($scope._history_rcv[i][0]);
            // $scope.raw_data_rcv_rate.push($scope._history_rcv[i][1]);
        }
        /*
           1. rcv_tot : total for interface rcv,
           2. rcv_len : length for interface rcv,
        */
        for (var j = 0; j < duration; j++) {
            $scope.rcv_tot.push(0);
            $scope.rcv_len.push(0);
        }
        for (var j = 0; j < duration; j++) {
            for (var i = 0; i < $scope._history_length_rcv_rate; i++) {
                if ($scope.int_cmp_date[j].raw === moment($scope._history_rcv[i][0]).format('MM-DD')) {
                    $scope.rcv_tot[j] += $scope._history_rcv[i][1];
                    $scope.rcv_len[j] += 1;
                }
            }
        }
        /* make average
           1. int_rcv_avg : average for interface rcv
        */
        for (var j = 0; j < duration; j++) {
            $scope.int_rcv_avg.push($scope.rcv_tot[j] / $scope.rcv_len[j]);
        }

        ReportData.getIntTrsData(function(data){
            /**********************************/
            /* TRS DATA OF INTERFACE          */
            /**********************************/
            $scope._history_length_trs_rate = data['data']['collection'][0]['_history_length_transmit_rate'];
            $scope._history_trs = data['data']['collection'][0]['_history_transmit_rate'];
            /* make trs rate
               1. data_trs_rate : total rate for trs interface
            */
            for(var i = 0; i < $scope._history_length_trs_rate; i++){
                if (i % 100 === 0) {
                    $scope.data_trs_rate.push(Math.round($scope._history_trs[i][1]*0.001));
                }
                // $scope.raw_data_trs_rate.push($scope._history_trs[i][1]);
            }
            /*
               1. trs_tot : total for interface trs,
               2. trs_len : length for interface trs,
            */
            for (var j = 0; j < duration; j++) {
                $scope.trs_tot.push(0);
                $scope.trs_len.push(0);
            }
            for (var j = 0; j < duration; j++) {
                for (var i = 0; i < $scope._history_length_trs_rate; i++) {
                    if ($scope.int_cmp_date[j].raw === moment($scope._history_trs[i][0]).format('MM-DD')) {
                        $scope.trs_tot[j] += $scope._history_trs[i][1];
                        $scope.trs_len[j] += 1;
                    }
                }
            }
            /* make average
               1. int_trs_avg : average for interface rcv
            */
            for (var j = 0; j < duration; j++) {
                $scope.int_trs_avg.push($scope.trs_tot[j] / $scope.trs_len[j]);
            }
            /* make all data for interface to use table
               1. int_data : date, rcv, trs
            */
            for (var k = 0; k < $scope.int_date.length; k++){
                $scope.int_data.push({
                    date : $scope.int_date[k],
                    rcv_avg : Math.round($scope.int_rcv_avg[k]*0.001),
                    trs_avg : Math.round($scope.int_trs_avg[k]*0.001)
                });
            }
            // interface rate for graph
            $scope.data = [
                $scope.data_rcv_rate,
                $scope.data_trs_rate
            ];
            // get max for y-axis
            $scope.int_rcv_max = Math.max.apply(null, $scope.data_rcv_rate);
            $scope.int_trs_max = Math.max.apply(null, $scope.data_trs_rate);
            $scope.int_max = Math.max.apply(null, [$scope.int_rcv_max, $scope.int_trs_max]);
            // set options for grp
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
                                fontSize: 14,
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
                                fontSize: 14,
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

            ReportData.getUserdata(function(data) {
                /**********************************/
                /* USER TOTAL RATE OF INTERFACE          */
                /**********************************/
                var _users = data['data']['collection'];
                /*
                   1. _users_label : username for user graph,
                   2. _users_from : start local date,
                   3. _users_until : end local date,
                   4. _users_total : total rate,
                   5. _users_download : dest_smoothed_rate,
                   6. _users_upload : source_smoothed_rate,
                   7. _users_tb_data : all data for table,
                   8. _users_data : all data for user graph,
                   9. _users_option : option for user graph,
                   10.
                */
                for (var i = 0; i < _users.length; i++) {
                    $scope._users_label.push(_users[i]['name']);
                    var user_from = new Date(_users[i]['from']);
                    user_from.setHours(user_from.getHours()+9);
                    $scope._users_from.push(user_from.toLocaleString());
                    var user_until = new Date(_users[i]['until']);
                    $scope._users_until.push(user_until.setHours(user_until.getHours()+9));
                    $scope._users_total.push(Math.round(_users[i]['total_rate']*0.001));
                    $scope._users_download.push(Math.round(_users[i]['dest_smoothed_rate']*0.001));
                    $scope._users_upload.push(Math.round(_users[i]['source_smoothed_rate']*0.001));
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
                                    fontSize: 14,
                                    labelString: '내부사용자'
                                }
                            }
                        ],
                        xAxes: [
                            {
                                scaleLabel: {
                                    display: true,
                                    fontSize: 14,
                                    labelString: '사용량(Mbit/s)'
                                }
                            }
                        ]
                    }
                };

                for (var i = 0; i < $scope._users_label.length; i++) {
                    /**********************************/
                    /* USER-APP DATA                  */
                    /**********************************/
                    UserAppData.getUserAppData($scope._users_label[i]).then(function(data){
                        /*
                            1. top1_from, top1_until
                            2. top2_from, top2_until
                            3. top3_from, top3_until
                            4. _users_app : user_app all data for table
                            5. _users_app_top1, _users_app_top2, _users_app_top3 : app total rate data for graph
                            6. _users_appName_top1, _users_appName_top2, _users_appName_top3 : app name for graph
                            7. _users_app_label : user name and app name for graph
                            8. _users_app_option : options for graph
                        */
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
                        $scope._users_app.sort(function(a, b) { // DESC
                            return b['top1_app_total'] - a['top1_app_total'];
                        });
                        $scope._users_app_top1.push(Math.round(data['data']['collection'][0]['total_rate'] * 0.001));
                        $scope._users_app_top2.push(Math.round(data['data']['collection'][1]['total_rate'] * 0.001));
                        $scope._users_app_top3.push(Math.round(data['data']['collection'][2]['total_rate'] * 0.001));
                        $scope._users_appName_top1.push(data['data']['collection'][0]['name']);
                        $scope._users_appName_top2.push(data['data']['collection'][1]['name']);
                        $scope._users_appName_top3.push(data['data']['collection'][2]['name']);
                        // $rootScope._users_app_top1 = $scope._users_app_top1;
                        $scope._users_app_label.push(data['data']['collection'][0].link.href.split('/')[6]+"("
                            +"1."+ data['data']['collection'][0]['name']+","
                            +"2."+ data['data']['collection'][1]['name']+","
                            +"3."+ data['data']['collection'][2]['name']+")"
                        );

                    })
                }
                $scope._users_app_data = [
                    $scope._users_app_top1,
                    $scope._users_app_top2,
                    $scope._users_app_top3
                ];
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
                                    labelString: '사용자 어플리케이션(Top1,Top2,Top3)'
                                }
                            }
                        ]
                    }
                };
            });
        });
        // for interface graph
        $scope.labels = $scope.label;
        $scope.series = ['수신(단위:Mbit/s)', '송신(단위:Mbit/s)'];
        $scope.colors = ['#ff6384', '#45b7cd', '#ffe200'];
        $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
    });
});