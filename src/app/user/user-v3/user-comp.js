
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .filter('userListV3filter', FilterFtn)    
    .factory('UserListV3Interface', InterfaceFtn)  
    .factory('UserV3Obj', ObjectFtn);

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
  function InterfaceFtn($log, JawboneService, ListViewerV3Interface, ListViewerElemInterface, ListElemAPI, UserV3Obj) {
    var iface = function(config) {
  		var ifaceInst = new ListViewerV3Interface();
  		var config = config || {};

		  ifaceInst.config.getElementsObj = JawboneService.makeBatch(JawboneService.makeEndpoint('users'));
      ifaceInst.config.makeListElementFtn = function(listData) {
        return new ListViewerElemInterface({
          api : new ListElemAPI(listData),
          data : new UserV3Obj(listData.element)
        });
      };
      ifaceInst.config.onSelect = config.onSelect || function(element, index) {
        $log.info('supply on select function to UserListV3Interface');
      };
      ifaceInst.config.onDeselect = config.onDeselect || function(element, index) {
        $log.info('supply on deselect function to UserListV3Interface');
      };
		  return ifaceInst;            
    };
    return iface;
  }

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log) {
    var object = function(data) {
    	var objInst = this;

    	$log.info('>>>>>> want jawbone id >>>>> data to user v3 object: ' + JSON.stringify(data));
    	var profile = data.profile || {};
      var jbdata = data.jawboneData || {};
    	objInst._id = data._id || null;
      objInst.jawboneId = jbdata.jawboneId || null;
    	objInst.memberSince = data.createdAt || null;
    	objInst.email = data.email || null;
    	objInst.first = profile.first || null;
    	objInst.last = profile.last || null;
    	objInst.weight = profile.weight || null;
    	objInst.height = profile.height || null;
    	objInst.gender = profile.gender || null;
      	objInst.template = 'app/user/user-v3/_user-list-elem-tpl.html';

		return objInst;
    };
    return object;
  }
})();
