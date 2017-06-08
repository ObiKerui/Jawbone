
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .filter('adminManagerV3filter', FilterFtn)    
    .factory('AdminManagerV3Interface', InterfaceFtn)  
    .factory('AdminManagerV3Obj', ObjectFtn)
    .controller('AdminManagerV3Ctrl', CtrlFtn)
    .directive('adminMgrV3', DirFtn);

  //----------------------------------------------------
  //  FILTER FUNCTION
  //----------------------------------------------------  
  function FilterFtn() {
    return function(arg) {  
      if(arg) {
      	// do something with arg
        return arg;
      }
      return arg;
    }     
  }

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function InterfaceFtn($log, BaseInterface) {
    var iface = function(config) {
      var ifaceInst = new BaseInterface();
      var config = config || {};

      ifaceInst.config = {   
        groupId: config.groupId || 0      
      };

      return ifaceInst;            
    };
    return iface;
  }

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log, AdminManagerV3Interface, BaseComp, ListViewerV3Interface, ListViewerElemInterface, ListElemAPI, PatientV3Obj, JawboneService) {
    var object = function(iface) {

      var onRender = onRenderFtn;
      var activateEditMode = activateEditModeFtn;

      var objInst = new BaseComp();
      objInst.mode = 'view';
      objInst.adminsListInterface = null;
      objInst.seletedAdmin = null;
      //objInst.sleepsChartInterface = null;
      //objInst.sleepsListInterface = null;

      objInst.api = {
        render: function(cb) {
          onRender();
          cb();
        },
        getMode : function() {
          return objInst.mode;
        },
        refresh : function() {
          $log.info('refresh the admin manager');
          objInst.adminsListInterface.getAPI().refresh();
        }       
      };

      function onRenderFtn() {

        objInst.adminsListInterface = new ListViewerV3Interface({
          getElementsObj : JawboneService.makeBatch(JawboneService.makeFieldGetter('groups', iface.config.groupId, 'admins')),
          makeListElementFtn : function(listData) {
            return new ListViewerElemInterface({
              api : new ListElemAPI(listData),
              data : new PatientV3Obj(listData.element)
            });
          },
          onSelect : function(element, index) {
            activateEditMode(element);
          },
          headerTpl : 'app/groups/group-manager-v3/_group-list-action-bar-tpl.html'           
        });
      }

      function activateEditModeFtn(selectedAdmin) {
        objInst.mode = 'edit';
        //var patientId = selectedPatient.config.data._id;
        var adminId = selectedAdmin.config.data;
      }

      return objInst;
    };
    return object;
  }

  //----------------------------------------------------
  //  CTRL FUNCTION
  //----------------------------------------------------  
  function CtrlFtn($scope, AdminManagerV3Obj, BaseCtrl) {
    var vm = this;  
    vm.obj = null;

    new BaseCtrl(vm.iface, function(createdIface) {
      return new AdminManagerV3Obj(createdIface);
    }, function(obj) {
      vm.obj = obj;
    });

    // $scope.$watch(function(scope) {
    //   return (vm.iface);
    // }, function(iface, oldval) {
    //   if(iface) {
    //     vm.obj = new AdminManagerV3Obj(iface);
    //     iface.setAPI(vm.obj.getAPI);
    //     vm.obj.api.render(function() {
    //     });
    //   }
    // }); 
  }

  //----------------------------------------------------
  //  DIRECTIVE
  //----------------------------------------------------  
  function DirFtn() {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'AdminManagerV3Ctrl',
      controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      templateUrl: 'app/admins/admin-manager-v3/_admin-manager-tpl.html'
    };
    return directive;   
  }
})();
