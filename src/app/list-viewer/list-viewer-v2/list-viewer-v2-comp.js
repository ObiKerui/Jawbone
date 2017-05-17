(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('ListV2Interface', InterfaceFtn)
    .factory('ListV2Obj', ObjectFtn)
    .controller('ListV2Ctrl', ControllerFtn)
    .directive('listviewerV2', DirectiveFtn);

  /**
  * IMPLEMENT THIS OBJECT TO CREATE A LIST OBJECT
  */
  function InterfaceFtn($log, BaseInterface) {
    var iface = function(config) {
      var name = 'list-viewer-v2/ListV2InterfaceObj : ';
      var ifaceInst = this;

      angular.merge(ifaceInst, ifaceInst, new BaseInterface());      

      // initialise config
      var config = config || {};
      config.header = config.header || {};
      config.events = config.events || {};

      // this can be put into a common base object
      ifaceInst.notify = function(eventName) {
        $log.info('notify listobj of event (came from higher level object): ' + eventName);
        var api = ifaceInst.getObjectAPI();
        api.handleChildEvent(eventName);
      };

      ifaceInst.config = {
          header : {
            heading: config.header.heading || null,
            headerTemplate: config.header.headerTemplate || null,
            headerObj: config.header.headerObj || null
          },
          events: {
            onCreated : config.events.onCreated || function(api) {
              $log.info(name + ' supply on created function. API passed: ' + JSON.stringify(api));
              //obj.EventHandler.events.register(api);
            },
            onSelect : config.events.onSelect || function(elem) {
              $log.info(name + ' supply on Select function');
            },
            onDeselect : config.events.onDeselect || function(elem) {
              $log.info(name + ' supply on deselect function');
            },
            onConfirm : config.events.onConfirm || function() {
              $log.info(name + ' supply on Confirm function');
            },
            onStateChange : config.events.onStateChange || function() {
              $log.info(name + ' supply on State Change function');
            },
            onEvent : config.events.onEvent || function() {
              $log.info(name + ' supply on Event function');
            }
          },
          loaderMessage: config.loaderMessage || null,          
          getElementsObj : config.getElementsObj || null,
          makeElement : config.makeElement || null,
          elementTemplate: config.elementTemplate || 'app/list-viewer/_default-lve-tpl.html'        
      };

      return ifaceInst;
    };
    return iface;
  }

  function ObjectFtn($q, $log, BaseComp, ListV2Interface, ListViewerElemObj) {
    var object = function(iface, onStateChange, onRefresh) {

      var initialise = initialiseFtn;

      var obj = this;
      obj.elements = [];
      obj.selected = -1;

      angular.merge(obj, obj, new BaseComp());

      // the list API - functions an external object can call
      obj.api = {
        // ensure all elements deselected
        deselectAll : function() {
          obj.selected = -1;
          angular.forEach(obj.elements, function(value) {
            //value.onDeselected();
            value.handleParentEvent('deselect');
            iface.config.events.onDeselect(value.element);
          }, obj.elements);          
        },

        // send an event to every member of the list
        propagateEvent: function(event, data) {
          angular.forEach(obj.elements, function(value) {
            $log.info('event action for elem: ' + event);
            value.handleParentEvent(event, data);
          }, obj.elements);
        },

        // handle an event
        handleChildEvent: function(event, data, index) {
          switch(event) {
            case 'clicked':
              obj.handleClick(index);
              break;
            case 'deleteMode':
              obj.api.deselectAll();
              obj.api.propagateEvent(event, null);
              break;
            case 'delete':
              obj.onEvent(event, obj.elements[index].element)
              .then(function(response) {
                $log.info('event handled with response : ' + response);
                obj.deleteElement(index);
              });   
              break; 
            case 'reveal':
              $log.info('list was revealed...reinitialise height');
              onRefresh();
            default:
              $log.info('list obj received event: ' + event);
              break;
          }
        }
      };

      obj.onStateChange = onStateChange || function(newState) {
        $log.info('supply a state change function to ChartObj');
      };

      obj.connect(iface, obj.api, initialise);

      // attach this object to the interface
      // iface.connectInterface(iface, function() {
      //   return (obj.api);
      // }, function(connectedIface) {
      //   // will want to call merge here
      //   obj.onStateChange('loading');
      //   initialise(connectedIface);
      // });

      // notify list object that an element was clicked
      obj.handleClick = function(index) {   
        // sets selected and notifies the list implementation type selected/deselected     
        if(obj.selected !== -1 && obj.selected < obj.elements.length) {
          //o.elements[o.selected].onDeselected();
          obj.elements[obj.selected].handleParentEvent('deselect');
          obj.events.onDeselect(obj.elements[obj.selected].element);
        }

        if(obj.selected !== index) {
          obj.selected = index;          
          obj.events.onSelect(obj.elements[obj.selected].element);
        } else {
          obj.selected = -1;
        }
      };

      function populate(list, batchObj, onComplete) {

        if(!batchObj) {
          onComplete({
            nbrElems: 0,
            totalElems: 0
          });
          return;
        }

        batchObj.get()
        .then(function(batch) {
          $log.info('batch in populate: ' + JSON.stringify(batchObj.params));
          $log.info('batch total: ' + batch.total);
          $log.info('total no. of objects: ' + batchObj.params.total);
          var i = list.length;
          angular.forEach(batch.data, function(value) { 
            //$log.info('value gotten: ' + JSON.stringify(value));           
            var e = obj.makeElement(value); 
            // $log.info('index to pass: ' + i);
            //$log.info('push a new element onto elements list: ' + JSON.stringify(value));
            this.push(new ListViewerElemObj(obj.api, e, parseInt(i)));
            i++;
          }, list);

          $log.info('size of list: ' + JSON.stringify(list.length));
          if(onComplete) {
            onComplete({
              nbrElems: list.length,
              totalElems: batch.total
            });
          }
        })
        .catch(function(err) {
          $log.info('error getting elements: ' + err);
        });        
      }

      obj.deleteElement = function(index) {
        obj.elements = [];
        populate(obj.elements, obj.getElementsObj);
      };

      // TODO implement
      obj.appendElements = function(cb) {        

        obj.getElementsObj = obj.getElementsObj.next();
        $log.info('next batch..params: ' + JSON.stringify(obj.getElementsObj.params));

        if(!obj.getElementsObj.more()) {
          $log.info('no more to get w/ params: ' + JSON.stringify(obj.getElementsObj.params));
          $log.info('no more to get w/ elems :  ' + obj.elements.length);
          return cb();          
        }
        
        populate(obj.elements, obj.getElementsObj, cb);
      };

      obj.onPopulate = function() {
        populate(obj.elements, obj.getElementsObj);
      };

      function initialiseFtn(iface) {
        angular.merge(obj, obj, iface.config);
        populate(obj.elements, obj.getElementsObj, function(updateData) {
          obj.onStateChange('ready', updateData);
        });        
      }

      return obj;
    };
    return object;
  }

  /** @ngInject */
  function ControllerFtn($log, $scope, ListV2Obj) {
    var vm = this;  
    vm.obj = null;
    vm.lo = {};
    vm.atStart = null;
    vm.atEnd = null;
    vm.frameHeight = 0;
    vm.totalElements = 0;
    vm.moveDistance = 0;
    vm.nbrForwards = 100;
    vm.chunksize = 4;
    vm.index = 0;
    vm.initcb = null;
    vm.setHeightCB = null;
    vm.animating = false;
    vm.state = 'init';
        
    vm.register = function(cb, shcb) {
      vm.initcb = cb;
      vm.setHeightCB = shcb;
    };

    vm.callinit = function() {
      vm.initcb();
    };

    vm.initialiseHeight = function(height, cb) {
      //$log.info('init height called: ' + height);
      vm.chunksize = vm.lo.chunksize || 4;
      vm.frameHeight = vm.chunksize * height;
      vm.moveDistance = parseInt(vm.frameHeight / 2);
      cb(vm.frameHeight);
      //vm.index = 0;
    };

    function calculateNoForwards(total, chunksize) {
      var totalPages = Math.ceil(total / chunksize);
      var nbrOnLastPage = parseInt(total % chunksize);
      var lessThanHalfOnLastPage = (nbrOnLastPage !== 0 && (nbrOnLastPage <= chunksize / 2))
      var nbrForwards = (lessThanHalfOnLastPage ? totalPages - 1 : totalPages);
      //$log.info('total elements: ' + total);
      //$log.info('number of pages: ' + totalPages + ' number of forwards: ' + nbrForwards);
      return nbrForwards;
    }

    vm.didMouseWheelUp = function(value) {
      //$log.info('mouse wheel up event!');
      vm.back();
    };

    vm.didMouseWheelDown = function(value) {
      //$log.info('mouse wheel down event!');
      vm.forward();
    };

    function init(iface) {
      vm.obj = new ListV2Obj(iface, function(newState, updateData) {
        //$log.info('update data: ' + JSON.stringify(updateData));
        completeInit(newState, updateData);
      }, function() {
        $log.info('refresh the list');
        //vm.setHeightCB();
        vm.initcb();
      });    
    }

    function completeInit(newState, updateData) {
        $log.info('update data: ' + JSON.stringify(updateData));
        var update = updateData || {};
        vm.nbrElems = update.nbrElems || 0;
        vm.totalElements = update.totalElems || 0;
        vm.nbrForwards = calculateNoForwards(vm.totalElements, vm.chunksize);
        $log.info('nbr forwards: ' + vm.nbrForwards);
        vm.state = newState;
        vm.setHeightCB();

        vm.back = function() {
          if(vm.atStart()) return;
          if(vm.animating) return;
          vm.animating = true;
          vm.index = (vm.index === 0 ? 0 : vm.index - 1);
          //$scope.$broadcast('clickback', vm.moveDistance);
          $scope.$broadcast('clickback', {
            dist: vm.moveDistance,
            callback: function() {
              vm.animating = false;
            }
          });
        };

        vm.forward = function() {
          vm.setHeightCB();
          $log.info('forward invoked...nbr forwards: ' + vm.nbrForwards);
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
              //$log.info('set animating to false: ' + vm.animating); 
            }
          });
          
          // tell the list obj to append elements in response to forwards request
          vm.obj.appendElements(function(updateData) {
            if(updateData) {
              //$log.info('more elements where added...');
            }
          });
        };

        vm.atStart = function() {
          return (vm.index === 0);
        };

        // why is this getting called so many times?
        vm.atEnd = function() {
          //$log.info('atEnd invoked... index : ' + vm.index + ' nbr forwards: ' + vm.nbrForwards);
          return (vm.index === vm.nbrForwards);
        };

        if(vm.initcb) {
          //$log.info('call init cb');
          vm.initcb();
        }
      }

    $scope.$watch(function(scope) {
      return (vm.iface);
    }, function(newval, oldval) {      
      if(newval) {        
        init(newval);
      }
    }); 
  }	

  function DirectiveFtn($log, $timeout) {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'ListV2Ctrl',
      controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      templateUrl: 'app/list-viewer/list-viewer-v2/_listviewer-tpl.html',
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

        //$log.info('THE HEIGHT OF FIRST ELEM: ' + height);

        ctrl.initialiseHeight(height, function(scrollFrameHeight) {
          $log.info('new init height of list element : ' + height + ' frame height: ' + scrollFrameHeight);
          frame.css({
            'height': scrollFrameHeight + 'px'
          });          
        });
      }

      scope.$on('clickback', function(event, data) {
        ul.velocity({
          'top': '+='+ data.dist
        }, 400, function() {
          // Animation complete.
          //$log.info('animating complete invoke cb...')
          data.callback();
        });          
      });

      scope.$on('clickforward', function(event, data) {
        //$log.info('click forwards event...');
        ul.velocity({
          'top': '-='+ data.dist
        }, 400, function() {
          // Animation complete.
          //$log.info('animating complete invoke cb...');
          data.callback();
        });                  
      });    

      scope.$on('adjustOffsetFromLeft', function(event, data) {
        ul.css({
          'left': '+=' + data
        });
      });        

      ctrl.register(function() {
        $timeout(function() {
          newInit();
        })
      }, function() {
        newInit();
      });
    }  
  }
})();