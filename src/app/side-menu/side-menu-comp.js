(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('SideMenuObj', SideMenuObjFtn)
    .controller('SideMenuCtrl', SideMenuCtrl)
    .directive('sideMenu', sideMenuFtn);

  function SideMenuObjFtn($log) {
    var SideMenuObj = function(data) {
      this.data = data || {};
    };
    return SideMenuObj;
  }

  /** @ngInject */
  function SideMenuCtrl($log, $scope, SideMenuObj) {
    var vm = this;  

    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      if(newval) {
        vm.smo = new SideMenuObj(vm.obj);
      }
    }); 
  }	

  function sideMenuFtn($log) {
    var directive = {
      restrict: 'E',
        scope: {},
        controller: 'SideMenuCtrl',
        controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/side-menu/_side-menu-tpl.html'
    };
    return directive;   
  }
})();