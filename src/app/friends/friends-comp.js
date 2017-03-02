(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('FriendsObj', FriendsObjFtn)
    .controller('FriendsCtrl', FriendsCtrl)
    .directive('friends', friendsFtn);

  function FriendsObjFtn($log) {
    var FriendsObj = function(data) {
      this.data = data || {};
    };
    return FriendsObj;
  }

  /** @ngInject */
  function FriendsCtrl($log, $scope, FriendsObj) {
    var vm = this;

    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      if(newval) {
        vm.fo = new FriendsObj(vm.obj[1]);
      }
    }); 

  }	

  function friendsFtn($log) {
    var directive = {
      restrict: 'E',
        scope: {},
        controller: 'FriendsCtrl',
        controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/friends/_friends-tpl.html'
    };
    return directive;   
  }
})();