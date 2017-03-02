(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .controller('ProfileCtrl', ProfileCtrl);
  
  /** @ngInject */
  //function ProfileCtrl($log, $scope, JawboneService, GoalsComponentBuilder, TrendsComponentBuilder, TrendsChartBuilderObj, SleepsComponentBuilder, UserModalObj, ListViewerCtrlObj, UsersComponentBuilder) {
  function ProfileCtrl($log, $scope, JawboneService, ProfileComponentBuilder) {
    var vm = this;
    vm.users = null;
    vm.sleeps = null;
    vm.trends = null;

    // var batch = JawboneService.makeBatch();
    // batch.get().then(function(response) {
    //   $log.info('got response: ' + JSON.stringify(response));
    // });

    // var next = batch.next();
    // var prev = batch.prev();
    // var orig = next.prev();

    init();

    // initialise the controller
    function init() {
      JawboneService.getMainUser()
      .then(function(mainUserSumm) {
        return JawboneService.getUser(mainUserSumm.jawboneId);
      })
      .then(function(mainUserFull) {
        return ProfileComponentBuilder.build(mainUserFull, JawboneService.getUsers);
      })
      .then(function(profile) {
        vm.sleeps = profile.sleeps;
        vm.sleepschart = profile.sleepschart;
        vm.trends = profile.trends;
        vm.trendschart = profile.trendschart;
        vm.userprofile = profile.userprofile;
        vm.recentUsers = profile.recentUsers;
      })
      .catch(function(errReason) {
        $log.info('error intialising profile ctrl: ' + JSON.stringify(errReason));
      });
    }

    function newUser(newUser) {
      $log.info('new user selected: ' + JSON.stringify(newUser));
    }

    JawboneService.setUserCallback(newUser);

    //   var jbdata = vm.data.jbdata;
    //   //vm.goalsObj = GoalsComponentBuilder.build(jbdata.profile[4]);
    //   vm.trendsObj = new TrendsComponentBuilder(jbdata.profile[3]);
    //   vm.trendsChartObj = new TrendsChartBuilderObj(jbdata.profile[3]);
    //   vm.sleepsObj =  new SleepsComponentBuilder(jbdata.activities[2].items);
    // }

  }	
})();