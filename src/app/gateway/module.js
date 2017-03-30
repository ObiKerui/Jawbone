(function() {
  'use strict';

  angular
    .module('jawboneGatewayApp')
    .config(config)
    .run(runBlock);

  /** @ngInject */
  function config($httpProvider, $logProvider, $locationProvider, $stateProvider, $urlRouterProvider) {
    console.log('ran gateway config');
    // Enable log
    $logProvider.debugEnabled(true);
    //$locationProvider.html5Mode(true);

    $urlRouterProvider
    .when('/?code', 'profile.user');
    
    // this is required rather than the line above to prevent an
    // infinite digest loop
    $urlRouterProvider.otherwise(function($injector, $location) {
      var $state = $injector.get("$state");
      $state.go('gateway.home');
    });

    $stateProvider
      .state('gateway', {
        abstract: true,
        templateUrl: 'app/gateway/gateway-main.html',
        controller: 'GatewayCtrl',
        controllerAs: 'gateway'
      })
      .state('gateway.home', {
        url: 'home',
        templateUrl: 'app/gateway/home.html'
      })
      .state('gateway.about', {
        url: 'about',
        templateUrl: 'app/gateway/about.html'
      });
  }

  function runBlock($log, JawboneService) {
   $log.info('we did execute the run block of gateway app');
   //JawboneService.init(JawboneData);
  }

})();
