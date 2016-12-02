(function() {	
    angular.module('myApp', ['mainform','logtable','ngAnimate'])
	//add cookies back in ,'ngCookies'
	
	.run(function($http,$rootScope) {		
        $rootScope.authenticated = true;
        $rootScope.authToken = "test";
		$rootScope.startField = "test";		
		
		$rootScope.getLocation = function(){
			return 'MSTR Web Log Parser'
		}
		$rootScope.doReset = function () {
	        $rootScope.data = new Array();
	    }		
	})
	
	.config(function ($httpProvider) {
		// passthru auth
	    $httpProvider.defaults.withCredentials = true;
	})
	
	.directive('elastic', [
	    '$timeout',
	    function($timeout) {
	        return {
	            restrict: 'A',
	            link: function($scope, element) {
	                $scope.initialHeight = $scope.initialHeight || element[0].style.height;
	                var resize = function() {
	                    element[0].style.height = $scope.initialHeight;
	                    element[0].style.height = "" + element[0].scrollHeight + "px";
	                };
	                element.on("input change", resize);
	                $timeout(resize, 0);
	            }
	        };
	    }
	]);
})();