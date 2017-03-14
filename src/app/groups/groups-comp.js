(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('GroupsComponentBuilder', GroupsComponentBuilderFtn)
    .factory('GroupObj', GroupObjFtn);

  function buildCallbacks($log, obj, groupsdata) {

    obj.onSelect = function(ss) {
      $log.info('on select event fired for group element: ' + JSON.stringify(ss));
    };

    obj.onConfirm = function() {
    };

  }

  function buildListViewer($q, $log, obj, data, GroupObj, batchRetriever) {
    $log.info('groups data: ' + JSON.stringify(data));
    obj.listobj = {};
    obj.listobj.template = 'app/groups/_group-element-tpl.html';
    obj.listobj.heading = 'Groups';

    obj.listobj.getElementsObj = batchRetriever;
    $log.info('batch retrieve: ' + JSON.stringify(batchRetriever));
    $log.info('get elem obj: ' + JSON.stringify(obj.listobj.getElementsObj));
    obj.listobj.getElements = function() {
      var deferred = $q.defer();
      deferred.resolve(data || []);
      return deferred.promise;
    }

    obj.listobj.makeElement = function(objElement) {
      return new GroupObj(objElement)
    };    

  }

  function GroupsComponentBuilderFtn($q, $log, GroupObj, JawboneService) {
    var GroupsComponentBuilder = function(user) {
      var obj = this;

      obj.profile = JawboneService.extractData('profile', user);
      obj.name = obj.profile.first + ' ' + obj.profile.last;
      obj.groups = JawboneService.extractData('groups', user);
      obj.elems = obj.groups || [];

      var bobj = JawboneService.makeBatch('groups');
      $log.info('bobj: ' + JSON.stringify(bobj));

      buildCallbacks($log, obj, obj.elems);
      buildListViewer($q, $log, obj, obj.elems, GroupObj, bobj);

    };
    return GroupsComponentBuilder;
  }

  function GroupObjFtn($log) {
    var GroupObj = function(data) {
      this.data = data || {};
      $log.info('group data: ' + JSON.stringify(data));
      this.name = data.name || 'blank';
      this.description = data.description || 'blank';
      this.size = data.members.length || 0;

      var o = this;
      o.selected = false;

      o.activated = function() {
        o.selected = true;
      };

      o.deactivated = function() {
        o.selected = false;
      }

    };
    return GroupObj;
  }

})();