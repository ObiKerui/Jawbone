
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .filter('movesListV3filter', FilterFtn)    
    .factory('MovesListV3Interface', InterfaceFtn)  
    .factory('MovesV3Obj', ObjectFtn);

  //----------------------------------------------------
  //  FILTER FUNCTION
  //----------------------------------------------------  
  function FilterFtn() {
    return function(arg) {  
      if(arg) {
      	// do something with arg
        return arg;
      }
      return arg;
    }     
  }

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function InterfaceFtn($log, ListViewerV3Interface, JawboneService, ListViewerElemInterface, ListElemAPI, MovesV3Obj) {
    var iface = function(config) {
      var ifaceInst = new ListViewerV3Interface();
      var config = config || {};

      var userId = config.userId || null;
      var patient = config.patient || {};
      var jawboneId = patient.jawboneId || null;
      $log.info('the patient passed to moves list is : ' + JSON.stringify(patient));
      $log.info('while the user id is: ' + userId);
      ifaceInst.config.makeGetElementsObj = function() {
        return JawboneService.makeBatch(JawboneService.makeEndpoint('moves', jawboneId));
      },
      ifaceInst.config.makeListElementFtn = function(listData) {
        return new ListViewerElemInterface({
          api : new ListElemAPI(listData),
          data : new MovesV3Obj(listData.element)
        });
      };
      ifaceInst.config.headerTpl = 'app/moves/moves-v3/_moves-header-tpl.html';

      return ifaceInst;
    };
    return iface;
  }

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log, JawboneService) {
    var object = function(data) {
    	var objInst = this;

    	data = data || {};
    	var details = data.details || {};
      objInst.date = data.date || new Date();
      objInst.calories = details.calories || 0;
      objInst.bmr = details.bmr || 0;
      objInst.distance = details.distance || 0;
      objInst.steps = details.steps || 0;
      objInst.template = 'app/moves/moves-v3/_moves-list-elem-tpl.html';

      objInst.getField = function(index) {
        switch(index) {
          case 0:
            return objInst.calories;
          case 1:
            return objInst.bmr;
          case 2:
            return objInst.distance;
          case 3: 
            return objInst.steps;
          default:
            return 0;
        }
      };

    	$log.info('details passed to move objec: ' + JSON.stringify(data, true, 2));

      	return objInst;
    };
    return object;
  }
})();
