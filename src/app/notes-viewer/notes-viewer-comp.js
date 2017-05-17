
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .filter('notesViewerfilter', NotesViewerfilterFtn)  
    .factory('NoteObj', NoteObjFtn)  
    .factory('NotesViewerObj', NotesViewerObjFtn)
    .controller('NotesViewerCtrl', NotesViewerCtrlFtn)
    .directive('notesViewer', NotesViewerDirFtn);

  function NotesViewerfilterFtn() {
    return function(arg) {  
      if(arg) {
        // do something with arg
        return arg;
      }
      return arg;
    }     
  }

  function NoteObjFtn($log, ListElementAPIObj) {
    var NoteObj = function(notedata, callbacks) {
      $log.info('the note data: ' + JSON.stringify(notedata));
      var obj = this;
      obj._id = notedata._id;
      obj.text = notedata.text || 'blank';
      obj.owner = notedata.owner || null;
      obj.creationDate = notedata.creationDate || null;
      obj.textLimit = 50;
      // obj.selected = false;

      // obj.cbs = callbacks || {};      
      // obj.delete = function() {
      //   $log.info('delete me: ' + JSON.stringify(obj));
      //   obj.cbs.onDelete(obj);
      // };

      // obj.clicked = function() {
      //   //$log.info('note obj was clicked...not necessarily selected!');
      // };

      // obj.onSelected = function() {
      //   obj.selected = true;
      // };

      // obj.onDeselected = function() {
      //   obj.selected = false;
      // };

      this.api = new ListElementAPIObj(this);

    };
    return NoteObj;
  };

  function NotesViewerObjFtn(NoteObj, JawboneService, $log, CommonModals) {
    var NotesViewerObj = function(arg) {
      var obj = this;
      obj.mode = 'view';
      obj.note = {
          text: null,
          owner: null,
          date : null
      };
      obj.tempnote = {
          text: null,
          owner: null,
          date : null
      };

      obj.callbacks = {
        onDelete : function(elem) {
          CommonModals.confirm('delete note, are you sure?')
          .then(function(confirmed) {
            if(confirmed) {
              JawboneService.deleteNote(elem)
              .then(function(response) {
                createlist();
              });
            }
          });
        },
        onSelect : function(elem) {
          //$log.info('set to edit mode : ' + JSON.stringify(elem));
          obj.notes.listobj.mode = 'edit';
          obj.notes.listobj.tempnote = angular.copy(elem);
          // $log.info('on select callback mode : ' + JSON.stringify(obj.mode));
          // $log.info('on select callback temp : ' + JSON.stringify(obj.notes.listobj.tempnote));          
          // $log.info('on select callback elem : ' + JSON.stringify(elem));
        },        
        onDeselect : function(elem) {
          //$log.info('on deselect called with elem: ' + JSON.stringify(elem));
          obj.notes.listobj.tempnote = null;
          obj.notes.listobj.mode = 'view';
        },
        onEdit : function(elem) {
          // JawboneService.updateNote(elem) 
          // .then(function(response) {
          //   createlist();
          // });          
        }
      };

      function createFunctions(listobj) {
        
        listobj.editMode = function() {
          return (listobj.mode === 'edit');
        };

        listobj.createMode = function() {
          return (listobj.mode === 'view');
        };

        listobj.cancelNote = function() {
          listobj.tempnote = null;
        };

        listobj.updateNote = function() {
          //var obj = this;
          $log.info('note to update: ' + JSON.stringify(listobj.tempnote, true, 3));
          JawboneService.updateNote(listobj.tempnote)
          .then(function(response) {
            listobj.mode = 'view';
            createlist();
          });
        };

        listobj.createNote = function() {
          //var obj = this;
          $log.info('note to create: ' + JSON.stringify(listobj.tempnote, true, 3));
          JawboneService.createNote(listobj.tempnote)
          .then(function(response) {
            listobj.mode = 'view';
            createlist();
          });
        };

        listobj.headerFtns = {
          deleteNotes : function() {
            $log.info('call to delete notes');
            listobj.baseFtns.deselectAll();
            listobj.state.deleteMode = !(listobj.state.deleteMode);
            listobj.baseFtns.propagateEvent('deleteMode', null);
          }
        };
      }

      function createlist() {
        var args = arg || {};
        obj.notes = {};
        obj.notes.listobj = {};
        obj.notes.listobj.state = {
          deleteMode : false
        };
        obj.notes.listobj.template = 'app/notes-viewer/_notes-element-tpl.html'; 
        obj.notes.listobj.getElementsObj = JawboneService.makeBatch(JawboneService.makeEndpoint('notes'));   
        obj.notes.listobj.headerbar = 'app/notes-viewer/_notes-header-tpl.html';    
        obj.notes.listobj.heading = 'Notes';
        obj.notes.listobj.mode = args.mode || 'view';
        createFunctions(obj.notes.listobj);        

        obj.notes.listobj.makeElement = function(objElement) {
          return new NoteObj(objElement, obj.callbacks);
        };

        obj.notes.onSelect = function(elem) {
          $log.info('supplied on select function: ');
          //elem.onSelected();
          obj.callbacks.onSelect(elem);
        };

        obj.notes.onDeselect = function(elem) {
          $log.info('supplied on deselect function: ');
          //elem.onDeselected();
          obj.callbacks.onDeselect(elem);
        };

        //$log.info(JSON.stringify(obj.notes.listobj, true, 2));
      }      

      createlist();

    };
    return NotesViewerObj;
  }

  function NotesViewerCtrlFtn($scope, NotesViewerObj, $log) {
    var vm = this;  
    vm.o = new NotesViewerObj();

    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      if(newval) {

      }
    }); 

    $log.info('controller ran for notes viewer : ' + JSON.stringify(vm.o));
  }

  function NotesViewerDirFtn() {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'NotesViewerCtrl',
      controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/notes-viewer/_notes-viewer-tpl.html'
    };
    return directive;   
  }
})();
