
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .filter('sleepsListfilter', FilterFtn)    
    .factory('SleepsListInterface', InterfaceFtn)
    .factory('SleepsV3Obj', ObjFtn);

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
  function InterfaceFtn($log, ListViewerV3Interface, JawboneService, ListViewerElemInterface, SleepsV3Obj, ListElemAPI) {
    var iface = function(config) {
      //var ifaceInst = this;
      var ifaceInst = new ListViewerV3Interface();
      var config = config || {};

      ifaceInst.config = {      
      	getElementsObj : JawboneService.makeBatch(JawboneService.makeEndpoint('sleeps')),
      	makeListElementFtn : function(listData) {
          return new ListViewerElemInterface({
            api : new ListElemAPI(listData),
            data : new SleepsV3Obj(listData.element)
          });
      	}   
      };

      return ifaceInst;
    };
    return iface;
  }

  function convertToMinutes(str, $log) {
    str = str.toString();

    var arr = str.match(/\d+/g);
    if(arr.length === 2) { // hours and minutes
      return (parseInt(arr[0]) * 60) + (parseInt(arr[1]));
    } else if(arr.length === 1 ) { // only minutes
      return (parseInt(arr[0]));
    } else { 
      return str;
    }
  }  

  function ObjFtn($log) {
    var obj = function(data) {
    	var objInst = this;

      $log.info('sleep data: ' + JSON.stringify(data));

      objInst.date = data.date || new Date();
      objInst.title = convertToMinutes(data.title, $log);
      var details = data.details || {};
      objInst.sounds = details.sound || 'blank';
      objInst.awakenings = details.awakenings || 0;
      objInst.light = details.light || 0;
      objInst.sleep_time = details.sleep_time || 0;
      objInst.awake_time = details.awake_time || 0;
      objInst.awake = details.awake || 0;
      objInst.rem = details.rem || 0;
      objInst.duration = details.duration || 0;
      objInst.image = 'https://jawbone.com' + data.snapshot_image;
      objInst.template = 'app/sleeps/sleeps-v3/_sleeps-list-elem-tpl.html';

      return objInst;
    };
    return obj;
  }

})();
	