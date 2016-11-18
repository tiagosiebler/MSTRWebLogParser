(function() {
    angular.module('sidebar', [])

    // directives make HTML easier, pull in subfiles without much effort.
    // <product-title></>
    .directive('sidebar', function() {
        return {
            restrict: 'E',
            templateUrl: 'partials/sidebar.html',
			link: function (scope, element, attrs) {
				
			},
			controller: ['$scope', function($scope) {				
				
			    $scope.doLogin = function (form) {
					
				};
				
				
			}],
			controllerAs: 'sidebarCtrl'
        };
    });
})();