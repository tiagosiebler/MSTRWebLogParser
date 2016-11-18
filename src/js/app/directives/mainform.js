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
								
								console.log("length: ",json.xml.length);
								
								if(json.xml.record.length){
									console.log(json.xml.record.length + " rows");
									
									for(var ii = 0;ii< json.xml.record.length;ii++){										
										json.xml.record[ii].id = $rootScope.index;
										$rootScope.data.push(json.xml.record[ii]);
										$rootScope.index++;
										
									}
									
								}else{
									console.log("1 row");
									
									json.xml.record.id = $rootScope.index;
									$rootScope.data.push(json.xml.record)
									$rootScope.index++;
								}
								
							  	
						  		console.log("loaded: ", $rootScope.data);
								console.log("have this many results: ", $rootScope.data.length)
								
								
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