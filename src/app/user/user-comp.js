(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('UsersComponentBuilder', UsersComponentBuilderFtn)
    .factory('UserSelectorObj', UserSelectorObjFtn)
    .factory('UserComp', UserCompFtn)
    .factory('UserObj', UserObjFtn)
    .controller('UserCtrl', UserCtrl)
    .directive('user', userFtn);

  function buildCallbacks($log, obj, callbacks) {
    obj.selectedUser = null
    obj.onSelect = function(su) {
      obj.selectedUser = su;
      $log.info('selected de user: ' + JSON.stringify(obj.selectedUser));
      callbacks.onSelect(obj.selectedUser);
    };

    obj.onConfirm = function() {
      $log.info('user yah confirm it : ' + JSON.stringify(obj.selectedUser));
      callbacks.onConfirm();
    };
  }

  function buildListViewer($log, obj, UserObj, batchRetriever) {
    //$log.info('profile data: ' + JSON.stringify());
    obj.listobj = {};
    obj.listobj.template = 'app/user/_user-element-tpl.html';
    obj.listobj.heading = 'Users';
    obj.listobj.getElementsObj = batchRetriever;

    // obj.listobj.getElements = function() {
    //   return getUsers().then(function(result) {
    //     $log.info('return dat result: ' + JSON.stringify(result));
    //     return result;
    //   }, function(err) {
    //     return [];
    //   });
    // }

    obj.listobj.makeElement = function(objElement) {
      return new UserObj(objElement)
    };    
  }

  function UsersComponentBuilderFtn($log, UserObj, JawboneService) {
    var UsersComponentBuilder = function(callbacks) {

      //$log.info('incoming data: ' + JSON.stringify(usersdata));
      var obj = this;
      var bobj = JawboneService.makeBatch('users');

      // build the callbacks
      buildCallbacks($log, obj, callbacks);
      buildListViewer($log, obj, UserObj, bobj);

    };
    return UsersComponentBuilder;
  }

  function UserSelectorObjFtn($log, UsersComponentBuilder) {
    var UserSelectorObj = function(onConfirm) {
      var obj = this;
      obj.tpl = 'app/user/_user-select-modal-tpl.html';
      obj.selection = null;

      obj.onSelect = function(arg) {
        obj.selection = arg;
        //$log.info('callbacks: on select function: ' + JSON.stringify(obj.selection));
      };

      obj.onConfirm = function() {
        if(onConfirm) {
          onConfirm(obj.selection);
        }
      };

      obj.callbacks = {
        onSelect : obj.onSelect,
        onConfirm : obj.onConfirm
      };

      obj.userlist = new UsersComponentBuilder(obj.callbacks);
    };
    return UserSelectorObj;
  }

  function UserCompFtn($log, UserObj, ModalService, UserSelectorObj, JawboneService) {
    var UserComp = function(userdata) {

      $log.info('data to user control: ' + JSON.stringify(userdata));

      var obj = this;
      obj.profiledata = userdata || {};
      obj.profile = new UserObj(obj.profiledata);
      
      obj.clickFtn = userdata.clickFtn || function() {        
        // create modal
        ModalService.onClick(new UserSelectorObj(function(obj) {
          $log.info('this called to confirm selection: ' + JSON.stringify(obj));
          JawboneService.setUser(obj);
        }))
        .then(function(result) {
          $log.info('result of modal: ' + JSON.stringify(result));
        });
      };

      obj.onClick = function() {
        obj.clickFtn();
      };
    }
    return UserComp;
  }

  function UserObjFtn($log, JawboneService) {
    var UserObj = function(objElement) {
      $log.info('obj supplied to UserObj: ' + JSON.stringify(objElement));
      //$log.info('profile userobject user: ' + JSON.stringify(objElement.profile));
      var o = this;
      o.data = objElement || {};
      o.jawboneId = objElement.jawboneId || 'blank';
      o.obj = objElement.profile || {};
      o.first = o.obj.first || 'blank';
      o.last = o.obj.last || 'blank';
      o.weight = o.obj.weight || 'blank weight';
      o.gender = o.obj.gender || 'no gender';
      o.height = o.obj.height || 'no height';
      o.image = JawboneService.extractData('userImage', objElement);

      o.selected = false;

      o.activated = function() {
        o.selected = true;
      };

      o.deactivated = function() {
        o.selected = false;
      }
      
    };
    return UserObj;
  }

  /** @ngInject */
  function UserCtrl($q, $log, $http, $window, $scope) {
    var vm = this;

    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      if(newval) {
        vm.uo = vm.obj;
      }
    });
  }	

  function userFtn($log) {
    var directive = {
      restrict: 'E',
        scope: {},
        controller: 'UserCtrl',
        controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/user/_user-tpl.html'
    };
    return directive;   
  }
})();