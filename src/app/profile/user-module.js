(function() {
  'use strict';

  angular
    .module('jawboneUApp')
    .config(config)
    .run(runBlock);

  /** @ngInject */
  function config($httpProvider, $logProvider, $locationProvider, $stateProvider, $urlRouterProvider) {
    console.log('ran config user app');
    // Enable log
    $logProvider.debugEnabled(true);
    //$locationProvider.html5Mode(true);

    $urlRouterProvider
    .when('/?code', 'profile.user');
    
    // this is required rather than the line above to prevent an
    // infinite digest loop
    $urlRouterProvider.otherwise(function($injector, $location) {
      var $state = $injector.get("$state");
      $state.go('profile.sleeps');
    });

    $stateProvider
      .state('profile', {
        abstract: true,
        url: '/?code',
        templateUrl: 'app/profile/profile-main.html',
        controller: 'ProfileCtrl',
        controllerAs: 'profile'
      })
      .state('profile.friends', {
        url: 'friends',
        templateUrl: 'app/profile/friends.html'
      })
      .state('profile.moves', {
        url: 'moves',
        templateUrl: 'app/profile/moves.html'
      })
      .state('profile.trends', {
        url: 'trends',
        templateUrl: 'app/profile/trends.html'
      })
      .state('profile.sleeps', {
        url: 'sleeps',
        templateUrl: 'app/profile/sleeps.html'
      });

  }

  function runBlock($log, JawboneData, JawboneService) {
   $log.info('we did execute the run block');
   $log.info('pre loaded data: ' + JSON.stringify(JawboneData));
   JawboneService.init(JawboneData);
  }

})();
