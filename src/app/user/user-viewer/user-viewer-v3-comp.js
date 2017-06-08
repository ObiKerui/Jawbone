
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .filter('userViewerV3filter', FilterFtn)    
    .factory('UserViewerV3Interface', InterfaceFtn)
    .factory('UserViewerV3Service', ServiceFtn)  
    .factory('UserViewerV3Obj', ObjectFtn)
    .controller('UserViewerV3Ctrl', CtrlFtn)
    .directive('userViewerV3', DirFtn);

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
      ifaceInst.selected = null;

      ifaceInst.config = {          
        setSelected : config.setSelected || function(selection) {
          this.selected = selection;
          $log.info('default set selected function for UserViewerV3Interface: ' + JSON.stringify(this.selected));
        },
        unsetSelected : config.unsetSelected || function() {
          this.selected = null;
          $log.info('default unset selected function for UserViewerV3Interface');          
        }
      };

      return ifaceInst;            
    };
    return iface;
  }

  //----------------------------------------------------
  //  SERVICE FUNCTION
  //----------------------------------------------------  
  function ServiceFtn($log) {
  	var service = {
  		getUser : getUserFtn
  	};
  	return service;

  	function getUserFtn() {

  	}
  }

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log, UserViewerV3Interface, BaseComp, UserListV3Interface) {
    var object = function(iface) {

      var objInst = new BaseComp();
      objInst.listIface = null;
      objInst.selectedUser = null;

      $log.info('iface passed to useer viewer: >>>>> ' + JSON.stringify(iface)); 

      objInst.api = {
      	render: function(cb) {
      		objInst.listIface = new UserListV3Interface({
            onSelect : function(element, index) {

              $log.info('user viewer on select function: element: ' + JSON.stringify(element.config.data));
              objInst.selectedUser = element.config.data;
              iface.config.setSelected(objInst.selectedUser);
            },
            onDeselect : function(element, index) {
              $log.info('user viewer on deselect function');
              objInst.selectedUser = null;
              iface.config.unsetSelected();
            }
      		});
      	}
      };

      return objInst;
    };
    return object;
  }

  //----------------------------------------------------
  //  CTRL FUNCTION
  //----------------------------------------------------  
  function CtrlFtn($log, $scope, BaseInterface, UserViewerV3Obj) {
    var vm = this;  
    vm.obj = null;

    // this is how a basectrl might work
    // var vm = new BaseCtrl($scope, function(iface) {
    //   return new UserViewerV3Obj(iface)
    // }, function(renderInfo) {
    //   $log.info('element is rendered');
    // });

    $scope.$watch(function(scope) {
      return (vm.iface);
    }, function(iface, oldval) {
      if(!iface) {
        $log.info('no iface was passed to the user viewer : ' + JSON.stringify(iface));

        var createdIface = new BaseInterface();
        vm.obj = new UserViewerV3Obj(createdIface);
        createdIface.setAPI(vm.obj.getAPI);
        
        vm.obj.api.render(function() {
          $log.info('called render function of user viewer');
        });         
               
      } else {
        $log.info('iface was passed to the user viewer : ' + JSON.stringify(iface));
        vm.obj = new UserViewerV3Obj(iface);
        iface.setAPI(vm.obj.getAPI);
        
        vm.obj.api.render(function() {
          $log.info('called render function of user viewer');
        });        
      }
      // }
    }); 
  }

  //----------------------------------------------------
  //  DIRECTIVE
  //----------------------------------------------------  
  function DirFtn() {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'UserViewerV3Ctrl',
      controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      templateUrl: 'app/user/user-viewer/_user-viewer-tpl.html'
    };
    return directive;   
  }
})();
