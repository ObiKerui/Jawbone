(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('ListElementAPIObj', ListElementAPIObjFtn)
    .factory('ListViewerElemObj', ListViewerElemObjFtn)
    .controller('ListViewerElemCtrl', ListViewerElemCtrl)
    .directive('lvelem', lvelemFtn);

  function ListElementAPIObjFtn($log) {
    var ListElementAPIObj = function(obj) {
      var o = this;
      o.selected = false;
      o.deleteMode = false;
      o.confirmDeleteMode = false;
      o.container = null;
      o.child = obj;

      o.notifyParent = function(event, data) {
        $log.info('no notify parent function created');
      };

      o.setContainer = function(container) {
        o.container = container;
        o.notifyParent = function(event, data) {
          o.container.handleChildEvent(event, data);
        };
      };

      o.handleParentEvent = function(event, data) {
        //$log.info('handle parent event: ' + event);
        switch(event) {
          case 'select':
            o.selected = true;
            break;
          case 'deselect':
            o.selected = false; 
            break;
          case 'deleteMode':
            o.deleteMode = !o.deleteMode;
            break;
          default:
            break;            
        }
        //maybe send to child
        //o.child.handleParentEvent(event, data);
      };

      o.handleChildEvent = function(event, data) {
        //$log.info('group handle event ftn for event: ' + event);
        //o.deleteMode = !o.deleteMode;
      };

      o.clickedView = function() {
        $log.info('clicked view called');
        if(o.deleteMode) {
          o.confirmDeleteMode = true;
          $log.info('confirm delete mode: ' + o.confirmDeleteMode);
        } else {
          $log.info('clicked selected');
          o.selected = !o.selected;
          o.notifyParent('clicked', o.selected);          
        }
      };

      o.delete = function(event) {
        o.confirmDeleteMode = false;
        o.notifyParent('delete');
        event.stopPropagation();
      };

      o.cancel = function(event) {
        o.confirmDeleteMode = false;
        event.stopPropagation();
      };

    };
    return ListElementAPIObj;
  }

  function ListViewerElemObjFtn($log) {
    var ListViewerElemObj = function(listAPI, data, indexArg) {      

      //$log.info('create a list elem object from data: ' + JSON.stringify(data));
      //this.template = data.template || 'app/list-viewer/_default-lve-tpl.html';
      
      var o = this;
      o.element = data || {};      
      o.index = indexArg;

      // set up container for element
      o.element.api = o.element.api || {};
      o.element.api.setContainer = o.element.api.setContainer || function() {
        $log.info('no set container function supplied');
      };

      o.handleChildEvent = function(event, data) {
        //$log.info('notify parent of event: ' + event);
        //$log.info('my index is  ' + o.index);

        // to replace with just the truth statement
        if(listAPI.handleChildEvent) {
          listAPI.handleChildEvent(event, data, o.index);          
        } else {
          listAPI(event, data, o.index);
        }
      };

      o.handleParentEvent = function(event, data) {
        o.element.api.handleParentEvent(event, data);
      };

      o.element.api.setContainer(o);
    };
    return ListViewerElemObj;
  }

  /** @ngInject */
  function ListViewerElemCtrl($log, $scope, ListViewerElemObj) {
    var vm = this;  

    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      if(newval) {        
        //vm.e = new ListViewerElemObj(vm.obj, vm.listobj);
      }
    }); 
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
      //template: '<div ng-include=\'ctrl.tpl\' ng-click=\'ctrl.obj.onClick(ctrl.i)\'></div>',
      template: '<div ng-include=\'ctrl.tpl\'></div>',
    };
    return directive;
  }
})();