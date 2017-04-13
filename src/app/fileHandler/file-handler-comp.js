(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('FileDownloadObj', FileDownloadObjFtn)
    .controller('FileDownloadCtrl', FileDownloadCtrl)
    .directive('fileDownloader', fileDownloader);

  function FileDownloadObjFtn($q, $log, FileSaver, Blob, JawboneService) {
    var FileDownloadObj = function(arg) {
      var obj = this;
      obj.arg = arg || {};
      obj.name = obj.arg.name || 'text.txt';
      obj.type = obj.arg.type || 'text/plain;charset=utf-8';
      obj.content = obj.arg.content || 'blank content';

      obj.download = function() {
        var data = new Blob([obj.content], { type: obj.type });
        FileSaver.saveAs(data, obj.name);
      };

    };
    return FileDownloadObj;
  }

  function FileDownloadCtrl($scope, $log, FileDownloadObj) {
    var vm = this;
    vm.do = null;

    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      if(newval) {
        vm.do = new FileDownloadObj(newval);
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