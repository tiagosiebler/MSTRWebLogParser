(function() {
  angular
    .module('logsKernel', [
      'ngTable',
      'ui.bootstrap',
      'JSONfilter',
      'inspectLogKernelCtrl'
    ])

    .directive('logskernel', function() {
      return {
        restrict: 'E',
        templateUrl: 'partials/logsKernel.html',
        link: function(scope, element, attrs) {},
        controller: [
          '$scope',
          '$rootScope',
          'NgTableParams',
          '$filter',
          '$timeout',
          '$uibModal',
          function(
            $scope,
            $rootScope,
            NgTableParams,
            $filter,
            $timeout,
            $uibModal
          ) {
            var self = $scope;

            self.total = {};
            self.pagination = {};
            self.pagination.currentPage = 1;
            self.pagination.perPage = 50;

            self.debug = function(param) {
              debugger;
            };

            // all tracking vars for drag n drop action
            self.dragging = false;
            self.mouseIsDown = false;
            self.mouseDown = function(event) {
              //console.log("mouse down");
              self.mouseIsDown = true;
              self.dragging = false;
            };
            self.mouseUp = function(log) {
              //console.log("mouse up");
              self.mouseIsDown = false;

              if (self.dragging) {
                //console.log("Must have dragged");
                return false;
              } else {
                self.viewKernelMessage(log);
              }
            };
            self.mouseMove = function(event) {
              //console.log("mouse moved");
              self.dragging = true;
            };
            self.dblClick = function($event) {
              console.log('double click');
              //$event.preventDefault();
              //$event.stopPropagation();
            };
            self.preventAction = function($event) {
              $event.preventDefault();
              $event.stopPropagation();
            };

            self.containsError = function(param) {
              if (typeof param.XMLActionName == 'undefined') return false;

              if (param.XMLActionName.indexOf('failed') !== -1) return true;

              return false;
            };
            self.getRowClass = function(row) {
              // mark rows differently if they have an error.
              if (this.containsError(row)) {
                if (row.isSelected) return 'bg-danger';
                else return 'bg-warning';
              } else if (row.isSelected) return 'bg-primary';
            };

            // Enable resize
            self.resizeKernel = false;
            self.toggleResizeKernel = function() {
              if (self.resizeKernel) {
                console.log('disabling resize');
                $('#ngTableKernelLogs').colResizable({
                  disable: true
                });
                self.resizeKernel = false;
              } else {
                console.log('enabling resize');
                $('#ngTableKernelLogs').colResizable({
                  fixed: false,
                  liveDrag: true,
                  resizeMode: 'overflow',
                  gripInnerHtml: "<div class='grip'></div>",
                  draggingClass: 'dragging'
                });
                self.resizeKernel = true;
              }
            };

            self.downloadJSON = function(exportObj, exportName) {
              var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
              var downloadAnchorNode = document.createElement('a');
              downloadAnchorNode.setAttribute("href", dataStr);
              downloadAnchorNode.setAttribute("download", exportName + ".json");
              document.body.appendChild(downloadAnchorNode); // required for firefox
              downloadAnchorNode.click();
              downloadAnchorNode.remove();
            }

            self.download = function(typeString) {
              var exportObj = $rootScope.dataset.logs.kernel;
              var exportName = "microstrategyKernelLog";

              if (typeString == 'json') {
                return self.downloadJSON(exportObj, exportName);
              }
              console.warn("Can't download(), unknown type string: ", typeString);
            }

            self.columns = {
              LID: {
                title:
                  'Reference ID of log message within log file. Higher numbers are more recent messages.'
              },
              Package: { title: 'Package Name' },
              XMLCommand: {
                title: 'Contents of <st><sst><st><cmd> within the raw XML'
              }
            };

            // delete a row from the dataset
            self.delKernel = function(row) {
              _.remove(self.kernelLogTableParams.settings().dataset, function(
                item
              ) {
                return row === item;
              });

              self.kernelLogTableParams.reload().then(function(data) {
                if (
                  $rootScope.dataset.logs.kernel.length === 0 &&
                  self.kernelLogTableParams.total() > 0
                ) {
                  self.kernelLogTableParams.page(
                    self.kernelLogTableParams.page() - 1
                  );
                  self.kernelLogTableParams.reload();
                }
              });
            };

            //Highlight row on click
            self.isSelected = [];
            self.toggleSelection = function(log) {
              log.isSelected = !log.isSelected;
              console.log('row selection toggled: ', log.isSelected);
            };

            // open modal to display full log in scrollable subview
            self.viewKernelMessage = function(log) {
              // open a modal view of that log message
              var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'partials/sub/inspectLogKernel.html',
                controller: 'inspectLogKernelCtrl',
                size: 'lg',
                windowClass: 'app-modal-window',
                resolve: {
                  log: function() {
                    return log;
                  }
                }
              });

              modalInstance.result.then(
                function(result) {
                  var nextID;
                  if (result.action == 'next') {
                    // debugger;
                    nextID = result.data - 1; //since rows are in reverse order, top row is first row
                  } else if (result.action == 'previous') {
                    nextID = result.data + 1;
                  }
                  //todo this doesn't work when sort order is changed
                  self.viewKernelMessage(
                    $rootScope.dataset.logs.kernel[nextID]
                  );
                },
                function() {
                  //console.log('Modal dismissed at: ' + new Date());
                }
              );
            };

            // open small modal with quick view of passed parameter
            self.quickView = function(param) {
              debugger;
            };

            self.filters = {
              date: '',
              time: '',

              host: '',
              pid: '',
              thread: '',

              XMLActionName: '', //XML Command, XML GetFolderID, etc
              XMLDetails: '', //other details, if not xml string
              XMLRaw: '', //xml
              XMLCommand: '' //xml.st.sst.st.cmd
            };

            self.kernelLogTableParams = new NgTableParams(
              {
                page: self.pagination.currentPage, // show first page
                count: self.pagination.perPage, // count per page
                sorting: {
                  id: 'desc',
                  date: '',
                  time: '',

                  host: '',
                  pid: '',
                  thread: '',

                  XMLActionName: '', //XML Command, XML GetFolderID, etc
                  XMLDetails: '', //other details, if not xml string
                  XMLRaw: '', //xml
                  XMLCommand: '' //xml.st.sst.st.cmd
                },
                filter: self.filters
              },
              {
                //filterSwitch: true,
                //total: 0, // length of data
                filterOptions: {
                  filterDelay: 200
                },
                dataset: $rootScope.dataset.logs.kernel,
                /*
						getData: function(params) {
				            var orderedData = params.sorting() ? $filter('orderBy')($scope.completedQueries, params.orderBy()) : data;
				            orderedData	= $filter('filter')(orderedData, params.filter());
				            params.total(orderedData.length);
				            return orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
				        }
						getData: function(params){
						    // method to do custom filtering etc of data
						    return $rootScope.dataset.logs.kernel;


						},//*/
                counts: [10, 25, 50, 100, 500] //1000 is SLOW
              }
            );

            // watch data source for any changes
            $rootScope.$watch('dataset.logs.kernel', function() {
              // update dataset view on delay
              $timeout(function() {
                //debugger;
                //console.log("reloading table data")
                self.kernelLogTableParams.settings({
                  dataset: $rootScope.dataset.logs.kernel
                });
                self.kernelLogTableParams.reload();
              }, 300);
            });

            $scope.$on('dataset.kernel.added', function() {
              //console.log("handle added dataset");
              $timeout(function() {
                self.kernelLogTableParams.settings({
                  dataset: $rootScope.dataset.logs.kernel
                });
                self.kernelLogTableParams.reload();
              }, 100);
            });
          }
        ],
        controllerAs: 'logsKernelCtrl'
      };
    });
})();
