(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('FileDownload', FileDownloadFtn)
    .factory('FileObj', FileObjFtn)
    .controller('FileDownloadCtrl', FileDownloadCtrl)
    .directive('fileDownloader', fileDownloader);

  function FileDownloadFtn($q, $log, FileObj, JawboneService) {
    var FileDownload = function() {
      var obj = this;
    };
    return FileDownload;
  }

  function FileObjFtn($log) {
    var FileObj = function(data) {
      var obj = this;
      obj.data = data || {};

      obj.onClick = function() {
        $log.info('on click ftn called');
      };

    };
    return FileObj;
  }

  function FileDownloadCtrl($scope, FileObj) {
    var vm = this;
    vm.do = new FileObj();

    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      if(newval) {
        vm.do = vm.obj;
      }
    });
  }

  function fileDownloader() {
    var directive = {
      restrict: 'E',
        scope: {},
        controller: 'FileDownloadCtrl',
        controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/fileHandler/_file-download-tpl.html'
    };
    return directive;       
  }

})();