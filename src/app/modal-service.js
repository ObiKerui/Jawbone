(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .controller('DefaultModalInstanceCtrl', DefaultModalInstanceCtrl)
    .factory('BaseSelector', BaseSelectorFtn)
    .factory('ModalService', ModalService)
    .factory('CommonModals', CommonModals);

    //--------------------------------------------------------------------
    // DEFAULT MODAL INSTANCE CTRL
    //--------------------------------------------------------------------
	function DefaultModalInstanceCtrl(resolveArg, $uibModalInstance, $log) {
		var vm = this;
		vm.resolveArg = resolveArg;
		vm.template = resolveArg.tpl || 'app/_default-modal-tpl.html';

		vm.ok = function () {
		  $uibModalInstance.close(vm.resolveArg);
		};

		vm.cancel = function () {
		  $uibModalInstance.dismiss(vm.resolveArg);
		};
	 }

    //--------------------------------------------------------------------
    // BASE SELECTOR
    //--------------------------------------------------------------------
	 function BaseSelectorFtn($log, BaseInterface) {
	 	var selector = function(config) {
	 		var selectorInst = new BaseInterface();
	 		config = config || {};
	 		var selection = null;

	 		selectorInst.iface = config.iface;
	 		selectorInst.tpl = config.tpl;
	 		selectorInst.onSelect = function(arg) {
	 			$log.info('selection made: ' + JSON.stringify(arg.iface));
	 		};
	 		selectorInst.onConfirm = function(arg) {
	 			$log.info('base selector was confirmed: ' + JSON.stringify(arg.iface));
	 			selectorInst.iface.config.onConfirm(arg.iface);
	 		};

	 		return selectorInst;
	 	};
	 	return selector;
	 }

    //--------------------------------------------------------------------
    // COMMON MODAL TYPES
    //--------------------------------------------------------------------
	function CommonModals($log, $q, ModalService) {
		var service = {
			confirm: confirm,
			selector: selector
		};
		return service;

		function confirm(msg) {
			var ps = {};
			ps.modalSize = 'sm';
			ps.tpl = 'app/_default-confirm-modal-tpl.html';
			ps.msg = msg || 'no message';
			ps.confirmed = false;
	  		ps.onConfirm = function() {
	  			ps.confirmed = true;
	  		};
			return ModalService.onClick(ps)
			.then(function(response) {
				return response.confirmed;
			});			
		}

		function selector(selectObj) {
			return ModalService.onClick(selectObj)
			.then(function(response) {
				return response.confirmed;
			});						
		}
	}

	//------------------------------------------------------
	//  JAWBONE DATA SERVICE 
	//------------------------------------------------------  
	function ModalService($log, $q, $uibModal) {
	    var service = {
	  		init : init,
	  		onClick : onClick
	  	};
	  	return service;    

	  	/*
	  	*	INITIALISE JAWBONE SERVICE
	  	*/
	  	function init() {
	  	}

	  	/*
	  	*	GET DATA
	  	* 	MODIFY THIS TO GET A SPECIFIED USER'S DATA FROM SERVER
	  	*/
	  	function onClick(ps) {
	  		//$log.info('params: ' + JSON.stringify(params));
	  		ps = ps || {};
	  		var ctrl = ps.ctrl || 'DefaultModalInstanceCtrl';
	  		var modalSize = ps.size || 'md';
	  		ps.tpl = ps.tpl || 'app/_default-modal-tpl.html';
	  		ps.onConfirm = ps.onConfirm || function() {
	  			$log.info('supply on confirm ftn');
	  		};
	  		ps.onDismiss = ps.onDismiss || function() {
	  			$log.info('supply on dismiss ftn');
	  		};

	  		var deferred = $q.defer();
        	var modalInstance = $uibModal.open({
	          	animation: false,
    	      	ariaLabelledBy: 'modal-title',
        	  	ariaDescribedBy: 'modal-body',
          		templateUrl: 'app/_modal-frame-tpl.html',
          		controller: ctrl,
          		controllerAs: 'ctrl',
          		size: modalSize,
          		resolve: {
            		resolveArg : function () {
              			return ps;
            		}
          		}
        	});

	        modalInstance.result.then(function(modalObj) {
	         	modalObj.onConfirm(ps);
	         	deferred.resolve(modalObj);
	        }, function(modalObj) {
	          modalObj.onDismiss(ps);
	          deferred.resolve(modalObj);
	        });

	        return deferred.promise;        
	  	}


	  	// function onClick(params) {
	  	// 	//$log.info('params: ' + JSON.stringify(params));
	  	// 	var ps = params || {};
	  	// 	var ctrl = ps.ctrl || 'DefaultModalInstanceCtrl';
	  	// 	var modalSize = ps.size || 'md';
	  	// 	ps.tpl = ps.tpl || 'app/_default-modal-tpl.html';
	  	// 	ps.onConfirm = ps.onConfirm || function() {
	  	// 		$log.info('supply on confirm ftn');
	  	// 	};
	  	// 	ps.onDismiss = ps.onDismiss || function() {
	  	// 		$log.info('supply on dismiss ftn');
	  	// 	};

	  	// 	var deferred = $q.defer();
    //     	var modalInstance = $uibModal.open({
	   //        	animation: false,
    // 	      	ariaLabelledBy: 'modal-title',
    //     	  	ariaDescribedBy: 'modal-body',
    //       		templateUrl: 'app/_modal-frame-tpl.html',
    //       		controller: ctrl,
    //       		controllerAs: 'ctrl',
    //       		size: modalSize,
    //       		resolve: {
    //         		resolveArg : function () {
    //           			return ps;
    //         		}
    //       		}
    //     	});

	   //      modalInstance.result.then(function(modalObj) {
	   //       	modalObj.onConfirm(ps);
	   //       	deferred.resolve(modalObj);
	   //      }, function(modalObj) {
	   //        modalObj.onDismiss(ps);
	   //        deferred.resolve(modalObj);
	   //      });

	   //      return deferred.promise;        
	  	// }

	}
})();