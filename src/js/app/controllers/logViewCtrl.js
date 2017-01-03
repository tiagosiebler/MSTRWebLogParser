angular.module('logViewCtrl', [])//'confirm'
	.controller('logViewCtrl', ['$scope', '$uibModalInstance', 'log', '$timeout', '$document', '$rootScope', function ($scope, $uibModalInstance, log, $timeout, $document, $rootScope) {
        $scope.log = log;//direct reference instead of clone
		
		$scope.saveLabel = "Save Application"
		$scope.saveAction = "next";
	    $scope.save = function () {
			var result = {
				action: $scope.saveAction,
				data: $scope.app
			};
			$uibModalInstance.close(result);
	    };
		

	    $scope.cancel = function () {
			$uibModalInstance.dismiss('cancel');
	    };
		
        $scope.navigateTo = function($direction){
            var result = {
                action: $direction,
                data: $scope.log.id
            };
            $uibModalInstance.close(result);
        }
        
        var EnumKeys = {
            left : 37,
            right : 39,
        }
        function eventHandler(event) {
           // console.log("event pressed: ",event.keyCode);
            //37 = left key
            //39 = right key
            if (event.keyCode === EnumKeys.left) {
                if($scope.log.id != ($rootScope.data.length - 1)){
                   // debugger;
                    console.log("moved left: ",$scope.log);
                    $scope.navigateTo("previous");
                }else{
                    console.log("refusing left action, this is the most recent log file");
                }
            }
            if (event.keyCode === EnumKeys.right) {
                //delete($scope.log);
                //$scope.log = $rootScope.data[(log.id+1)];
                if($scope.log.id != 1){
                    console.log("moved right: ",$scope.log);
                    $scope.navigateTo("next");
                }else{
                    console.log("refusing right action, this is the last log file");
                }
            }
        }
        
        var EVENT_TYPES = "keydown keypress"
        $document.bind(EVENT_TYPES, eventHandler);
        
		// catch modal close actions and add warning with possibility to cancel
		$scope.$on('modal.closing', function(event, reason, closed) {
			var message = "You are about to leave the edit view. Uncaught reason. Are you sure?";

			if(typeof reason === 'object' && reason.action === 'save'){
				message = "Save changes?";
			}
			else switch (reason){
				// clicked outside
				case "backdrop click":
					message = "Any changes will be lost, are you sure?";
					break;
				
				// cancel button
				case "cancel":
					message = "Any changes will be lost, are you sure?";
					break;
				
				// escape key
				case "escape key press":
					message = "Any changes will be lost, are you sure?";
					break;
					
				default:
					console.log('modal.closing: ' + (closed ? 'close' : 'dismiss') + '(' + reason + ')');
					break;
			}
            /*
			if (!confirm(message)) {
				event.preventDefault();
			}//*/
		});
			  
		$scope.autoExpand = function(e) {
			var element = typeof e === 'object' ? e.target : document.getElementById(e);
	        //element.style.height = 'auto';
	        element.style.height = element.scrollHeight + 2 +'px';
	    };
		// init stuff here
		$scope.onShow = function(){
		    $timeout(function(){
                $scope.autoExpand('email_body');
            }, 0);
			
		}
		
		function resize(){
		    //$scope.autoExpand('email_body');
		}
	}
]);