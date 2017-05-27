
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .filter('notesViewerV3filter', FilterFtn)    
    .factory('NotesViewerV3Interface', InterfaceFtn)  
    .factory('NotesViewerV3Obj', ObjectFtn)
    .controller('NotesViewerV3Ctrl', CtrlFtn)
    .directive('notesViewerV3', DirFtn);

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
  function ObjectFtn($log, JawboneService, NotesViewerV3Interface, NoteService, BaseComp, ListViewerV3Interface, NoteV3Interface, ListElemAPI, NoteV3Obj, NotesHeaderV3Interface) {
    var object = function(iface) {

      var handleElementClick = handleElementClickFtn;

      var objInst = new BaseComp();
      objInst.notesList = null;

      objInst.api = {
        message: 'notes viewer api',
      	render : renderFtn,
        nofity : function(event, arg) {
          $log.info('notes viewer notified of event: ' + event);
        }
      };

      function renderFtn(cb) {
        // the notes list
      	objInst.notesList = new ListViewerV3Interface({
      		getElementsObj : JawboneService.makeBatch(JawboneService.makeEndpoint('notes')),
      		makeListElementFtn : function(elemInfo) {
	          return new NoteV3Interface({
	          	data: elemInfo
	          });
      		},
          onElementClicked : function(action, element, index) {
            handleElementClick(action, element, index);
          },
          onDelete : function(elem, idx, cb) {
            $log.info('delete the note: ' + JSON.stringify(elem.config.data));
            NoteService.deleteNote(elem.config.data)
            .then(function(response) {
              cb();
            })
          },
          headerTpl : 'app/notes-viewer/notes-viewer-v3/_notes-list-action-bar-tpl.html'
      	});

        // the notes header
        objInst.notesHeader = new NotesHeaderV3Interface({
          onCreatedNote : function(createdNote) {
            objInst.notesList.notify('refresh');
          },
          onEditedNote : function(editedNote) {
            objInst.notesList.notify('refresh');
          }
        });

      	cb();
      }

      //--------------------------------------------------
      //  HANDLE ELEMENT CLICKED FTN
       //--------------------------------------------------     
      function handleElementClickFtn(action, element, index) {
        if(action === 'selected' || action === 'deselected') {
          objInst.notesHeader.notify(action, { 'elem': element, 'idx' : index });
        } 
      }

      return objInst;
    };
    return object;
  }

  //----------------------------------------------------
  //  CTRL FUNCTION
  //----------------------------------------------------  
  function CtrlFtn($log, $scope, NotesViewerV3Obj) {
    var vm = this;  
    vm.obj = null;

    $scope.$watch(function(scope) {
      return (vm.iface);
    }, function(iface, oldval) {
		if(iface) {
        	vm.obj = new NotesViewerV3Obj(iface);
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
      controller: 'NotesViewerV3Ctrl',
      controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      templateUrl: 'app/notes-viewer/notes-viewer-v3/_notes-viewer-tpl.html'
    };
    return directive;   
  }
})();
