(function() {
    angular.module('mainform', ['ngFileUpload'])

    // directives make HTML easier, pull in subfiles without much effort.
    // <product-title></>
    .directive('mainform', function() {
        return {
            restrict: 'E',
            templateUrl: 'partials/mainform.html',
			/*
			link: function (scope, element, attrs) {
				scope.uploadButton = element[0].getElementsByClassName("uploadButton")[0];
				scope.uploadButton.onchange = function(e) {
					scope.uploadXmlFile(e);
				};
			},//*/
			controller: ['$scope','$rootScope', function($scope, $rootScope) {
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
								
								var xml = "<xml>" + e.target.result +"</xml>";
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
								
						  		console.log("Current dataset: ", $rootScope.data);
								console.log("Contains this many log rows: ", $rootScope.data.length)
								//debugger;
								
							};
							reader.readAsBinaryString(file);
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
    });
})();