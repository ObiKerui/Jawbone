(function() {
  'use strict';

  angular
    .module('config')
    .config(config);

  /** @ngInject */
  function config($httpProvider, $logProvider, $locationProvider) {
    // Enable log
    $logProvider.debugEnabled(true);
    //$locationProvider.html5Mode(true);
  }

})();
