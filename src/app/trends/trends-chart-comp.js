(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('TrendsChartBuilderObj', TrendsChartBuilderObjFtn);

  function TrendsChartBuilderObjFtn($q, $log, TrendObj, JawboneService) {
    var TrendsChartBuilderObj = function(user) {

      var o = this;      
      o.profile = JawboneService.extractData('profile', user);
      o.name = o.profile.first + ' ' + o.profile.last;
      //o.trends = JawboneService.extractData('trends', user);
      //o.earliest = o.trends.earliest || new Date();
      //o.elems = o.trends.data || [];
      //o.elements = [];

      // get the elements to construct the chart
      o.getElementsObj = JawboneService.makeBatch('trends');
      // o.getElements = function(data) {        
      //   var deferred = $q.defer();
      //   deferred.resolve(data || o.elems);
      //   return deferred.promise;
      // };

      o.makePlotParams = function(profile) {
        profile = profile || o.profile;
        return {
          range : [new Date(2016, 11, 1), new Date(2017, 2, 20)],
          plotName : profile.first          
        }
      };

      o.preprocessElements = function(arr) {
        return arr;
      };

      // make an element
      o.makeElement = function(rawElem) {
        return new TrendObj(rawElem);
      };

      // get the plot labels
      o.getPlotNames = function() {
        return [
          'weight', 'height', 'bmr', 'totalCalories'
        ];
      };

      o.title = 'Trends';

      o.doNewTest = function() {
        PlotGenerator.testit(o.elements);
      };

      function randomrange(min, max) {
        return Math.random() * (max - min) + min;
      }

      o.extractFromUser = function(user) {
        
        var batch = JawboneService.makeBatch('trends', user._id);
        return batch.get()
        .then(function(response) {
          $log.info('return the trends response: ' + JSON.stringify(response));
          return response;
        });

        // fake some data for now


        // var fakedata = o.elems.slice();

        // angular.forEach(fakedata, function(val) {
        //   val[1].weight = randomrange(50, 100);
        // }, fakedata);

        // return fakedata;
        //return JawboneService.extractData('trends', user);
      };

      o.extract = function(obj, fieldIdx) {
        var pnames = o.getPlotNames();        
        return obj[pnames[fieldIdx]];
      };

    };
    return TrendsChartBuilderObj;
  }

})();