
(function() {
  'use strict';

  angular
    .module('jawboneApp')  
    .factory('ListViewerV3Interface', InterfaceFtn)  
    .factory('ListViewerV3Obj', ObjectFtn)
    .controller('ListViewerV3Ctrl', CtrlFtn)
    .directive('listViewerV3', DirFtn);

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function InterfaceFtn($log, BaseInterface) {
    var iface = function(config) {
      var ifaceInst = new BaseInterface();
      var config = config || {};

      ifaceInst.config = {
      	getElementsObj : config.getElementsObj || null,
      	makeListElementFtn : config.makeListElementFtn || null,
        onElementClicked : config.onElementClicked || function(action, element, index) {
          $log.info('passed to iface: element of index clicked ' + index);
        },
        onDeselect : config.onDeselect || function(element) {
          $log.info('supply on onDeselect function');
        },
        onDelete : config.onDelete || function(elem, index, cb) {
          $log.info('supply on Delete function..');
          cb();
        },
        headerTpl : config.headerTpl || null
      };

      return ifaceInst;
    };
    return iface;
  }

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log, ListViewerElemInterface, HeaderBarV3Interface, BaseComp) {
    var obj = function(iface) {

      var refreshList = refreshListFtn;

    	var objInst = new BaseComp();
    	objInst.elements = [];
      objInst.deleteMode = false;
      // set breakpoint here

    	// private functions
    	var populate = populateFtn;
      var handleClick = handleClickFtn;

		  objInst.api = {

        // POPULATE THE LIST
        render: function(cb) {

          // create the heading bar
          objInst.header = new HeaderBarV3Interface({
            tpl : iface.config.headerTpl,
            getListAPI : objInst.getAPI
          });

          populate(objInst.elements, iface.config.getElementsObj, cb);
        },

        // HANDLE ELEMENT CLICKED EVENT
        elementClicked: function(index) {
          handleClick(objInst, iface, index);
        },

        deleteElement: function(index) {
          iface.config.onDelete(objInst.elements[index], index, function() {
            objInst.elements.splice(index, 1);
          });
        },

        isDeleteMode : function() {
          return objInst.deleteMode;
        },

        // DESELECT ALL ELEMENTS OF LIST
        deselectAll : function() {
          $log.info('deselect all called');
          var selected = objInst.selected;
          objInst.selected = -1;
          angular.forEach(objInst.elements, function(element) {
            element.notify('deselect');
            iface.config.onDeselect(element);
          });          
        },

        // PROPAGATE EVENT TO EVERY LIST ELEMENT
        propagateEvent: function(event, data) {
          angular.forEach(objInst.elements, function(element) {
            //set breakpoint
            element.notify(event, data);
          });
        },

        // REFRESH THE LIST
        refresh: function() {
        	$log.info('refresh list');
          this.deselectAll();
          refreshList();
        },

        // APPEND ELEMENTS TO THE LIST
  			appendElements: function(cb) {        

  				iface.config.getElementsObj = iface.config.getElementsObj.next();
  				$log.info('next batch..params: ' + JSON.stringify(iface.config.getElementsObj.params));

  				if(!iface.config.getElementsObj.more()) {
  				  $log.info('no more to get w/ params: ' + JSON.stringify(iface.config.getElementsObj.params));
  				  $log.info('no more to get w/ elems :  ' + objInst.elements.length);
  				  return cb();          
  				}
  				populate(objInst.elements, iface.config.getElementsObj, cb);
        },

        // HANDLE AN EVENT
        notify: function(event, data, index) {
          switch(event) {
            case 'clicked':
              //objInst.handleClick(index);
              break;
            case 'deleteMode':
              objInst.deleteMode = !objInst.deleteMode;
  						objInst.api.deselectAll();
  						objInst.api.propagateEvent(event, null);
  						break;
		        case 'delete':
  						objInst.onEvent(event, objInst.elements[index].element)
  						.then(function(response) {
  							$log.info('event handled with response : ' + response);
  							objInst.deleteElement(index);
  						});   
  						break; 
		        case 'reveal':
  						$log.info('list was revealed...reinitialise height');
  						objInst.api.refresh();
              break;
            case 'refresh':
              $log.info('refresh the list');
              objInst.api.refresh();
              break;
		        default:
  						$log.info('list obj received event: ' + event);
  						break;
          }
        }
      };

      return objInst;

      //----------------------------------------------
      // REFRESH THE LIST
      //----------------------------------------------
      function refreshListFtn() {
        objInst.elements = [];
        populate(objInst.elements, iface.config.getElementsObj, function(listdata) {
          $log.info('list refreshed: ' + JSON.stringify(listdata));
        });
      }

      //----------------------------------------------
      // HANDLE POPULATE OF LIST
      //----------------------------------------------
    	function populateFtn(list, getElementsObj, onDone) {
        if(!getElementsObj) {
          onDone({
            nbrElems: 0,
            totalElems: 0
          });
          return;
        }

        getElementsObj.get()
        .then(function(batch) {
          $log.info('batch in populate: ' + JSON.stringify(getElementsObj.params));
          $log.info('batch total: ' + batch.total);
          $log.info('total no. of objects: ' + getElementsObj.params.total);
          var i = list.length;
          angular.forEach(batch.data, function(value) { 
            this.push(iface.config.makeListElementFtn({
            	api: objInst.api,
            	element: value,
            	index: parseInt(i)
            }));
            i++;
          }, list);

          $log.info('size of list: ' + JSON.stringify(list.length));
          $log.info('elements : ' + JSON.stringify(list));

          if(onDone) {
            onDone({
              nbrElems: list.length,
              totalElems: batch.total,
              elems: list
            });
          }
        })
        .catch(function(err) {
          $log.info('error getting elements: ' + err);
        });            		
    	}

      //----------------------------------------------
      // HANDLE WHEN NOTIFIED OF AN ELEMENT CLICK
      //----------------------------------------------
      function handleClickFtn(obj, iface, index) {   
                  
        $log.info('handle click function was called: idx: ' + index);

        // tell an element and the interface if it was deselected
        if(obj.selected !== -1 && obj.selected < obj.elements.length) {
          obj.elements[obj.selected].notify('deselected');  
          //iface.notify('deselected', obj.elements[obj.selected], index);
          iface.config.onElementClicked('deselected', obj.elements[obj.selected], index);
        }

        // tell the interface of click event
        //iface.notify('clicked', obj.elements[index], index);
        iface.config.onElementClicked('clicked', obj.elements[index], index);

        if(obj.selected !== index) {
          obj.selected = index;          
          //iface.notify('selected', obj.elements[index], index);
          iface.config.onElementClicked('selected', obj.elements[index], index);
        } else {
          obj.selected = -1;
        }
      }
    };
    return obj;    
  }

  var log = null;

  //-------------------------------------------
  // LIST SCROLLER IMPLEMENTATION
  //-------------------------------------------
  function ListScroller(initCB, refreshCB) {
    var scroller = this;
    var initCB = initCB;
    var refreshCB = refreshCB;
    var chunksize = 4;
    var index = 0;
    var nbrForwards = 0;
    var moveDistance = 0;
    var scrollforward = null;
    var scrollback = null;
    var animating = false;
    var onScrollForwardFtn = null;

    function atEnd() {
      return (index === nbrForwards);
    };

    function atStart() {
      return (index === 0);
    }

    // SET THE HEIGHT
    var setHeight = function(height, cb) {
      //$log.info('init height called: ' + height);
      var frameHeight = (chunksize * height);
      moveDistance = parseInt(frameHeight / 2);
      cb(frameHeight);
    };

    // CALCULATE THE NBR FORWARDS
    var calculateNoForwards = function(listdata, chunksize) {
      // set breakpoint here
      var total = listdata.totalElems;
      var totalPages = Math.ceil(total / chunksize);
      var nbrOnLastPage = parseInt(total % chunksize);
      var lessThanHalfOnLastPage = (nbrOnLastPage !== 0 && (nbrOnLastPage <= chunksize / 2))
      var nbrForwards = (lessThanHalfOnLastPage ? totalPages - 1 : totalPages);
      //log.info('total elements: ' + total);
      //log.info('number of pages: ' + totalPages + ' number of forwards: ' + nbrForwards);
      return nbrForwards;
    }

    // PUBLIC ON-SHOW
    scroller.onShow = function(data) {
      //log.info('on show called with list data: ' + JSON.stringify(data.listdata));
      initCB(function(scrollInfo, cb) {
        //log.info('the height of list element is: ' + height);
        setHeight(scrollInfo.height, cb);
        nbrForwards = calculateNoForwards(data.listdata, chunksize);
        scrollforward = scrollInfo.forward;
        scrollback = scrollInfo.back;
        //log.info('nbr forwards: ' + nbrForwards);
      });
    };

    scroller.setOnScrollForward = function(onScrollForward) {
      onScrollForwardFtn = onScrollForward;
    };

    // PUBLIC FORWARD
    scroller.forward = function() {
      //log.info('scroll forward...');
      // set height
      if(atEnd() || (animating == true)) return;
      animating = true;
      index = (index === nbrForwards ? nbrForwards : index + 1);
      scrollforward(moveDistance, function() {
        animating = false;
        if(onScrollForwardFtn) {
          onScrollForwardFtn();
        }
      });
    };

    // PUBLIC BACK
    scroller.back = function() {
      //log.info('scroll back...');
      if(atStart() || (animating == true)) return;
      animating = true;
      index = (index === 0 ? 0 : index - 1);
      scrollback(moveDistance, function() {
        animating = false;
      });
    };

    return scroller;
  }

  //----------------------------------------------------
  //  CTRL FUNCTION
  //----------------------------------------------------  
  function CtrlFtn($log, $scope, ListViewerV3Obj) {
    var vm = this;  
    vm.obj = null;
    vm.scroller = null;
    vm.didMouseWheelUp = function() {
      $log.info('did mouse wheel up..');
    };
    vm.didMouseWheelDown = function() {
      $log.info('did mouse wheel down..');
    };

    log = $log;

    vm.registerLink = function(initCB, refreshCB) {
      $log.info('called register link');
      vm.scroller = new ListScroller(initCB, refreshCB);
    };

    $scope.$watch(function(scope) {
      return (vm.iface);
    }, function(iface, oldval) {
      if(iface) {
      	vm.obj = new ListViewerV3Obj(iface);
      	iface.setAPI(vm.obj.getAPI);
        vm.obj.api.render(function(listdata) {
          vm.scroller.setOnScrollForward(function() {
            vm.obj.api.appendElements(function(listdata) {
              $log.info('appended elements: ' + JSON.stringify(listdata));
            });
          });
          vm.didMouseWheelUp = vm.scroller.forward,
          vm.didMouseWheelDown = vm.scroller.back,
          vm.scroller.onShow({
            listdata : listdata
          });
        });
      }
    }); 
  }

  //----------------------------------------------------
  //  DIRECTIVE
  //----------------------------------------------------  
  function DirFtn($log, $timeout) {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'ListViewerV3Ctrl',
      controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      templateUrl: 'app/list-viewer/list-viewer-v3/_list-viewer-tpl.html',
      link: linkFtn
    };
    return directive;

    function linkFtn(scope, element, attrs, ctrl) {
      //var frame = angular.element(element[0].querySelector('.list-viewer-elements'))
      var frame = null;
      var li = null;
      var ul = null;

      var forward = null;
      var back = null;

      function initialise(callback) {
        frame = angular.element(element[0].querySelector('.list-viewer-elements'));
        ul = frame.find('ul');
        li = ul.find('li');
        var height = li.first().height();

        forward = function(dist, onDone) {
          ul.velocity({
            'top': '-='+ dist
          }, 400, function() {
            onDone();
          });                  
        };

        back = function(dist, onDone) {
          ul.velocity({
            'top': '+='+ dist
          }, 400, function() {
            onDone();
          });                  
        };

        callback({ 
          height: height,
          forward: forward,
          back: back
        }, function(scrollFrameHeight) {
          //$log.info('new init height of list element : ' + height + ' frame height: ' + scrollFrameHeight);
          frame.css({
            'height': scrollFrameHeight + 'px'
          });          
        });
      }

      ctrl.registerLink(function(cb) {
        $timeout(function() {
          initialise(cb);
        })
      }, function(cb) {
        initialise(cb);
      });
    }   
  }
})();
