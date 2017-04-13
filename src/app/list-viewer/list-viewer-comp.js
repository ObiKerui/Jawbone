(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('ListViewerCtrlObj', ListViewerCtrlObjFtn)
    .factory('ListViewerObj', ListViewerObjFtn)
    .controller('ListViewerCtrl', ListViewerCtrl)
    .directive('listviewer', listviewerFtn);

  function ListViewerCtrlObjFtn($log, ListViewerObj) {
    var ListViewerCtrlObj = function(obj) {

      var o = this;

      //$log.info('run dat list viewer ctrl obj');
      
      o.onSelect = obj.onSelect || function(selected) {
        $log.info('selected: ' + JSON.stringify(selected));
      };
      
      o.onConfirm = obj.onConfirm || function() {
        $log.info('on confirm selection');
      };
      
      o.listobj = new ListViewerObj(obj);

    };
    return ListViewerCtrlObj;
  }

  function ListViewerObjFtn($log, ListViewerElemObj) {
    var ListViewerObj = function(obj) {

      //$log.info('obj to listviewer obj: ' + JSON.stringify(obj));

      var o = this;
      o.listobj = obj.listobj || {};
      o.heading = obj.listobj.heading || 'blank';
      o.headerbar = obj.listobj.headerbar || 'app/list-viewer/_default-headerbar-tpl.html';
      o.headerObj = obj.listobj.headerObj || {};
      o.template = obj.listobj.template || 'app/list-viewer/_default-lve-tpl.html';
      o.chunksize = obj.listobj.chunksize || 4;
      o.getElements = o.listobj.getElements || function() {
        return [];
      };

      // get an object to retrieve batches now
      o.getElementsObj = o.listobj.getElementsObj || {};

      o.makeElement = o.listobj.makeElement || function(value) {
        $log.info('supply a make element function');
        return {};
      };

      // set up callbacks
      //o.callbacks = obj.callbacks || {};
      o.onSelect = obj.onSelect || function(elem) {
        $log.info('supply on select function');
      };

      o.onDeselect = obj.onDeselect || function(elem) {
        $log.info('supply on deselect function');
      };

      o.elements = [];
      o.selected = -1;

      // notify list object that an element was clicked
      o.notifyClicked = function(index) {        
        if(o.selected !== -1 && o.selected < o.elements.length) {
          o.elements[o.selected].onDeselected();
          o.onDeselect(o.elements[o.selected].element);
        }

        if(o.selected !== index) {
          o.selected = index;          
          o.onSelect(o.elements[o.selected].element);
        } else {
          o.selected = -1;
        }

      };

      // ensure all elements deselected
      o.listobj.baseFtns = {
        deselectAll : function() {
          o.selected = -1;
          angular.forEach(o.elements, function(value) {
            value.onDeselected();
            o.onDeselect(value.element);
          }, o.elements);          
        }
      };

      function populate(list, batchObj) {
        // o.getElements()

        //$log.info('list comprises: ' + JSON.stringify(list));
        //$log.info('call batch obj get: ' + JSON.stringify(batchObj));
        batchObj.get()
        .then(function(batch) {
          angular.forEach(batch.data, function(value) { 
            //$log.info('value gotten: ' + JSON.stringify(value));           
            var e = o.makeElement(value); 
            this.push(new ListViewerElemObj(o.notifyClicked, e));
          }, list);

          $log.info('size of list: ' + JSON.stringify(list.length));

        })
        .catch(function(err) {
          $log.info('error getting elements: ' + err);
        });        
      }

      // TODO implement
      o.appendElements = function() {
        $log.info('call to append elements...');
        o.getElementsObj = o.getElementsObj.next();
        populate(o.elements, o.getElementsObj);
      };

      o.listobj.onPopulate = function() {
        populate(o.elements, o.getElementsObj);
      };

      //$log.info('calling populate on creation...');
      populate(o.elements, o.getElementsObj);

      //$log.info('got elems: ' + JSON.stringify(o.elems));


    };
    return ListViewerObj;
  }

  /** @ngInject */
  function ListViewerCtrl($log, $scope, ListViewerCtrlObj) {
    var vm = this;  
    vm.lo = {};
    vm.atStart = null;
    vm.atEnd = null;
    vm.frameHeight = 0;
    vm.moveDistance = 0;
    vm.nbrForwards = 100;
    vm.index = 0;
    vm.initcb = null;
    vm.animating = false;

    vm.register = function(cb) {
      vm.initcb = cb;
    };

    vm.initialiseHeight = function(height) {
      $log.info('init height called: ' + height);
      var chunksize = vm.lo.chunksize || 4;
      vm.frameHeight = chunksize * height;
      vm.moveDistance = parseInt(vm.frameHeight / 2);
      //vm.index = 0;
    };

    vm.getFrameHeight = function() {
      return vm.frameHeight;
    };

    function adjust(length) {
      vm.nbrElems = vm.lo.listobj.elements.length;
      vm.nbrForwards = parseInt(vm.nbrElems / 2);
      $log.info('no. forwards: ' + vm.nbrForwards);
      if(vm.initcb) {
       vm.initcb();
      }
    }


      vm.didMouseWheelUp = function(value) {
        //$log.info('mouse wheel up event!');
        vm.back();
      };

      vm.didMouseWheelDown = function(value) {
        //$log.info('mouse wheel down event!');
        vm.forward();
      };


    function init(obj) {
      vm.lo = new ListViewerCtrlObj(obj);
      $log.info('calling init of listviewer : ' + JSON.stringify(vm.lo));

      vm.nbrElems = vm.lo.listobj.elements.length;
      vm.nbrForwards = parseInt(vm.nbrElems / 2);

      vm.back = function() {
        if(vm.atStart()) return;
        if(vm.animating) return;
        vm.animating = true;
        vm.index = (vm.index === 0 ? 0 : vm.index - 1);
        $log.info('clicked back: ' + vm.index);
        //$scope.$broadcast('clickback', vm.moveDistance);
        $scope.$broadcast('clickback', {
          dist: vm.moveDistance,
          callback: function() {
            vm.animating = false;
          }
        });
      };

      vm.forward = function() {
        if(vm.atEnd()) return;
        if(vm.animating) return;
        vm.animating = true;
        //$log.info('clicked forward');
        //$log.info('number of elements: ' + vm.nbrElems + ' move distance: ' + vm.moveDistance + ' forwards: ' + vm.nbrForwards);
        vm.index = (vm.index === vm.nbrForwards ? vm.nbrForwards : vm.index + 1);
        //$scope.$broadcast('clickforward', vm.moveDistance);
        $scope.$broadcast('clickforward', { 
          dist: vm.moveDistance, 
          callback: function() { 
            vm.animating = false;
            $log.info('set animating to false: ' + vm.animating); 
          }
        });
        vm.lo.listobj.appendElements();
      };

      vm.atStart = function() {
        return (vm.index === 0);
      };

      vm.atEnd = function() {
        return (vm.index === vm.nbrForwards);
      };

      if(vm.initcb) {
        vm.initcb();
      }

      $scope.$watch(function(scope) {
        return (vm.lo.listobj.elements.length);
      }, function(newVal, oldVal) {
        if(newVal) {
          $log.info('elements changed: ' + vm.lo.listobj.elements.length); 
          adjust(newVal);         
        }
      });
    }

    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      if(newval) {
        init(newval);
      }
    }); 
  }	

  function listviewerFtn($log, $timeout) {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'ListViewerCtrl',
      controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/list-viewer/_list-viewer-tpl.html',
      link: link
    };
    return directive;

    function link(scope, element, attrs, ctrl) {

      var frame = angular.element(element[0].querySelector('.list-viewer-elements'))
      var li = null;
      var ul = null;

      function newInit() {
        //frame = angular.element('#listviewerbox');
        frame = angular.element(element[0].querySelector('.list-viewer-elements'));
        ul = frame.find('ul');
        li = ul.find('li');
        var height = li.first().height();

        //height = 100;

        ctrl.initialiseHeight(height);
        var frameHeight = ctrl.getFrameHeight();
        $log.info('new init height of list element : ' + height + ' frame height: ' + frameHeight);
        frame.css({
          'height': frameHeight + 'px'
        });
      }

      //function init() {
        //$log.info('run the init futn');

        scope.$on('clickback', function(event, data) {
          ul.velocity({
            'top': '+='+ data.dist
          }, 400, function() {
            // Animation complete.
            $log.info('animating complete invoke cb...')
            data.callback();
          });          
        });

        scope.$on('clickforward', function(event, data) {
          $log.info('click forwards event...');
          ul.velocity({
            'top': '-='+ data.dist
          }, 400, function() {
            // Animation complete.
            $log.info('animating complete invoke cb...');
            data.callback();
          });                  
        });    

        scope.$on('adjustOffsetFromLeft', function(event, data) {
          ul.css({
            'left': '+=' + data
          });
        });        
      //}

      ctrl.register(function() {
        $timeout(function() {
          newInit();
        })
      });
    }  
  }
})();