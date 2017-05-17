
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .filter('groupCreatorfilter', FilterFtn)    
    .factory('GroupCreatorInterface', InterfaceFtn)  
    .factory('GroupCreatorObj', ObjectFtn)
    .controller('GroupCreatorCtrl', CtrlFtn)
    .directive('groupCreator', DirFtn);

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
      var ifaceInst = this;
      var config = config || {};

      angular.merge(ifaceInst, ifaceInst, new BaseInterface());

      ifaceInst.config = {       
      	user : config.user   
      };

      ifaceInst.notify = function(eventName) {
        var api = ifaceInst.getObjectAPI();
        api.notify(eventName);
      };

      return ifaceInst;            
    };
    return iface;
  }

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log, GroupCreatorInterface, BaseComp, ModalService) {
    var object = function(iface) {

      var initialise = initialiseFtn;
      var obj = this;
      angular.merge(obj, obj, new BaseComp());

      obj.api = {
      	getUser : function() {
      		return iface.config.user
      	},
      	getGroupDetails : function() {
      		return 'app/groups/group-creator/_group-details-form-tpl.html';
      	},
      	editImage : function() {
      		ModalService.onClick({
				tpl : 'app/groups/group-creator/_group-image-editor-tpl.html'
      		});
      	}
      };

      obj.connect(iface, obj.api, initialise);      

      function initialiseFtn(iface) {


      }

      return obj;
    };
    return object;
  }

  //----------------------------------------------------
  //  CTRL FUNCTION
  //----------------------------------------------------  
  function CtrlFtn($scope, $log, GroupCreatorObj) {
    var vm = this;  
    vm.obj = null;

    $log.info('ran the group creator ctrl');

    $scope.$watch(function(scope) {
      return (vm.iface);
    }, function(newval, oldval) {
      if(newval) {
      	$log.info('create the group creator...');
        vm.obj = new GroupCreatorObj(newval);
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
      controller: 'GroupCreatorCtrl',
      controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      templateUrl: 'app/groups/group-creator/_group-creator-tpl.html'
    };
    return directive;   
  }
})();
