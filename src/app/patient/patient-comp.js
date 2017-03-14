(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('PatientsComponentBuilder', PatientsComponentBuilderFtn)
    .factory('PatientObj', PatientObjFtn)
    .controller('PatientCtrl', PatientCtrlFtn)
    .directive('patientMgr', patientMgrFtn);

  function buildPatientSleeps($log, obj, SleepObj, batchRetriever) {
    obj.listobj = {};
    obj.listobj.template = 'app/sleeps/_sleeps-element-tpl.html';
    obj.listobj.heading = 'Sleeps';

    obj.listobj.getElementsObj = batchRetriever;

    obj.listobj.makeElement = function(objElement) {
      return new SleepObj(objElement)
    };        
  }

  function buildPatientGraph($log, obj, user, SleepsChartBuilderObj) {
    obj.sleepsChart = new SleepsChartBuilderObj(user);
  }

  function buildCallbacks($log, obj, SleepObj, JawboneService, SleepsChartBuilderObj, user) {

    obj.mode = 'view';

    obj.patientViewer.onSelect = function(ss) {
      $log.info('on select event fired for patients element: ' + JSON.stringify(ss));
      var bsleeps = JawboneService.makeBatch('sleeps');
      buildPatientSleeps($log, obj.sleepsViewer, SleepObj, bsleeps);
      buildPatientGraph($log, obj, user, SleepsChartBuilderObj);
      obj.mode = 'edit';
    };
  }

  function buildListViewer($q, $log, obj, PatientObj, batchRetriever) {
    obj.listobj = {};
    obj.listobj.template = 'app/patient/_patient-element-tpl.html';
    obj.listobj.heading = 'Patients';

    obj.listobj.getElementsObj = batchRetriever;

    obj.listobj.makeElement = function(objElement) {
      return new PatientObj(objElement)
    };    

  }

  function PatientsComponentBuilderFtn($q, $log, PatientObj, SleepObj, JawboneService, SleepsChartBuilderObj) {
    var PatientsComponentBuilder = function(user) {
      var obj = this;

      obj.profile = JawboneService.extractData('profile', user);
      obj.name = obj.profile.first + ' ' + obj.profile.last;
      obj.patients = JawboneService.extractData('patients', user);
      obj.mode = 'view';
      
      obj.patientViewer = {};
      obj.sleepsViewer = {};
      obj.sleepsChart = {};

      var bobj = JawboneService.makeBatch('patients');
      $log.info('bobj: ' + JSON.stringify(bobj));

      buildCallbacks($log, obj, SleepObj, JawboneService, SleepsChartBuilderObj, user);
      buildListViewer($q, $log, obj.patientViewer, PatientObj, bobj);

      $log.info('patient comp builder ran: ' );

    };
    return PatientsComponentBuilder;
  }

  function PatientObjFtn($log) {
    var PatientObj = function(objElement) {

      $log.info('obj element: ' + JSON.stringify(objElement));

      var o = this;
      o.data = objElement || {};
      o.jawboneId = objElement.jawboneId || 'blank';
      o.obj = objElement.user.profile || {};
      o.first = o.obj.first || 'blank';
      o.last = o.obj.last || 'blank';
      o.weight = o.obj.weight || 'blank weight';
      o.gender = o.obj.gender || 'no gender';
      o.height = o.obj.height || 'no height';
      o.joinDate = objElement.joinDate || null;

      o.selected = false;

      o.activated = function() {
        o.selected = true;
      };

      o.deactivated = function() {
        o.selected = false;
      }
    };
    return PatientObj;
  }

  function PatientCtrlFtn($log) {
    var vm = this;
  }

  function patientMgrFtn($log) {
    var directive = {
      restrict: 'E',
        scope: {},
        controller: 'PatientCtrl',
        controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/patient/_patient-mgr-tpl.html'
    };
    return directive;   
  }


})();