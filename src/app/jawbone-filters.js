(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .filter('minutesConverter', minutesConverterFtn)
    .filter('jbDate', jbDateFtn);

  function minutesConverterFtn($log) {
    return function(minutes, arg) {
      if(arg === 'hrs-mins') {
        // tag on minutes
        return parseInt(minutes / 60.0) + 'h ' + parseInt(minutes % 60) + 'm';
      }
      return minutes;
    }
  }

  /** @ngInject */
  function jbDateFtn($log) {
     return function(date, arg) {  
      var dateStr = date.toString();  
      if(dateStr.length !== 8) {
        return dateStr;
      }

      var year = dateStr.slice(0,4);
      var month = dateStr.slice(4,6);
      var day = dateStr.slice(6,8);
      return day + '/' + month + '/' + year;
    }     
  }
})();
