 (function() {
  'use strict';

  angular
    .module('jawboneApp')    
    .factory('GroupsPatientsBuilder', GroupsPatientsBuilderFtn)

  var log = null;
  var jbservice = null;
  var modalservice = null;
  var promiseService = null;

  function buildCallbacks(obj, userGroup) {
    obj.patientViewer.onEvent = function(event, selectedPatient) {
      var deferred = promiseService.defer();
      switch(event) {
        case 'delete':
          log.info('remove patient from the group: ' + selectedPatient);
          jbservice.groupService().removeMemberFromGroup(userGroup, selectedPatient);
          deferred.resolve(true);
          break;
        default:
          break;
      }
      return deferred.promise;
    };
  }

  function buildPatientsActionBar(obj) {

    //log.info('the object for the patients is: ' + JSON.stringify(obj, true, 3));

    obj.patientViewer.listobj.headerbar = 'app/groups/_group-patients-action-bar-tpl.html';    
    obj.patientViewer.listobj.headerFtns = {
      addPatientToGroup: function() {
        log.info('implement add patient to group ftn');
        modalservice.onClick({
          tpl : 'app/patient/_patient-notes-viewer-tpl.html'
        })
        .then(function(result) {});
      },
      removePatientFromGroup: function() {
        log.info('implement remove patient from group ftn');
        obj.patientViewer.listobj.baseFtns.deselectAll();
        obj.patientViewer.listobj.state.deleteMode = !(obj.patientViewer.listobj.state.deleteMode);
        obj.patientViewer.listobj.baseFtns.propagateEvent('deleteMode', null);

      }
    }    
  }

  function GroupsPatientsBuilderFtn($q, $log, JawboneService, ModalService, PatientsComponentBuilder) {
    var GroupsPatientsBuilder = function(user, userGroup) {
      var obj = this;

      // obj.profile = JawboneService.extractData('profile', user);
      // obj.name = obj.profile.first + ' ' + obj.profile.last;
      // obj.groups = JawboneService.extractData('groups', user);
      // obj.elems = obj.groups || [];
      // obj.mode = 'view';

      promiseService = $q;
      log = $log;
      jbservice = JawboneService;
      modalservice = ModalService;

      obj = new PatientsComponentBuilder(user, userGroup);

      log.info('obj: ' + JSON.stringify(obj));
      log.info('now build the patients group action bar...');

      buildPatientsActionBar(obj);  
      buildCallbacks(obj, userGroup);
      
      return obj;
    };
    return GroupsPatientsBuilder;
  }
})();
