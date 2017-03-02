(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('MoodsObj', MoodsObjFtn)
    .controller('MoodsCtrl', MoodsCtrl)
    .directive('moods', moodsFtn);

  function MoodsObjFtn($log) {
    var MoodsObj = function(data) {
      this.data = data || {};
    };
    return MoodsObj;
  }

  /** @ngInject */
  function MoodsCtrl($log, $scope, MoodsObj) {
    var vm = this;  

    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      if(newval) {
        vm.mo = new MoodsObj(vm.obj[2]);
      }
    }); 
  }	

  function moodsFtn($log) {
    var directive = {
      restrict: 'E',
        scope: {},
        controller: 'MoodsCtrl',
        controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/moods/_moods-tpl.html'
    };
    return directive;   
  }
})();