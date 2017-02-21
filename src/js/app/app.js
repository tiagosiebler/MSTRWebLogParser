(function() {	
    angular.module('myApp', ['startform','logsWeb','ngAnimate','ngProgress','Data'])
	//add cookies back in ,'ngCookies'
	
	.run(function($http,$rootScope,$uibModal,ngProgressFactory,Data) {		
        $rootScope.authenticated = true;
        $rootScope.authToken = "test";
		$rootScope.startField = "test";		
        $rootScope.data = new Array();
        
		$rootScope.getLocation = function(){
			return 'MSTR Web Log Parser'
		}
		$rootScope.doReset = function () {
            //delete($rootScope.data);
	        $rootScope.data = new Array();
	    }
        $rootScope.viewHelp = function(){
             var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'partials/sub/helpView.html',
                size: 'lg',
            });
        }
		$rootScope.isParsing = function(){
			if(typeof(Data) == 'undefined') return false;
			return Data.isParsing();
		};
		$rootScope.isUploading = function(){
			if(typeof(Data) == 'undefined') return false;
			return Data.isUploading();
		};
		
		// link any monitoring vars to rootScope, so they're accessible from the DOM scope
		
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