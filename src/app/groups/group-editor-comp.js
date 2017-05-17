
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .filter('groupEditorfilter', GroupEditorfilterFtn)    
    .factory('GroupEditorObj', GroupEditorObjFtn)
    .controller('GroupEditorCtrl', GroupEditorCtrlFtn)
    .directive('groupEditor', GroupEditorDirFtn);

  var jbservice = null;
  var modalservice = null;

  function GroupEditorfilterFtn() {
    return function(arg) {  
      if(arg) {
      	// do something with arg
        return arg;
      }
      return arg;
    }     
  }

  function buildPatientViewer(obj, PatientObj) {
    obj.patientViewer.listobj = {};
    obj.patientViewer.listobj.state = {
      deleteMode : false
    };
    obj.patientViewer.listobj.template = 'app/groups/_group-element-tpl.html';
    obj.patientViewer.listobj.heading = 'Current Members';
    obj.patientViewer.listobj.loaderMessage = 'Loading Current Members...';
    obj.patientViewer.listobj.getElementsObj = jbservice.makeBatch(jbservice.makeEndpoint('users'));

    obj.patientViewer.listobj.makeElement = function(objElement) {
      return new PatientObj(objElement)
    };    

  }

  function buildPatientViewerHeader(obj) {
    obj.patientViewer.listobj.headerbar = 'app/groups/_group-header-bar-tpl.html';    
    obj.patientViewer.listobj.headerFtns = {
      addMember: function() {      
        //obj.mode = 'create';
        modalservice.onClick({
          tpl : 'app/groups/_group-member-modal-tpl.html'
        })
        .then(function(result) {});
      },
      deleteMember: function() {
        log.info('implement delete member ftn');
        obj.patientViewer.listobj.baseFtns.deselectAll();
        obj.patientViewer.listobj.state.deleteMode = !(obj.patientViewer.listobj.state.deleteMode);
        obj.patientViewer.listobj.baseFtns.propagateEvent('deleteMode', null);
      }
    }    
  }

  function GroupEditorObjFtn($log, ModalService, JawboneService, PatientObj) {
    var GroupEditorObj = function(arg, onCommitCB) {

      jbservice = JawboneService;
      modalservice = ModalService;

    	var obj = this;
      var args = arg || {};

      obj.patientViewer = {};
      buildPatientViewer(obj, PatientObj);
      buildPatientViewerHeader(obj);

      obj.message = 'the group creator';
      obj.onCommitCB = onCommitCB || function() {
        $log.info('supply on commit cb');
      };    

      obj.onAddPatient = function() {
        $log.info('on add patient');
        modalservice.onClick({
          tpl : 'app/groups/_group-member-modal-tpl.html',
          obj : obj
        }).then(function(result) {});      
      };

      obj.onAddAdmin = function() {
        $log.info('on add admin');
        modalservice.onClick({
          tpl : 'app/groups/_group-member-modal-tpl.html'
        }).then(function(result) {});      

      };
    };
    return GroupEditorObj;
  }

  function GroupEditorCtrlFtn($scope, GroupEditorObj) {
    var vm = this;  

    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      if(newval) {
        vm.obj = newval;        
      }
    }); 
  }

  function GroupEditorDirFtn() {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'GroupEditorCtrl',
      controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/groups/_group-edit-form-tpl.html'
    };
    return directive;   
  }
})();
