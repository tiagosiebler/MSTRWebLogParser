(function() {
    angular.module('mainform', ['ngFileUpload'])

    // directives make HTML easier, pull in subfiles without much effort.
    // <product-title></>
    .directive('mainform', function() {
        return {
            restrict: 'E',
            templateUrl: 'partials/mainform.html',
            link: function (scope, element, attrs) {

			},
			controller: ['$scope','$rootScope', function($scope, $rootScope) {
				var eventHandler = function(e) {
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
                    $scope.parseXMLLog(pastedData);
                    $scope.$apply()
                }
                //$document.
                var EVENT_TYPES = "paste";
                document.getElementById('editableDiv').addEventListener(EVENT_TYPES, eventHandler);    
                
                $scope.pasted = false;
                $scope.flipPaste = function(){
                    
                }
                
                $scope.pasteLog = function(param){
                    debugger;
                    
                    var theURL = prompt("Please paste the log file here","<record><package>com.mstr.test</package><etc>...");
                    //debugger;
                    $rootScope.data = new Array();
                    $scope.parseXMLLog(theURL);
                }
                

                // doesn't work for most pages due to CORS
                /*$scope.loadURL = function(param){
                    var theURL = prompt("Please provide a URL to a MicroStrategy Web Log file","http://path/to/file");
                    
                    window.URL = window.URL || window.webkitURL;  // Take care of vendor prefixes.

                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', theURL, true);
                    xhr.responseType = 'blob';

                    xhr.onload = function(e) {
                        if (this.status == 200) {
                            var blob = this.response;
                            var reader = new FileReader();

                            reader.onloadend = function () {
                                console.log(reader.result); //this is an ArrayBuffer
                                window.URL.revokeObjectURL(theURL); // Clean up after yourself.
                            }

                            reader.readAsArrayBuffer(blob);
                        }
                    }
                    xhr.send();
                }//*/
                $scope.concatExtraCols = function(row){					
					
					var template = { 
					    'package' : 'Java package within which message was triggered', 
					    'level' : 'Logging level',
					    'miliseconds' : 'Message milliseconds',
					    'timestamp' : 'Message timestamp',
					    'thread' : 'Thread ID',
					    'class' : 'Java class that triggered this message',
					    'method' : 'Method in java class that triggered this message',
					    'message' : 'Message',
					    'exception' : 'Full exception, if available',
						'others' : 'Used as a placeholder for abnormal extra xml tags and values'
					};
					if(!row.hasOwnProperty('others')) row.others = "";											
					
					for (var key in row) {
						// check against list for known keys
					    if (!template.hasOwnProperty(key) && row.hasOwnProperty(key) && typeof(row[key]) == 'string') {
						    //console.log($rootScope.index + ": "+ key + " ( "+  typeof(row[key]) + ") -> " + row[key]);
							row.others += "(" + key + ")->" + row[key] + "; \n";
						}
					}
				};
                $scope.parseXMLLog = function(contentStr){
                    var xml = "<xml>" + contentStr +"</xml>";
                    var x2js = new X2JS();

                    var json = x2js.xml_str2json(xml);

                    //console.log("length: ",json.xml.length);

                    if(json.xml.record.length){
                        console.log("Processing " + json.xml.record.length + " rows");

                        for(var ii = 0;ii< json.xml.record.length;ii++){
                            $scope.concatExtraCols(json.xml.record[ii]);

                            json.xml.record[ii].id = $rootScope.index;


                            //package, level, miliseconds, timestamp, thread, class, method, message, exception			

                            $rootScope.data.push(json.xml.record[ii]);
                            $rootScope.index++;

                        }

                    }else{
                        console.log("Processing 1 row");
                        $scope.concatExtraCols(json.xml.record);

                        json.xml.record.id = $rootScope.index;
                        $rootScope.data.push(json.xml.record)
                        $rootScope.index++;
                    }

                    //console.log("Current dataset: ", $rootScope.data);
                    console.log("current dataset contains this many log rows: ", $rootScope.data.length)
                    //debugger;
                }
				$scope.uploadXmlFile = function(files){
					if(!files) return;

					$rootScope.data = new Array();
					$rootScope.index = 0;
					console.clear();
					
			        if (files && files.length) {
						$scope.log = "Processing " + files.length + " files.";
						
			            for (var i = 0; i < files.length; i++) {
			                var file = files[i];
							
							reader = new FileReader();
							
							reader.onloadend = function(e){
								//debugger;
								$scope.log = "Loaded " + i + "/" + files.length + " files.";
								
								//var xml = "<xml>" + e.target.result +"</xml>";
                                $scope.parseXMLLog(e.target.result);
								
							};
							reader.readAsText(file, 'UTF-8');
						}
					}
				};
				
				$scope.$watch('files', function () {
					$scope.uploadXmlFile($scope.files);
			    });
				
				$scope.$watch('file', function () {
					if ($scope.file != null) {
					    $scope.files = [$scope.file]; 
					}
				});
				$scope.log = '';
				
			    
			}],
			controllerAs: 'mainformCtrl'
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