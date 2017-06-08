
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .filter('groupManagerV3filter', FilterFtn)    
    .factory('GroupManagerV3Interface', InterfaceFtn)  
    .factory('GroupManagerV3Obj', ObjectFtn)
    .controller('GroupManagerV3Ctrl', CtrlFtn)
    .directive('groupManagerV3', DirFtn);

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
      };

      return ifaceInst;            
    };
    return iface;
  }

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log, GroupManagerV3Interface, BaseComp, ListViewerV3Interface, ListViewerElemInterface, ListElemAPI, GroupV3Obj, JawboneService, PatientMgrV3Interface, AdminMgrInterface) {
    var object = function(iface) {

    	var activateEditMode = activateEditModeFtn;

      var objInst = new BaseComp();
      objInst.groupList = null;
      objInst.patientMgrInterface = null;
      objInst.adminMgrInterface = null;
      objInst.mode = 'view';
      objInst.patientAdminView = 'admin';
      objInst.selectedGroup = null;

      objInst.api = {
      	render: function(cb) {
      		// create out group list
      		objInst.groupList = new ListViewerV3Interface({
      			getElementsObj : JawboneService.makeBatch(JawboneService.makeEndpoint('groups')),
      			makeListElementFtn : function(listData) {
			        return new ListViewerElemInterface({
			          api : new ListElemAPI(listData),
			          data : new GroupV3Obj(listData.element)
			        });
      			},
		        onSelect : function(element, index) {
		          activateEditMode(element);
		        },
          		headerTpl : 'app/groups/group-manager-v3/_group-list-action-bar-tpl.html'		        
      		});
      	},

      	getMode: function() {
      		return objInst.mode;
      	},

      	setViewMode: function() {
      		objInst.mode = 'view';
      	},

        isPatientView : function() {
          return (objInst.patientAdminView === 'patient');
        },

        isAdminView : function() {
          return (objInst.patientAdminView === 'admin');
        },

        setPatientView : function() {
          objInst.patientAdminView = 'patient';
          objInst.patientMgrInterface.getAPI().refresh();
          //tell the patient manager interface to refresh
        },

        setAdminView : function() {
          objInst.patientAdminView = 'admin';
          objInst.adminMgrInterface.getAPI().refresh();
          //tell the admin manager interface to refresh
        }

      };

      function activateEditModeFtn(selectedGroup) {
      	objInst.mode = 'edit';
        objInst.selectedGroup = selectedGroup.config.data;
        var groupId = selectedGroup.config.data._id;
        $log.info('create with id: ' + JSON.stringify(groupId));

        objInst.patientMgrInterface = new PatientMgrV3Interface({
          groupId : groupId
        });

        objInst.adminMgrInterface = new AdminMgrInterface({
          groupId : groupId
        });

        $log.info('group element was selected: ' + JSON.stringify(selectedGroup));
      }

      return objInst;
    };
    return object;
  }

  //----------------------------------------------------
  //  CTRL FUNCTION
  //----------------------------------------------------  
  function CtrlFtn($scope, GroupManagerV3Obj, BaseInterface) {
    var vm = this;  
    vm.obj = null;

    $scope.$watch(function(scope) {
      return (vm.iface);
    }, function(iface, oldval) {
    	if(!iface) {
    		var iface = new BaseInterface();
    		vm.obj = new GroupManagerV3Obj(iface);
    		iface.setAPI(vm.obj.getAPI);
    		vm.obj.api.render(function(arg) {

    		});	
    	} else {
	        vm.obj = new GroupManagerV3Obj(iface);
	        iface.setAPI(vm.obj.getAPI);
	        vm.obj.api.render(function(arg) {
        	});
      	}
    }); 
  }

  //----------------------------------------------------
  //  DIRECTIVE
  //----------------------------------------------------  
  function DirFtn() {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'GroupManagerV3Ctrl',
      controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      templateUrl: 'app/groups/group-manager-v3/_group-manager-v3-tpl.html'
    };
    return directive;   
  }
})();
