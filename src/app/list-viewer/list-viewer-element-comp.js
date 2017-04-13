(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('ListViewerElemObj', ListViewerElemObjFtn)
    .controller('ListViewerElemCtrl', ListViewerElemCtrl)
    .directive('lvelem', lvelemFtn);

  function ListViewerElemObjFtn($log) {
    var ListViewerElemObj = function(notify, data) {      

      //$log.info('create a list elem object from data: ' + JSON.stringify(data));
      this.data = data || {};      
      this.template = data.template || 'app/list-viewer/_default-lve-tpl.html';
      this.parent = parent || {};      
      this.element = data;

      this.clicked = data.clicked || function() {
        $log.info('default clicked function');
      };

      this.deactivated = data.deactivated || function() {
        $log.info('default deactivated function');
      };

      this.onClick = function(index) {
        this.clicked();
        notify(index);
      }

      this.onDeselected = function() {
        //$log.info('on deselected called');
        this.deactivated();
      };
    };
    return ListViewerElemObj;
  }

  /** @ngInject */
  function ListViewerElemCtrl($log, $scope, ListViewerElemObj) {
    var vm = this;  

    // $scope.$watch(function(scope) {
    //   return (vm.obj);
    // }, function(newval, oldval) {
    //   if(newval) {        
    //     vm.e = new ListViewerElemObj(vm.obj, vm.listobj);
    //   }
    // }); 
  }	

  function lvelemFtn($log, $timeout) {
    var directive = {
      restrict: 'E',
        scope: {},
        controller: 'ListViewerElemCtrl',
        controllerAs: 'ctrl',
      bindToController: {
        tpl : '=',
        obj : '=',
        i : '@'
      },
      template: '<div ng-include=\'ctrl.tpl\' ng-click=\'ctrl.obj.onClick(ctrl.i)\'></div>',
    };
    return directive;
  }
})();