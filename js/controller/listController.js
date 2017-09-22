reportApp.controller("listController", ["$scope",
    function($scope) {
        $scope.data=  [{"agence":"CTM","secteur":"Safi","statutImp":"operationnel"}];

        $scope.export = function(){
            html2canvas(document.getElementById('exportthis'), {
                onrendered: function (canvas) {
                    var data = canvas.toDataURL();
                    var docDefinition = {
                        content: [{
                            image: data,
                            width: 500,
                        }]
                    };
                    pdfMake.createPdf(docDefinition).download("test.pdf");
                }
            });
        }
    }
]);