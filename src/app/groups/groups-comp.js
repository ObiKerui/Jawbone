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

  function buildCallbacks(obj, user, GroupsPatientsBuilder, GroupSummObj, PatientsComponentBuilder) {

    obj.mode = 'view';

    obj.groupViewer.onSelect = function(selectedGroup) {
      if(obj.groupViewer.listobj.state.deleteMode) {
        //log.info('delete the group: ' + JSON.stringify(selectedGroup, true, 3));
        return;
      }
      //log.info('on select event fired: delete mode? ' + obj.groupViewer.listobj.state.deleteMode);
      
      obj.patients = new GroupsPatientsBuilder(user, selectedGroup.data);
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
        modalservice.onClick({
          tpl : 'app/patient/_patient-notes-viewer-tpl.html'
        })
        .then(function(result) {});
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
      return new GroupObj(objElement)
    };    
  }

  function GroupsComponentBuilderFtn($q, $log, GroupObj, JawboneService, GroupsPatientsBuilder, PatientsComponentBuilder, GroupSummObj, ModalService) {
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
      // obj.downloader = {};

      $log.info('build the groups component..........');

      buildCallbacks(obj, user, GroupsPatientsBuilder, GroupSummObj, PatientsComponentBuilder);
      buildListViewer(obj, GroupObj);
      buildListViewerHeader(obj);      
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
      
      // var o = this;
      // o.selected = false;
      // o.deleteMode = false;

      // o.activated = function() {
      //   o.selected = true;
      // };

      // o.deactivated = function() {
      //   o.selected = false;
      // };

      // o.handleEventFtn = function(event, data) {
      //   $log.info('group handle event ftn for event: ' + event);
      //   o.deleteMode = !o.deleteMode;
      // };

      // o.clickedDelete = function() {
      //   $log.info('clicked delete');
      //   o.notifyParent('delete');
      // };

      // o.clickedView = function() {
      //   $log.info('clicked view');
      //   o.selected = !o.selected;
      //   o.notifyParent('view', o.selected);
      // };

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