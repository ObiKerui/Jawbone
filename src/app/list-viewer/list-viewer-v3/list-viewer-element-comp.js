
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('ListElemAPI', APIFtn)  
    .factory('ListViewerElemInterface', InterfaceFtn)  
    .factory('ListViewerV3ElemObj', ObjectFtn)
    .controller('ListViewerV3ElemCtrl', CtrlFtn)
    .directive('listViewerElem', DirFtn);

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function APIFtn($log) {
    var adaptor = function(config) {
      var adaptorInst = this;

      //$log.info('config passed to APIFtn: ' + JSON.stringify(config));

      adaptorInst.listAPI = config.api;
      adaptorInst.index = config.index;
      adaptorInst.selected = false;
      adaptorInst.deleteMode = false;
      adaptorInst.confirmDeleteMode = false;

      adaptorInst.onClick = function() {
        $log.info('element was clicked...');
        if(this.deleteMode) {
          this.confirmDeleteMode = !this.confirmDeleteMode;
        } else {
          this.selected = !this.selected;
          this.listAPI.elementClicked(this.index);                  
        }
      };

      adaptorInst.notify = function(event, arg) {
        switch(event) {
          case 'deleteMode':
            this.deleteMode = !this.deleteMode;
            break;
          case 'deselect':
            this.selected = false;
            break;
          default:
            break;
        }
      };

      adaptorInst.cancel = function(event) {
        this.confirmDeleteMode = false;
        event.stopPropagation();
      };

      adaptorInst.delete = function(event) {
        this.confirmDeleteMode = false;
        this.listAPI.deleteElement(this.index);
        event.stopPropagation();        
      };

      $log.info('is the list in delete mode? ' + adaptorInst.listAPI.isDeleteMode());
      if(adaptorInst.listAPI.isDeleteMode()) {
        adaptorInst.deleteMode = true;
      }

      return adaptorInst;            
    };
    return adaptor;
  }

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function InterfaceFtn($log, BaseInterface) {
    var iface = function(config) {
      var ifaceInst = new BaseInterface();
      var config = config || {};

      ifaceInst.config = {          
      	api: config.api || null,
      	data: config.data || null
      };

      return ifaceInst;            
    };
    return iface;
  }

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log, ListViewerElemInterface, BaseComp) {
    var object = function(iface) {
      var obj = new BaseComp();

      obj.api = {
        render : function(cb) {
          cb();
        },
        getData : function() {
          return iface.config.data;
        },
        getAPI : function() {
          return iface.config.api;
        },
        notify : function(event, arg) {
          $log.info('notified of event in list elem: ' + event);
          iface.config.api.notify(event, arg);
        }
      };

      return obj;
    };
    return object;
  }

  //----------------------------------------------------
  //  CTRL FUNCTION
  //----------------------------------------------------  
  function CtrlFtn($log, $scope, ListViewerV3ElemObj) {
    var vm = this;  
    vm.obj = null;

    $scope.$watch(function(scope) {
      return (vm.iface);
    }, function(iface, oldval) {
      if(iface) {
      	vm.obj = new ListViewerV3ElemObj(iface);
      	iface.setAPI(vm.obj.getAPI);
        vm.obj.getAPI().render(function(result) {

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
      controller: 'ListViewerV3ElemCtrl',
      controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      template: '<div ng-include=\'ctrl.obj.api.getData().template\'></div>'
      //template: '<h4>ctrl: {{ctrl.obj.api.getElement() | json}}</h4>'
    };
    return directive;   
  }
})();
