(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('ProfileComponentBuilder', ProfileComponentBuilderFtn)
    .factory('ProfileObj', ProfileObjFtn)

  function ProfileComponentBuilderFtn($q, $log, ProfileObj, JawboneService, GoalsComponentBuilder, ListViewerCtrlObj, UsersComponentBuilder) {

    var ProfileComponentBuilder = function() {
      var obj = this;
    };
    
    ProfileComponentBuilder.build = function(jbUser, users) {
      var deferred = $q.defer();

      //$log.info('build profile for jb user : ' + JSON.stringify(jbUser));
      var profile = new ProfileObj(jbUser, users);

      deferred.resolve(profile);
      return deferred.promise;
    };

    return ProfileComponentBuilder;
  }

  function ProfileObjFtn(
    $log, 
    SleepsComponentBuilder, 
    TrendsComponentBuilder, 
    TrendsChartBuilderObj, 
    SleepsChartBuilderObj, 
    GroupsComponentBuilder, 
    PatientsComponentBuilder, 
    UserComp, 
    RecentUsersObj) {
    
    var ProfileObj = function(jbUser, getUsers) {
      //$log.info('profile object jawbone user: ' + JSON.stringify(jbUser));
      //$log.info('users: ' + JSON.stringify(users));
      var obj = this;

      obj.user = jbUser || {};   
      obj.jbdata = obj.user.jbdata;   
      obj.sleeps =  new SleepsComponentBuilder(obj.user);
      obj.sleepschart = new SleepsChartBuilderObj(obj.user);
      obj.trends = new TrendsComponentBuilder(obj.user);
      obj.trendschart = new TrendsChartBuilderObj(obj.user);
      obj.userprofile = new UserComp(jbUser, getUsers);
      obj.recentUsers = new RecentUsersObj(jbUser, getUsers);
      obj.groups = new GroupsComponentBuilder(obj.user);
      obj.patients = new PatientsComponentBuilder(obj.user);
    };
    return ProfileObj;
  }
})();