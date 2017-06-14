(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .filter('minutesConverter', minutesConverterFtn)
    .filter('secondsToHrsMins', secondsToHrsMinsFtn)
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

  function secondsToHrsMinsFtn($log) {
    return function(seconds, arg) {
      var hours = Math.floor(parseInt(seconds) / 3600);
      var totalSeconds = parseInt(seconds) % 3600;
      var minutes = Math.floor(totalSeconds / 60);
      var seconds = totalSeconds % 60;      

      var hrs = (hours > 0 ? hours + 'h ' : '');
      var hrsMins = (hrs + minutes + 'm');
      return hrsMins;
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
