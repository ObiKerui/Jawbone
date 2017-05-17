
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('SleepListV2Interface', InterfaceFtn);

    var id = 'sleeps/sleep-list-v2-comp: ';

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function InterfaceFtn($log, BaseInterface, SleepObj, JawboneService) {
    var iface = function(config) {

		var makeHeaderObj = makeHeaderObjFtn;
	  	var ifaceInst = this;

		angular.merge(ifaceInst, ifaceInst, new BaseInterface());      	

		ifaceInst.config = { 
			patient : config.patient || null,
			header : {
				heading: 'Sleeps',
				headerTemplate: 'app/sleeps/_sleeps-header-tpl.html',
				headerObj: makeHeaderObj()
			},
			events: {
				onCreated : function(api) {
					$log.info(id + ' on created');
				},
				onSelect : function(elem) {
					$log.info(id + ' on Select');
				},
				onDeselect : function(elem) {
					$log.info(id + ' on Deselect');
				},
				onConfirm : function() {
					$log.info(id + ' admin on Confirm function');
				},
				onStateChange : function() {
					$log.info(id + ' admin on State Change function');
				},
				onEvent : function() {
					$log.info(id + ' admin on Event function');
				}
			},
			loaderMessage: 'Loading Sleeps...',          
			getElementsObj : JawboneService.makeBatch(JawboneService.makeEndpoint('sleeps')),
			makeElement : function(element) {       
			  return new SleepObj(element);
			},
			elementTemplate: 'app/sleeps/_sleeps-element-tpl.html'                        
	    };

		function makeHeaderObjFtn() {
		}

		return ifaceInst;  
    };
    return iface;
  }
})();
