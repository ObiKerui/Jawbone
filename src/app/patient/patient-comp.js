(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('PatientsComponentBuilder', PatientsComponentBuilderFtn)
    .factory('PatientObj', PatientObjFtn)
    .filter('defaultPatient', defaultPatientFtn)
    .controller('PatientCtrl', PatientCtrlFtn)
    .directive('patientMgr', patientMgrFtn);

  var log = null;
  var jbservice = null;

  function buildPatientSummary(obj, user, PatientSummObj) {
    obj.patientSummary = new PatientSummObj(user);
    obj.patientSummary.parent = {
      switchView: function() {
        obj.mode = 'view';
      },
      showPatientNotes: function() {
        log.info('implement show patient notes');
      },
      downloadToCSV: function() {
        log.info('implement show patient notes');
      }
    };
  }

  function buildPatientSleeps(obj, user, SleepObj) {
    obj.sleepsViewer.listobj = {};
    obj.sleepsViewer.listobj.template = 'app/sleeps/_sleeps-element-tpl.html';
    obj.sleepsViewer.listobj.headerbar = 'app/sleeps/_sleeps-header-tpl.html';    
    obj.sleepsViewer.listobj.heading = 'Sleeps';
    obj.sleepsViewer.listobj.loaderMessage = 'Loading sleep data...';

    obj.sleepsViewer.listobj.getElementsObj = jbservice.makeBatch(jbservice.makeEndpoint('sleeps', user._id));

    obj.sleepsViewer.listobj.makeElement = function(objElement) {
      return new SleepObj(objElement);
    };        
  }

  function buildPatientGraph(obj, user, SleepsChartBuilderObj) {
    obj.sleepsChart = new SleepsChartBuilderObj(user);
  }

  function buildPatientDownloader(obj, SleepsChartDownloaderBuilder, ModalService) {
        
    obj.patientSummary.parent.downloadToCSV = function() {
      //log.info('call to show download modal');
      ModalService.onClick(new SleepsChartDownloaderBuilder(obj, function() {
        return obj.sleepsChart.getGraphDataCB();
      }))
      .then(function(result) {});
    };
  }

  function buildPatientNotes(obj, ModalService) {
    obj.patientSummary.parent.showPatientNotes = function() {
      //log.info('call show patient notes modal...');
      ModalService.onClick({
        tpl : 'app/patient/_patient-notes-viewer-tpl.html'
      })
      .then(function(result) {});
    };
  }

  function buildCallbacks(obj, SleepObj, SleepsChartBuilderObj, SleepsChartDownloaderBuilder, PatientSummObj, ModalService) {
  
    obj.mode = 'view';

    obj.patientViewer.onSelect = function(ss) {
      //log.info('on select event fired for patients element: ' + JSON.stringify(ss));

      buildPatientSummary(obj, ss.data.user, PatientSummObj);
      buildPatientSleeps(obj, ss.data.user, SleepObj);
      buildPatientGraph(obj, ss.data.user, SleepsChartBuilderObj);
      buildPatientDownloader(obj, SleepsChartDownloaderBuilder, ModalService);
      buildPatientNotes(obj, ModalService);
      obj.mode = 'edit';
    };
  }

  function buildListViewer(obj, group, PatientObj) {
    obj.patientViewer.listobj = {};
    obj.patientViewer.listobj.template = 'app/patient/_patient-element-tpl.html';
    obj.patientViewer.listobj.heading = 'Patients';
    obj.patientViewer.listobj.loaderMessage = 'Loading Patients...';

    var groupId = group._id || null;
    obj.patientViewer.listobj.getElementsObj = jbservice.makeBatch(jbservice.makeFieldGetter('groups', group._id, 'members'));

    obj.patientViewer.listobj.makeElement = function(objElement) {
      return new PatientObj(objElement)
    };    
  }

  function defaultPatientFtn($log) {
    return function(img) {  
      if(!img) {
        return 'assets/users.png';
      }
      return img;
    }     
  }

  function PatientsComponentBuilderFtn($q, $log, PatientObj, SleepObj, JawboneService, SleepsChartBuilderObj, SleepsChartDownloaderBuilder, PatientSummObj, ModalService) {
    var PatientsComponentBuilder = function(user, userGroup) {

      // assign some scoped variables rather than pass these as args
      log = $log;
      jbservice = JawboneService;

      log.info('user group: ' + JSON.stringify(userGroup));

      var obj = this;

      userGroup = userGroup || {};
      obj.profile = JawboneService.extractData('profile', user);
      obj.name = obj.profile.first + ' ' + obj.profile.last;
      obj.patients = JawboneService.extractData('patients', user);
      obj.mode = 'view';
      
      obj.patientSummary = {};
      obj.patientViewer = {};
      obj.sleepsViewer = {};
      obj.sleepsChart = {};
      obj.downloader = {};

      // to implement
      obj.noteViewer = {};

      buildCallbacks(obj, SleepObj, SleepsChartBuilderObj, SleepsChartDownloaderBuilder, PatientSummObj, ModalService);
      buildListViewer(obj, userGroup, PatientObj);

    };
    return PatientsComponentBuilder;
  }

  function PatientObjFtn($log, ListElementAPIObj) {
    var PatientObj = function(objElement) {

      //$log.info('obj element: ' + JSON.stringify(objElement));

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

      this.api = new ListElementAPIObj(this);
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