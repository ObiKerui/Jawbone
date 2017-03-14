(function() {
  'use strict';

  angular
    .module('jawboneSUApp')
    .config(config)
    .run(runBlock);

  /** @ngInject */
  function config($httpProvider, $logProvider, $locationProvider, $stateProvider, $urlRouterProvider) {
    console.log('ran config');
    // Enable log
    $logProvider.debugEnabled(true);
    //$locationProvider.html5Mode(true);

    $urlRouterProvider
    .when('/?code', 'profile.user');
    
    // this is required rather than the line above to prevent an
    // infinite digest loop
    $urlRouterProvider.otherwise(function($injector, $location) {
      var $state = $injector.get("$state");
      $state.go('profile.groups');
    });

    $stateProvider
      .state('profile', {
        abstract: true,
        url: '/?code',
        templateUrl: 'app/superuser/profile-main.html',
        controller: 'ProfileCtrl',
        controllerAs: 'profile'
      })
      .state('profile.patients', {
        url: 'patients',
        templateUrl: 'app/superuser/patients.html'
      })
      .state('profile.groups', {
        url: 'groups',
        templateUrl: 'app/superuser/groups.html'
      });

      // .state('profile.trends', {
      //   url: 'trends',
      //   templateUrl: 'app/superuser/trends.html'
      // })
      // .state('profile.sleeps', {
      //   url: 'sleeps',
      //   templateUrl: 'app/superuser/sleeps.html'
      // });

  }

  function runBlock($log, JawboneData, JawboneService) {
   $log.info('we did execute the run block');
   $log.info('pre loaded data: ' + JSON.stringify(JawboneData));
   JawboneService.init(JawboneData);
  }

})();
