(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('ListInterfaceObj', ListInterfaceObjFtn)
    .factory('ListViewerCtrlObj', ListViewerCtrlObjFtn)
    .factory('ListViewerObj', ListViewerObjFtn)
    .controller('ListViewerCtrl', ListViewerCtrl)
    .directive('listviewer', listviewerFtn);

  /**
  * IMPLEMENT THIS OBJECT TO CREATE A LIST OBJECT
  */
  function ListInterfaceObjFtn($log) {
    var ListInterfaceObj = function(config) {
      var name = 'list-viewer//ListInterfaceObj : ';
      var obj = this;
      obj.config = {
          header : {
            heading: config.header.heading || null,
            headerTemplate: config.header.headerTemplate || null,
            headerObj: config.header.headerObj || null
          },
          events: {
            onSelect : config.events.onSelect || function() {
              $log.info(name + ' supply on Select function');
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

      obj.getInterface = function() {
        return obj.config;        
      };
    };
  }

  function ListViewerCtrlObjFtn($log, ListViewerObj) {
    var ListViewerCtrlObj = function(obj, onStateChange) {

      var o = this;
      
      o.onSelect = obj.onSelect || function(selected) {
        $log.info('selected: ' + JSON.stringify(selected));
      };
      
      o.onConfirm = obj.onConfirm || function() {
        $log.info('on confirm selection');
      };
      
      o.listobj = new ListViewerObj(obj, onStateChange);

    };
    return ListViewerCtrlObj;
  }

  function ListViewerObjFtn($q, $log, ListViewerElemObj) {
    var ListViewerObj = function(obj, onStateChange) {

      //$log.info('obj to listviewer obj: ' + JSON.stringify(obj));

      var o = this;

      obj.onStateChange = onStateChange || function(newState) {
        $log.info('supply a state change function to ChartObj');
      };

      o.listobj = obj.listobj || {};
      o.loaderMessage = obj.listobj.loaderMessage || 'Loading...';
      o.heading = obj.listobj.heading || 'blank';
      o.headerbar = obj.listobj.headerbar || 'app/list-viewer/_default-headerbar-tpl.html';
      o.headerObj = obj.listobj.headerObj || {};
      o.template = obj.listobj.template || 'app/list-viewer/_default-lve-tpl.html';
      o.chunksize = obj.listobj.chunksize || 4;

      // get an object to retrieve batches now
      o.getElementsObj = o.listobj.getElementsObj || {};

      o.makeElement = o.listobj.makeElement || function(value) {
        $log.info('supply a make element function');
        return {};
      };

      o.onSelect = obj.onSelect || function(elem) {
        $log.info('supply on select function');
      };

      o.onDeselect = obj.onDeselect || function(elem) {
        $log.info('supply on deselect function');
      };

      o.onEvent = obj.onEvent || function(event, elem) {
        var deferred = $q.defer();
        deferred.resolve(true);
        $log.info('supply on event function');
        return deferred.promise;
      };

      o.elements = [];
      o.selected = -1;

      // notify list object that an element was clicked
      o.handleClick = function(index) {   
        // sets selected and notifies the list implementation type selected/deselected     
        if(o.selected !== -1 && o.selected < o.elements.length) {
          //o.elements[o.selected].onDeselected();
          o.elements[o.selected].handleParentEvent('deselect');
          o.onDeselect(o.elements[o.selected].element);
        }

        if(o.selected !== index) {
          o.selected = index;          
          o.onSelect(o.elements[o.selected].element);
        } else {
          o.selected = -1;
        }
      };

      o.handleChildEvent = function(event, data, index) {
        switch(event) {
          case 'clicked':
            o.handleClick(index);
            break;
          case 'delete':
            o.onEvent(event, o.elements[index].element)
            .then(function(response) {
              //$log.info('event handled with response : ' + response);
              o.deleteElement(index);
            });   
            break; 
          default:
            break;
        }
      };

      o.listobj.baseFtns = {
        // ensure all elements deselected
        deselectAll : function() {
          o.selected = -1;
          angular.forEach(o.elements, function(value) {
            //value.onDeselected();
            value.handleParentEvent('deselect');
            o.onDeselect(value.element);
          }, o.elements);          
        },

        // send an event to every member of the list
        propagateEvent: function(event, data) {
          angular.forEach(o.elements, function(value) {
            //$log.info('event action for elem: ' + event);
            value.handleParentEvent(event, data);
          }, o.elements);
        }
      };

      function populate(list, batchObj, onComplete) {

        batchObj.get()
        .then(function(batch) {
          //$log.info('total no. of objects: ' + batchObj.params.total);
          var i = list.length;
          angular.forEach(batch.data, function(value) { 
            //$log.info('value gotten: ' + JSON.stringify(value));           
            var e = o.makeElement(value); 
            // $log.info('index to pass: ' + i);
            this.push(new ListViewerElemObj(o.handleChildEvent, e, parseInt(i)));
            i++;
          }, list);

          //$log.info('size of list: ' + JSON.stringify(list.length));
          if(onComplete) {
            onComplete({
              nbrElems: list.length,
              totalElems: batchObj.params.total
            });
          }
        })
        .catch(function(err) {
          $log.info('error getting elements: ' + err);
        });        
      }

      o.deleteElement = function(index) {
        o.elements = [];
        populate(o.elements, o.getElementsObj);
      };

      // TODO implement
      o.appendElements = function(cb) {        

        o.getElementsObj = o.getElementsObj.next();
        $log.info('next batch..params: ' + JSON.stringify(o.getElementsObj.params));

        if(!o.getElementsObj.more()) {
          $log.info('no more to get w/ params: ' + JSON.stringify(o.getElementsObj.params));
          $log.info('no more to get w/ elems :  ' + o.elements.length);
          return cb();          
        }
        
        populate(o.elements, o.getElementsObj, cb);
      };

      o.listobj.onPopulate = function() {
        populate(o.elements, o.getElementsObj);
      };

      //$log.info('calling populate on creation...');
      obj.onStateChange('loading');
      populate(o.elements, o.getElementsObj, function(updateData) {
        obj.onStateChange('ready', updateData);
      });

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
      // $log.info('total elements: ' + total);
      // $log.info('number of pages: ' + totalPages + ' number of forwards: ' + nbrForwards);
      return nbrForwards;
    }

    // function adjust(length) {
    //   vm.nbrElems = vm.lo.listobj.elements.length;
    //   //$log.info('what is chunsize anyways: ' + vm.lo.chunksize);
    //   vm.chunksize = parseInt(vm.lo.chunksize) || 4;
    //   var nbrWindows = Math.ceil(vm.nbrElems / vm.chunksize);
    //   //$log.info('no. of windows: ' + nbrWindows + ' nbrelems: ' + vm.nbrElems + ' chunksize: ' + vm.chunksize);

    //   //vm.nbrForwards = parseInt(vm.nbrElems / (vm.chunksize / 2));
    //   vm.nbrForwards = nbrWindows > 1 ? parseInt(nbrWindows * 2) : 0;
    //   //$log.info('nb elems: ' + vm.nbrElems + ' chunksize: ' + vm.chunksize + ' no. forwards: ' + vm.nbrForwards);
    //   //$log.info('calculate: ' + (vm.nbrElems / (vm.chunksize / 2)));
    //   if(vm.initcb) {
    //    vm.initcb();
    //   }
    // }

    vm.didMouseWheelUp = function(value) {
      //$log.info('mouse wheel up event!');
      vm.back();
    };

    vm.didMouseWheelDown = function(value) {
      //$log.info('mouse wheel down event!');
      vm.forward();
    };

    function init(obj) {
      vm.lo = new ListViewerCtrlObj(obj, function(newState, updateData) {
        //$log.info('update data: ' + JSON.stringify(updateData));
        completeInit(newState, updateData);
      });    

      // watch the size of the array of elements
      // consider removing this in favour of a callback from listviewerctrlobj
      // $scope.$watch(function(scope) {
      //   return (vm.lo.listobj.elements.length);
      // }, function(newVal, oldVal) {
      //   if(newVal) {
      //     $log.info('elements changed: ' + vm.lo.listobj.elements.length); 
      //     adjust(newVal);         
      //   }
      // });
    }

    function completeInit(newState, updateData) {
        //$log.info('update data: ' + JSON.stringify(updateData));
        var update = updateData || {};
        vm.nbrElems = update.nbrElems || 0;
        vm.totalElements = update.totalElems || 0;
        vm.nbrForwards = calculateNoForwards(vm.totalElements, vm.chunksize);
        //$log.info('nbr forwards: ' + vm.nbrForwards);
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
          //$log.info('forward invoked...');
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
          vm.lo.listobj.appendElements(function(updateData) {
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
          vm.initcb();
        }
      }
    //}

    // function init(obj) {
    //   //$log.info('calling init...');
    //   vm.lo = new ListViewerCtrlObj(obj, function(newState, updateData) {
    //     $log.info('update data: ' + JSON.stringify(updateData));
    //     var update = updateData || {};
    //     vm.totalElements = update.totalElems || 0;
    //     vm.state = newState;
    //     vm.setHeightCB();
    //   });

    //   vm.nbrElems = vm.lo.listobj.elements.length;
    //   //vm.nbrForwards = parseInt(vm.nbrElems / 2);
    //   vm.nbrForwards = calculateNoForwards(vm.totalElements, vm.chunksize);

    //   //$log.info('calling init of listviewer : ' + JSON.stringify(vm.lo));
    //   //$log.info('nbr elems : ' + vm.nbrElems);

    //   vm.back = function() {
    //     if(vm.atStart()) return;
    //     if(vm.animating) return;
    //     vm.animating = true;
    //     vm.index = (vm.index === 0 ? 0 : vm.index - 1);
    //     //$scope.$broadcast('clickback', vm.moveDistance);
    //     $scope.$broadcast('clickback', {
    //       dist: vm.moveDistance,
    //       callback: function() {
    //         vm.animating = false;
    //       }
    //     });
    //   };

    //   vm.forward = function() {
    //     vm.setHeightCB();
    //     if(vm.atEnd()) return;
    //     if(vm.animating) return;
    //     vm.animating = true;
    //     //$log.info('clicked forward');
    //     //$log.info('number of elements: ' + vm.nbrElems + ' move distance: ' + vm.moveDistance + ' forwards: ' + vm.nbrForwards);
    //     vm.index = (vm.index === vm.nbrForwards ? vm.nbrForwards : vm.index + 1);
    //     //$scope.$broadcast('clickforward', vm.moveDistance);
    //     $scope.$broadcast('clickforward', { 
    //       dist: vm.moveDistance, 
    //       callback: function() { 
    //         vm.animating = false;
    //         //$log.info('set animating to false: ' + vm.animating); 
    //       }
    //     });
    //     vm.lo.listobj.appendElements();
    //   };

    //   vm.atStart = function() {
    //     return (vm.index === 0);
    //   };

    //   vm.atEnd = function() {
    //     //$log.info('index : ' + vm.index + ' nbr forwards: ' + vm.nbrForwards);
    //     return (vm.index === vm.nbrForwards);
    //   };

    //   if(vm.initcb) {
    //     vm.initcb();
    //   }

    //   $scope.$watch(function(scope) {
    //     return (vm.lo.listobj.elements.length);
    //   }, function(newVal, oldVal) {
    //     if(newVal) {
    //       $log.info('elements changed: ' + vm.lo.listobj.elements.length); 
    //       adjust(newVal);         
    //     }
    //   });
    // }

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

        //$log.info('THE HEIGHT OF FIRST ELEM: ' + height);

        ctrl.initialiseHeight(height, function(scrollFrameHeight) {
          //$log.info('new init height of list element : ' + height + ' frame height: ' + scrollFrameHeight);
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