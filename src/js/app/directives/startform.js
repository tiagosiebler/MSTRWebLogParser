(function() {
    angular.module('startform', ['ngFileUpload','Data'])
    .directive('startform', function() {
        return {
            restrict: 'E',
            templateUrl: 'partials/startform.html',
            link: function (scope, element, attrs) {

			},
			controller: ['$scope','$rootScope','Data', function($scope, $rootScope, Data) {
			    var self = $scope;				
				
				var inputPasteHandler = function(e) {
					Data.progressBar.start();
					
                    var clipboardData, pastedData;

                    // Stop data actually being pasted into div
                    e.stopPropagation();
                    e.preventDefault();

                    // Get pasted data via clipboard API
                    clipboardData = e.clipboardData || window.clipboardData;
                    pastedData = clipboardData.getData('Text');

                    // Do whatever with pasteddata
                    Data.resetLogs();
					
                    Data.processNewLog(pastedData);
                    self.$apply();
					
					Data.progressBar.complete();
                }
                //$document.
                var EVENT_TYPES = "paste";
                document.getElementById('editableDiv').addEventListener(EVENT_TYPES, inputPasteHandler);    
				
				self.uploadFile = function(files){					
					if(!files) return;

					Data.resetLogs();
					console.clear();
					
					$rootScope.dataset.state.filesParsing = files.length;
					console.log("Upload XML file");
					
			        if (files && files.length) {
						Data.progressBar.start();
                        $rootScope.dataset.state.isParsing = true;

						self.log = "Processing " + files.length + " files.";
						
			            for (var i = 0; i < files.length; i++) {
			                var file = files[i];
							
							reader = new FileReader();
							reader.onloadend = function(e){
								self.log = "Loaded " + i + "/" + files.length + " files.";
                                Data.processNewLog(e.target.result);
							};
							reader.readAsText(file, 'UTF-8');
						}
					}else{
						console.log("no files registered: ",files);
					}
				};
				
				self.$watch('files', function () {
					self.uploadFile(self.files);
			    });
				
				self.$watch('file', function () {
					if (self.file != null) {
					    self.files = [self.file]; 
					}
				});
				self.log = '';
				
			    
			}],
			controllerAs: 'startformCtrl'
        };
    })
    .directive('sglclick', ['$parse', function($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attr) {
              var fn = $parse(attr['sglclick']);
              var delay = 300, clicks = 0, timer = null;
              element.on('click', function (event) {
                clicks++;  //count clicks
                if(clicks === 1) {
                  timer = setTimeout(function() {
                    scope.$apply(function () {
                        fn(scope, { $event: event });
                    }); 
                    clicks = 0;             //after action performed, reset counter
                  }, delay);
                  } else {
                    clearTimeout(timer);    //prevent single-click action
                    clicks = 0;             //after action performed, reset counter
                  }
              });
            }
        };
    }])
})();