/*! saisei_report - v1.0.0 - 2017-10-17 */ 
'use strict';

var reportApp = angular.module('reportApp', [
    "ngRoute", 'base64', 'chart.js', 'angular-momentjs', 'angular-loading-bar',
    'angularjs-datetime-picker', 'angularjs-dropdown-multiselect'
])
    .config(function($routeProvider, $locationProvider, $momentProvider) {
        $momentProvider
            .asyncLoading(false)
            .scriptUrl('./lib/moment.min.js');
        $routeProvider
            // .when('/', {
            //     templateUrl: "index.html",
            //     controller: "MainCtrl"
            // })
            .when('/report', {
                templateUrl: "templates/report.html",
                controller: "ReportCtrl"
            })
            .otherwise({
                redirectTo: '/'
            });
        $locationProvider.html5Mode(true);
    })
    .config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
        cfpLoadingBarProvider.latencyThreshold = 1200;
        cfpLoadingBarProvider.parentSelector = '#loading-bar-container';
        cfpLoadingBarProvider.spinnerTemplate = '<div id="loading-bar-spinner"><div class="spinner-icon"></div></div>';
    }]).run(function($rootScope) {
        $rootScope.users_app_top1 = [];
    });
reportApp.controller('MainCtrl', function MainCtrl($scope, $log, $route, $templateCache, $location, $window, SharedData) {
    var from;
    var until;
    var today = new $window.Sugar.Date(new Date());
    $scope.select2model = [];
    $scope.select2data = [
        {
            id: 1,
            label: "인터페이스 트래픽"
        },
        {
            id: 2,
            label: "사용자 트래픽"
        },
        {
            id: 3,
            label: "사용자-어플리케이션 트래픽"
        }
    ];
    $scope.select2settings = {};
    // $scope.currentState = SharedData.getCurrentState();
    $scope.currentState = true;
    $scope.currentDurationState = SharedData.currentDurationState;
    $scope.$watch('date_from', function(val) {
        from = val;
        console.log(val);
        // $scope.from = new Date(val);
    });
    $scope.$watch('date_until', function(val) {
        until = val;
        console.log(val);
        // $scope.until = new Date(val);
    });

    $scope.sendDate = function() {
        var duration = $window.Sugar.Date.range(from, until).every('days').length;
        console.log(duration);
        var _until = new $window.Sugar.Date(until);
        var _from = new $window.Sugar.Date(from);
        console.log("from : until -> " + _from.raw + ':' + _until.raw);
        if (from === undefined || until === undefined) {
            notie.alert({
                type: 'error',
                text: '리포트 기간을 넣어주세요!!!'
            })
        } else if (duration > 31) {
            notie.alert({
                type: 'error',
                text: '리포트 기간은 최대 한달까지 가능합니다!!'
            })
        } else if (_until.isFuture().raw) {
            notie.alert({
                type: 'error',
                text: '리포트 종료 시점은 현재보다 미래로 설정할 수 없습니다!!'
            })
        } else if (_from.isFuture().raw) {
            notie.alert({
                type: 'error',
                text: '리포트 시작 시점은 현재보다 미래로 설정할 수 없습니다!!'
            })
        } else {
            $scope.currentState = false;
            $scope.currentDurationState = false;
            SharedData.setFrom(from);
            SharedData.setUntil(until);
            $location.path('/report');
        }
        // var currentPageTemplate = $route.current.templateUrl;
        // $templateCache.remove(currentPageTemplate);
        // $route.reload();
    };
});
reportApp.controller('ReportCtrl', function ReportCtrl($rootScope, $scope, $log, ReportData, SharedData, UserAppData, $location, $route, $window, cfpLoadingBar) {
    $scope.$on('$routeChangeStart', function(scope, next, current) {
        SharedData.setCurrentState(true);
        console.log("change back");
        $location.path('/');
        $window.location.href = '/saisei_report/';
    });
    $scope.complete_count = 0;
    $scope.complete_check_count = 13; // 나중에 계산 수식 필요~!!
    $rootScope.$on('cfpLoadingBar:loaded', function() {
        $scope.complete_count += 1;
        console.log("complete_count : " + $scope.complete_count);
    });

    $rootScope.$on('cfpLoadingBar:completed', function() {
        if ($scope.complete_count === $scope.complete_check_count) {
            notie.alert({
                type: 'info',
                stay: 'true',
                time: 30,
                text: 'SAISEI 트래픽 보고서가 완성 되었습니다!!!'
            });
        }
    });

    var from = SharedData.getFrom();
    var until = SharedData.getUntil();
    console.log(from + " - " + until);
    //get div size init
    var size = {};
    size.first_page = {};
    size.second_page = {};
    size.third_page = {};
    // set date
    // ReportData.setFrom(from);
    // ReportData.setUntil(until);
    // UserAppData.setFrom(from);
    // UserAppData.setUntil(until);
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
    $scope.back = function() {
        $window.location.reload();
    };
    $scope.export_xls = function() {
        var data1 = alasql('SELECT * FROM HTML("#table1",{headers:true})');
        var data2 = alasql('SELECT * FROM HTML("#table2",{headers:true})');
        var data3 = alasql('SELECT * FROM HTML("#table3",{headers:true})');

        alasql('SELECT * INTO CSV("interface.csv",{headers:true, separator:","}) FROM ?', [data1]);
        alasql('SELECT * INTO CSV("user_traffic.csv",{headers:true, separator:","}) FROM ?', [data2]);
        alasql('SELECT * INTO CSV("user_app_traffic.csv",{headers:true, separator:","}) FROM ?', [data3]);

        notie.alert({
            type: 'error',
            text: 'csv파일이 생성되었습니다!'
        });


    };


    $scope.export = function() {
        html2canvas(document.getElementById('first_page'), {
            onrendered: function(canvas) {
                // document.body.appendChild(canvas);
                $scope.first_page = canvas.toDataURL();
            }
            // width: 1200
        });
        html2canvas(document.getElementById('second_page'), {
            onrendered: function(canvas) {
                // document.body.appendChild(canvas);
                $scope.second_page = canvas.toDataURL();
            }
        });
        html2canvas(document.getElementById('third_page'), {
            onrendered: function(canvas) {
                $scope.third_page = canvas.toDataURL();
                size.first_page.width = $('#first_page').width();
                size.first_page.height = $('#first_page').height();
                size.second_page.width = $('#second_page').width();
                size.second_page.height = $('#second_page').height();
                size.third_page.width = $('#third_page').width();
                size.third_page.height = $('#third_page').height();

                console.log(size.first_page.width + " : " + size.first_page.height + " : " + size.second_page.height + " : " + size.second_page.height);
                // formular : (original height / original width) x new_width = new_height
                if (duration >= 20) {
                    var ratio = 3;
                } else if (10 < duration && duration < 20) {
                    var ratio = 2.6;
                } else {
                    var ratio = 2.2;
                }
                $scope.docConfig = {
                    content: [{
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
                pdfMake.createPdf($scope.docConfig).download("test.pdf", function() {
                    // alert('pdf 다운로드가 완료 되었습니다!');
                    // notie.confirm({ text: 'pdf를 다운 받으시겠습니까?' }, function() {
                    notie.alert({
                        type: 'error',
                        text: 'pdf 다운로드가 완료 되었습니다!!'
                    });
                    // });

                });
            }
        });
    };

    ReportData.getIntRcvData(function(data) {
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
        for (var j = 0; j < duration - 1; j++) {
            $scope.int_date.push(from_date.addDays(1).format("%F").raw);
            $scope.int_cmp_date.push(_from_date.addDays(1).format("%m-%d"));
        }
        /* make array
           1. label : date,
           2. data_rcv_rate : interface rcv,
        */

        for (var i = 0; i < $scope._history_length_rcv_rate; i++) {
            if (i % 100 === 0) {
                $scope.t = new Date($scope._history_rcv[i][0]);
                $scope.label.push($scope.t.toLocaleString());
                $scope.data_rcv_rate.push(Math.round($scope._history_rcv[i][1] * 0.001));
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

        ReportData.getIntTrsData(function(data) {
            /**********************************/
            /* TRS DATA OF INTERFACE          */
            /**********************************/
            $scope._history_length_trs_rate = data['data']['collection'][0]['_history_length_transmit_rate'];
            $scope._history_trs = data['data']['collection'][0]['_history_transmit_rate'];
            /* make trs rate
               1. data_trs_rate : total rate for trs interface
            */
            for (var i = 0; i < $scope._history_length_trs_rate; i++) {
                if (i % 100 === 0) {
                    $scope.data_trs_rate.push(Math.round($scope._history_trs[i][1] * 0.001));
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
            for (var k = 0; k < $scope.int_date.length; k++) {
                $scope.int_data.push({
                    date: $scope.int_date[k],
                    rcv_avg: Math.round($scope.int_rcv_avg[k] * 0.001),
                    trs_avg: Math.round($scope.int_trs_avg[k] * 0.001)
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
                    yAxes: [{
                        id: 'y-axis-1',
                        type: 'linear',
                        display: true,
                        position: 'left',
                        scaleLabel: {
                            display: true,
                            fontSize: 14,
                            labelString: '수신(Mbit/s)',
                            fontStyle: "bold"
                        },
                        ticks: {
                            max: Math.ceil($scope.int_max * 0.001) * 1000,
                            min: 0,
                            beginAtZero: true,
                            fontSize: 12,
                            fontStyle: "bold"
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
                                labelString: '송신(Mbit/s)',
                                fontStyle: "bold"
                            },
                            ticks: {
                                max: Math.ceil($scope.int_max * 0.001) * 1000,
                                min: 0,
                                beginAtZero: true,
                                fontSize: 12,
                                fontStyle: "bold"
                            }
                        }
                    ],
                    xAxes: [{
                        ticks: {
                            fontSize: 12,
                            fontStyle: "bold"
                        },
                        scaleLabel: {
                            display: true,
                            fontSize: 14,
                            labelString: '시간',
                            fontStyle: "bold"
                        }
                    }]
                }
            };

            ReportData.getUserData(function(data) {
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
                    user_from.setHours(user_from.getHours() + 9);
                    $scope._users_from.push(user_from.toLocaleString());
                    var user_until = new Date(_users[i]['until']);
                    $scope._users_until.push(user_until.setHours(user_until.getHours() + 9));
                    $scope._users_total.push(Math.round(_users[i]['total_rate'] * 0.001));
                    $scope._users_download.push(Math.round(_users[i]['dest_smoothed_rate'] * 0.001));
                    $scope._users_upload.push(Math.round(_users[i]['source_smoothed_rate'] * 0.001));
                    $scope._users_tb_data.push({
                        name: _users[i]['name'],
                        from: user_from.toLocaleString(),
                        until: user_until.toLocaleString(),
                        total: Math.round(_users[i]['total_rate'] * 0.001),
                        down: Math.round(_users[i]['dest_smoothed_rate'] * 0.001),
                        up: Math.round(_users[i]['source_smoothed_rate'] * 0.001)
                    });
                }
                $scope._users_data = [$scope._users_total, $scope._users_download, $scope._users_upload];
                $scope._users_option = {
                    scales: {
                        yAxes: [{
                            ticks: {
                                fontSize: 12,
                                fontStyle: "bold"
                            },
                            scaleLabel: {
                                display: true,
                                fontSize: 14,
                                labelString: '내부사용자',
                                fontStyle: "bold"
                            }
                        }],
                        xAxes: [{
                            ticks: {
                                fontSize: 12,
                                fontStyle: "bold"
                            },
                            scaleLabel: {
                                display: true,
                                fontSize: 14,
                                labelString: '사용량(Mbit/s)',
                                fontStyle: "bold"
                            }
                        }]
                    }
                };

                for (var i = 0; i < $scope._users_label.length; i++) {
                    /**********************************/
                    /* USER-APP DATA                  */
                    /**********************************/
                    UserAppData.getUserAppData($scope._users_label[i]).then(function(data) {
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
                        top1_from.setHours(top1_from.getHours() + 9);
                        var top1_until = new Date(data['data']['collection'][0]['until']);
                        top1_until.setHours(top1_until.getHours() + 9);
                        var top2_from = new Date(data['data']['collection'][1]['from']);
                        top2_from.setHours(top2_from.getHours() + 9);
                        var top2_until = new Date(data['data']['collection'][1]['until']);
                        top2_until.setHours(top2_until.getHours() + 9);
                        var top3_from = new Date(data['data']['collection'][2]['from']);
                        top3_from.setHours(top3_from.getHours() + 9);
                        var top3_until = new Date(data['data']['collection'][2]['until']);
                        top3_until.setHours(top3_until.getHours() + 9);
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
                        $scope._users_app_label.push(data['data']['collection'][0].link.href.split('/')[6] + "(" +
                            "1." + data['data']['collection'][0]['name'] + "," +
                            "2." + data['data']['collection'][1]['name'] + "," +
                            "3." + data['data']['collection'][2]['name'] + ")"
                        );

                    });
                    console.log("status : " + cfpLoadingBar.status());
                }
                $scope._users_app_data = [
                    $scope._users_app_top1,
                    $scope._users_app_top2,
                    $scope._users_app_top3
                ];
                $scope._users_app_series = ["TOP APP 1", "TOP APP 2", "TOP APP 3"];
                $scope._users_app_option = {
                    scales: {
                        xAxes: [{
                            ticks: {
                                fontSize: 12,
                                fontStyle: "bold"
                            },
                            scaleLabel: {
                                display: true,
                                fontSize: 14,
                                labelString: 'APP 사용량(Mbit/s)',
                                fontStyle: "bold"
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                fontSize: 12,
                                fontStyle: "bold"
                            },
                            scaleLabel: {
                                display: true,
                                fontSize: 14,
                                labelString: '사용자 어플리케이션(Top1,Top2,Top3)',
                                fontStyle: "bold"
                            }
                        }]
                    }
                };
            });
        });
        // for interface graph
        $scope.labels = $scope.label;
        $scope.series = ['수신(단위:Mbit/s)', '송신(단위:Mbit/s)'];
        $scope.colors = ['#ff6384', '#45b7cd', '#ffe200'];
        $scope.datasetOverride = [{
            yAxisID: 'y-axis-1'
        }, {
            yAxisID: 'y-axis-2'
        }];
    });
});
reportApp.service('ReportAuth', function($base64) {
    var Auth = function (start) {
        var self = this;
        this.addId = function(id){
            start = start + id;
            return self;
        };
        this.addPasswd = function(pass){
            start = start + ":" + pass;
            return self;
        };
        this.getAuth = function(){
            return {
                "Authorization": "Basic " + $base64.encode(start)
            };
        };
    };
    return Auth;
});
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
reportApp.factory('ReportData', function($http, $log, $base64, $window, ReportFrom, ReportUntil, ReportUrl, ReportQstring, ReportAuth, SharedData) {
    var from = SharedData.getFrom();
    var until = SharedData.getUntil();
    // open sync
    $.ajaxSetup({
        async: false
    });
    // get config
    var result;
    var config = (function() {
        // var result;
        $.getJSON("./config/report-config.json", function(d) {
            console.log(d);
            result = d.config;
        });
        return result;
    })();
    // close sync
    $.ajaxSetup({
        async: true
    });
    // set date and headers
    var rest_from = new ReportFrom("")
        .setFrom(from)
        .getFrom();
    var rest_until = new ReportUntil("")
        .setUntil(until)
        .getUntil();
    var headers = new ReportAuth("")
        .addId(config.common.id)
        .addPasswd(config.common.passwd)
        .getAuth();
    /*
     *   get user's total rate
     */
    function getUserData(successcb) {
        // set urls
        var rest_qstring = new ReportQstring("")
            .addSelect('?select='+config.users_tr.attr)
            .addOrder('&order='+config.users_tr.order)
            .addLimit('&limit='+config.users_tr.limit)
            .addWith('&with='+config.users_tr.with)
            .addFrom('&from='+rest_from)
            .addUntil('&until='+rest_until)
            .getQstring();
        var rest_url = new ReportUrl("")
            .addDefault(config.common.ip, config.common.port, config.common.path)
            .addSection(config.users_tr.section)
            .addQstring(rest_qstring)
            .getUrls();

        $http({
            method: 'GET',
            url: rest_url,
            headers: headers
        }).
        then(function(data, status, headers, config) {
                successcb(data);
            },
            function onError(response) {
                if (response.status < 0) {
                    notie.alert({
                        type: 'error',
                        stay: 'true',
                        time: 3600,
                        text: 'ERROR - 유저 데이터가 존재하지 않습니다.'
                    });
                }
            })
    }
    /*
     *   get interface rcv rate
     */
    function getIntRcvData(successcb) {
        // set urls
        var rest_qstring = new ReportQstring("")
            .addSelect('?select='+config.interface_rcv.attr)
            .addFrom('&from='+rest_from)
            .addOrder('&operation='+config.interface_rcv.operation)
            .addLimit('&history_points='+config.interface_rcv.hist_point)
            .addUntil('&until='+rest_until)
            .getQstring();
        var rest_url = new ReportUrl("")
            .addDefault(config.common.ip, config.common.port, config.common.path)
            .addSection(config.interface_rcv.section)
            .addQstring(rest_qstring)
            .getUrls();

        $http({
            method: 'GET',
            url: rest_url,
            headers: headers
        }).
        then(function(data, status, headers, config) {
                successcb(data);
            },
            function onError(response) {
                console.log(response);
                if (response.status < 0) {
                    notie.alert({
                        type: 'error',
                        stay: 'true',
                        time: 3600,
                        text: 'ERROR - 인터페이스 데이터가 존재하지 않습니다.'
                    });
                    //alert("ERROR! - 데이터가 존재하지 않습니다.");
                }
            })
    }
    /*
     *   get interface trs rate
     */
    function getIntTrsData(successcb) {
        // set urls
        var rest_qstring = new ReportQstring("")
            .addSelect('?select='+config.interface_trs.attr)
            .addFrom('&from='+rest_from)
            .addOrder('&operation='+config.interface_trs.operation)
            .addLimit('&history_points='+config.interface_trs.hist_point)
            .addUntil('&until='+rest_until)
            .getQstring();
        var rest_url = new ReportUrl("")
            .addDefault(config.common.ip, config.common.port, config.common.path)
            .addSection(config.interface_trs.section)
            .addQstring(rest_qstring)
            .getUrls();
        console.log(rest_url);
        $http({
            method: 'GET',
            url: rest_url,
            headers: headers
        }).
        then(function(data, status, headers, config) {
                successcb(data);
                $log.info(data['data']['collection'][0]['_history_length_receive_rate']);
                $log.info(data['data']['collection'][0]['_history_receive_rate']);
            },
            function onError(response) {
                if (response.status < 0) {
                    notie.alert({
                        type: 'error',
                        stay: 'true',
                        time: 3600,
                        text: 'ERROR - 인터페이스 데이터가 존재하지 않습니다.'
                    });
                }
            })
    }
    return {
        getUserData: getUserData,
        getIntRcvData: getIntRcvData,
        getIntTrsData: getIntTrsData
    };
});
reportApp.service('ReportFrom', function() {
    var From = function (start) {
        var self = this;
        this.setFrom = function(_from){
            var from = new Date(_from);
            var _from_yy = moment(from.toUTCString()).utc().format('YYYY');
            var _from_mm = moment(from.toUTCString()).utc().format('MM');
            var _from_dd = moment(from.toUTCString()).utc().format('DD');
            var _from_hh = moment(from.toUTCString()).utc().format('HH');
            var _from_min = moment(from.toUTCString()).utc().format('mm');
            var _from_sec = moment(from.toUTCString()).utc().format('ss');
            start = start+_from_hh+":"+_from_min+":"+_from_sec+"_"+_from_yy+_from_mm+_from_dd;
            return self;
        };
        this.getFrom = function(){
            return start;
        };
    };
    return From;
});
reportApp.service('ReportQstring', function() {
    var Qstring = function (start) {
        var self = this;
        this.addSelect = function(attr){
            start = start + attr;
            return self;
        };
        this.addOrder = function(order){
            start = start + order;
            return self;
        };
        this.addLimit = function(limit){
            start = start + limit;
            return self;
        };
        this.addWith = function(_with){
            start = start + _with;
            return self;
        };
        this.addFrom = function(from){
            start = start + from;
            return self;
        };
        this.addUntil = function(until){
            start = start + until;
            return self;
        };
        this.getQstring = function(){
            return start;
        };
    };

    return Qstring;
});
reportApp.service('ReportUntil', function() {
    var Until = function (start) {
        var self = this;
        this.setUntil = function(_until){
            var until = new Date(_until);
            var _until_yy = moment(until.toUTCString()).utc().format('YYYY');
            var _until_mm = moment(until.toUTCString()).utc().format('MM');
            var _until_dd = moment(until.toUTCString()).utc().format('DD');
            var _until_hh = moment(until.toUTCString()).utc().format('HH');
            var _until_min = moment(until.toUTCString()).utc().format('mm');
            var _until_sec = moment(until.toUTCString()).utc().format('ss');
            start = start+_until_hh+":"+_until_min+":"+_until_sec+"_"+_until_yy+_until_mm+_until_dd;
            return self;
        };
        this.getUntil = function(){
            return start;
        };
    };
    return Until;
});
reportApp.service('ReportUrl', function() {
    var Urls = function (start) {
        var self = this;
        this.addDefault = function(ip, port, path){
            start = start + ip + port + path;
            return self;
        };
        this.addSection = function(section){
            start = start + section;
            return self;
        };
        this.addQstring = function(qstring){
            start = start + qstring;
            return self;
        };
        this.getUrls = function(){
            // callback(start);
            return start;
        };
    };

    return Urls;
});
reportApp.service('SharedData', function() {
    var sharedData = {};
    sharedData.currentDurationState = true;
    sharedData.currentBtnState = false;
    sharedData.currentState = true;
    sharedData.from;
    sharedData.until;
    return {
        setCurrentState: function(arg) {
            sharedData.currentState = arg;
        },
        getCurrentState: function() {
            return sharedData.currentState;
        },
        getSharedData: function() {
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
reportApp.factory('UserAppData', function($http, $log, $base64, $window, ReportConfig, ReportFrom, ReportUntil, ReportUrl, ReportQstring, ReportAuth, SharedData) {
    var from = SharedData.getFrom();
    var until = SharedData.getUntil();
    // open sync
    $.ajaxSetup({
        async: false
    });
    // get config
    var result;
    var config = (function() {
        // var result;
        $.getJSON("./config/report-config.json", function(d) {
            console.log(d);
            result = d.config;
        });
        return result;
    })();
    // close sync
    $.ajaxSetup({
        async: true
    });

    function getUserAppData(userid) {
        var rest_from = new ReportFrom("")
            .setFrom(from)
            .getFrom();
        var rest_until = new ReportUntil("")
            .setUntil(until)
            .getUntil();
        var rest_qstring = new ReportQstring("")
            .addSelect('?select='+config.user_app.attr)
            .addOrder('&order='+config.user_app.order)
            .addLimit('&limit='+config.user_app.limit)
            .addWith('&with='+config.user_app.with)
            .addFrom('&from='+rest_from)
            .addUntil('&until='+rest_until)
            .getQstring();
        var rest_url = new ReportUrl("")
            .addDefault(config.common.ip, config.common.port, config.common.path)
            .addSection(config.user_app.section.replace(':userID', userid))
            .addQstring(rest_qstring)
            .getUrls();
        var headers = new ReportAuth("")
            .addId(config.common.id)
            .addPasswd(config.common.passwd)
            .getAuth();

        return $http({
            method: 'GET',
            url: rest_url,
            headers: headers
        }).
        then(function(data, status, headers, config) {
                return data;
            },
            function onError(response) {
                if (response.status < 0) {
                    notie.alert({
                        type: 'error',
                        stay: 'true',
                        time: 3600,
                        text: 'ERROR - 유저 데이터가 존재하지 않습니다.'
                    });
                }
            })
    }

    return {
        getUserAppData: getUserAppData
    };
});