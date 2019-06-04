(function() {
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
            self.paginationWeb = {};
            self.paginationWeb.currentPage = 1;
            self.paginationWeb.perPage = 50;

          self.debug = function(param){
              debugger;
          };

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

            if (self.dragging){
                //console.log("Must have dragged");
                return false;
            } else {
                self.viewWebMessage(log);
            }
            };
          self.mouseMove = function(event){
            //console.log("mouse moved");
              self.dragging = true;
            };
          self.dblClick = function($event){
            //console.log("double click");
            //$event.preventDefault();
              //$event.stopPropagation();
            };
          self.preventAction = function($event){
              $event.preventDefault();
              $event.stopPropagation();
          };

            // Enable resize
            self.resizeWeb = false;
          self.toggleResizeWeb = function () {
              if (self.resizeWeb) {
              console.log('disabling resize');
              $('#ngTableWebLogs').colResizable({
                  disable: true
                });
                self.resizeWeb = false;
              } else {
              console.log('enabling resize');
              $('#ngTableWebLogs').colResizable({
                  fixed: false,
                  liveDrag: true,
                  resizeMode: 'overflow',
                gripInnerHtml:"<div class='grip'></div>", 
                  draggingClass: 'dragging'
                });
                self.resizeWeb = true;
            }
          };
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
            "LID": {'title': 'Reference ID of log message within log file. Higher numbers are more recent messages.'},
            "Package": {'title': 'Package Name'},
            };

            // delete a row from the dataset
            self.delWeb = function(row) {
            _.remove(self.webLogTableParams.settings().dataset, function(item) {
                return row === item;
              });

              self.webLogTableParams.reload().then(function(data) {
              if ($rootScope.dataset.logs.web.length === 0 && self.webLogTableParams.total() > 0) {
                self.webLogTableParams.page(self.webLogTableParams.page() - 1);
                  self.webLogTableParams.reload();
                }
              });
          };

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
          };
                
          //Highlight row on click
            self.isSelected = [];
          self.toggleSelection = function (log) {
            log.isSelected =!log.isSelected;
            console.log('row selection toggled: ', log.isSelected);
          };

          // open modal to display full log in scrollable subview
          self.viewWebMessage = function(log){
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
              });

              modalInstance.result.then(
                function(result) {
                  var nextID;
              if (result.action == 'next'){
                    // debugger;
                nextID = result.data - 1;//since rows are in reverse order, top row is first row
                  } else if (result.action == 'previous') {
                    nextID = result.data + 1;
              }
                  //todo this doesn't work when sort order is changed
                  self.viewWebMessage($rootScope.dataset.logs.web[nextID]);
            }, function () {
                  //console.log('Modal dismissed at: ' + new Date());
            }
            );
          };
              );
            };

            // open small modal with quick view of passed parameter
          self.quickView = function(param){
              debugger;
          };

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

            //>>>>>>> web log is empty for some reason, when uploading more than one file? ng-repeat brings no results
            self.webLogTableParams = new NgTableParams(
              {
                page: self.paginationWeb.currentPage, // show first page
                count: self.paginationWeb.perPage, // count per page
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
                filter: self.filters
              },
              {
                //filterSwitch: true,
                //total: 0, // length of data
                filterOptions: {
                  filterDelay: 200
                },
                dataset: $rootScope.dataset.logs.web,
                /*
						getData: function(params) {
				            var orderedData = params.sorting() ? $filter('orderBy')($scope.completedQueries, params.orderBy()) : data;
				            orderedData	= $filter('filter')(orderedData, params.filter());
				            params.total(orderedData.length);
				            return orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
				        }
						getData: function(params){
						    // method to do custom filtering etc of data
						    return $rootScope.dataset.logs.web;
					
					
						},//*/
            counts: [10, 25, 50, 100, 500],//1000 is SLOW
              }
            );

            // watch data source for any changes
            /*
				$rootScope.$watch('dataset.logs.web', function () {
					// update dataset view on delay
					$timeout(function(){
						//debugger;
						//console.log("reloading table data")
						self.webLogTableParams.settings({
							dataset: $rootScope.dataset.logs.web
						});
						self.webLogTableParams.reload();
						//debugger;
					}, 300)
				});//*/

          $scope.$on('dataset.web.added', function(){
              //console.log("handle added dataset");
            $timeout(function(){
                //debugger;
                //console.log("reloading table data")
                self.webLogTableParams.settings({
                  dataset: $rootScope.dataset.logs.web
                });
                self.webLogTableParams.reload();
                //debugger;
              }, 100);
            });
          }
        ],
        controllerAs: 'logsWebCtrl'
      };
    });
})();
