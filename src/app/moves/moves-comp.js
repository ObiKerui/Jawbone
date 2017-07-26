(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('MovesObj', MovesObjFtn)
    .controller('MovesCtrl', MovesCtrl)
    .directive('moves', movesFtn)
    .factory('MoveObj', MoveObjFtn)
    .controller('MoveCtrl', MoveCtrl)
    .directive('move', moveFtn);

  function MovesObjFtn($log) {
    var MovesObj = function(data) {
      this.data = data || {};
      //$log.info('data: ' + JSON.stringify(data));
      this.elements = data.items || [];
    };
    return MovesObj;
  }

  /** @ngInject */
  function MovesCtrl($log, $scope, MovesObj) {
    var vm = this;
  
    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      if(newval) {
        vm.mo = new MovesObj(vm.obj);
      }
    });
  }	

  function movesFtn($log) {
    var directive = {
      restrict: 'E',
        scope: {},
        controller: 'MovesCtrl',
        controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/moves/_moves-tpl.html'
    };
    return directive;   
  }

  function MoveObjFtn($log) {
    var MoveObj = function(data) {
      this.data = data || {};
      this.date = data.date || new Date();
      this.title = data.title || 'blank';
      
    };
    return MoveObj;
  }

  /** @ngInject */
  function MoveCtrl($q, $log, $http, $window, MoveObj) {
    var vm = this;
    vm.mo = new MoveObj(vm.obj); 

    //$log.info('move obj: ' + JSON.stringify(vm.mo));   
  } 

  function moveFtn($log) {
    var directive = {
      restrict: 'E',
        scope: {},
        controller: 'MoveCtrl',
        controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/moves/_move-tpl.html'
    };
    return directive;   
  }  
})();