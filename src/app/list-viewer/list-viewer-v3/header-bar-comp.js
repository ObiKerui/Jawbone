(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('HeaderBarV3Interface', InterfaceFtn)
    .factory('HeaderBarV3Obj', ObjFtn)
    .controller('HeaderBarV3Ctrl', CtrlFtn)
    .directive('headerBarV3', directiveFtn);

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function InterfaceFtn($log, BaseInterface) {
    var iface = function(config) {
      var ifaceInst = new BaseInterface();
      var config = config || {};

      ifaceInst.config = {          
        tpl: config.tpl || null,
        getListAPI : config.getListAPI || null
      };

      return ifaceInst;            
    };
    return iface;
  }

  function ObjFtn($log, BaseComp) {
    var object = function(iface) {
      var objInst = new BaseComp();

      objInst.api = {
        render : function(cb) {
          $log.info('render function of header bar');          
        },
        getListAPI: function() {
          $log.info('called get list api');
          return iface.config.getListAPI();
        }
      };     

      return objInst;
    };
    return object;
  }

  /** @ngInject */
  function CtrlFtn($log, $scope, HeaderBarV3Obj) {
    var vm = this;  

    $scope.$watch(function(scope) {
      return (vm.iface);
    }, function(iface, oldval) {
      if(iface) {
        vm.obj = new HeaderBarV3Obj(iface);
        iface.setAPI(vm.obj.getAPI);
        vm.obj.getAPI().render(function(result) {
          $log.info('>>> >>> >>> header bar v3 render function...');
        });
      }
    }); 
  }	

  function directiveFtn($log) {
    var directive = {
      restrict: 'E',
        scope: {},
        controller: 'HeaderBarV3Ctrl',
        controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      template: '<div ng-include=\'ctrl.iface.config.tpl\'></div>'
    };
    return directive;   
  }
})();