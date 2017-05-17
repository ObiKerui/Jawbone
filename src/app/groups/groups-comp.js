(function() {
  'use strict';

  angular
    .module('jawboneApp')    
    .factory('GroupsComponentBuilder', GroupsComponentBuilderFtn)
    .factory('GroupObj', GroupObjFtn)
    .filter('defaultGroup', defaultGroupFtn)
    .controller('GroupCtrl', GroupCtrlFtn)
    .directive('groupMgr', groupMgrFtn);

  var log = null;
  var jbservice = null;
  var modalservice = null;
  var promiseService = null;

  function defaultGroupFtn($log) {
    return function(img) {  
      if(!img) {
        return 'assets/group.png';
      }
      return img;
    }     
  }

  function buildGroupSummary(obj, group, GroupSummObj) {
    obj.groupSummary = new GroupSummObj(group);
    obj.groupSummary.parent = {
      switchView: function() {
        obj.mode = 'view';
      },
      addPatient: function() {
        log.info('implement add patient');
        modalservice.onClick({
          tpl : 'app/patient/_patient-notes-viewer-tpl.html'
        })
        .then(function(result) {});
      },
      removePatients: function() {
        log.info('implement remove patients');
      },

      clickedOther: function() {
        log.info('user clicked other');
      }
    };
  }

  function buildCallbacks(obj, user, GroupsPatientsBuilder, GroupSummObj, PatientsComponentBuilder, AdminMgrInterface, PatientMgrInterface) {

    obj.mode = 'view';

    obj.groupViewer.onSelect = function(selectedGroup) {
      if(obj.groupViewer.listobj.state.deleteMode) {
        //log.info('delete the group: ' + JSON.stringify(selectedGroup, true, 3));
        return;
      }
      //log.info('on select event fired: delete mode? ' + obj.groupViewer.listobj.state.deleteMode);
      
      //obj.patients = new GroupsPatientsBuilder(user, selectedGroup.data);      
      
      obj.patientMgrInterface = new PatientMgrInterface({
        groupId : selectedGroup.data._id
      });

      obj.adminMgrInterface = new AdminMgrInterface({
        groupId : selectedGroup.data._id
      });
      
      buildGroupSummary(obj, selectedGroup.data, GroupSummObj);
      obj.mode = 'edit';
    };
    
    obj.groupViewer.onEvent = function(event, selectedGroup) {
      var deferred = promiseService.defer();
      switch(event) {
        case 'delete':
          //log.info('delete the group: ' + JSON.stringify(selectedGroup));
          deferred.resolve(true);
          break;
        default:
          break;
      }
      return deferred.promise;
    };

    // obj.onSelect = function(ss) {
    //   $log.info('on select event fired for group element: ' + JSON.stringify(ss));
    // };

    // obj.onConfirm = function() {
    // };

  }

  function buildListViewerHeader(obj) {
    obj.groupViewer.listobj.headerbar = 'app/groups/_group-header-bar-tpl.html';    
    obj.groupViewer.listobj.headerFtns = {
      createGroup: function() {
        log.info('implement create group ftn');
        obj.mode = 'create';
        // modalservice.onClick({
        //   tpl : 'app/patient/_patient-notes-viewer-tpl.html'
        // })
        // .then(function(result) {});
      },
      deleteGroups: function() {
        log.info('implement delete groups ftn');
        obj.groupViewer.listobj.baseFtns.deselectAll();
        obj.groupViewer.listobj.state.deleteMode = !(obj.groupViewer.listobj.state.deleteMode);
        obj.groupViewer.listobj.baseFtns.propagateEvent('deleteMode', null);
      }, 
      clickElsewhere: function() {
        log.info('clicked the elsewhere...');
      }
    }    
  }

  function buildListViewer(obj, GroupObj) {
    obj.groupViewer.listobj = {};
    obj.groupViewer.listobj.state = {
      deleteMode : false
    };
    obj.groupViewer.listobj.template = 'app/groups/_group-element-tpl.html';
    obj.groupViewer.listobj.heading = 'Groups';
    obj.groupViewer.listobj.loaderMessage = 'Loading Groups...';
    obj.groupViewer.listobj.getElementsObj = jbservice.makeBatch(jbservice.makeEndpoint('groups'));

    obj.groupViewer.listobj.makeElement = function(objElement) {
      return new GroupObj(objElement);
    };    
  }

  function buildGroupCreator(obj, user, GroupCreatorInterface) {
    obj.groupCreatorInterface = new GroupCreatorInterface({
      user : user
    });
  }

  function GroupsComponentBuilderFtn($q, $log, GroupObj, JawboneService, GroupsPatientsBuilder, PatientsComponentBuilder, GroupSummObj, ModalService, GroupCreatorInterface, AdminMgrInterface, PatientMgrInterface) {
    var GroupsComponentBuilder = function(user) {
      var obj = this;

      obj.profile = JawboneService.extractData('profile', user);
      obj.name = obj.profile.first + ' ' + obj.profile.last;
      obj.groups = JawboneService.extractData('groups', user);
      obj.elems = obj.groups || [];
      obj.mode = 'view';

      log = $log;
      jbservice = JawboneService;
      modalservice = ModalService;
      promiseService = $q;      

      obj.groupSummary = {};
      obj.groupViewer = {};
      obj.patientViewer = {};      
      obj.adminMgr = {};
      
      // obj.downloader = {};

      $log.info('build the groups component..........');

      buildCallbacks(obj, user, GroupsPatientsBuilder, GroupSummObj, PatientsComponentBuilder, AdminMgrInterface, PatientMgrInterface);
      buildListViewer(obj, GroupObj);
      buildListViewerHeader(obj);    
      buildGroupCreator(obj, user, GroupCreatorInterface);  

            // handle the views
      obj.adminPatientView = 'patient';

      obj.api = {
        setPatientView : function() {
          $log.info('set the patient view');
          obj.adminPatientView = 'patient';
          obj.patientMgrInterface.notify('reveal');
        },

        setAdminView : function() {
          $log.info('set admin view');
          obj.adminPatientView = 'admin';
          obj.adminMgrInterface.notify('reveal');
        },

        isPatientView : function() {
          return obj.adminPatientView === 'patient';
        },
      
        isAdminView : function() {
          return obj.adminPatientView === 'admin';
        }
      }
    };
    return GroupsComponentBuilder;
  }

  function GroupObjFtn($log, ListElementAPIObj) {
    var GroupObj = function(data) {
      this.data = data || {};
      $log.info('group data: ' + JSON.stringify(data));
      this.name = data.name || 'blank';
      this.description = data.description || 'blank';
      this.size = data.members.length || 0;

      this.api = new ListElementAPIObj(this);
      
    };
    return GroupObj;
  }

  function GroupCtrlFtn($log) {
    var vm = this;
  }

  function groupMgrFtn($log) {
    var directive = {
      restrict: 'E',
        scope: {},
        controller: 'GroupCtrl',
        controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/groups/_group-mgr-tpl.html'
    };
    return directive;   
  }


})();