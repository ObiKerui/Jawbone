
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('BaseCtrl', BaseCtrlFtn)
    .factory('BaseComp', BaseCompFtn)  
    .factory('BaseInterface', BaseInterfaceFtn);

  //trying to pull common ctrl logic into base function
  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function BaseCtrlFtn($log, $rootScope, BaseInterface) {
    var ctrl = function(iface, createObjFtn, onRenderFtn) {

      $rootScope.$watch(function(scope) {
        return (iface);
      }, function(iface, oldval) {
        iface = (iface ? iface : new BaseInterface());
        var obj = createObjFtn(iface);
        iface.setAPI(obj.getAPI);
        obj.api.render(function(state) {
          onRenderFtn(obj);
        });        
      }); 
    };
    return ctrl;
  }

  //----------------------------------------------------
  //  BASE COMP FUNCTION
  //----------------------------------------------------  
  function BaseCompFtn($log) {
    var obj = function() {
      
      var objInst = this;
         
      objInst.api = { 
        render: function(cb) {
          $log.info('implement a render function');
          cb();
        },      
        notify: function(event, arg) {
          $log.info('implement notify function: event: ' + event);
        }
      };

      // get rid of this once all switched to v3
      objInst.connect = function(iface, api, init) {
        $log.info('iface to connect: ' + JSON.stringify(iface));
        iface.connectInterface(iface, function() {
          return api;
        }, function(connectedIface) {
          $log.info('iface right now: ' + JSON.stringify(connectedIface));
          init(connectedIface);
        });
      };

      objInst.getAPI = function() {
        return objInst.api;
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
      //ifaceInst.status = 'created';

      // ifaceInst.connectInterface = function(iface, getObject, cb) {
      //   $log.info('the iface instance: ' + JSON.stringify(ifaceInst));
      //   iface.getObjectAPI = getObject;
      //   iface.status = 'connected';
      //   cb(iface);
      // };

      ifaceInst.config = {};

      ifaceInst.setAPI = function(getAPI) {
        ifaceInst.getObjectAPI = getAPI;
      };

      ifaceInst.getAPI = function() {
        return ifaceInst.getObjectAPI();
      };

      ifaceInst.notify = function(event, arg) {
        var api = ifaceInst.getObjectAPI();
        $log.info('called notify on base interface. API: ' + JSON.stringify(api));
        api.notify(event, arg);
      };

      return ifaceInst;
    };
    return iface;
  }

})();
