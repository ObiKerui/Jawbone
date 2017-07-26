
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .filter('fileHandlerV3filter', FilterFtn)    
    .factory('FileHandlerV3Interface', InterfaceFtn)  
    .factory('FileHandlerV3Obj', ObjectFtn)
    .controller('FileHandlerV3Ctrl', CtrlFtn)
    .directive('fileHandlerV3', DirFtn);

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
      	getContents : config.getContents || function() {
      		$log.info('supply a get contents function');
      		return '';
      	},
        getFileName : config.getFileName || function() {
          $log.info('supply a get filename function');          
          return 'text.txt';
        }      
      };

      return ifaceInst;            
    };
    return iface;
  }

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log, FileHandlerV3Interface, BaseComp, $q, FileSaver, Blob) {
    var object = function(iface) {

    	var setup = setupFtn;
		var objInst = new BaseComp();
		objInst.contents = null;

     	objInst.api = {
	        render: function(cb) {
	        	setup();
	          	cb();
	        },

	        getContents: function() {
	        	return objInst.contents;
	        },

	        download: function() {
	        	var data = new Blob([objInst.contents], { type: objInst.textType });
	        	FileSaver.saveAs(data, objInst.fileName);
	        }
		};

      	return objInst;

		function setupFtn() {
			objInst.contents = iface.config.getContents();
			objInst.textType = 'text/plain;charset=utf-8';
			objInst.fileName = iface.config.getFileName();
		}
    };
    return object;
  }

  //----------------------------------------------------
  //  CTRL FUNCTION
  //----------------------------------------------------  
  function CtrlFtn($scope, FileHandlerV3Obj) {
    var vm = this;  
    vm.obj = null;

    $scope.$watch(function(scope) {
      return (vm.iface);
    }, function(iface, oldval) {
      if(iface) {
        vm.obj = new FileHandlerV3Obj(iface);
        iface.setAPI(vm.obj.getAPI);
        vm.obj.api.render(function() {
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
      controller: 'FileHandlerV3Ctrl',
      controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      templateUrl: 'app/fileHandler/file-handler-v3/_file-handler-v3-tpl.html'
    };
    return directive;   
  }
})();
