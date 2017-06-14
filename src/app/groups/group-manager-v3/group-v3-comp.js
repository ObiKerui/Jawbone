

(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('GroupV3Obj', ObjectFtn);

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log) {
    var object = function(data) {

    	$log.info('data passed to group obj: ' + JSON.stringify(data));
   		var objInst = this;
      objInst._id = data._id;
   		objInst.name = data.name || null;
   		objInst.description = data.description || null;
   		objInst.size = data.members.length || 0;
   		objInst.template = 'app/groups/group-manager-v3/_group-element-tpl.html';
      objInst.permissions = data.permissions || {};

		return objInst;
    };
    return object;
  }
})();
