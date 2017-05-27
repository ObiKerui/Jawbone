
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('NoteV3Interface', InterfaceFtn)  
    .factory('NoteV3Obj', ObjectFtn);


  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function InterfaceFtn($log, ListViewerElemInterface, ListElemAPI, NoteV3Obj) {
    var iface = function(config) {
      var ifaceInst = new ListViewerElemInterface();
      var config = config || {};

      ifaceInst.config = {
      	api: new ListElemAPI(config.data),
      	data: new NoteV3Obj(config.data.element)          
      };

      return ifaceInst;            
    };
    return iface;
  }

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log) {
    var object = function(notedata) {

      var objInst = this;
      var notedata = notedata || {};
      objInst._id = notedata._id || null;
      objInst.text = notedata.text || '';
      objInst.owner = notedata.owner || null;
      objInst.creationDate = notedata.creationDate || Date.now();
      objInst.textLimit = 50;
      objInst.template = 'app/notes-viewer/notes-viewer-v3/_note-elem-tpl.html';

      $log.info('notedata to NoteV3Obj: ' + JSON.stringify(objInst));

		return objInst;
    };
    return object;
  }

})();
