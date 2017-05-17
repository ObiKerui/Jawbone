
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('BaseComp', BaseCompFtn)  
    .factory('BaseInterface', BaseInterfaceFtn);

  //----------------------------------------------------
  //  BASE COMP FUNCTION
  //----------------------------------------------------  
  function BaseCompFtn($log) {
    var obj = function() {
      
      var objInst = this;
      objInst.api = {        
      };

      objInst.connect = function(iface, api, init) {
        $log.info('iface to connect: ' + JSON.stringify(iface));
        iface.connectInterface(iface, function() {
          return api;
        }, function(connectedIface) {
          $log.info('iface right now: ' + JSON.stringify(connectedIface));
          init(connectedIface);
        });
      };

      return objInst;
    };
    return obj;
  }

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function BaseInterfaceFtn($log) {
    var iface = function() {
      var ifaceInst = this;
      ifaceInst.getObjectAPI = null;
      ifaceInst.status = 'created';

      ifaceInst.connectInterface = function(iface, getObject, cb) {
        $log.info('the iface instance: ' + JSON.stringify(ifaceInst));
        iface.getObjectAPI = getObject;
        iface.status = 'connected';
        cb(iface);
      };

      return ifaceInst;
    };
    return iface;
  }

})();
