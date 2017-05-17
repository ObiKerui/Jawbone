
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .filter('imgUploaderfilter', FilterFtn)    
    .factory('ImgUploaderInterface', InterfaceFtn)  
    .factory('ImgUploaderObj', ObjectFtn)
    .controller('ImgUploaderCtrl', CtrlFtn)
    .directive('imgUploader', DirFtn);

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
  function ObjectFtn($log, ImgUploaderInterface, BaseComp) {
    var object = function(iface) {

      var initialise = initialiseFtn;
      var obj = this;
      angular.merge(obj, obj, new BaseComp());

      obj.api = {

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
  function CtrlFtn($scope, ImgUploaderObj) {
    var vm = this;  
    vm.obj = null;
    vm.newImage = null;
    vm.newCroppedImage = null;

    $scope.$watch(function(scope) {
      return (vm.iface);
    }, function(newval, oldval) {
      if(newval) {
        vm.obj = new ImgUploaderObj(newval);
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
      controller: 'ImgUploaderCtrl',
      controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      templateUrl: 'app/img-uploader/_img-uploader-tpl.html'
    };
    return directive;   
  }
})();
