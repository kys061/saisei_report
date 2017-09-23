'use strict';

reportApp.controller('LineCtrl', function ReportController($scope, $log, ReportData, SharedData, $location, $route, $window) {
    var from = SharedData.getFrom();
    var until = SharedData.getUntil();
    $log.info("LineCtrl: "+from+" : "+until);
    ReportData.setFrom(from);
    ReportData.setUntil(until);

    $("#export").click(function() {
        var $btn = $(this);
        $btn.button('loading');
        // simulating a timeout
        setTimeout(function () {
            $btn.button('reset');
        }, 10000);
    });
    $scope.back = function () {
        $log.info("back!!");
        $window.location.reload();
        // $route.reload();
        // $location.path('/saisei_report/');
    };
    // $scope.from;
    // $scope.until;
    // $scope.$watch('date_from', function(val) {
    //     $scope.from = new Date(val);
    // });
    // $scope.$watch('date_until', function(val) {
    //     $scope.until = new Date(val);
    // });
    //
    // $scope.sendDate = function() {
    //   $log.info($scope.from+" : "+ $scope.until);
    // };

    $scope.export = function() {
        html2canvas(document.getElementById('first_page'), {
            onrendered: function (canvas) {
                // document.body.appendChild(canvas);
                $scope.first_page = canvas.toDataURL();
            }
            // width: 1200
        });

        html2canvas(document.getElementById('second_page'), {
           onrendered: function (canvas){
               $scope.second_page = canvas.toDataURL();
               var docDefinition = {
                   content: [
                       {
                           image: $scope.first_page,
                           width: 600,
                           height: 650,
                           pageBreak: 'after'
                       },
                       {
                           image: $scope.second_page,
                           width: 600,
                           height: 650
                       }
                   ]
               };
               // $log.info("onrendered");
               pdfMake.createPdf(docDefinition).download("test.pdf",function() { alert('pdf download is done'); });
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

        $scope.label = [];
        $scope.raw_label = [];
        $scope.data_rcv_rate = [];
        $scope.raw_data_rcv_rate = [];
        // for avg calculating
        $scope.cal_avg = {
            today_rcv_tot : 0,
            today_rcv_len : 0,
            today_trs_tot : 0,
            today_trs_len : 0,

            sondday_rcv_tot : 0,
            sondday_rcv_len : 0,
            sondday_trs_tot : 0,
            sondday_trs_len : 0,

            tirdday_rcv_tot : 0,
            tirdday_rcv_len : 0,
            tirdday_trs_tot : 0,
            tirdday_trs_len : 0,

            frthday_rcv_tot : 0,
            frthday_rcv_len : 0,
            frthday_trs_tot : 0,
            frthday_trs_len : 0,

            fithday_rcv_tot : 0,
            fithday_rcv_len : 0,
            fithday_trs_tot : 0,
            fithday_trs_len : 0,

            sithday_rcv_tot : 0,
            sithday_rcv_len : 0,
            sithday_trs_tot : 0,
            sithday_trs_len : 0,

            snthday_rcv_tot : 0,
            snthday_rcv_len : 0,
            snthday_trs_tot : 0,
            snthday_trs_len : 0,

            to_day : moment().format('DD'),
            sond_day : moment().add(-1, 'days').format('DD'),
            tird_day : moment().add(-2, 'days').format('DD'),
            frth_day : moment().add(-3, 'days').format('DD'),
            fith_day : moment().add(-4, 'days').format('DD'),
            sith_day : moment().add(-5, 'days').format('DD'),
            snth_day : moment().add(-6, 'days').format('DD'),

            today : moment().format('YYYY년 MM월 DD일'),
            sondday : moment().add(-1, 'days').format('YYYY년 MM월 DD일'),
            tirdday : moment().add(-2, 'days').format('YYYY년 MM월 DD일'),
            frthday : moment().add(-3, 'days').format('YYYY년 MM월 DD일'),
            fithday : moment().add(-4, 'days').format('YYYY년 MM월 DD일'),
            sithday : moment().add(-5, 'days').format('YYYY년 MM월 DD일'),
            snthday : moment().add(-6, 'days').format('YYYY년 MM월 DD일')
        };

        $scope.week_avg = {
            today : [],
            secondday : [],
            thirdday : [],
            fourthday : [],
            fifthday : [],
            sixthday : [],
            seventhday : []
        };
        // $log.info(moment().unix());
        // $log.info(moment(moment().format('YYYY MM DD 00:00:00')).unix());
        // $scope.diff_sec = moment().unix() - moment(moment().format('YYYY MM DD 00:00:00')).unix()
        // $log.info($scope.diff_sec);
        for(var i = 0; i < $scope._history_length_rcv_rate; i++){
            if (i % 100 === 0) {
                $scope.t = new Date($scope._history_rcv[i][0]);
                $scope.label.push($scope.t.toLocaleString());
                $scope.data_rcv_rate.push($scope._history_rcv[i][1]);
            }
            $scope.raw_label.push($scope._history_rcv[i][0]);
            $scope.raw_data_rcv_rate.push($scope._history_rcv[i][1]);
        }
        // console.log($scope.day === moment($scope.raw_label[6000]).format('DD'));
        // $log.info(moment($scope.raw_label[6000]).format('DD'));
        for(var i = 0; i < $scope._history_length_rcv_rate; i++){
            if ($scope.cal_avg.to_day === moment($scope._history_rcv[i][0]).format('DD')) {
                $scope.cal_avg.today_rcv_tot += $scope._history_rcv[i][1];
                $scope.cal_avg.today_rcv_len += 1;
            }
            if ($scope.cal_avg.sond_day === moment($scope._history_rcv[i][0]).format('DD')) {
                $scope.cal_avg.sondday_rcv_tot += $scope._history_rcv[i][1];
                $scope.cal_avg.sondday_rcv_len += 1;
            }
            if ($scope.cal_avg.tird_day === moment($scope._history_rcv[i][0]).format('DD')) {
                $scope.cal_avg.tirdday_rcv_tot += $scope._history_rcv[i][1];
                $scope.cal_avg.tirdday_rcv_len += 1;
            }
            if ($scope.cal_avg.frth_day === moment($scope._history_rcv[i][0]).format('DD')) {
                $scope.cal_avg.frthday_rcv_tot += $scope._history_rcv[i][1];
                $scope.cal_avg.frthday_rcv_len += 1;
            }
            if ($scope.cal_avg.fith_day === moment($scope._history_rcv[i][0]).format('DD')) {
                $scope.cal_avg.fithday_rcv_tot += $scope._history_rcv[i][1];
                $scope.cal_avg.fithday_rcv_len += 1;
            }
            if ($scope.cal_avg.sith_day === moment($scope._history_rcv[i][0]).format('DD')) {
                $scope.cal_avg.sithday_rcv_tot += $scope._history_rcv[i][1];
                $scope.cal_avg.sithday_rcv_len += 1;
            }
            if ($scope.cal_avg.snth_day === moment($scope._history_rcv[i][0]).format('DD')) {
                $scope.cal_avg.snthday_rcv_tot += $scope._history_rcv[i][1];
                $scope.cal_avg.snthday_rcv_len += 1;
            }
        }

        // $log.info("rcv tot : "+$scope.today_rcv_tot);
        $scope.today_rcv_avg = $scope.cal_avg.today_rcv_tot / $scope.cal_avg.today_rcv_len;
        $scope.sondday_rcv_avg = $scope.cal_avg.sondday_rcv_tot / $scope.cal_avg.sondday_rcv_len;
        $scope.tirdday_rcv_avg = $scope.cal_avg.tirdday_rcv_tot / $scope.cal_avg.tirdday_rcv_len;
        $scope.frthday_rcv_avg = $scope.cal_avg.frthday_rcv_tot / $scope.cal_avg.frthday_rcv_len;
        $scope.fithday_rcv_avg = $scope.cal_avg.fithday_rcv_tot / $scope.cal_avg.fithday_rcv_len;
        $scope.sithday_rcv_avg = $scope.cal_avg.sithday_rcv_tot / $scope.cal_avg.sithday_rcv_len;
        $scope.snthday_rcv_avg = $scope.cal_avg.snthday_rcv_tot / $scope.cal_avg.snthday_rcv_len;

        ReportData.getIntTrsData(function(data){
            $scope._history_length_trs_rate = data['data']['collection'][0]['_history_length_transmit_rate'];
            $scope._history_trs = data['data']['collection'][0]['_history_transmit_rate'];

            // $scope.labels = [];
            $scope.data_trs_rate = [];
            $scope.raw_data_trs_rate = [];

            for(var i = 0; i < $scope._history_length_trs_rate; i++){
                if (i % 100 === 0) {
                    // $scope.t = new Date($scope._history_trs[i][0]);
                    // $scope.labels.push($scope.t.toLocaleString());
                    $scope.data_trs_rate.push($scope._history_trs[i][1]);
                }
                $scope.raw_data_trs_rate.push($scope._history_trs[i][1]);
            }

            for(var i = 0; i < $scope._history_length_trs_rate; i++){
                if ($scope.cal_avg.to_day === moment($scope._history_trs[i][0]).format('DD')) {
                    $scope.cal_avg.today_trs_tot += $scope._history_trs[i][1];
                    $scope.cal_avg.today_trs_len += 1;
                }
                if ($scope.cal_avg.sond_day === moment($scope._history_trs[i][0]).format('DD')) {
                    $scope.cal_avg.sondday_trs_tot += $scope._history_trs[i][1];
                    $scope.cal_avg.sondday_trs_len += 1;
                }
                if ($scope.cal_avg.tird_day === moment($scope._history_trs[i][0]).format('DD')) {
                    $scope.cal_avg.tirdday_trs_tot += $scope._history_trs[i][1];
                    $scope.cal_avg.tirdday_trs_len += 1;
                }
                if ($scope.cal_avg.frth_day === moment($scope._history_trs[i][0]).format('DD')) {
                    $scope.cal_avg.frthday_trs_tot += $scope._history_trs[i][1];
                    $scope.cal_avg.frthday_trs_len += 1;
                }
                if ($scope.cal_avg.fith_day === moment($scope._history_trs[i][0]).format('DD')) {
                    $scope.cal_avg.fithday_trs_tot += $scope._history_trs[i][1];
                    $scope.cal_avg.fithday_trs_len += 1;
                }
                if ($scope.cal_avg.sith_day === moment($scope._history_trs[i][0]).format('DD')) {
                    $scope.cal_avg.sithday_trs_tot += $scope._history_trs[i][1];
                    $scope.cal_avg.sithday_trs_len += 1;
                }
                if ($scope.cal_avg.snth_day === moment($scope._history_trs[i][0]).format('DD')) {
                    $scope.cal_avg.snthday_trs_tot += $scope._history_trs[i][1];
                    $scope.cal_avg.snthday_trs_len += 1;
                }
            }

            $scope.today_trs_avg = $scope.cal_avg.today_trs_tot / $scope.cal_avg.today_trs_len;
            $scope.sondday_trs_avg = $scope.cal_avg.sondday_trs_tot / $scope.cal_avg.sondday_trs_len;
            $scope.tirdday_trs_avg = $scope.cal_avg.tirdday_trs_tot / $scope.cal_avg.tirdday_trs_len;
            $scope.frthday_trs_avg = $scope.cal_avg.frthday_trs_tot / $scope.cal_avg.frthday_trs_len;
            $scope.fithday_trs_avg = $scope.cal_avg.fithday_trs_tot / $scope.cal_avg.fithday_trs_len;
            $scope.sithday_trs_avg = $scope.cal_avg.sithday_trs_tot / $scope.cal_avg.sithday_trs_len;
            $scope.snthday_trs_avg = $scope.cal_avg.snthday_trs_tot / $scope.cal_avg.snthday_trs_len;

            $log.info("second avg : "+$scope.sondday_trs_avg);
            $scope.data = [
                $scope.data_rcv_rate,
                $scope.data_trs_rate
            ];
        });

        $scope.labels = $scope.label;
        $scope.series = ['p1p1-ext-rcv(단위:KB/S)', 'p1p1-int-trs(단위:KB/S)'];
        $scope.colors = ['#45b7cd', '#ff6384', '#ff8e72'];
        $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
        $scope.options = {
            scales: {
                yAxes: [
                    {
                        id: 'y-axis-1',
                        type: 'linear',
                        display: true,
                        position: 'left'
                    },
                    {
                        id: 'y-axis-2',
                        type: 'linear',
                        display: true,
                        position: 'right'
                    }
                ]
            }
        };
    });





    // $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
    // $scope.series = ['Series A', 'Series B'];
    // $scope.data = [
    //     [65, 59, 80, 81, 56, 55, 40],
    //     [28, 48, 40, 19, 86, 27, 90]
    // ];
    // $scope.onClick = function (points, evt) {
    //     console.log(points, evt);
    // };
    // $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
    // $scope.options = {
    //     scales: {
    //         yAxes: [
    //             {
    //                 id: 'y-axis-1',
    //                 type: 'linear',
    //                 display: true,
    //                 position: 'left'
    //             },
    //             {
    //                 id: 'y-axis-2',
    //                 type: 'linear',
    //                 display: true,
    //                 position: 'right'
    //             }
    //         ]
    //     }
    // };
});