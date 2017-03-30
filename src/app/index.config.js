(function() {
  'use strict';

  angular
    .module('config')
    .config(config);

  /** @ngInject */
  function config($httpProvider, $logProvider, $locationProvider) {
    // Enable log
    
    // // enable CORS for Oauth
    // $httpProvider.defaults.useXDomain = true;
    // delete $httpProvider.defaults.headers.common['X-Requested-With'];
    // $httpProvider.defaults.withCredentials = true;

    console.info('set up Cors access');

    $logProvider.debugEnabled(true);
    //$locationProvider.html5Mode(true);
  }

})();
