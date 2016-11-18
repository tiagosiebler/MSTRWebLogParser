(function() {
    angular.module('Data', ['ngProgress'])
	.factory("Data", ['$http', 'ngProgressFactory', '$rootScope', '$q',
		function ($http, ngProgressFactory, $rootScope, $q) {
			
			
			var timestamp = new Date().getTime();
			timestamp = '?&i='+timestamp;
			var progressBar = ngProgressFactory.createInstance();
			//progressBar.setParent(document.getElementById('main-container'));
			progressBar.queue = 0;
			progressBar.updateQueue = function(value){
				var startedNow = true;
				if(progressBar.queue == 0) startedNow = false;
				//debugger;
				progressBar.queue = progressBar.queue + value;
				
				if(progressBar.queue > 0) {
					if(!startedNow) {
						progressBar.start();
					}
					else{
						if(progressBar.queue != 1){
							var newVal = (100 / progressBar.queue);
							progressBar.set(newVal);
							progressBar.start();
						}
					}
				}
				else{
					progressBar.complete();
				}
			}
			
		    var obj = {};
		    var serviceBase = 'API/';
			obj.handleError = function(e){
				//debugger;
				if(typeof(e.data) != 'undefined' && e.data){
					console.log("POST failed",e);
					console.log(e.data.status + " : " + e.data.message + " : " + e.data.cause);
					$rootScope.hasError = true;
					$rootScope.error = {
						status: e.data.status,
						message: e.data.message,
						cause: e.data.cause
					}; 
				}else{
					//don't think this will ever hit, unless server is unreachable?
					$rootScope.hasError = true;
					$rootScope.error = {
						status: -1,
						message: "uncaught exception",
						cause: "check that the URL is correct and that the server is reachable."
					}; 
				}
			};
		    obj.get = function (url, headers, params) {
				//debugger;
				progressBar.updateQueue(1);
				return $http({
		            method: 'GET',
				    headers: headers,
					url: url + params
				}).catch(function(e){
					obj.handleError(e);
				}).then(function (results) {
					progressBar.updateQueue(-1);
					console.log("post results: ",results);
					
					if(typeof results == 'undefined'){
						return $rootScope.error;
					}
					return results;
					
		        });
		    };
		    obj.post = function (url, postBody, headers) {	
				progressBar.updateQueue(1);
				return $http({
		            method: 'POST',
				    headers: headers,
					url: url,
					data: postBody 
				}).catch(function(e){
					console.log("POST failure", e);
					obj.handleError(e);
				}).then(function (results) {
					progressBar.updateQueue(-1);
					console.log("post results: ",results);
					
					if(typeof results == 'undefined'){
						return $rootScope.error;
					}
					return results;
					
		        });
		    };
		    obj.delete = function (url, headers) {	
				//debugger;
				progressBar.updateQueue(1);
				return $http({
		            method: 'DELETE',
				    headers: headers,
					url: url
				}).then(function (results) {
					progressBar.updateQueue(-1);
					
					console.log("DELETE results: ");
					console.log(results);
					return results;
		        });
		    };
		    obj.put = function (q, object) {
		        return $http.put(serviceBase + q, object).then(function (results) {
					console.log("put: " + JSON.stringify(results.data));
					
		            return results.data;
		        });
		    };
		    return obj;
		}
	])
	
})();