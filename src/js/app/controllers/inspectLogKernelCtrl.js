angular
  .module('inspectLogKernelCtrl', []) //'confirm'
  .controller('inspectLogKernelCtrl', [
    '$scope',
    '$uibModalInstance',
    'log',
    '$timeout',
    '$document',
    'Data',
    '$rootScope',
    function(
      $scope,
      $uibModalInstance,
      log,
      $timeout,
      $document,
      Data,
      $rootScope
    ) {
      var self = $scope;

      self.log = log; //direct reference instead of clone

      self.saveLabel = 'Save Application';
      self.saveAction = 'next';
      self.save = function() {
        var result = {
          action: self.saveAction,
          data: self.app
        };
        $uibModalInstance.close(result);
      };

      self.cancel = function() {
        $uibModalInstance.dismiss('cancel');
      };

      self.navigateTo = function($direction) {
        var result = {
          action: $direction,
          data: self.log.id
        };
        $uibModalInstance.close(result);
      };

      var EnumKeys = {
        left: 37,
        right: 39
      };
      function eventHandler(event) {
        // console.log("event pressed: ",event.keyCode);
        //37 = left key
        //39 = right key
        if (event.keyCode === EnumKeys.left) {
          if (self.log.id != $rootScope.dataset.logs.kernel.length - 1) {
            //last element is actually 1 before total element count due to array notation
            // debugger;
            console.log('moved left: ', self.log);
            self.navigateTo('previous');
          } else {
            console.log(
              'refusing left action, this is the most recent log file'
            );
          }
        }
        if (event.keyCode === EnumKeys.right) {
          //delete(self.log);
          if (self.log.id != 0) {
            console.log('moved right: ', self.log);
            self.navigateTo('next');
          } else {
            console.log('refusing right action, this is the last log file');
          }
        }
      }

      var EVENT_TYPES = 'keydown keypress';
      $document.bind(EVENT_TYPES, eventHandler);

      self.autoExpand = function(e) {
        var element =
          typeof e === 'object' ? e.target : document.getElementById(e);
        //element.style.height = 'auto';
        element.style.height = element.scrollHeight + 2 + 'px';
      };
      // init stuff here
      self.onShow = function() {
        $timeout(function() {
          self.autoExpand('email_body');
        }, 0);
      };
    }
  ]);
