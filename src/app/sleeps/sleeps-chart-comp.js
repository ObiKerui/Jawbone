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
      // get the elements to construct the chart
      o.getElementsObj = JawboneService.makeBatch('sleeps');

      // o.plotParams = {
      //   range : [new Date(2016, 11, 1), new Date(2017, 2, 20)],
      //   plotName : o.profile.first
      // };

      // make an element
      o.makeElement = function(rawElem) {
        return new SleepObj(rawElem);
      };

      o.makePlotParams = function(profile) {
        profile = profile || o.profile;
        return {
          range : [new Date(2016, 11, 1), new Date(2017, 2, 20)],
          plotName : profile.first          
        }
      };

      o.preprocessElements = function(arr) {
        // reverse the ordering in array - sleeps buts the 
        // newest first
        return arr.reverse();
      }

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
        return parseInt(Math.random() * (max - min) + min);
      }

      function randomize(data) {
        $log.info('data is: ' + JSON.stringify(data));
        var randomizedData = data.data.slice();
        angular.forEach(randomizedData, function(val) {
          var hr = randomrange(1, 3);
          var min = randomrange(1, 60);
          val.title = hr + 'h ' + min + 'm';
        }, randomizedData);

        data.data = randomizedData;
        return data;
      }

      o.extractFromUser = function(user) {

        // get the sleeps for this user
        var batch = JawboneService.makeBatch('sleeps', user._id);
        return batch.get()
        .then(function(response) {
          return randomize(response);
        });
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