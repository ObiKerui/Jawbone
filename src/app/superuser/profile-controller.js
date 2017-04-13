(function() {
  'use strict';

  angular
    .module('jawboneSUApp')
    .controller('ProfileCtrl', ProfileCtrl);
  
  /** @ngInject */
  function ProfileCtrl($log, $scope, JawboneService, ProfileComponentBuilder) {
    var vm = this;

    init();

    // initialise the controller
    function init() {
      JawboneService.getMainUser()
      .then(function(mainUserSumm) {
        $log.info('summary info : ' + JSON.stringify(mainUserSumm));
        return JawboneService.getUser(mainUserSumm._id);
      })
      .then(function(mainUserFull) {
        return ProfileComponentBuilder.build(mainUserFull, JawboneService.getUsers);
      })
      .then(function(profile) {
        // vm.sleeps = profile.sleeps;
        // vm.sleepschart = profile.sleepschart;
        // vm.trends = profile.trends;
        // vm.trendschart = profile.trendschart;
        vm.userprofile = profile.userprofile;
        // vm.recentUsers = profile.recentUsers;
        vm.groups = profile.groups;
        vm.patients = profile.patients;
      })
      .catch(function(errReason) {
        $log.info('error intialising profile ctrl: ' + JSON.stringify(errReason));
      });
    }


    // function init() {
    // 	var userbatch = JawboneService.makeBatch('users');
    // 	userbatch.get()
    // 	.then(function(response) {
    // 		$log.info('response: ' + JSON.stringify(response));
    //     vm.users = response;
    // 	});

    //   var groupbatch = JawboneService.makeBatch('groups');
    //   groupbatch.get()
    //   .then(function(response) {
    //     $log.info('response: ' + JSON.stringify(response));
    //     vm.groups = response;
    //   });
    // }

    // JawboneService.getMainUser()
    // .then(function(response) {
    // 	$log.info('got main user: ' + JSON.stringify(response));
    // 	vm.user = response;
    // 	init();
    // });

    $log.info('profile controller a ran');
  }	
})();