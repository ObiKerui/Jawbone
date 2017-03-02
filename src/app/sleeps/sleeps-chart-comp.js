(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('SleepsChartBuilderObj', SleepsChartBuilderObjFtn);

  function SleepsChartBuilderObjFtn($q, $log, SleepObj, JawboneService) {
    var SleepsChartBuilderObj = function(user) {

      var o = this;      
      o.profile = JawboneService.extractData('profile', user);
      o.name = o.profile.first + ' ' + o.profile.last;
      o.elems = JawboneService.extractData('sleeps', user);
      o.elements = [];

      // get the elements to construct the chart
      o.getElements = function(data) {      
        //$log.info('sleeps chart builder call to get elements: ' + JSON.stringify(o.elems));  
        var deferred = $q.defer();
        deferred.resolve(data || o.elems);
        return deferred.promise;
      };

      // make an element
      o.makeElement = function(rawElem) {
        return new SleepObj(rawElem);
      };

      // get the plot labels
      o.getPlotNames = function() {
        return [
          'title', 'sounds', 'awakenings', 'light'
        ];
      };

      o.title = 'Sleeps';

      o.doNewTest = function() {
        PlotGenerator.testit(o.elements);
      };

      function randomrange(min, max) {
        return Math.random() * (max - min) + min;
      }

      o.extractFromUser = function(user) {
        // fake some data for now
        var fakedata = o.elems.slice();
        angular.forEach(fakedata, function(val) {
          val.title = randomrange(50, 100);
        }, fakedata);

        return fakedata;
        //return JawboneService.extractData('trends', user);
      };

      o.extract = function(obj, fieldIdx) {
        var pnames = o.getPlotNames();      
        var fieldToGet = pnames[fieldIdx];
        //$log.info('obj is : ' + JSON.stringify(obj.title));
        //$log.info('get the field: ' + fieldToGet + ' result: ' + JSON.stringify(obj[pnames[fieldIdx]]));  
        return obj[pnames[fieldIdx]];
      };

    };
    return SleepsChartBuilderObj;
  }

})();