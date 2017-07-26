
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .filter('sleepsDownloaderfilter', FilterFtn)    
    .factory('SleepsDownloaderAdaptor', AdaptorFtn)
    .factory('SleepsDownloaderInterface', InterfaceFtn)  
    .factory('SleepsDownloaderObj', ObjectFtn)
    .controller('SleepsDownloaderCtrl', CtrlFtn)
    .directive('sleepsDownloaderV3', DirFtn);

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
  function AdaptorFtn($log, SleepsDownloaderInterface) {
    var iface = function(config) {
        var adaptorInst = new SleepsDownloaderInterface();
        config = config || {};

        adaptorInst.config.onConfirm = config.onConfirm || function(element) {
          $log.info('supply an onConfirm function to UserViewerV3Adaptor');
        }; 

        adaptorInst.config.getSleepData = config.getSleepData || function() {
          $log.info('implement a get sleep data function');
        };

        return adaptorInst;
    };
    return iface;
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
  function ObjectFtn($log, SleepsDownloaderInterface, BaseComp, FileHandlerV3Interface) {
    var object = function(iface) {

      var convertContentsToCSV = convertContentsToCSVFtn;

      var objInst = new BaseComp();
      objInst.fileHandler = null;

      objInst.api = {
        render: function(cb) {

          objInst.fileHandler = new FileHandlerV3Interface({
            //getContents : iface.config.getSleepData
            getContents : convertContentsToCSV
          });
          $log.info('created da file handler interface obj');
          cb();
        },

        getFileHandler: function() {
          return objInst.fileHandler;
        }
      };

      function getColumns(data) {
        var testJson = {
          "hello": { "name" : 0 }
        };

        var dataStr = JSON.stringify(data);
        //dataStr = dataStr.replace(/\\"/g, '"');
        dataStr = dataStr.replace(/\\"/g, '');
        var json = JSON.parse(dataStr);
        $log.info('data: ' + JSON.stringify(json.cols));
        $log.info('data: ' + JSON.stringify(json.rows));
        return json.cols;
      }

      function getRows(data) {
        return data.rows;
      }

      function convertContentsToCSVFtn() {
        var sleepData = iface.config.getSleepData();
        //return sleepData;
        return getColumns(sleepData);
      }

      return objInst;
    };
    return object;
  }

  //----------------------------------------------------
  //  CTRL FUNCTION
  //----------------------------------------------------  
  function CtrlFtn($scope, $log, SleepsDownloaderObj) {
    var vm = this;  
    vm.obj = null;

    $scope.$watch(function(scope) {
      return (vm.iface);
    }, function(iface, oldval) {
      if(iface) {
        vm.obj = new SleepsDownloaderObj(iface);
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
      controller: 'SleepsDownloaderCtrl',
      controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      templateUrl: 'app/sleeps/sleeps-downloader-v3/_sleeps-downloader-tpl.html'
    };
    return directive;   
  }
})();
