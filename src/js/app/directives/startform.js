(function() {
    angular.module('startform', ['ngFileUpload','Data'])

    // directives make HTML easier, pull in subfiles without much effort.
    // <product-title></>
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
                    $rootScope.data = new Array();
					$rootScope.index = 0;
                    self.parseXMLLog(pastedData);
                    self.$apply()
					
					Data.progressBar.complete();
                }
                //$document.
                var EVENT_TYPES = "paste";
                document.getElementById('editableDiv').addEventListener(EVENT_TYPES, inputPasteHandler);    
				
                self.parseXMLLog = function(contentStr){
                    //todo add logic here to determine the type of log (web/webxmlAPI/kernelAPI/DSSErrors.log)
                    
                    // web log files are xml but aren't wrapped in an XML tab.
                    var xml = "<xml>" + contentStr +"</xml>";
                    var x2js = new X2JS();
                    var json = x2js.xml_str2json(xml);
                    if(json.xml.record.length){
                        console.log("Processing " + json.xml.record.length + " rows");

                        for(var ii = 0;ii< json.xml.record.length;ii++){
                            Data.concatExtraColsWeb(json.xml.record[ii]);

                            json.xml.record[ii].id = $rootScope.index;
                            $rootScope.data.push(json.xml.record[ii]);
                            $rootScope.index++;
                        }
                    }else{
                        console.log("Processing 1 row");
                        Data.concatExtraColsWeb(json.xml.record);

                        json.xml.record.id = $rootScope.index;
                        $rootScope.data.push(json.xml.record)
                        $rootScope.index++;
                    }
					Data.state.filesParsed++;
					
					if(Data.state.filesParsed == Data.state.filesParsing){
						Data.progressBar.complete();
						Data.state.isParsing = false;
					}
                    //console.log("Current dataset: ", $rootScope.data);
                    console.log("current dataset contains this many log rows: ", $rootScope.data.length)
                }
				self.uploadXmlFile = function(files){					
					if(!files) return;

					$rootScope.data = new Array();
					$rootScope.index = 0;

					Data.state.filesParsed = 0;
					Data.state.filesParsing = 0;
					console.clear();
					
					Data.state.filesParsing = files.length;
					console.log("Upload XML file");
					
			        if (files && files.length) {
						Data.progressBar.start();
                        Data.state.isParsing = true;

						self.log = "Processing " + files.length + " files.";
						
			            for (var i = 0; i < files.length; i++) {
			                var file = files[i];
							
							reader = new FileReader();
							
							reader.onloadend = function(e){
								//debugger;
								self.log = "Loaded " + i + "/" + files.length + " files.";
                                self.parseXMLLog(e.target.result);
							};
							reader.readAsText(file, 'UTF-8');
						}
					}else{
						console.log("no files registered: ",files);
					}
                    //delete(files);
					//self.$apply();
				};
				
				self.$watch('files', function () {
					self.uploadXmlFile(self.files);
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