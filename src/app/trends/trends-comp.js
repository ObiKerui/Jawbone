(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('TrendsComponentBuilder', TrendsComponentBuilderFtn)
    .factory('TrendObj', TrendObjFtn);

  function buildCallbacks($log, obj, trendsdata) {
    obj.selectedTrend = null
    obj.onSelect = function(st) {
      obj.selectedTrend = st;
    };

    obj.onConfirm = function() {
      $log.info('trends: yah confirm it');
    };

  }

  function buildListViewer($q, $log, obj, trendsdata, TrendObj) {
    //$log.info('trends data: ' + JSON.stringify(trendsdata));
    obj.listobj = {};
    obj.listobj.template = 'app/trends/_trends-element-tpl.html';
    obj.listobj.headerbar = 'app/trends/_trends-header.html';
    obj.listobj.heading = 'Trends';

    obj.listobj.getElements = function() {
      var deferred = $q.defer();
      deferred.resolve(trendsdata.data || []);
      return deferred.promise;
      //return (trendsdata.data || []);
    }

    obj.listobj.makeElement = function(objElement) {
      return new TrendObj(objElement)
    };    

  }

  function TrendsComponentBuilderFtn($q, $log, TrendObj) {
    var TrendsComponentBuilder = function(trendsdata) {
      var obj = this;

      buildCallbacks($log, obj, trendsdata);
      buildListViewer($q, $log, obj, trendsdata, TrendObj);

    };
    return TrendsComponentBuilder;
  }    

  function TrendObjFtn($log) {
    var TrendObj = function(data) {
      this.data = data || [];
      this.date = data[0] || new Date();
      this.details = data[1] || {};
      this.weight = this.details.weight || null;
      this.height = this.details.height || null;
      this.bmr = this.details.bmr || 0;
      this.totalCalories = this.details.m_total_calories || 0;
      this.age = this.details.age || 0;
      var vm = this;
      vm.selected = false;

      this.activated = function() {
        vm.selected = true;
      };

      this.deactivated = function() {
        vm.selected = false;
      }
    };
    return TrendObj;
  }

})();