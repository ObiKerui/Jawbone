(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('HeaderBarObj', HeaderBarFtn)
    .controller('HeaderBarCtrl', HeaderBarCtrl)
    .directive('headerBar', headerBarFtn);

  function HeaderBarFtn($log) {
    var HeaderBar = function(data) {
      this.data = data || {};
    };
    return HeaderBar;
  }

  /** @ngInject */
  function HeaderBarCtrl($log, $scope, HeaderBarObj) {
    var vm = this;  

    $log.info('header bar: ' + JSON.stringify(vm.tpl));
    // $scope.$watch(function(scope) {
    //   return (vm.obj);
    // }, function(newval, oldval) {
    //   if(newval) {
    //     vm.mo = new HeaderBarObj(vm.obj);
    //   }
    // }); 
  }	

  function headerBarFtn($log) {
    var directive = {
      restrict: 'E',
        scope: {},
        controller: 'HeaderBarCtrl',
        controllerAs: 'ctrl',
      bindToController: {
        tpl : '='
      },
      template: '<div ng-include=\'ctrl.tpl\'></div>'
    };
    return directive;   
  }
})();