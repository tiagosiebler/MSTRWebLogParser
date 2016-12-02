(function() {
    angular.module('logtable', ['ngTable'])

    .directive('logtable', function() {
        return {
            restrict: 'E',
            templateUrl: 'partials/logtable.html',
			link: function (scope, element, attrs) {
				
			},
			controller: ['$scope','$rootScope','NgTableParams', '$filter', '$timeout', function($scope, $rootScope, NgTableParams, $filter, $timeout) {	
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
					exception: ''
	        	};
				
				$scope.pagination = {};
				$scope.pagination.currentPage = 1;
				$scope.pagination.perPage = 40;

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
				console.log("using data: ",$rootScope.data);
			    var self = $scope;
				
				self.debug = function(param){
					debugger;
				}
				
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

			    $scope.tableParams = new NgTableParams({
			        page: $scope.pagination.currentPage,            // show first page
			        count: $scope.pagination.perPage,           // count per page
			        sorting: { 
			            package: '',
						level: '',
						miliseconds: '',
						timestamp: 'desc',
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
					dataset: $rootScope.data
				});
				
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