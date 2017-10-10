'use strict';

reportApp.controller('ReportCtrl', function ReportCtrl($scope, $log, ReportData, SharedData, $location, $route, $window) {
    var from = SharedData.getFrom();
    var until = SharedData.getUntil();
    $log.info("ReportCtrl: "+from+" : "+until);
    //get div size init
    var size = {};
    size.first_page = {};
    size.second_page = {};
    // set date
    ReportData.setFrom(from);
    ReportData.setUntil(until);
    var _from = new Date(from);
    var _until = new Date(until);
    //
    $scope.from = _from.toLocaleString();
    $scope.until = _until.toLocaleString();

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
           onrendered: function (canvas){
               $scope.second_page = canvas.toDataURL();
               size.first_page.width = $('#first_page').width();
               size.first_page.height = $('#first_page').height();
               size.second_page.width = $('#second_page').width();
               size.second_page.height = $('#second_page').height();

               // var first_page_width = Math.ceil(size.first_page.width / ratio);
               // var first_page_height = Math.ceil((size.first_page.height / size.first_page.width) * first_page_width);
               // var second_page_width = Math.ceil(size.second_page.width / ratio);
               // var second_page_height = Math.ceil((size.second_page.height / size.second_page.width) * second_page_width);

               console.log(size.first_page.width+" : "+size.first_page.height+" : "+size.second_page.height+" : "+size.second_page.height);
               // (original height / original width) x new_width = new_height
               if (duration >= 20) {
                   var ratio = 2.7;
                   $scope.docConfig = {
                       content: [
                           {
                               image: $scope.first_page,
                               width: Math.ceil(size.first_page.width / ratio),
                               height: Math.ceil((size.first_page.height / size.first_page.width) * Math.ceil(size.first_page.width / ratio)),
                               // margin: [left, top, right, bottom]
                               margin: [30, 20, 0, 0],
                               pageBreak: 'after'
                           },
                           {
                               image: $scope.second_page,
                               width: Math.ceil(size.second_page.width / ratio),
                               height: Math.ceil((size.second_page.height / size.second_page.width) * Math.ceil(size.second_page.width / ratio)),
                               margin: [30, 5, 0, 0]
                           }
                       ]
                   };

               } else if ( 10 < duration && duration < 20) {
                   var ratio = 2.3;
                   $scope.docConfig = {
                       content: [
                           {
                               image: $scope.first_page,
                               width: Math.ceil(size.first_page.width / ratio),
                               height: Math.ceil((size.first_page.height / size.first_page.width) * Math.ceil(size.first_page.width / ratio)),
                               // margin: [left, top, right, bottom]
                               margin: [30, 20, 0, 0],
                               pageBreak: 'after'
                           },
                           {
                               image: $scope.second_page,
                               width: Math.ceil(size.second_page.width / ratio),
                               height: Math.ceil((size.second_page.height / size.second_page.width) * Math.ceil(size.second_page.width / ratio)),
                               margin: [30, 5, 0, 0]
                           }
                       ]
                   };
               } else {
                   var ratio = 2;
                   // var docConfig = {
                   //     content: [
                   //         {
                   //             image: $scope.first_page,
                   //             width: Math.ceil($('#first_page').width() / ratio),
                   //             height: Math.ceil(($('#first_page').height() / $('#first_page').width()) * $('#first_page').width()),
                   //             // margin: [left, top, right, bottom]
                   //             margin: [50, 20, 0, 0]
                   //             // pageBreak: 'after'
                   //         },
                   //         {
                   //             image: $scope.second_page,
                   //             width: Math.ceil($('#second_page').width() / ratio),
                   //             height: Math.ceil(($('#second_page').height() / $('#second_page').width()) * $('#second_page').width()),
                   //             margin: [50, 5, 0, 0]
                   //         }
                   //     ]
                   // };
                   $scope.docConfig = {
                       content: [
                           {
                               image: $scope.first_page,
                               width: Math.ceil(size.first_page.width / ratio),
                               height: Math.ceil((size.first_page.height / size.first_page.width) * Math.ceil(size.first_page.width / ratio)),
                               // margin: [left, top, right, bottom]
                               margin: [5, 0, 0, 0],
                               pageBreak: 'after'
                           },
                           {
                               image: $scope.second_page,
                               width: Math.ceil(size.second_page.width / ratio),
                               height: Math.ceil((size.second_page.height / size.second_page.width) * Math.ceil(size.second_page.width / ratio)),
                               margin: [5, 0, 0, 0]
                           }
                       ]
                   };
                   console.log($scope.docConfig);
               }
               console.log("ratio : " + ratio);
               console.log($scope.docConfig);
               var docDefinition = $scope.docConfig;
               // $log.info("onrendered");
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
                $scope.data_rcv_rate.push($scope._history_rcv[i][1]);
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
            // init trs data vars
            $scope.int_trs_avg = [];
            $scope.trs_tot = [];
            $scope.trs_len = [];
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
            // for ng-repeat
            $scope.int_data = [];
            for (var k = 0; k < $scope.int_date.length; k++){
                $scope.int_data.push({
                    date : $scope.int_date[k],
                    rcv_avg : Math.ceil($scope.int_rcv_avg[k]*0.001),
                    trs_avg : Math.ceil($scope.int_trs_avg[k]*0.001)
                });
            }

            // setting for graph
            $scope.data = [
                $scope.data_rcv_rate,
                $scope.data_trs_rate
            ];

            ReportData.getUserdata(function(data) {
                console.log(data);
                var _users = data['data']['collection'];
                $scope._users_label = [];
                $scope._users_from = [];
                $scope._users_until = [];
                $scope._users_series = ['총사용량(단위:Mbit/s)', '다운로드 사용량(단위:Mbit/s)', '업로드 사용량(단위:Mbit/s)'];
                $scope._users_total = [];
                $scope._users_download = [];
                $scope._users_upload = [];
                $scope._users_tb_data = [];
                for (var i = 0; i < _users.length; i++) {
                    $scope._users_label.push(_users[i]['name']);
                    var t_from = new Date(_users[i]['from']);
                    $scope._users_from.push(t_from.toLocaleString());
                    var t_until = new Date(_users[i]['until']);
                    $scope._users_until.push(t_until.toLocaleString());
                    $scope._users_total.push(Math.ceil(_users[i]['total_rate']*0.001));
                    $scope._users_download.push(Math.ceil(_users[i]['dest_smoothed_rate']*0.001));
                    $scope._users_upload.push(Math.ceil(_users[i]['source_smoothed_rate']*0.001));

                    //
                    $scope._users_tb_data.push({
                        name : _users[i]['name'],
                        from : t_from.toLocaleString(),
                        until : t_until.toLocaleString(),
                        total : Math.ceil(_users[i]['total_rate']*0.001),
                        down : Math.ceil(_users[i]['dest_smoothed_rate']*0.001),
                        up : Math.ceil(_users[i]['source_smoothed_rate']*0.001)
                    });
                }
                $scope._users_data = [$scope._users_total, $scope._users_download, $scope._users_upload];
                // for (var i = 0; i < _users.length; i++) {
                //
                // }
                console.log($scope._users_tb_data);
            });

        });


        // for interface graph
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
        // for users data graph
        // $scope.users_label = $scope._users_label;
        // $scope.users_series = $scope._users_series;
        // $scope.users_data = $scope._users_data;
        // $scope._users_label = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
        // $scope._users_series = ['Series A'];
        // $scope._users_data = [28, 48, 40, 19, 86, 27, 90];
    });
});