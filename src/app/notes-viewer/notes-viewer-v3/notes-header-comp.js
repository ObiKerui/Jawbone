
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .filter('notesHeaderV3filter', FilterFtn)    
    .factory('NotesHeaderV3Interface', InterfaceFtn)
    .factory('NoteService', ServiceFtn)  
    .factory('NotesHeaderV3Obj', ObjectFtn)
    .controller('NotesHeaderV3Ctrl', CtrlFtn)
    .directive('notesHeaderV3', DirFtn);

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
        onCreatedNote : config.onCreatedNote || function(createdNote) {
          $log.info('supply an on created note function');
        },
        onEditedNote : config.onEditedNote || function(editedNote) {
          $log.info('supply an on edited note function');
        }
      };

      return ifaceInst;            
    };
    return iface;
  }

  //----------------------------------------------------
  //  SERVICE OBJECT
  //----------------------------------------------------  
  function ServiceFtn($log, NoteV3Obj, $http) {
      var serviceInst = {
        createNote : createNoteFtn,
        deleteNote : deleteNoteFtn,
        editNote : editNoteFtn
      };

      function createNoteFtn(note) {
        $log.info('note service create note: ' + JSON.stringify(note));
        return $http.post('/notes', note)
        .then(function(response) {
          return response;
        })
        .catch(function(errResponse) {
          $log.info('error creating note: ' + JSON.stringify(errResponse));
        });
      };

      function deleteNoteFtn(note) {
        return $http.delete('/notes/' + note._id)
        .then(function(response) {
          return response;
        })
        .catch(function(errResponse) {
          $log.info('error deleting note: ' + JSON.stringify(errResponse));
        });       
      };

      function editNoteFtn(note) {
        return $http.put('/notes/' + note._id, note)
        .then(function(response) {
          return response;
        })
        .catch(function(errResponse) {
          $log.info('error updating note: ' + JSON.stringify(errResponse));
        });
      };

      return serviceInst;
  }

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log, NotesHeaderV3Interface, NoteV3Obj, BaseComp, NoteService) {
    var object = function(iface) {
      
      var render = renderFtn;
      var notify = notifyFtn;
      var handleSelect = handleSelectFtn;
      var reset = resetFtn;
      var mode = 'create';
      var tempNote = null;

      var objInst = new BaseComp();

      objInst.api = {
        render : renderFtn,
        notify : notifyFtn,
      	inCreateMode : function() {
      		return mode === 'create';
      	},
      	inEditMode : function() {
      		return mode === 'edit';
      	},
      	inDeleteMode : function() {
      		return mode === 'delete';
      	},
      	cancelNote : function() {
      		$log.info('clicked to cancel note');
          tempNote = new NoteV3Obj();
      	},
        prepareNewNote : function() {
          $log.info('prepare a new note');
          tempNote = new NoteV3Obj();
        },
        createNote : function() {
          $log.info('clicked to create note');
          NoteService.createNote(tempNote).then(function(response) {
            iface.config.onCreatedNote(angular.copy(tempNote));
            reset();
            $log.info('response when created note: ' + JSON.stringify(response));
          });
      	},
        editNote : function() {
          $log.info('clicked to update note');
          NoteService.editNote(tempNote).then(function(response) {
            iface.config.onEditedNote(angular.copy(tempNote));
            reset();
            $log.info('response when updating note: ' + JSON.stringify(response));
          });
        },
      	getTempNote : function() {
      		return tempNote;
      	}
      };

      function renderFtn(cb) {
        cb();
      }

      function notifyFtn(event, arg) {
        $log.info('notes header notified of event: ' + event);
        if(event === 'selected') {
          handleSelect(arg);
        } else if(event === 'deselected') {
          reset();
        }
      }

      function handleSelectFtn(arg) {
        mode = 'edit';
        tempNote = new NoteV3Obj(arg.elem.config.data);
      }

      function resetFtn() {
        mode = 'create';
        tempNote = null;

      }

      return objInst;
    };
    return object;
  }

  //----------------------------------------------------
  //  CTRL FUNCTION
  //----------------------------------------------------  
  function CtrlFtn($scope, NotesHeaderV3Obj) {
    var vm = this;  
    vm.obj = null;

    $scope.$watch(function(scope) {
      return (vm.iface);
    }, function(iface, oldval) {
      if(iface) {
        vm.obj = new NotesHeaderV3Obj(iface);
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
      controller: 'NotesHeaderV3Ctrl',
      controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      templateUrl: 'app/notes-viewer/notes-viewer-v3/_notes-header-tpl.html'
    };
    return directive;   
  }
})();
