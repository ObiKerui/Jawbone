(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('HeaderBarObj', HeaderBarFtn)
    .controller('HeaderBarCtrl', HeaderBarCtrl)
    .directive('headerBar', headerBarFtn);

  function HeaderBarFtn($log) {
    var HeaderBar = function(data) {
      var obj = this;
      obj.data = data || {};
      obj.message = 'hello there';

    };
    return HeaderBar;
  }

  /** @ngInject */
  function HeaderBarCtrl($log, $scope, HeaderBarObj) {
    var vm = this;  
    vm.o = null;

    //$log.info('header bar: ' + JSON.stringify(vm.tpl));
    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      if(newval) {
        vm.o = newval;
      }
    }); 
  }	

  function headerBarFtn($log) {
    var directive = {
      restrict: 'E',
        scope: {},
        controller: 'HeaderBarCtrl',
        controllerAs: 'ctrl',
      bindToController: {
        tpl : '=',
        obj : '='
      },
      template: '<div ng-include=\'ctrl.obj.headerbar\'></div>'
      //template: '<div ng-include=\'ctrl.tpl\'></div>{{ctrl.tpl}} {{ctrl.obj.headerbar}}'
    };
    return directive;   
  }
})();