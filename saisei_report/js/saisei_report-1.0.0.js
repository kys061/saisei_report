/*! saisei_report - v1.0.0 - 2017-10-27 */ 
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
    $scope.report_def = {1: 'int_report', 2: 'user_report'};
    $scope.select2model = [];
    $scope.select2data = [
        {
            id: 1,
            label: "인터페이스 트래픽"
        },
        {
            id: 2,
            label: "사용자 트래픽"
        }
        // {
        //     id: 3,
        //     label: "사용자-어플리케이션 트래픽"
        // }
    ];
    $scope.select2settings = {};
    // $scope.$on('', function(){
    //
    // });
    $scope.$watch('select2model', function(val){
        console.log(val);
    });

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
        console.log($scope.select2model);

        $scope.report_type = [];
        for (var i = 0; i < $scope.select2model.length; i++) {
            $scope.report_type.push({name : $scope.report_def[$scope.select2model[i]['id']], status: true});
        }

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
            });
        } else {
            if($scope.select2model.length > 0) {
                $scope.currentState = false;
                $scope.currentDurationState = false;
                SharedData.setFrom(from);
                SharedData.setUntil(until);
                SharedData.setSelect2model($scope.select2model);
                SharedData.setReportType($scope.report_type);
                $location.path('/report');
            }else{
                notie.alert({
                    type: 'error',
                    text: '최소 하나의 리포트를 선택해주세요!'
                })
            }
        }
        // var currentPageTemplate = $route.current.templateUrl;
        // $templateCache.remove(currentPageTemplate);
        // $route.reload();
    };
});

/*
모델이 선택 되면

1. 해당 배열을 돌면서 선택한 리포트가 무엇인지 알아낸다->넘버로 처리
2. 1번은 인터페이스 리포트 2. 유저리포트 3. 유저앱리포트 순으로 정하여
생성해야할 리포트 넘버만 배열로 만들어 reportctrl로 해당 배열을 공유한다.

3. 코드 수정없이 하나의 로직으로 각 넘버별에 맞는 리포트를 출력하려면?
	1. 사전 정의된 객체 테이터 필요, {1: 'int_report', 2: 'user_report', 3: 'user_app_report'}
	2. 넘어온 생성해야할 넘버링된 리포트 배열(a=[1,2])의 갯수만큼 배열을 돌면서 해당 리포트를 데이터를 가져오고, pdf를 찍어야 하며, csv데이터를 만들어야 한다.
	3. 해당 리포트 데이터를 가져오는 것은 동적인 xhr 통신을 할 수있도록 코드를 준비해야한다.
	4. 뷰쪽에서는 html 페이지에서 해당 리포트에 대한 엘리먼트들만 컨트롤러와 통신 할 수 있도록 ng-hide 또는 데이터 바인딩이 안되도록 해야 한다.
 */
