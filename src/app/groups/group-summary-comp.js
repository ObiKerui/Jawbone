
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('GroupSummObj', GroupSummObjFtn)
    .controller('GroupSummCtrl', GroupSummCtrlFtn)
    .directive('groupSummary', GroupSummDirFtn);

  function GroupSummObjFtn() {
    var GroupSummObj = function(arg) {
    	var obj = this;
      	obj.actionBar = arg.tpl || 'app/groups/_group-summary-action-bar-tpl.html';
      	obj.group = arg || {};
    };
    return GroupSummObj;
  }

  function GroupSummCtrlFtn($scope, $log) {
    var vm = this;  

    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      if(newval) {
        //$log.info('assign patient summ obj : ' + JSON.stringify(newval));
        vm.pso = vm.obj;        
      }
    }); 
  }

  function GroupSummDirFtn() {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'GroupSummCtrl',
      controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/groups/_group-summary-tpl.html'
    };
    return directive;   
  }
})();
