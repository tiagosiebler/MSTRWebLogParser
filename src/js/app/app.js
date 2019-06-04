(function() {
  angular
    .module('myApp', [
      'startform',
      'ngAnimate',
      'ngProgress',
      'Data',
      'logsWeb',
      'logsKernel'
    ])

    .run(function($http, $rootScope, $uibModal, ngProgressFactory, Data) {
      $rootScope.authenticated = true;
      $rootScope.authToken = 'test';
      $rootScope.startField = 'test';

      $rootScope.getLocation = function() {
        return 'MicroStrategy Log Parser';
      };

      $rootScope.getErrorCSS = function(error) {
        if (!error) return 'alert-danger';

        //{error.status == 'Warning' ? ''alert-warning' : 'alert-danger'}
        if (error.status == 'Warning') return 'alert-warning';
        else return 'alert-danger';
      };

      $rootScope.doReset = function() {
        $rootScope.totalData = 0;
        return Data.resetLogs();
      };

      $rootScope.viewHelp = function() {
        var modalInstance = $uibModal.open({
          animation: true,
          templateUrl: 'partials/sub/helpView.html',
          size: 'lg'
        });
      };

      $rootScope.totalData = 0;
      $rootScope.dataset = {
        //these will hold the data processed by the parser
        logs: {
          web: new Array(),
          kernel: new Array(),
          iserver: new Array(),
          skipped: new Array()
        },
        indexes: {
          web: 0,
          kernel: 0,
          iserver: 0,
          skipped: 0
        },
        //hold the state of the parser, whether it's still processing incoming data
        state: {
          isParsing: false, //processing uploaded file
          uploading: false, //uploading
          filesParsing: 0,
          filesParsed: 0
        }
      };
      $rootScope.isParsing = function() {
        return $rootScope.dataset.state.isParsing;
      };
      $rootScope.isUploading = function() {
        return $rootScope.dataset.state.isUploading;
      };

      // link any monitoring vars to rootScope, so they're accessible from the DOM scope
    })

    .config(function($httpProvider) {
      // passthru auth
      $httpProvider.defaults.withCredentials = true;
    })

    .directive('elastic', [
      '$timeout',
      function($timeout) {
        return {
          restrict: 'A',
          link: function($scope, element) {
            $scope.initialHeight =
              $scope.initialHeight || element[0].style.height;
            var resize = function() {
              element[0].style.height = $scope.initialHeight;
              element[0].style.height = '' + element[0].scrollHeight + 'px';
            };
            element.on('input change', resize);
            $timeout(resize, 0);
          }
        };
      }
    ]);
})();
