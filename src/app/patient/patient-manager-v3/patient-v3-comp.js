
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('PatientV3Obj', ObjectFtn);

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log) {
    var object = function(data) {
    	var objInst = this;

    	$log.info('data passed to patientv3 obj: ' + JSON.stringify(data));

      var data = data || {};
      var user = data.user || {};
      var profile = user.profile || {};

      objInst._id = data._id || null;
      objInst.jawboneId = user.jawboneData.jawboneId || null;
      objInst.email = data.user.email || null;
      objInst.first = profile.first || null;
      objInst.last = profile.last || null;    
      objInst.weight = profile.weight || null; 
      objInst.gender =  profile.gender || null;
      objInst.height = profile.height || null;
      objInst.joinDate = data.joinDate || null;
      objInst.template = 'app/patient/patient-manager-v3/_patient-tpl.html';

		return objInst;
    };
    return object;
  }

})();
