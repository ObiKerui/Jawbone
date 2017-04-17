
(function() {
  'use strict';

  angular
    .module('jawboneApp')   
    .controller('LoaderCtrl', LoaderCtrlFtn)
    .directive('loader', LoaderDirFtn);

  function LoaderCtrlFtn($scope) {
    var vm = this; 
    vm.message = 'Loading...';
    vm.loader = 'app/loaders/_basic-spinner-tpl.html'; 
    vm.width = 300;
    vm.height = 300;

    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      if(newval) {
        vm.message = newval;
      }
    }); 
  }

  function LoaderDirFtn() {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'LoaderCtrl',
      controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/loaders/_loader-frame-tpl.html'
    };
    return directive;   
  }
})();
