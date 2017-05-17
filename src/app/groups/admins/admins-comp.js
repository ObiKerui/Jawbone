
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('AdminMgrInterface', InterfaceFtn)  
    .factory('AdminMgrObj', ObjectFtn)
    .controller('AdminMgrCtrl', AdminMgrCtrlFtn)
    .directive('adminMgr', AdminMgrDirFtn);

  var name = 'groups/admins/AdminMgrComp : ';
  var log = null;
  var jbservice = null;
  var modalservice = null;
  var promiseService = null;

  /**
  * IMPLEMENT THIS OBJECT TO CREATE AN ADMIN MANAGER OBJ
  */
  function InterfaceFtn($log, BaseInterface) {
    var iface = function(config) {
      var ifaceInst = this;
      var config = config || {};

      angular.merge(ifaceInst, ifaceInst, new BaseInterface());

      ifaceInst.config = {
          groupId : config.groupId || null
      };

      ifaceInst.notify = function(eventName) {
        var api = ifaceInst.getObjectAPI();
        api.notify(eventName);
      };

      return ifaceInst;
    };
    return iface;
  }

  function ObjectFtn($log, BaseComp, AdminMgrInterface, ListV2Interface, GroupMemberObj, JawboneService) {
    var object = function(iface) {

      var makeHeaderObj = makeHeaderObjFtn;
      var initialise = initialiseFtn;

    	var obj = this;
      var listapi = null;

      // extend from BaseObject
      angular.merge(obj, obj, new BaseComp());

      var api = {
        message: 'adminMgrObject API',
        notify: function(eventName) {
          $log.info('admin mgr handle event: ' + eventName);
          switch(eventName) {
            case 'reveal':
              obj.listIface.notify(eventName);
          }
        }
      };

      obj.connect(iface, api, initialise);

      function initialiseFtn(iface) {
        obj.listIface = new ListV2Interface({
          header : {
            heading: 'Admins',
            headerTemplate: 'app/groups/admins/_admin-action-bar-tpl.html',
            headerObj: makeHeaderObj()
          },
          events: {
            onCreated : function(api) {
              $log.info(name + ' on created');
            },
            onSelect : function(elem) {
              $log.info(name + ' on Select');
            },
            onDeselect : function(elem) {
              $log.info(name + ' on Deselect');
            },
            onConfirm : function() {
              $log.info(name + ' admin on Confirm function');
            },
            onStateChange : function() {
              $log.info(name + ' admin on State Change function');
            },
            onEvent : function() {
              $log.info(name + ' admin on Event function');
            }
          },
          loaderMessage: 'Loading Admins...',          
          getElementsObj : JawboneService.makeBatch(JawboneService.makeFieldGetter('groups', iface.config.groupId, 'admins')),
          makeElement : function(element) {       
            return new GroupMemberObj(element);
          },
          elementTemplate: 'app/patient/_group-member-element-tpl.html'               
        });        
      }

      function makeHeaderObjFtn() {
        return {
          createAdmin : function() {
            $log.info(name + ' call to create admin');
          },

          deleteAdmins : function() {
            $log.info(name + ' call to delete admin');
          }
        };
      }

      return obj;
    };
    return object;
  }

  function AdminMgrCtrlFtn($scope, $log, AdminMgrObj) {
    var vm = this;  
    vm.obj = null;

    $scope.$watch(function(scope) {
      return (vm.iface);
    }, function(newval, oldval) {
      if(newval) {
        //$log.info('create AdminMrgObj with iface: ' + JSON.stringify(newval));
        vm.obj = new AdminMgrObj(newval);
      }
    }); 
  }

  function AdminMgrDirFtn() {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'AdminMgrCtrl',
      controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      templateUrl: 'app/groups/admins/_admin-mgr-tpl.html'
    };
    return directive;   
  }
})();
