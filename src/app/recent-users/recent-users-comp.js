(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('RecentUsersObj', RecentUsersObjFtn);

  // function buildCallbacks($log, obj) {

  //   obj.onSelect = function(sel) {
  //   };

  //   obj.onConfirm = function() {
  //     $log.info('recent confirm it');
  //   };

  // }

  // function buildListViewer($q, $log, UserObj) {
  //   //$log.info('recent users data: ' + JSON.stringify(sleepsdata));
  //   obj.listobj = {};
  //   //obj.listobj.template = 'app/sleeps/_sleeps-element-tpl.html';
  //   //obj.listobj.headerbar = 'app/sleeps/_sleeps-header-tpl.html';
  //   obj.listobj.heading = 'Recent Users';

  //   obj.listobj.getElements = function() {
  //     var deferred = $q.defer();
  //     deferred.resolve(sleepsdata || []);
  //     return deferred.promise;
  //   }

  //   obj.listobj.makeElement = function(objElement) {
  //     return new SleepObj(objElement)
  //   };    

  // }

  // function SleepsComponentBuilderFtn($q, $log, UserObj) {
  //   var RecentUsersBuilder = function() {
  //     var obj = this;

  //     buildCallbacks($log, obj);
  //     buildListViewer($q, $log, UserObj);

  //   };
  //   return RecentUsersBuilder;
  // }


  function RecentUsersObjFtn($q, $log, JawboneService, UserObj) {
    var RecentUsersObj = function(jbdata, getUsers) {

      var obj = this;
      obj.data = jbdata || {};
      obj.recentUsers = [];

      function newUser(newUser) {
        $log.info('recent-user obj new user selected: ' + JSON.stringify(newUser.data));
        obj.recentUsers.push(newUser.data);
        obj.listobj.onPopulate();
      }

      JawboneService.setUserCallback(newUser);

      obj.listobj = obj.listobj || {};
      obj.listobj.heading = 'Recent Users';
      obj.listobj.template = obj.listobj.template || 'app/user/_user-element-tpl.html';
      obj.listobj.chunksize = obj.listobj.chunksize || 1;

      obj.listobj.getElementsObj = JawboneService.makeBatch('recentUsers');
      // obj.listobj.getElements = function() {
      //   var deferred = $q.defer();
      //   deferred.resolve(obj.recentUsers);
      //   return deferred.promise;
      // };

      obj.listobj.makeElement = function(value) {
        //$log.info('user to-a make : ' + JSON.stringify(value));
        return new UserObj(value);
      };

    };
    return RecentUsersObj;
  }

  /** @ngInject */
  // function RecentUsersCtrl($log, $scope, RecentUsersObj) {
  //   var vm = this;  

  //   $scope.$watch(function(scope) {
  //     return (vm.obj);
  //   }, function(newval, oldval) {
  //     if(newval) {
  //       vm.smo = new RecentUsersObj(vm.obj);
  //     }
  //   }); 
  // }	

  // function recentUsersFtn($log) {
  //   var directive = {
  //     restrict: 'E',
  //       scope: {},
  //       controller: 'RecentUsersCtrl',
  //       controllerAs: 'ctrl',
  //     bindToController: {
  //       obj : '='
  //     },
  //     templateUrl: 'app/recent-users/_recent-users-tpl.html'
  //   };
  //   return directive;   
  // }
})();