reportApp.controller('ReportCtrl', function ReportCtrl(
    $rootScope, $scope, $log, ReportData, SharedData, UserAppData, $location, $route, $window, cfpLoadingBar,
    $q, $timeout, ReportInterfaceTotalRate, ReportUserData) {
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
    var select2model = SharedData.getSelect2model();
    var report_type = SharedData.getReportType();
    /*
     *  그래프 상태 체크
     *  [0] : 인터페이스 그래프
     *  [1] : 유저 리포트 및 유저-앱 연관 그래프
     *  --- 계속 추가될 예정
     */
    $scope.grpState = [
        {
            "name": "int_report",
            "state": false
        },
        {
            "name": "user_report",
            "state": false
        }
    ];
    for (var k = 0; k < report_type.length; k++) {
        if (report_type[k].status) {
            for (var j = 0; j < $scope.grpState.length; j++) {
                if ($scope.grpState[j].name === report_type[k].name) {
                    // console.log(report_type[k]);
                    // console.log($scope.state[j]);
                    $scope.grpState[j].state = true;
                }
            }
        }
    }

    $scope.getGraphState = function(arr, name) {
        // arr.push({cmpname: name});
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].name === name) {
                return arr[i].state === true;
            }
        }
        // arr.some(function (obj) {
        //     for(var j = 0; j < arr.length; j++) {
        //         // console.log(name);
        //         // console.log($scope.grpState[j].name+"==="+report_type[k].name);
        //         if (obj.name===name){
        //             // console.log(obj.state);
        //             return obj.state === true;
        //         }
        //     }
        // });
    };
    console.log(from + " - " + until);
    //get div size init
    var size = {};
    size.header_page = {};
    size.first_page = {};
    size.second_page = {};
    size.third_page = {};
    size.last_page = {};
    // set date
    var _from = new Date(from);
    var _until = new Date(until);
    // set locale date(kr)
    $scope.from = _from.toLocaleString();
    $scope.until = _until.toLocaleString();

    var duration = $window.Sugar.Date.range(from, until).every('days').length;
    $scope.back = function() {
        $window.location.reload();
    };
    $scope.export_xls = function() {
        if($scope.grpState[0].state && $scope.grpState[1].state) {
            var data1 = alasql('SELECT * FROM HTML("#table1",{headers:true})');
            var data2 = alasql('SELECT * FROM HTML("#table2",{headers:true})');
            var data3 = alasql('SELECT * FROM HTML("#table3",{headers:true})');
            var int_file = 'SELECT * INTO CSV("interface-'+ $scope.from+"~"+$scope.until + '.csv",{headers:true, separator:","}) FROM ?';
            // var int_file = "interface.csv";
            // alasql('SELECT * INTO CSV("interface.csv",{headers:true, separator:","}) FROM ?', [data1]);
            alasql(int_file, [data1]);
            alasql('SELECT * INTO CSV("user_traffic.csv",{headers:true, separator:","}) FROM ?', [data2]);
            alasql('SELECT * INTO CSV("user_app_traffic.csv",{headers:true, separator:","}) FROM ?', [data3]);
            notie.alert({
                type: 'error',
                text: 'csv파일이 생성되었습니다!'
            });
        } else {
            if($scope.grpState[0].state){
                var data1 = alasql('SELECT * FROM HTML("#table1",{headers:true})');
                alasql('SELECT * INTO CSV("interface.csv",{headers:true, separator:","}) FROM ?', [data1]);
                notie.alert({
                    type: 'error',
                    text: 'csv파일이 생성되었습니다!'
                });
            } else if($scope.grpState[1].state){
                var data2 = alasql('SELECT * FROM HTML("#table2",{headers:true})');
                var data3 = alasql('SELECT * FROM HTML("#table3",{headers:true})');
                alasql('SELECT * INTO CSV("user_traffic.csv",{headers:true, separator:","}) FROM ?', [data2]);
                alasql('SELECT * INTO CSV("user_app_traffic.csv",{headers:true, separator:","}) FROM ?', [data3]);
                notie.alert({
                    type: 'error',
                    text: 'csv파일이 생성되었습니다!'
                });
        } else {
                notie.alert({
                    type: 'error',
                    text: '출력할 데이터가 존재하지 않습니다.'
                });
            }
        }
    };

    $scope.promise_pdf = [];
    var _promise_header = function() {
        return $q(function(resolve, reject) {
            html2canvas(document.getElementById('header_page'), {
                onrendered: function(canvas) {
                    // document.body.appendChild(canvas);
                    $scope.header_page = canvas.toDataURL();
                    resolve($scope.header_page);
                }
                // width: 1200
            });
        });
    };
    var _promise_first = function() {
        return $q(function(resolve, reject) {
            html2canvas(document.getElementById('first_page'), {
                onrendered: function(canvas) {
                    // document.body.appendChild(canvas);
                    $scope.first_page = canvas.toDataURL();
                    resolve($scope.first_page);
                },
                async: false
                // width: 1200
            });
        });
    };
    var _promise_second = function() {
        return $q(function(resolve, reject) {
            html2canvas(document.getElementById('second_page'), {
                onrendered: function(canvas) {
                    // document.body.appendChild(canvas);
                    $scope.second_page = canvas.toDataURL();
                    resolve($scope.second_page);
                },
                async: false
            });
        });
    };
    var _promise_third = function() {
        return $q(function(resolve, reject) {
            html2canvas(document.getElementById('third_page'), {
                onrendered: function(canvas) {
                    $scope.third_page = canvas.toDataURL();
                    resolve($scope.third_page);
                },
                async: false
            });
        });
    };

    $scope.export = function() {
        var check_grp_state = function() {
            return $q(function(resolve, reject){
                $scope.promise_pdf.push(_promise_header());
                if ($scope.grpState[0].state) {
                    $scope.promise_pdf.push(_promise_first());
                }
                if ($scope.grpState[1].state) {
                    $scope.promise_pdf.push(_promise_second());
                    $scope.promise_pdf.push(_promise_third());
                }
                resolve('check grp state!!');
            });
        };
        check_grp_state().then(
            /*성공시*/
            function (values) {
                console.log(values);
                $q.all($scope.promise_pdf).then(function(values) {
                    console.log("모두 완료됨", values);
                    size.header_page.width = $('#header_page').width();
                    size.header_page.height = $('#header_page').height();
                    size.first_page.width = $('#first_page').width();
                    size.first_page.height = $('#first_page').height();
                    size.second_page.width = $('#second_page').width();
                    size.second_page.height = $('#second_page').height();
                    size.third_page.width = $('#third_page').width();
                    size.third_page.height = $('#third_page').height();
                    size.last_page.width = $('#last_page').width();
                    size.last_page.height = $('#last_page').height();
                    pdfMake.fonts = {
                        customFont: {
                            normal: '/fonts/glyphicons-halflings-regular.ttf',
                            bold: '/fonts/glyphicons-halflings-regular.ttf',
                            italics: '/fonts/glyphicons-halflings-regular.ttf',
                            bolditalics: '/fonts/glyphicons-halflings-regular.ttf'
                        },
                        Roboto: {
                            normal: 'Roboto-Regular.ttf',
                            bold: 'Roboto-Medium.ttf',
                            italics: 'Roboto-Italic.ttf',
                            bolditalics: 'Roboto-MediumItalic.ttf'
                        }
                    };

                    console.log(size.first_page.width + " : " + size.first_page.height + " : " + size.second_page.height + " : " + size.second_page.height);
                    // formular : (original height / original width) x new_width = new_height
                    if (duration >= 20) {
                        var ratio = 3;
                    } else if (10 < duration && duration < 20) {
                        var ratio = 2.6;
                    } else {
                        var ratio = 2.2;
                    }
                    // margin: [left, top, right, bottom]
                    var mod_doc_config = {
                        header_page: {
                            image: $scope.header_page,
                            width: Math.ceil(size.header_page.width / ratio),
                            height: Math.ceil((size.header_page.height / size.header_page.width) * Math.ceil(size.header_page.width / ratio)),
                            margin: [0, 0, 0, 0],
                            style: 'defaultStyle'
                        },
                       first_page: {
                           image: $scope.first_page,
                           width: Math.ceil(size.first_page.width / ratio),
                           height: Math.ceil((size.first_page.height / size.first_page.width) * Math.ceil(size.first_page.width / ratio)),
                           margin: [0, 0, 0, 0],
                           style: 'defaultStyle',
                           pageBreak: 'after'
                        },
                        second_page: {
                            image: $scope.second_page,
                            width: Math.ceil(size.second_page.width / ratio),
                            height: Math.ceil((size.second_page.height / size.second_page.width) * Math.ceil(size.second_page.width / ratio)),
                            margin: [0, 15, 0, 0],
                            style: 'defaultStyle',
                            pageBreak: 'after'
                        },
                        third_page: {
                            image: $scope.third_page,
                            width: Math.ceil(size.third_page.width / ratio),
                            height: Math.ceil((size.third_page.height / size.third_page.width) * Math.ceil(size.third_page.width / ratio)),
                            margin: [0, 15, 0, 0],
                            style: 'defaultStyle'
                        }
                       // last_page: {
                       //      image: $scope.last_page,
                       //      width: Math.ceil(size.last_page.width / ratio),
                       //      height: Math.ceil((size.last_page.height / size.last_page.width) * Math.ceil(size.last_page.width / ratio)),
                       //      margin: [0, 15, 0, 0]
                       //  }
                };
                    if($scope.grpState[0].state && $scope.grpState[1].state) {
                        $scope.docConfig = {
                            footer: {
                                columns: [{
                                    text: 'Saisei copyright',
                                    alignment: 'center'
                                }]
                            },
                            content: [
                                mod_doc_config.header_page,
                                mod_doc_config.first_page,
                                mod_doc_config.second_page,
                                mod_doc_config.third_page
                            ],
                            styles: {
                                defaultStyle: {
                                    alignment: 'center'
                                },
                                footer: {
                                    alignment: 'center',
                                    font: 'customFont'
                                }
                            }
                        };
                    } else{
                        if($scope.grpState[0].state){
                            delete mod_doc_config.first_page.pageBreak;
                            $scope.docConfig = {
                                footer: {
                                    columns: [{
                                        text: 'Saisei copyright',
                                        alignment: 'center'
                                    }]
                                },
                                content: [
                                    mod_doc_config.header_page,
                                    mod_doc_config.first_page,
                                ],
                                styles: {
                                    defaultStyle: {
                                        alignment: 'center'
                                    },
                                    footer: {
                                        alignment: 'center',
                                        font: 'customFont'
                                    }
                                }
                            };
                        } else if($scope.grpState[1].state){
                            $scope.docConfig = {
                                footer: {
                                    columns: [{
                                        text: 'Saisei copyright',
                                        alignment: 'center'
                                    }]
                                },
                                content: [
                                    mod_doc_config.header_page,
                                    mod_doc_config.second_page,
                                    mod_doc_config.third_page
                                ],
                                styles: {
                                    defaultStyle: {
                                        alignment: 'center'
                                    },
                                    footer: {
                                        alignment: 'center',
                                        font: 'customFont'
                                    }
                                }
                            };
                        }else{
                            $scope.docConfig = {
                                footer: {
                                    columns: [{
                                        text: 'Saisei copyright',
                                        alignment: 'center'
                                    }]
                                },
                                content: [
                                    mod_doc_config.header_page,
                                ],
                                styles: {
                                    defaultStyle: {
                                        alignment: 'center'
                                    },
                                    footer: {
                                        alignment: 'center',
                                        font: 'customFont'
                                    }
                                }
                            };
                        }

                    }
                    console.log("ratio : " + ratio);
                    console.log($scope.docConfig);
                    var report_filename = "saisei_report("+$scope.from+"~"+$scope.until+").pdf" ;
                    pdfMake.createPdf($scope.docConfig).download(report_filename, function() {
                        notie.alert({
                            type: 'error',
                            text: 'pdf 다운로드가 완료 되었습니다!!'
                        });
                    });
                });
            },
            /*실패시*/
            function (values) {
                console.log(values);
                notie.alert({
                    type: 'error',
                    text: '데이터가 존재하지 않아 pdf를 다운로드 할 수 없습니다.'
                });
            }
        );
    };
    // 그래프
    var intGrpDataset = new ReportInterfaceTotalRate();
    intGrpDataset.q_intData(from, until, duration, $scope.grpState[0].state).then(
        function(val){
            $scope.data = val.data;
            $scope.labels = val.labels;
            $scope.series = val.series;
            $scope.colors = val.colors;
            $scope.options = val.options;
            $scope.datasetOverride = val.datasetOverride;
            $scope.int_data = val.int_data;
            $scope.int_name = val.int_name;
        },
        function(val){
            console.log(val);
        }
    );

    var userGrpDataset = new ReportUserData();
    userGrpDataset.q_userData(from, until, duration, $scope.grpState[1].state).then(
        function(val){
            $scope._users_tb_data = val.user._users_tb_data;
            $scope._users_data = val.user._users_data;
            $scope._users_label = val.user._users_label;
            $scope._users_series = val.user._users_series;
            $scope._users_option = val.user._users_option;
            $scope.colors = val.user.colors;
            //
            $scope._users_app = val.user_app._users_app; // for table
            $scope._users_app_data = val.user_app._users_app_data;
            $scope._users_app_label = val.user_app._users_app_label;
            $scope._users_app_series = val.user_app._users_app_series;
            $scope._users_app_option = val.user_app._users_app_option;
        },
        function(val){
            console.log(val);
        }
    );
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
reportApp.service('ReportConfig', function($q) {
    var Config = function() {
        var self = this;
        var result;
        this.getConfig = function() {
            $.getJSON("./config/report-config.json", function (d) {
                result = d.config;
            });
            return result;
        };
        this.q_configData = function() {
            var deferred = $q.defer();
            // var config;
            $.getJSON("./config/report-config.json", function (d) {
                // config = d.config;
                deferred.resolve(d.config);
            });
            return deferred.promise;
        }
    };

    return Config;
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
reportApp.service('ReportInterfaceTotalRate', function($window, $q, ReportData) {
    var InterfaceRate = function() {
        var self = this;
        this.q_intData = function(from, until, duration, isset) {
            var deferred = $q.defer();
            var from = from;
            var until = until;
            var duration = duration;
            if (isset) {
                ReportData.getIntRcvData().then(function (data) {
                    /**********************************/
                    /* RCV DATA OF INTERFACE          */
                    /**********************************/
                    /*
                     * 인터페이스 수신 데이터 변수
                     */
                    var label = [];
                    // var raw_label = [];
                    var data_rcv_rate = [];
                    // var raw_data_rcv_rate = [];
                    // init date vars
                    var int_date = [];
                    var int_cmp_date = [];
                    // init rcv data vars
                    var int_rcv_avg = [];
                    var rcv_tot = [];
                    var rcv_len = [];
                    /*
                     * 인터페이스 송신 데이터 변수
                     */
                    var data_trs_rate = [];
                    // var raw_data_trs_rate = [];
                    // init trs data vars
                    var int_trs_avg = [];
                    var trs_tot = [];
                    var trs_len = [];
                    // setting interface data for table
                    var int_data = [];
                    //
                    var _history_length_rcv_rate = data['data']['collection'][0]['_history_length_receive_rate'];
                    var _history_rcv = data['data']['collection'][0]['_history_receive_rate'];
                    var int_name = data['data']['collection'][0]['name'];

                    // set date with from
                    var from_date = new $window.Sugar.Date(from);
                    var _from_date = new $window.Sugar.Date(from);

                    // add date
                    int_date.push(from_date.format("%F"));
                    int_cmp_date.push(_from_date.format("%m-%d"));


                    /**********************************/
                    /* make date array for compare date
                    /**********************************/
                    for (var j = 0; j < duration - 1; j++) {
                        int_date.push(from_date.addDays(1).format("%F").raw);
                        int_cmp_date.push(_from_date.addDays(1).format("%m-%d"));
                    }
                    /* make array
                       1. label : date,
                       2. data_rcv_rate : interface rcv,
                    */

                    for (var i = 0; i < _history_length_rcv_rate; i++) {
                        if (i % 100 === 0) {
                            var t = new Date(_history_rcv[i][0]);
                            label.push(t.toLocaleString());
                            data_rcv_rate.push(Math.round(_history_rcv[i][1] * 0.001));
                        }
                        // raw_label.push(_history_rcv[i][0]);
                        // raw_data_rcv_rate.push(_history_rcv[i][1]);
                    }
                    /*
                       1. rcv_tot : total for interface rcv,
                       2. rcv_len : length for interface rcv,
                    */
                    for (var j = 0; j < duration; j++) {
                        rcv_tot.push(0);
                        rcv_len.push(0);
                    }
                    for (var j = 0; j < duration; j++) {
                        for (var i = 0; i < _history_length_rcv_rate; i++) {
                            if (int_cmp_date[j].raw === moment(_history_rcv[i][0]).format('MM-DD')) {
                                rcv_tot[j] += _history_rcv[i][1];
                                rcv_len[j] += 1;
                            }
                        }
                    }
                    /* make average
                       1. int_rcv_avg : average for interface rcv
                    */
                    for (var j = 0; j < duration; j++) {
                        int_rcv_avg.push(rcv_tot[j] / rcv_len[j]);
                    }
                    // for interface graph
                    var labels = label;
                    var series = ['수신(단위:Mbit/s)', '송신(단위:Mbit/s)'];
                    var colors = ['#ff6384', '#45b7cd', '#ffe200'];
                    var datasetOverride = [{
                        yAxisID: 'y-axis-1'
                    }, {
                        yAxisID: 'y-axis-2'
                    }];
                    ReportData.getIntTrsData().then(function (data) {
                        /**********************************/
                        /* TRS DATA OF INTERFACE          */
                        /**********************************/
                        var _history_length_trs_rate = data['data']['collection'][0]['_history_length_transmit_rate'];
                        var _history_trs = data['data']['collection'][0]['_history_transmit_rate'];
                        /* make trs rate
                           1. data_trs_rate : total rate for trs interface
                        */
                        for (var i = 0; i < _history_length_trs_rate; i++) {
                            if (i % 100 === 0) {
                                data_trs_rate.push(Math.round(_history_trs[i][1] * 0.001));
                            }
                            // raw_data_trs_rate.push(_history_trs[i][1]);
                        }
                        /*
                           1. trs_tot : total for interface trs,
                           2. trs_len : length for interface trs,
                        */
                        for (var j = 0; j < duration; j++) {
                            trs_tot.push(0);
                            trs_len.push(0);
                        }
                        for (var j = 0; j < duration; j++) {
                            for (var i = 0; i < _history_length_trs_rate; i++) {
                                if (int_cmp_date[j].raw === moment(_history_trs[i][0]).format('MM-DD')) {
                                    trs_tot[j] += _history_trs[i][1];
                                    trs_len[j] += 1;
                                }
                            }
                        }
                        /* make average
                           1. int_trs_avg : average for interface rcv
                        */
                        for (var j = 0; j < duration; j++) {
                            int_trs_avg.push(trs_tot[j] / trs_len[j]);
                        }
                        /* make all data for interface to use table
                           1. int_data : date, rcv, trs
                        */
                        for (var k = 0; k < int_date.length; k++) {
                            int_data.push({
                                date: int_date[k],
                                rcv_avg: Math.round(int_rcv_avg[k] * 0.001),
                                trs_avg: Math.round(int_trs_avg[k] * 0.001)
                            });
                        }
                        // interface rate for graph
                        var intGrpData = [
                            data_rcv_rate,
                            data_trs_rate
                        ];
                        // get max for y-axis
                        var int_rcv_max = Math.max.apply(null, data_rcv_rate);
                        var int_trs_max = Math.max.apply(null, data_trs_rate);
                        var int_max = Math.max.apply(null, [int_rcv_max, int_trs_max]);
                        // set options for grp
                        var options = {
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
                                        max: Math.ceil(int_max * 0.001) * 1000,
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
                                            max: Math.ceil(int_max * 0.001) * 1000,
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
                        deferred.resolve({
                            data: intGrpData,
                            labels: labels,
                            series: series,
                            colors: colors,
                            options: options,
                            datasetOverride: datasetOverride,
                            int_data: int_data,
                            int_name: int_name
                        });
                    });
                });
            }
            return deferred.promise;
        };
    };
    return InterfaceRate;
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
reportApp.service('ReportUserData', function($window, $q, ReportData, UserAppData) {
    var UserData = function() {
        var self = this;
        // this.q_userAppData = function(){
        //     var deferred = $q.defer();
        //
        // };
        this.q_userData = function(from, until, duration, isset) {
            var deferred = $q.defer();
            var from = from;
            var until = until;
            var duration = duration;
            if (isset) {
                ReportData.getUserData().then(function (data) {
                    /*
                     * USER TOTAL RATE OF INTERFACE
                     */

                    /******************************************************************************************************************/
                    /* 사용자 전체 사용량 데이터 변수
                    /******************************************************************************************************************/
                    // for users data
                    var _users_label = [];
                    var _users_from = [];
                    var _users_until = [];
                    var _users_series = ['총사용량(단위:Mbit/s)', '다운로드 사용량(단위:Mbit/s)', '업로드 사용량(단위:Mbit/s)'];
                    var _users_total = [];
                    var _users_download = [];
                    var _users_upload = [];
                    var _users_tb_data = [];
                    var _users_data = [];
                    /******************************************************************************************************************/
                    /* 사용자-어플리케이션 TOP3 데이터 변수
                    /******************************************************************************************************************/
                    // for users app data
                    var _users_app = [];
                    var _users_app_top1 = [];
                    var _users_app_top2 = [];
                    var _users_app_top3 = [];
                    var _users_app_data = [];
                    var _users_appName_top1 = [];
                    var _users_appName_top2 = [];
                    var _users_appName_top3 = [];
                    var _users_app_label = [];
                    var _users_app_series = [];
                    var _users_app_option = [];

                    var colors = ['#ff6384', '#45b7cd', '#ffe200'];
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
                        _users_label.push(_users[i]['name']);
                        var user_from = new Date(_users[i]['from']);
                        user_from.setHours(user_from.getHours() + 9);
                        _users_from.push(user_from.toLocaleString());
                        var user_until = new Date(_users[i]['until']);
                        _users_until.push(user_until.setHours(user_until.getHours() + 9));
                        _users_total.push(Math.round(_users[i]['total_rate'] * 0.001));
                        _users_download.push(Math.round(_users[i]['dest_smoothed_rate'] * 0.001));
                        _users_upload.push(Math.round(_users[i]['source_smoothed_rate'] * 0.001));
                        _users_tb_data.push({
                            name: _users[i]['name'],
                            from: user_from.toLocaleString(),
                            until: user_until.toLocaleString(),
                            total: Math.round(_users[i]['total_rate'] * 0.001),
                            down: Math.round(_users[i]['dest_smoothed_rate'] * 0.001),
                            up: Math.round(_users[i]['source_smoothed_rate'] * 0.001)
                        });
                    }
                    // var _users_data = [_users_total, _users_download, _users_upload];
                    _users_data.push(_users_total);
                    _users_data.push(_users_download);
                    _users_data.push(_users_upload);
                    var _users_option = {
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

                    for (var i = 0; i < _users_label.length; i++) {
                        /**********************************/
                        /* USER-APP DATA                  */
                        /**********************************/
                        UserAppData.getUserAppData(_users_label[i]).then(function (data) {
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
                            _users_app.push({
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
                            _users_app.sort(function (a, b) { // DESC
                                return b['top1_app_total'] - a['top1_app_total'];
                            });
                            _users_app_top1.push(Math.round(data['data']['collection'][0]['total_rate'] * 0.001));
                            _users_app_top2.push(Math.round(data['data']['collection'][1]['total_rate'] * 0.001));
                            _users_app_top3.push(Math.round(data['data']['collection'][2]['total_rate'] * 0.001));
                            _users_appName_top1.push(data['data']['collection'][0]['name']);
                            _users_appName_top2.push(data['data']['collection'][1]['name']);
                            _users_appName_top3.push(data['data']['collection'][2]['name']);
                            // $rootScope._users_app_top1 = _users_app_top1;
                            _users_app_label.push(data['data']['collection'][0].link.href.split('/')[6] + "(" +
                                "1." + data['data']['collection'][0]['name'] + "," +
                                "2." + data['data']['collection'][1]['name'] + "," +
                                "3." + data['data']['collection'][2]['name'] + ")"
                            );
                        });
                        // console.log("status : " + cfpLoadingBar.status());
                    }
                    var _users_app_data = [
                        _users_app_top1,
                        _users_app_top2,
                        _users_app_top3
                    ];
                    var _users_app_series = ["TOP APP 1", "TOP APP 2", "TOP APP 3"];
                    var _users_app_option = {
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
                    deferred.resolve({
                        user: {
                            _users_tb_data: _users_tb_data, // for table
                            _users_data: _users_data,
                            _users_label: _users_label,
                            _users_series: _users_series,
                            _users_option: _users_option,
                            colors: colors
                        },
                        user_app: {
                            _users_app: _users_app, // for table
                            _users_app_data: _users_app_data,
                            _users_app_label: _users_app_label,
                            _users_app_series: _users_app_series,
                            _users_app_option: _users_app_option,
                            colors: colors
                        }
                    });
                });
            }
            return deferred.promise;
        }
    };
    return UserData;
});
reportApp.service('SharedData', function() {
    var sharedData = {};
    sharedData.currentDurationState = true;
    sharedData.currentBtnState = false;
    sharedData.currentState = true;
    sharedData.from;
    sharedData.until;
    sharedData.select2model;
    sharedData.report_type;
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
        },
        setSelect2model: function(data) {
            sharedData.select2model = data;
        },
        getSelect2model: function() {
            return sharedData.select2model;
        },
        setReportType: function(data) {
            sharedData.report_type = data;
        },
        getReportType: function() {
            return sharedData.report_type;
        }
    };
});
reportApp.factory('ReportData', function($http, $log, $base64, $window, ReportFrom, ReportUntil, ReportUrl,
                                         ReportQstring, ReportAuth, ReportConfig, SharedData)
{
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
    var rest_from = new ReportFrom("").setFrom(from).getFrom();
    var rest_until = new ReportUntil("").setUntil(until).getUntil();
    var headers = new ReportAuth("").addId(config.common.id).addPasswd(config.common.passwd).getAuth();
    /*
     *   get user's total rate
     */
    function getUserData() {
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

        return $http({
            method: 'GET',
            url: rest_url,
            headers: headers
        }).
        then(function(data, status, headers, config) {
                return data;
                // successcb(data);
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
    function getIntRcvData() {
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

        return $http({
            method: 'GET',
            url: rest_url,
            headers: headers
        }).
        then(function(data, status, headers, config) {
                // successcb(data);
                return data;
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
    function getIntTrsData() {
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
        return $http({
            method: 'GET',
            url: rest_url,
            headers: headers
        }).
        then(function(data, status, headers, config) {
                // successcb(data);
                return data;
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