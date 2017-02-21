(function () {
    angular.module('logsWeb', ['ngTable','ui.bootstrap','inspectLogWebCtrl'])

    .directive('logsweb', function() {
        return {
            restrict: 'E',
            templateUrl: 'partials/logsWeb.html',
			link: function (scope, element, attrs) {
				
			},
			controller: ['$scope','$rootScope','NgTableParams', '$filter', '$timeout','$uibModal', function($scope, $rootScope, NgTableParams, $filter, $timeout, $uibModal) {	
			    var self = $scope;				

				self.total = {};
			    
				self.filters = {
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
				
				self.pagination = {};
				self.pagination.currentPage = 1;
				self.pagination.perPage = 50;

				self.debug = function(param){
					debugger;
				}
				
				// all tracking vars for drag n drop action
                self.dragging = false;
				self.mouseIsDown = false;
                self.mouseDown = function(event){
                    //console.log("mouse down");
                    self.mouseIsDown = true;
                    self.dragging = false;
                };
                self.mouseUp = function(log){
                    //console.log("mouse up");
                    self.mouseIsDown = false;
                    
                    if(self.dragging){
                        //console.log("Must have dragged");
                        return false;
                    }else{
                        self.view(log);
                    }
                };
                self.mouseMove = function(event){
                    //console.log("mouse moved");
                    self.dragging = true;
                };
                self.dblClick = function($event){
                    console.log("double click");
                    //$event.preventDefault();
                    //$event.stopPropagation();
					
                };
				self.preventAction = function($event){
					$event.preventDefault();
					$event.stopPropagation();
				}

				// Enable resize
				self.resize = false;
				self.enableResize = function () {
					if (self.resize) {
						console.log("disabling resize");
						$("#ngTable").colResizable({
							disable: true
						});
						self.resize = false;
					} else {
						console.log("enabling resize");
						$("#ngTable").colResizable({
							fixed: false,
							liveDrag: true,
							resizeMode: 'overflow',
							gripInnerHtml:"<div class='grip'></div>", 
   							draggingClass:"dragging"
						});
						self.resize = true;
					}
				};
                
				//esvit/ng-table/issues/189
				/*
			    self.columns = [
					{ field: "LID", 		title: "LID", 			show: true },
					{ field: "Package", 	title: "Package", 		show: true },
					{ field: "Level", 		title: "Level", 		show: true },
					{ field: "Milliseconds", title: "Milliseconds",	show: true },
					{ field: "TimeStamp", 	title: "TimeStamp", 	show: true },
					{ field: "Thread", 		title: "Thread", 		show: true },
					{ field: "Class", 		title: "Class", 		show: true },
					{ field: "Method", 		title: "Method", 		show: true },
					{ field: "Exception", 	title: "Exception", 	show: true },
					{ field: "Others", 		title: "Others", 		show: true },
			    ];//*/
				
				self.columns = {
					"LID": {"title": "Reference ID of log message within log file. Higher numbers are more recent messages."},
					"Package": {"title": "Package Name"},
				};

				// delete a row from the dataset
			    self.del = function(row) {
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
				
				// create a popup with contents of param, deprecated in favour of bootstrap modals
				self.alert = function(param){
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
                
				//Highlight row on click
				self.isSelected = [];
				self.toggleSelection = function (log) {
					log.isSelected =! log.isSelected;
					console.log("row selection toggled: ", log.isSelected);
				}

                // open modal to display full log in scrollable subview
                self.view = function(log){
                    // open a modal view of that log message
                    var modalInstance = $uibModal.open({
						animation: true,
						templateUrl: 'partials/sub/inspectLogWeb.html',
						controller: 'inspectLogWebCtrl',
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
                        self.view($rootScope.data[nextID]);
                    }, function () {
						//console.log('Modal dismissed at: ' + new Date());
						}
					);
                }
                
                // open small modal with quick view of passed parameter
                self.quickView = function(param){
                    debugger;
                }

			    self.tableParams = new NgTableParams({
			        page: self.pagination.currentPage,            // show first page
			        count: self.pagination.perPage,           // count per page
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
			        filter: self.filters,
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
						self.tableParams.settings({
							dataset: $rootScope.data
						});
						//debugger;
					}, 200)
					
					
				});
				
			}],
			controllerAs: 'logsWebCtrl'
        };
    });
})();