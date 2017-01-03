(function () {
    angular.module('logtable', ['ngTable','ui.bootstrap','logViewCtrl'])

    .directive('logtable', function() {
        return {
            restrict: 'E',
            templateUrl: 'partials/logtable.html',
			link: function (scope, element, attrs) {
				
			},
			controller: ['$scope','$rootScope','NgTableParams', '$filter', '$timeout','$uibModal', function($scope, $rootScope, NgTableParams, $filter, $timeout, $uibModal) {	
				$scope.total = {};
			    
				$scope.filters = {
		            package: '',
					level: '',
					miliseconds: '',
					timestamp: '',
					thread: '',
					class: '',
					method: '',
					message: '',
					exception: '',
					others: ''
	        	};
				
				$scope.pagination = {};
				$scope.pagination.currentPage = 1;
				$scope.pagination.perPage = 50;

				/*
				function testRow(){
					var xml = '<record reset="true">  <package>mytestrow!!!!</package>  <level>SEVERE</level>  <miliseconds>1473163518955</miliseconds>  <timestamp>09/06/2016 13:05:18:956</timestamp>  <thread>0</thread>  <class>Connection</class>  <method>newSocket</method>  <message>Operation timed out (com.microstrategy.webapi.MSTRWebAPIException)</message>  <exception>cthisismytestrow</exception></record>';

					var xml = "<xml>" + xml +"</xml>";
					var x2js = new X2JS();
				
					var json = x2js.xml_str2json(xml);
				
					console.log("length: ",json.xml.length);
				
					if(json.xml.record.length){
						console.log(json.xml.record.length + " rows");
						for(var ii = 0;ii< json.xml.record.length;ii++){
							$rootScope.data.push(json.xml.record[ii]);
						}
					}else{
						console.log("1 row");
						$rootScope.data.push(json.xml.record)
					}
				}
				testRow();
				//*/
				//console.log("using data: ",$rootScope.data);
			    var self = $scope;
				
				self.debug = function(param){
					debugger;
				}
				
                $scope.dragging = false;
				$scope.mouseIsDown = false;
                $scope.mouseDown = function(event){
                    //console.log("mouse down");
                    $scope.mouseIsDown = true;
                    $scope.dragging = false;
                };
                $scope.mouseUp = function(log){
                    //console.log("mouse up");
                    $scope.mouseIsDown = false;
                    
                    if($scope.dragging){
                        //console.log("Must have dragged");
                        return false;
                    }else{
                        $scope.view(log);
                    }
                };
                $scope.mouseMove = function(event){
                    //console.log("mouse moved");
                    $scope.dragging = true;
                };
                $scope.dblClick = function($event){
                    console.log("double click");
                    //$event.preventDefault();
                    //$event.stopPropagation();
                };
                
				//esvit/ng-table/issues/189
			    $scope.columns = [
					{ field: "Package", 	title: "Package", 		show: true },
					{ field: "Level", 		title: "Level", 		show: true },
					{ field: "Milliseconds", title: "Milliseconds",	show: true },
					{ field: "TimeStamp", 	title: "TimeStamp", 	show: true },
					{ field: "Thread", 		title: "Thread", 		show: true },
					{ field: "Class", 		title: "Class", 		show: true },
					{ field: "Method", 		title: "Method", 		show: true },
					{ field: "Exception", 	title: "Exception", 	show: true },
					{ field: "Others", 		title: "Others", 		show: true },
			    ];

			    $scope.del = function(row) {
					_.remove(self.tableParams.settings().dataset, function(item) {
						return row === item;
					});

					self.tableParams.reload().then(function(data) {
						if (data.length === 0 && self.tableParams.total() > 0) {
							self.tableParams.page(self.tableParams.page() - 1);
							self.tableParams.reload();
						}
					});
				}
				$scope.alert = function(param){
					//alert(param);
					var html = document.createElement('html');
					var body = document.createElement('body');
					var pre = document.createElement('pre');
					
					html.appendChild(body);
					body.appendChild(pre);
					pre.appendChild(document.createTextNode(param));
					
					var x=window.open('','_blank', 'toolbar=0,location=0,menubar=0,height=500,width=1400');
						x.document.open();
						x.document.write(html.innerHTML);
						x.document.close();
				}
                
                // open modal to display full log in scrollable subview
                $scope.view = function(log){
                    // open a modal view of that log message
                    var modalInstance = $uibModal.open({
						animation: true,
						templateUrl: 'partials/sub/logView.html',
						controller: 'logViewCtrl',
						size: 'lg',
            			windowClass: 'app-modal-window',
						resolve: {
							log: function () {
								return log;
							}
						}
					});
                    
                    modalInstance.result.then(function (result) {
                        var nextID;
                        if(result.action == "next"){
                           // debugger;
                            nextID = result.data - 1;//since rows are in reverse order, top row is first row
                            
                        }else if(result.action == "previous"){
                            nextID = result.data + 1;
                        }
                        //todo this doesn't work when sort order is changed
                        $scope.view($rootScope.data[nextID]);
                    }, function () {
						console.log('Modal dismissed at: ' + new Date());
						}
					);
                }
                
                // open small modal with quick view of passed parameter
                $scope.quickView = function(param){
                    debugger;
                }

			    $scope.tableParams = new NgTableParams({
			        page: $scope.pagination.currentPage,            // show first page
			        count: $scope.pagination.perPage,           // count per page
			        sorting: { 
                        id: 'desc',
			            package: '',
						level: '',
						miliseconds: '',
						timestamp: '',
						thread: '',
						class: '',
						method: '',
						message: '',
						exception: ''
					},
			        filter: $scope.filters,
			    }, 
				{
			        //filterSwitch: true,
			        //total: 0, // length of data
					filterOptions: {
						filterDelay: 200
					},
					dataset: $rootScope.data,
					counts: [10, 25, 50, 100, 500],//1000 is SLOW
					
				});
				//debugger;
				
				$rootScope.$watch('data', function () {
					//debugger;
					$timeout(function(){
						$scope.tableParams.settings({
							dataset: $rootScope.data
						});
						//debugger;
					}, 200)
					
					
				});
				
			}],
			controllerAs: 'logtableCtrl'
        };
    });
})();