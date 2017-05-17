(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('HeaderBarV2Obj', ObjFtn)
    .controller('HeaderBarV2Ctrl', CtrlFtn)
    .directive('headerBarV2', directiveFtn);

  function ObjFtn($log) {
    var object = function(data) {
      // var obj = this;
      // obj.data = data || {};
      // obj.message = 'hello there';

    };
    return object;
  }

  /** @ngInject */
  function CtrlFtn($log, $scope, HeaderBarV2Obj) {
    var vm = this;  
    // vm.o = null;

    //$log.info('header bar: ' + JSON.stringify(vm.tpl));
    // $scope.$watch(function(scope) {
    //   return (vm.iface);
    // }, function(newval, oldval) {
    //   if(newval) {
    //     $log.info('header bar v2: new value: ' + JSON.stringify(newval));
    //     vm.o = newval;
    //   }
    // }); 
  }	

  function directiveFtn($log) {
    var directive = {
      restrict: 'E',
        scope: {},
        controller: 'HeaderBarV2Ctrl',
        controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      template: '<div ng-include=\'ctrl.iface.header.headerTemplate\'></div>'
    };
    return directive;   
  }
})();