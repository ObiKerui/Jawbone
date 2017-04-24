(function() {
  'use strict';

  angular.module('jbtemplates', [])
  angular.module('config', [])
  angular.module('constants', [])
  angular.module('mainRoute', [
  	'ui.router'
  ])
  angular.module('run', [])
  angular.module('jawboneApp', [
  	'config',
  	'constants',
  	'mainRoute',
  	'run',
    'ngAnimate',
  	'ngSanitize',
    'ngFileSaver',
    'ui.bootstrap',
    'ui.router',
    'googlechart',
    'jbtemplates'
  ])
  angular.module('jawboneGatewayApp', [
    'jawboneApp',
    'PreloadedData'
  ])
  angular.module('jawboneUApp', [
    'jawboneApp',
    'PreloadedData'
  ])
  angular.module('jawboneSUApp', [
    'jawboneApp',
    'PreloadedData'
  ]);

  // angular.module('jawboneSUApp', [
    
  // ]);

})();
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('UsersComponentBuilder', UsersComponentBuilderFtn)
    .factory('UserSelectorObj', UserSelectorObjFtn)
    .factory('UserComp', UserCompFtn)
    .factory('UserObj', UserObjFtn)
    .controller('UserCtrl', UserCtrl)
    .directive('user', userFtn);

  function buildCallbacks($log, obj, callbacks) {
    obj.selectedUser = null
    obj.onSelect = function(su) {
      obj.selectedUser = su;
      $log.info('selected de user: ' + JSON.stringify(obj.selectedUser));
      callbacks.onSelect(obj.selectedUser);
    };

    obj.onConfirm = function() {
      $log.info('user yah confirm it : ' + JSON.stringify(obj.selectedUser));
      callbacks.onConfirm();
    };
  }

  function buildListViewer($log, obj, UserObj, batchRetriever) {
    //$log.info('profile data: ' + JSON.stringify());
    obj.listobj = {};
    obj.listobj.template = 'app/user/_user-element-tpl.html';
    obj.listobj.heading = 'Users';
    obj.listobj.getElementsObj = batchRetriever;

    // obj.listobj.getElements = function() {
    //   return getUsers().then(function(result) {
    //     $log.info('return dat result: ' + JSON.stringify(result));
    //     return result;
    //   }, function(err) {
    //     return [];
    //   });
    // }

    obj.listobj.makeElement = function(objElement) {
      return new UserObj(objElement)
    };    
  }

  function UsersComponentBuilderFtn($log, UserObj, JawboneService) {
    var UsersComponentBuilder = function(callbacks) {

      //$log.info('incoming data: ' + JSON.stringify(usersdata));
      var obj = this;
      var bobj = JawboneService.makeBatch('users');

      // build the callbacks
      buildCallbacks($log, obj, callbacks);
      buildListViewer($log, obj, UserObj, bobj);

    };
    return UsersComponentBuilder;
  }

  function UserSelectorObjFtn($log, UsersComponentBuilder) {
    var UserSelectorObj = function(onConfirm) {
      var obj = this;
      obj.tpl = 'app/user/_user-select-modal-tpl.html';
      obj.selection = null;

      obj.onSelect = function(arg) {
        obj.selection = arg;
        //$log.info('callbacks: on select function: ' + JSON.stringify(obj.selection));
      };

      obj.onConfirm = function() {
        if(onConfirm) {
          onConfirm(obj.selection);
        }
      };

      obj.callbacks = {
        onSelect : obj.onSelect,
        onConfirm : obj.onConfirm
      };

      obj.userlist = new UsersComponentBuilder(obj.callbacks);
    };
    return UserSelectorObj;
  }

  function UserCompFtn($log, UserObj, ModalService, UserSelectorObj, JawboneService) {
    var UserComp = function(userdata) {

      $log.info('data to user control: ' + JSON.stringify(userdata));

      var obj = this;
      obj.profiledata = userdata || {};
      obj.profile = new UserObj(obj.profiledata);
      
      obj.clickFtn = userdata.clickFtn || function() {        
        // create modal
        ModalService.onClick(new UserSelectorObj(function(obj) {
          $log.info('this called to confirm selection: ' + JSON.stringify(obj));
          JawboneService.setUser(obj);
        }))
        .then(function(result) {
          $log.info('result of modal: ' + JSON.stringify(result));
        });
      };

      obj.onClick = function() {
        obj.clickFtn();
      };
    }
    return UserComp;
  }

  function UserObjFtn($log, JawboneService) {
    var UserObj = function(objElement) {
      //$log.info('obj supplied to UserObj: ' + JSON.stringify(objElement));
      //$log.info('profile userobject user: ' + JSON.stringify(objElement.profile));
      var o = this;
      o.data = objElement || {};
      o.jawboneId = objElement.jawboneId || 'blank';
      o.obj = objElement.profile || {};
      o.first = o.obj.first || 'blank';
      o.last = o.obj.last || 'blank';
      o.weight = o.obj.weight || 'blank weight';
      o.gender = o.obj.gender || 'no gender';
      o.height = o.obj.height || 'no height';
      o.stats = o.obj.stats || {};
      o.image = JawboneService.extractData('userImage', objElement);

      o.selected = false;

      o.activated = function() {
        o.selected = true;
      };

      o.deactivated = function() {
        o.selected = false;
      }
      
    };
    return UserObj;
  }

  /** @ngInject */
  function UserCtrl($q, $log, $http, $window, $scope) {
    var vm = this;

    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      if(newval) {
        vm.uo = vm.obj;
      }
    });
  }	

  function userFtn($log) {
    var directive = {
      restrict: 'E',
        scope: {},
        controller: 'UserCtrl',
        controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/user/_user-tpl.html'
    };
    return directive;   
  }
})();
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('TrendsComponentBuilder', TrendsComponentBuilderFtn)
    .factory('TrendObj', TrendObjFtn);

  function buildCallbacks($log, obj, trendsdata) {
    obj.selectedTrend = null
    obj.onSelect = function(st) {
      obj.selectedTrend = st;
    };

    obj.onConfirm = function() {
      $log.info('trends: yah confirm it');
    };

  }

  function buildListViewer($q, $log, obj, trendsdata, TrendObj, batchRetriever) {
    //$log.info('trends data: ' + JSON.stringify(trendsdata));
    obj.listobj = {};
    obj.listobj.template = 'app/trends/_trends-element-tpl.html';
    obj.listobj.headerbar = 'app/trends/_trends-header.html';
    obj.listobj.heading = 'Trends';

    obj.listobj.getElementsObj = batchRetriever;
    
    obj.listobj.getElements = function() {
      var deferred = $q.defer();
      deferred.resolve(trendsdata.data || []);
      return deferred.promise;
      //return (trendsdata.data || []);
    };

    obj.listobj.makeElement = function(objElement) {
      return new TrendObj(objElement)
    };    

  }

  function TrendsComponentBuilderFtn($q, $log, TrendObj, JawboneService) {
    var TrendsComponentBuilder = function(user) {
      var obj = this;

      obj.profile = JawboneService.extractData('profile', user);
      obj.name = obj.profile.first + ' ' + obj.profile.last;
      obj.trends = JawboneService.extractData('trends', user);
      obj.earliest = obj.trends.earliest || new Date();
      obj.elems = obj.trends.data || [];
      var bobj = JawboneService.makeBatch('trends');

      buildCallbacks($log, obj, obj.elems);
      buildListViewer($q, $log, obj, obj.elems, TrendObj, bobj);

    };
    return TrendsComponentBuilder;
  }    

  function TrendObjFtn($log) {
    var TrendObj = function(data) {
      this.data = data || [];
      this.date = data[0] || new Date();
      this.details = data[1] || {};
      this.weight = this.details.weight || null;
      this.height = this.details.height || null;
      this.bmr = this.details.bmr || 0;
      this.totalCalories = this.details.m_total_calories || 0;
      this.age = this.details.age || 0;
      var vm = this;
      vm.selected = false;

      this.activated = function() {
        vm.selected = true;
      };

      this.deactivated = function() {
        vm.selected = false;
      }
    };
    return TrendObj;
  }

})();
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('TrendsChartBuilderObj', TrendsChartBuilderObjFtn);

  function TrendsChartBuilderObjFtn($q, $log, TrendObj, JawboneService) {
    var TrendsChartBuilderObj = function(user) {

      var o = this;      
      o.profile = JawboneService.extractData('profile', user);
      o.name = o.profile.first + ' ' + o.profile.last;
      //o.trends = JawboneService.extractData('trends', user);
      //o.earliest = o.trends.earliest || new Date();
      //o.elems = o.trends.data || [];
      //o.elements = [];

      // get the elements to construct the chart
      o.getElementsObj = JawboneService.makeBatch('trends');
      // o.getElements = function(data) {        
      //   var deferred = $q.defer();
      //   deferred.resolve(data || o.elems);
      //   return deferred.promise;
      // };

      o.makePlotParams = function(profile) {
        profile = profile || o.profile;
        return {
          range : [new Date(2016, 11, 1), new Date(2017, 2, 20)],
          plotName : profile.first          
        }
      };

      o.preprocessElements = function(arr) {
        return arr;
      };

      // make an element
      o.makeElement = function(rawElem) {
        return new TrendObj(rawElem);
      };

      // get the plot labels
      o.getPlotNames = function() {
        return [
          'weight', 'height', 'bmr', 'totalCalories'
        ];
      };

      o.title = 'Trends';

      o.doNewTest = function() {
        PlotGenerator.testit(o.elements);
      };

      function randomrange(min, max) {
        return Math.random() * (max - min) + min;
      }

      o.extractFromUser = function(user) {
        
        var batch = JawboneService.makeBatch('trends', user._id);
        return batch.get()
        .then(function(response) {
          $log.info('return the trends response: ' + JSON.stringify(response));
          return response;
        });

        // fake some data for now


        // var fakedata = o.elems.slice();

        // angular.forEach(fakedata, function(val) {
        //   val[1].weight = randomrange(50, 100);
        // }, fakedata);

        // return fakedata;
        //return JawboneService.extractData('trends', user);
      };

      o.extract = function(obj, fieldIdx) {
        var pnames = o.getPlotNames();        
        return obj[pnames[fieldIdx]];
      };

    };
    return TrendsChartBuilderObj;
  }

})();
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

(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('SleepsComponentBuilder', SleepsComponentBuilderFtn)
    .factory('SleepObj', SleepObjFtn);

  function buildCallbacks($log, obj, sleepsdata) {
    obj.selectedSleep = null
    obj.onSelect = function(ss) {
      obj.selectedSleep = ss;
    };

    obj.onConfirm = function() {
      $log.info('sleep: yah confirm it');
    };

  }

  function buildListViewer($q, $log, obj, sleepsdata, SleepObj, batchRetriever) {
    $log.info('sleeps data: ' + JSON.stringify(sleepsdata));
    obj.listobj = {};
    obj.listobj.template = 'app/sleeps/_sleeps-element-tpl.html';
    obj.listobj.headerbar = 'app/sleeps/_sleeps-header-tpl.html';
    obj.listobj.heading = 'Sleeps';
    obj.listobj.loaderMessage = 'Loading sleep data...';

    obj.listobj.getElementsObj = batchRetriever;
    obj.listobj.getElements = function() {
      var deferred = $q.defer();
      deferred.resolve(sleepsdata || []);
      return deferred.promise;
    }

    obj.listobj.makeElement = function(objElement) {
      return new SleepObj(objElement)
    };    

  }

  function SleepsComponentBuilderFtn($q, $log, SleepObj, JawboneService) {
    var SleepsComponentBuilder = function(user) {
      var obj = this;

      obj.profile = JawboneService.extractData('profile', user);
      obj.name = obj.profile.first + ' ' + obj.profile.last;
      obj.elems = JawboneService.extractData('sleeps', user);
      var bobj = JawboneService.makeBatch(JawboneService.makeEndpoint('sleeps'));

      buildCallbacks($log, obj, obj.elems);
      buildListViewer($q, $log, obj, obj.elems, SleepObj, bobj);

    };
    return SleepsComponentBuilder;
  }

  function convertToMinutes(str, $log) {
    str = str.toString();

    var arr = str.match(/\d+/g);
    if(arr.length === 2) { // hours and minutes
      return (parseInt(arr[0]) * 60) + (parseInt(arr[1]));
    } else if(arr.length === 1 ) { // only minutes
      return (parseInt(arr[0]));
    } else { 
      return str;
    }
  }

  function SleepObjFtn($log) {
    var SleepObj = function(data) {
      this.data = data || {};
      $log.info('sleep data: ' + JSON.stringify(data));
      this.date = data.date || new Date();
      this.title = convertToMinutes(data.title, $log);
      this.details = data.details || {};
      this.sounds = this.details.sound || 'blank';
      this.awakenings = this.details.awakenings || 0;
      this.light = this.details.light || 0;
      this.sleep_time = this.details.sleep_time || 0;
      this.awake_time = this.details.awake_time || 0;
      this.awake = this.details.awake || 0;
      this.rem = this.details.rem || 0;
      this.duration = this.details.duration || 0;
      this.image = 'https://jawbone.com' + this.data.snapshot_image;

      var o = this;
      o.selected = false;

      o.activated = function() {
        o.selected = true;
      };

      o.deactivated = function() {
        o.selected = false;
      }

    };
    return SleepObj;
  }

})();
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('SleepsChartDownloaderBuilder', SleepsChartDownloaderBuilderFtn)
    .factory('SleepsChartDownloaderObj', SleepsChartDownloaderObjFtn);

  function SleepsChartDownloaderBuilderFtn($log) {
  	var SleepsChartDownloaderBuilder = function(arg, getSleepData) {
  		$log.info('ran sleeps chart downloader with arg: ' + JSON.stringify(arg));
      var obj = this;
      obj.tpl = 'app/sleeps/_sleeps-chart-download-tpl.html';
      obj.downloader = {};
      obj.downloader.getData = getSleepData || function() {
        $log.info('implement a getSleepData ftn in SleepsChartDownloaderBuilder');
        return [];
      };
      obj.downloader.content = obj.downloader.getData();
  	};
  	return SleepsChartDownloaderBuilder;
  }

  function SleepsChartDownloaderObjFtn($log) {
  	var SleepsChartDownloaderObj = function(obj) {
		$log.info('ran sleeps chart downloader obj with obj: ' + JSON.stringify(obj));
  	};
  	return SleepsChartDownloaderObj;
  }

})();


(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('SleepsChartBuilderObj', SleepsChartBuilderObjFtn);

  function SleepsChartBuilderObjFtn($q, $log, SleepObj, JawboneService) {
    var SleepsChartBuilderObj = function(user) {

      var o = this;      
      o.profile = JawboneService.extractData('profile', user);
      o.name = o.profile.first + ' ' + o.profile.last;
      // get the elements to construct the chart
      o.getElementsObj = JawboneService.makeBatch(JawboneService.makeEndpoint('sleeps'));

      // o.plotParams = {
      //   range : [new Date(2016, 11, 1), new Date(2017, 2, 20)],
      //   plotName : o.profile.first
      // };

      o.getGraphDataCB = function() {
        $log.info('implement this \'getGraphDataCB\' callback');
      };

      // make an element
      o.makeElement = function(rawElem) {
        return new SleepObj(rawElem);
      };

      o.makePlotParams = function(profile) {
        profile = profile || o.profile;
        return {
          range : [new Date(2016, 11, 1), new Date(2017, 2, 20)],
          plotName : profile.first          
        }
      };

      o.preprocessElements = function(arr) {
        // reverse the ordering in array - sleeps buts the 
        // newest first
        return arr.reverse();
      }

      // get the plot labels
      o.getPlotNames = function() {
        return [
          'title', 'sounds', 'awakenings', 'light'
        ];
      };

      o.title = 'Sleeps';

      o.doNewTest = function() {
        PlotGenerator.testit(o.elements);
      };

      function randomrange(min, max) {
        return parseInt(Math.random() * (max - min) + min);
      }

      function randomize(data) {
        $log.info('data is: ' + JSON.stringify(data));
        var randomizedData = data.data.slice();
        angular.forEach(randomizedData, function(val) {
          var hr = randomrange(1, 3);
          var min = randomrange(1, 60);
          val.title = hr + 'h ' + min + 'm';
        }, randomizedData);

        data.data = randomizedData;
        return data;
      }

      o.extractFromUser = function(user) {

        // get the sleeps for this user
        var batch = JawboneService.makeBatch('sleeps', user._id);
        return batch.get()
        .then(function(response) {
          return randomize(response);
        });
      };

      o.extract = function(obj, fieldIdx) {
        var pnames = o.getPlotNames();      
        var fieldToGet = pnames[fieldIdx];
        //$log.info('obj is : ' + JSON.stringify(obj.title));
        //$log.info('get the field: ' + fieldToGet + ' result: ' + JSON.stringify(obj[pnames[fieldIdx]]));  
        return obj[pnames[fieldIdx]];
      };

    };
    return SleepsChartBuilderObj;
  }

})();
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('SideMenuObj', SideMenuObjFtn)
    .controller('SideMenuCtrl', SideMenuCtrl)
    .directive('sideMenu', sideMenuFtn);

  function SideMenuObjFtn($log) {
    var SideMenuObj = function(data) {
      this.data = data || {};
    };
    return SideMenuObj;
  }

  /** @ngInject */
  function SideMenuCtrl($log, $scope, SideMenuObj) {
    var vm = this;  

    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      if(newval) {
        vm.smo = new SideMenuObj(vm.obj);
      }
    }); 
  }	

  function sideMenuFtn($log) {
    var directive = {
      restrict: 'E',
        scope: {},
        controller: 'SideMenuCtrl',
        controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/side-menu/_side-menu-tpl.html'
    };
    return directive;   
  }
})();
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('RecentUsersObj', RecentUsersObjFtn);

  function RecentUsersObjFtn($q, $log, JawboneService, UserObj) {
    var RecentUsersObj = function(jbdata, getUsers) {

      var obj = this;
      obj.data = jbdata || {};
      obj.recentUsers = [];

      function newUser(newUser) {
        //$log.info('recent-user obj new user selected: ' + JSON.stringify(newUser.data));
        obj.recentUsers.push(newUser.data);
        //obj.listobj.onPopulate(); // why is this not working atm?
      }

      JawboneService.setUserCallback(newUser);

      obj.listobj = obj.listobj || {};
      obj.listobj.heading = 'Recent Users';
      obj.listobj.template = obj.listobj.template || 'app/user/_user-element-tpl.html';
      obj.listobj.chunksize = obj.listobj.chunksize || 1;

      obj.listobj.getElementsObj = JawboneService.makeBatch('recentUsers');
      // obj.listobj.getElements = function() {
      //   var deferred = $q.defer();
      //   deferred.resolve(obj.recentUsers);
      //   return deferred.promise;
      // };

      obj.listobj.makeElement = function(value) {
        //$log.info('user to-a make : ' + JSON.stringify(value));
        return new UserObj(value);
      };

    };
    return RecentUsersObj;
  }

  /** @ngInject */
  // function RecentUsersCtrl($log, $scope, RecentUsersObj) {
  //   var vm = this;  

  //   $scope.$watch(function(scope) {
  //     return (vm.obj);
  //   }, function(newval, oldval) {
  //     if(newval) {
  //       vm.smo = new RecentUsersObj(vm.obj);
  //     }
  //   }); 
  // }	

  // function recentUsersFtn($log) {
  //   var directive = {
  //     restrict: 'E',
  //       scope: {},
  //       controller: 'RecentUsersCtrl',
  //       controllerAs: 'ctrl',
  //     bindToController: {
  //       obj : '='
  //     },
  //     templateUrl: 'app/recent-users/_recent-users-tpl.html'
  //   };
  //   return directive;   
  // }
})();
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

(function() {
  'use strict';

  angular
    .module('jawboneUApp')
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
        return JawboneService.getUser(mainUserSumm._id);
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
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('PatientSummObj', PatientSummObjFtn)
    .controller('PatientSummCtrl', PatientSummCtrlFtn)
    .directive('patientSummary', patientSummaryFtn);

  function PatientSummObjFtn($log) {
    var PatientSummObj = function(user) {
      $log.info('patient summary obj : ' + JSON.stringify(user));

      var obj = this;
      obj.user = user || {};
      // TODO temp assign here but pass into this object
      obj.actionBar = 'app/patient/_patient-summary-action-bar-tpl.html';
    };

    return PatientSummObj;
  }

  function PatientSummCtrlFtn($scope, $log, PatientSummObj) {
    var vm = this;
    vm.pso = null;
  
    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      if(newval) {
        $log.info('assign patient summ obj : ' + JSON.stringify(newval));
        vm.pso = vm.obj;
      }
    });
  }

  function patientSummaryFtn($log) {
    var directive = {
      restrict: 'E',
        scope: {},
        controller: 'PatientSummCtrl',
        controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/patient/_patient-summary-tpl.html'
    };
    return directive;   
  }


})();
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('PatientsComponentBuilder', PatientsComponentBuilderFtn)
    .factory('PatientObj', PatientObjFtn)
    .filter('defaultPatient', defaultPatientFtn)
    .controller('PatientCtrl', PatientCtrlFtn)
    .directive('patientMgr', patientMgrFtn);

  var log = null;
  var jbservice = null;

  function buildPatientSummary(obj, user, PatientSummObj) {
    obj.patientSummary = new PatientSummObj(user);
    obj.patientSummary.parent = {
      switchView: function() {
        obj.mode = 'view';
      },
      showPatientNotes: function() {
        log.info('implement show patient notes');
      },
      downloadToCSV: function() {
        log.info('implement show patient notes');
      }
    };
  }

  function buildPatientSleeps(obj, user, SleepObj) {
    obj.sleepsViewer.listobj = {};
    obj.sleepsViewer.listobj.template = 'app/sleeps/_sleeps-element-tpl.html';
    obj.sleepsViewer.listobj.headerbar = 'app/sleeps/_sleeps-header-tpl.html';    
    obj.sleepsViewer.listobj.heading = 'Sleeps';
    obj.sleepsViewer.listobj.loaderMessage = 'Loading sleep data...';

    obj.sleepsViewer.listobj.getElementsObj = jbservice.makeBatch(jbservice.makeEndpoint('sleeps', user._id));

    obj.sleepsViewer.listobj.makeElement = function(objElement) {
      return new SleepObj(objElement);
    };        
  }

  function buildPatientGraph(obj, user, SleepsChartBuilderObj) {
    obj.sleepsChart = new SleepsChartBuilderObj(user);
  }

  function buildPatientDownloader(obj, SleepsChartDownloaderBuilder, ModalService) {
        
    obj.patientSummary.parent.downloadToCSV = function() {
      //log.info('call to show download modal');
      ModalService.onClick(new SleepsChartDownloaderBuilder(obj, function() {
        return obj.sleepsChart.getGraphDataCB();
      }))
      .then(function(result) {});
    };
  }

  function buildPatientNotes(obj, ModalService) {
    obj.patientSummary.parent.showPatientNotes = function() {
      //log.info('call show patient notes modal...');
      ModalService.onClick({
        tpl : 'app/patient/_patient-notes-viewer-tpl.html'
      })
      .then(function(result) {});
    };
  }

  function buildCallbacks(obj, SleepObj, SleepsChartBuilderObj, SleepsChartDownloaderBuilder, PatientSummObj, ModalService) {
  
    obj.mode = 'view';

    obj.patientViewer.onSelect = function(ss) {
      //log.info('on select event fired for patients element: ' + JSON.stringify(ss));

      buildPatientSummary(obj, ss.data.user, PatientSummObj);
      buildPatientSleeps(obj, ss.data.user, SleepObj);
      buildPatientGraph(obj, ss.data.user, SleepsChartBuilderObj);
      buildPatientDownloader(obj, SleepsChartDownloaderBuilder, ModalService);
      buildPatientNotes(obj, ModalService);
      obj.mode = 'edit';
    };
  }

  function buildListViewer(obj, group, PatientObj) {
    obj.patientViewer.listobj = {};
    obj.patientViewer.listobj.template = 'app/patient/_patient-element-tpl.html';
    obj.patientViewer.listobj.heading = 'Patients';
    obj.patientViewer.listobj.loaderMessage = 'Loading Patients...';

    var groupId = group._id || null;
    obj.patientViewer.listobj.getElementsObj = jbservice.makeBatch(jbservice.makeFieldGetter('groups', group._id, 'members'));

    obj.patientViewer.listobj.makeElement = function(objElement) {
      return new PatientObj(objElement)
    };    
  }

  function defaultPatientFtn($log) {
    return function(img) {  
      if(!img) {
        return 'assets/users.png';
      }
      return img;
    }     
  }

  function PatientsComponentBuilderFtn($q, $log, PatientObj, SleepObj, JawboneService, SleepsChartBuilderObj, SleepsChartDownloaderBuilder, PatientSummObj, ModalService) {
    var PatientsComponentBuilder = function(user, userGroup) {

      // assign some scoped variables rather than pass these as args
      log = $log;
      jbservice = JawboneService;

      log.info('user group: ' + JSON.stringify(userGroup));

      var obj = this;

      userGroup = userGroup || {};
      obj.profile = JawboneService.extractData('profile', user);
      obj.name = obj.profile.first + ' ' + obj.profile.last;
      obj.patients = JawboneService.extractData('patients', user);
      obj.mode = 'view';
      
      obj.patientSummary = {};
      obj.patientViewer = {};
      obj.sleepsViewer = {};
      obj.sleepsChart = {};
      obj.downloader = {};

      // to implement
      obj.noteViewer = {};

      buildCallbacks(obj, SleepObj, SleepsChartBuilderObj, SleepsChartDownloaderBuilder, PatientSummObj, ModalService);
      buildListViewer(obj, userGroup, PatientObj);

    };
    return PatientsComponentBuilder;
  }

  function PatientObjFtn($log, ListElementAPIObj) {
    var PatientObj = function(objElement) {

      //$log.info('obj element: ' + JSON.stringify(objElement));

      var o = this;
      o.data = objElement || {};
      o.jawboneId = objElement.jawboneId || 'blank';
      o.obj = objElement.user.profile || {};
      o.first = o.obj.first || 'blank';
      o.last = o.obj.last || 'blank';
      o.weight = o.obj.weight || 'blank weight';
      o.gender = o.obj.gender || 'no gender';
      o.height = o.obj.height || 'no height';
      o.joinDate = objElement.joinDate || null;

      this.api = new ListElementAPIObj(this);
    };
    return PatientObj;
  }

  function PatientCtrlFtn($log) {
    var vm = this;
  }

  function patientMgrFtn($log) {
    var directive = {
      restrict: 'E',
        scope: {},
        controller: 'PatientCtrl',
        controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/patient/_patient-mgr-tpl.html'
    };
    return directive;   
  }


})();

(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .filter('notesViewerfilter', NotesViewerfilterFtn)  
    .factory('NoteObj', NoteObjFtn)  
    .factory('NotesViewerObj', NotesViewerObjFtn)
    .controller('NotesViewerCtrl', NotesViewerCtrlFtn)
    .directive('notesViewer', NotesViewerDirFtn);

  function NotesViewerfilterFtn() {
    return function(arg) {  
      if(arg) {
        // do something with arg
        return arg;
      }
      return arg;
    }     
  }

  function NoteObjFtn($log) {
    var NoteObj = function(notedata, callbacks) {
      $log.info('the note data: ' + JSON.stringify(notedata));
      var obj = this;
      obj._id = notedata._id;
      obj.text = notedata.text || 'blank';
      obj.owner = notedata.owner || null;
      obj.creationDate = notedata.creationDate || null;
      obj.textLimit = 50;
      obj.selected = false;

      obj.cbs = callbacks || {};      
      obj.delete = function() {
        $log.info('delete me: ' + JSON.stringify(obj));
        obj.cbs.onDelete(obj);
      };

      obj.clicked = function() {
        //$log.info('note obj was clicked...not necessarily selected!');
      };

      obj.onSelected = function() {
        obj.selected = true;
      };

      obj.onDeselected = function() {
        obj.selected = false;
      };

    };
    return NoteObj;
  };

  function NotesViewerObjFtn(NoteObj, JawboneService, $log, CommonModals) {
    var NotesViewerObj = function(arg) {
      var obj = this;
      obj.mode = 'view';
      obj.note = {
          text: null,
          owner: null,
          date : null
      };
      obj.tempnote = {
          text: null,
          owner: null,
          date : null
      };

      obj.callbacks = {
        onDelete : function(elem) {
          CommonModals.confirm('delete note, are you sure?')
          .then(function(confirmed) {
            if(confirmed) {
              JawboneService.deleteNote(elem)
              .then(function(response) {
                createlist();
              });
            }
          });
        },
        onSelect : function(elem) {
          //$log.info('set to edit mode : ' + JSON.stringify(elem));
          obj.notes.listobj.mode = 'edit';
          obj.notes.listobj.tempnote = angular.copy(elem);
          // $log.info('on select callback mode : ' + JSON.stringify(obj.mode));
          // $log.info('on select callback temp : ' + JSON.stringify(obj.notes.listobj.tempnote));          
          // $log.info('on select callback elem : ' + JSON.stringify(elem));
        },        
        onDeselect : function(elem) {
          //$log.info('on deselect called with elem: ' + JSON.stringify(elem));
          obj.notes.listobj.tempnote = null;
          obj.notes.listobj.mode = 'view';
        },
        onEdit : function(elem) {
          // JawboneService.updateNote(elem) 
          // .then(function(response) {
          //   createlist();
          // });          
        }
      };

      function createFunctions(listobj) {
        
        listobj.editMode = function() {
          return (listobj.mode === 'edit');
        };

        listobj.createMode = function() {
          return (listobj.mode === 'view');
        };

        listobj.cancelNote = function() {
          listobj.tempnote = null;
        };

        listobj.updateNote = function() {
          //var obj = this;
          $log.info('note to update: ' + JSON.stringify(listobj.tempnote, true, 3));
          JawboneService.updateNote(listobj.tempnote)
          .then(function(response) {
            listobj.mode = 'view';
            createlist();
          });
        };

        listobj.createNote = function() {
          //var obj = this;
          $log.info('note to create: ' + JSON.stringify(listobj.tempnote, true, 3));
          JawboneService.createNote(listobj.tempnote)
          .then(function(response) {
            listobj.mode = 'view';
            createlist();
          });
        };
      }

      function createlist() {
        var args = arg || {};
        obj.notes = {};
        obj.notes.listobj = {};
        obj.notes.listobj.template = 'app/notes-viewer/_notes-element-tpl.html'; 
        obj.notes.listobj.getElementsObj = JawboneService.makeBatch(JawboneService.makeEndpoint('notes'));   
        obj.notes.listobj.headerbar = 'app/notes-viewer/_notes-header-tpl.html';    
        obj.notes.listobj.heading = 'Notes';
        obj.notes.listobj.mode = args.mode || 'view';
        createFunctions(obj.notes.listobj);

        obj.notes.listobj.makeElement = function(objElement) {
          return new NoteObj(objElement, obj.callbacks);
        };

        obj.notes.onSelect = function(elem) {
          $log.info('supplied on select function: ' + JSON.stringify(elem));
          elem.onSelected();
          obj.callbacks.onSelect(elem);
        };

        obj.notes.onDeselect = function(elem) {
          $log.info('supplied on deselect function: ' + JSON.stringify(elem));
          elem.onDeselected();
          obj.callbacks.onDeselect(elem);
        };

        //$log.info(JSON.stringify(obj.notes.listobj, true, 2));
      }      

      createlist();

    };
    return NotesViewerObj;
  }

  function NotesViewerCtrlFtn($scope, NotesViewerObj, $log) {
    var vm = this;  
    vm.o = new NotesViewerObj();

    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      if(newval) {

      }
    }); 

    $log.info('controller ran for notes viewer : ' + JSON.stringify(vm.o));
  }

  function NotesViewerDirFtn() {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'NotesViewerCtrl',
      controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/notes-viewer/_notes-viewer-tpl.html'
    };
    return directive;   
  }
})();

(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('MovesObj', MovesObjFtn)
    .controller('MovesCtrl', MovesCtrl)
    .directive('moves', movesFtn)
    .factory('MoveObj', MoveObjFtn)
    .controller('MoveCtrl', MoveCtrl)
    .directive('move', moveFtn);

  function MovesObjFtn($log) {
    var MovesObj = function(data) {
      this.data = data || {};
      //$log.info('data: ' + JSON.stringify(data));
      this.elements = data.items || [];
    };
    return MovesObj;
  }

  /** @ngInject */
  function MovesCtrl($log, $scope, MovesObj) {
    var vm = this;
  
    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      if(newval) {
        vm.mo = new MovesObj(vm.obj);
      }
    });
  }	

  function movesFtn($log) {
    var directive = {
      restrict: 'E',
        scope: {},
        controller: 'MovesCtrl',
        controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/moves/_moves-tpl.html'
    };
    return directive;   
  }

  function MoveObjFtn($log) {
    var MoveObj = function(data) {
      this.data = data || {};
      this.date = data.date || new Date();
      this.title = data.title || 'blank';
    };
    return MoveObj;
  }

  /** @ngInject */
  function MoveCtrl($q, $log, $http, $window, MoveObj) {
    var vm = this;
    vm.mo = new MoveObj(vm.obj); 

    //$log.info('move obj: ' + JSON.stringify(vm.mo));   
  } 

  function moveFtn($log) {
    var directive = {
      restrict: 'E',
        scope: {},
        controller: 'MoveCtrl',
        controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/moves/_move-tpl.html'
    };
    return directive;   
  }  
})();
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .directive('mouseWheelDown', mouseWheelDown)
    .directive('mouseWheelUp', mouseWheelUp);

  function mouseWheelDown($log) {
    var directive = {
      link : link
    };
    return directive;

    function link(scope, elem, attrs) {
      elem.bind("DOMMouseScroll mousewheel onmousewheel", function(event) {

        // cross-browser wheel delta
        var ev = window.event || event; // old IE support
        ev = ev.originalEvent;
        var delta = (ev.wheelDelta || -ev.detail);

        if(delta < 0) {          
          scope.$apply(function(){
              scope.$eval(attrs.mouseWheelDown);
          });
        
          // for IE
          event.returnValue = false;
          // for Chrome and Firefox
          if(event.preventDefault) {
              event.preventDefault();                        
          }
        }
      });
    }    
  }

  function mouseWheelUp($log) {
    var directive = {
      link : link
    };
    return directive;

    function link(scope, elem, attrs) {      
      elem.bind("DOMMouseScroll mousewheel onmousewheel", function(event) {
        // cross-browser wheel delta

        var ev = window.event || event; // old IE support
        ev = ev.originalEvent;
        //var delta = Math.max(-1, Math.min(1, (ev.wheelDelta || -ev.detail)));
        var delta = (ev.wheelDelta || -ev.detail);

        //$log.info('mouse wheel delta: ' + delta);

        if(delta > 0) {          
          scope.$apply(function(){
              scope.$eval(attrs.mouseWheelUp);
          });
        
          // for IE
          event.returnValue = false;
          // for Chrome and Firefox
          if(event.preventDefault) {
              event.preventDefault();                        
          }
        }
      });
    }
  }
})();

(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('MoodsObj', MoodsObjFtn)
    .controller('MoodsCtrl', MoodsCtrl)
    .directive('moods', moodsFtn);

  function MoodsObjFtn($log) {
    var MoodsObj = function(data) {
      this.data = data || {};
    };
    return MoodsObj;
  }

  /** @ngInject */
  function MoodsCtrl($log, $scope, MoodsObj) {
    var vm = this;  

    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      if(newval) {
        vm.mo = new MoodsObj(vm.obj[2]);
      }
    }); 
  }	

  function moodsFtn($log) {
    var directive = {
      restrict: 'E',
        scope: {},
        controller: 'MoodsCtrl',
        controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/moods/_moods-tpl.html'
    };
    return directive;   
  }
})();
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .controller('DefaultModalInstanceCtrl', DefaultModalInstanceCtrl)
    .factory('ModalService', ModalService)
    .factory('CommonModals', CommonModals);

	function DefaultModalInstanceCtrl(resolveArg, $uibModalInstance, $log) {
		var vm = this;
		vm.resolveArg = resolveArg;
		vm.template = resolveArg.tpl || 'app/_default-modal-tpl.html';

		vm.ok = function () {
		  $uibModalInstance.close(vm.resolveArg);
		};

		vm.cancel = function () {
		  $uibModalInstance.dismiss(vm.resolveArg);
		};
	 }

	function CommonModals($log, $q, ModalService) {
		var service = {
			confirm: confirm
		};
		return service;

		function confirm(msg) {
			var ps = {};
			ps.modalSize = 'sm';
			ps.tpl = 'app/_default-confirm-modal-tpl.html';
			ps.msg = msg || 'no message';
			ps.confirmed = false;
	  		ps.onConfirm = function() {
	  			ps.confirmed = true;
	  		};
			return ModalService.onClick(ps)
			.then(function(response) {
				return response.confirmed;
			});			
		}
	}

	//------------------------------------------------------
	//  JAWBONE DATA SERVICE 
	//------------------------------------------------------  
	function ModalService($log, $q, $uibModal) {
	    var service = {
	  		init : init,
	  		onClick : onClick
	  	};
	  	return service;    

	  	/*
	  	*	INITIALISE JAWBONE SERVICE
	  	*/
	  	function init() {
	  	}

	  	/*
	  	*	GET DATA
	  	* 	MODIFY THIS TO GET A SPECIFIED USER'S DATA FROM SERVER
	  	*/
	  	function onClick(params) {
	  		//$log.info('params: ' + JSON.stringify(params));
	  		var ps = params || {};
	  		var ctrl = ps.ctrl || 'DefaultModalInstanceCtrl';
	  		var modalSize = ps.size || 'md';
	  		ps.tpl = ps.tpl || 'app/_default-modal-tpl.html';
	  		ps.onConfirm = ps.onConfirm || function() {
	  			$log.info('supply on confirm ftn');
	  		};
	  		ps.onDismiss = ps.onDismiss || function() {
	  			$log.info('supply on dismiss ftn');
	  		};

	  		var deferred = $q.defer();
        	var modalInstance = $uibModal.open({
	          	animation: false,
    	      	ariaLabelledBy: 'modal-title',
        	  	ariaDescribedBy: 'modal-body',
          		templateUrl: 'app/_modal-frame-tpl.html',
          		controller: ctrl,
          		controllerAs: 'ctrl',
          		size: modalSize,
          		resolve: {
            		resolveArg : function () {
              			return ps;
            		}
          		}
        	});

	        modalInstance.result.then(function(modalObj) {
	         	modalObj.onConfirm();
	         	deferred.resolve(modalObj);
	        }, function(modalObj) {
	          modalObj.onDismiss();
	          deferred.resolve(modalObj);
	        });

	        return deferred.promise;        
	  	}

	}
})();

(function() {
  'use strict';

  angular
    .module('jawboneApp')   
    .controller('LoaderCtrl', LoaderCtrlFtn)
    .directive('loader', LoaderDirFtn);

  function LoaderCtrlFtn($scope) {
    var vm = this; 
    vm.message = 'Loading...';
    vm.loader = 'app/loaders/_basic-spinner-tpl.html'; 
    vm.width = 300;
    vm.height = 300;

    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      if(newval) {
        vm.message = newval;
      }
    }); 
  }

  function LoaderDirFtn() {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'LoaderCtrl',
      controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/loaders/_loader-frame-tpl.html'
    };
    return directive;   
  }
})();

(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('ListElementAPIObj', ListElementAPIObjFtn)
    .factory('ListViewerElemObj', ListViewerElemObjFtn)
    .controller('ListViewerElemCtrl', ListViewerElemCtrl)
    .directive('lvelem', lvelemFtn);

  function ListElementAPIObjFtn($log) {
    var ListElementAPIObj = function(obj) {
      var o = this;
      o.selected = false;
      o.deleteMode = false;
      o.confirmDeleteMode = false;
      o.container = null;
      o.child = obj;

      o.notifyParent = function(event, data) {
        $log.info('no notify parent function created');
      };

      o.setContainer = function(container) {
        o.container = container;
        o.notifyParent = function(event, data) {
          o.container.handleChildEvent(event, data);
        };
      };

      // o.activated = function() {
      //   o.selected = true;
      // };

      // o.deactivated = function() {
      //   o.selected = false;
      // };

      o.handleParentEvent = function(event, data) {
        $log.info('handle parent event: ' + event);
        switch(event) {
          case 'select':
            o.selected = true;
            break;
          case 'deselect':
            o.selected = false; 
            break;
          case 'deleteMode':
            o.deleteMode = !o.deleteMode;
            break;
          default:
            break;            
        }
        //maybe send to child
        //o.child.handleParentEvent(event, data);
      };

      o.handleChildEvent = function(event, data) {
        //$log.info('group handle event ftn for event: ' + event);
        //o.deleteMode = !o.deleteMode;
      };

      o.clickedView = function() {
        $log.info('clicked view called');
        if(o.deleteMode) {
          o.confirmDeleteMode = true;
          $log.info('confirm delete mode: ' + o.confirmDeleteMode);
        } else {
          $log.info('clicked selected');
          o.selected = !o.selected;
          o.notifyParent('clicked', o.selected);          
        }
      };

      o.delete = function(event) {
        o.confirmDeleteMode = false;
        o.notifyParent('delete');
        event.stopPropagation();
      };

      o.cancel = function(event) {
        o.confirmDeleteMode = false;
        event.stopPropagation();
      };

      o.clickelse = function(event) {
        $log.info('clicked elsewhere');
        //event.stopPropagation();
      };

    };
    return ListElementAPIObj;
  }

  function ListViewerElemObjFtn($log) {
    var ListViewerElemObj = function(notify, data, indexArg) {      

      //$log.info('create a list elem object from data: ' + JSON.stringify(data));
      //this.template = data.template || 'app/list-viewer/_default-lve-tpl.html';
      
      var o = this;
      o.element = data || {};      
      o.index = indexArg;

      // set up container for element
      o.element.api = o.element.api || {};
      o.element.api.setContainer = o.element.api.setContainer || function() {
        $log.info('no set container function supplied');
      };

      o.handleChildEvent = function(event, data) {
        $log.info('notify parent of event: ' + event);
        $log.info('my index is  ' + o.index);
        notify(event, data, o.index);
      }

      o.handleParentEvent = function(event, data) {
        o.element.api.handleParentEvent(event, data);
      };

      o.element.api.setContainer(o);

      // o.handleEventFtn = o.element.api.handleEventFtn || function(event, data) {
      //   $log.info('default handleEventFtn');
      // };

      // this.clicked = data.clicked || function() {
      //   $log.info('default clicked function');
      // };

      // this.deactivated = data.deactivated || function() {
      //   $log.info('default deactivated function');
      // };


      // this.onClick = function(index) {
      //   this.clicked();
      //   notify(index);
      // }


      // this.handleEvent = function(event, data) {
      //   this.handleEventFtn(event, data);
      // };

      //$log.info('data: ' + JSON.stringify(data));
    };
    return ListViewerElemObj;
  }

  /** @ngInject */
  function ListViewerElemCtrl($log, $scope, ListViewerElemObj) {
    var vm = this;  

    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      if(newval) {        
        //vm.e = new ListViewerElemObj(vm.obj, vm.listobj);
      }
    }); 
  }	

  function lvelemFtn($log, $timeout) {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'ListViewerElemCtrl',
      controllerAs: 'ctrl',
      bindToController: {
        tpl : '=',
        obj : '=',
        i : '@'
      },
      //template: '<div ng-include=\'ctrl.tpl\' ng-click=\'ctrl.obj.onClick(ctrl.i)\'></div>',
      template: '<div ng-include=\'ctrl.tpl\'></div>',
    };
    return directive;
  }
})();
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('ListViewerCtrlObj', ListViewerCtrlObjFtn)
    .factory('ListViewerObj', ListViewerObjFtn)
    .controller('ListViewerCtrl', ListViewerCtrl)
    .directive('listviewer', listviewerFtn);

  function ListViewerCtrlObjFtn($log, ListViewerObj) {
    var ListViewerCtrlObj = function(obj, onStateChange) {

      var o = this;

      //$log.info('run dat list viewer ctrl obj');
      
      o.onSelect = obj.onSelect || function(selected) {
        $log.info('selected: ' + JSON.stringify(selected));
      };
      
      o.onConfirm = obj.onConfirm || function() {
        $log.info('on confirm selection');
      };
      
      o.listobj = new ListViewerObj(obj, onStateChange);

    };
    return ListViewerCtrlObj;
  }

  function ListViewerObjFtn($q, $log, ListViewerElemObj) {
    var ListViewerObj = function(obj, onStateChange) {

      //$log.info('obj to listviewer obj: ' + JSON.stringify(obj));

      var o = this;

      obj.onStateChange = onStateChange || function(newState) {
        $log.info('supply a state change function to ChartObj');
      };

      o.listobj = obj.listobj || {};
      o.loaderMessage = obj.listobj.loaderMessage || 'Loading...';
      o.heading = obj.listobj.heading || 'blank';
      o.headerbar = obj.listobj.headerbar || 'app/list-viewer/_default-headerbar-tpl.html';
      o.headerObj = obj.listobj.headerObj || {};
      o.template = obj.listobj.template || 'app/list-viewer/_default-lve-tpl.html';
      o.chunksize = obj.listobj.chunksize || 4;
      o.getElements = o.listobj.getElements || function() {
        return [];
      };

      // get an object to retrieve batches now
      o.getElementsObj = o.listobj.getElementsObj || {};

      o.makeElement = o.listobj.makeElement || function(value) {
        $log.info('supply a make element function');
        return {};
      };

      o.onSelect = obj.onSelect || function(elem) {
        $log.info('supply on select function');
      };

      o.onDeselect = obj.onDeselect || function(elem) {
        $log.info('supply on deselect function');
      };

      o.onEvent = obj.onEvent || function(event, elem) {
        var deferred = $q.defer();
        deferred.resolve(true);
        $log.info('supply on event function');
        return deferred.promise;
      };

      o.elements = [];
      o.selected = -1;

      // notify list object that an element was clicked
      o.handleClick = function(index) {   
        // sets selected and notifies the list implementation type selected/deselected     
        if(o.selected !== -1 && o.selected < o.elements.length) {
          //o.elements[o.selected].onDeselected();
          o.elements[o.selected].handleParentEvent('deselect');
          o.onDeselect(o.elements[o.selected].element);
        }

        if(o.selected !== index) {
          o.selected = index;          
          o.onSelect(o.elements[o.selected].element);
        } else {
          o.selected = -1;
        }
      };

      o.handleChildEvent = function(event, data, index) {
        switch(event) {
          case 'clicked':
            o.handleClick(index);
            break;
          case 'delete':
            o.onEvent(event, o.elements[index].element)
            .then(function(response) {
              $log.info('event handled with response : ' + response);
              o.deleteElement(index);
            });   
            break; 
          default:
            break;
        }
      };

      o.listobj.baseFtns = {
        // ensure all elements deselected
        deselectAll : function() {
          o.selected = -1;
          angular.forEach(o.elements, function(value) {
            //value.onDeselected();
            value.handleParentEvent('deselect');
            o.onDeselect(value.element);
          }, o.elements);          
        },

        // send an event to every member of the list
        propagateEvent: function(event, data) {
          angular.forEach(o.elements, function(value) {
            $log.info('event action for elem: ' + event);
            value.handleParentEvent(event, data);
          }, o.elements);
        }
      };

      function populate(list, batchObj, onComplete) {

        batchObj.get()
        .then(function(batch) {
          $log.info('total no. of objects: ' + batchObj.params.total);
          var i = 0;
          angular.forEach(batch.data, function(value) { 
            //$log.info('value gotten: ' + JSON.stringify(value));           
            var e = o.makeElement(value); 
            // $log.info('index to pass: ' + i);
            this.push(new ListViewerElemObj(o.handleChildEvent, e, parseInt(i)));
            i++;
          }, list);

          $log.info('size of list: ' + JSON.stringify(list.length));
          if(onComplete) {
            onComplete({
              nbrElems: list.length,
              totalElems: batchObj.params.total
            });
          }
        })
        .catch(function(err) {
          $log.info('error getting elements: ' + err);
        });        
      }

      o.deleteElement = function(index) {
        o.elements = [];
        populate(o.elements, o.getElementsObj);
      };

      // TODO implement
      o.appendElements = function() {        

        o.getElementsObj = o.getElementsObj.next();
        $log.info('next batch..params: ' + JSON.stringify(o.getElementsObj.params));

        if(!o.getElementsObj.more()) {
          $log.info('no more to get w/ params: ' + JSON.stringify(o.getElementsObj.params));
          $log.info('no more to get w/ elems :  ' + o.elements.length);
          return;          
        }
        
        populate(o.elements, o.getElementsObj);
      };

      o.listobj.onPopulate = function() {
        populate(o.elements, o.getElementsObj);
      };

      //$log.info('calling populate on creation...');
      obj.onStateChange('loading');
      populate(o.elements, o.getElementsObj, function(updateData) {
        obj.onStateChange('ready', updateData);
      });

      //$log.info('got elems: ' + JSON.stringify(o.elems));


    };
    return ListViewerObj;
  }

  /** @ngInject */
  function ListViewerCtrl($log, $scope, ListViewerCtrlObj) {
    var vm = this;  
    vm.lo = {};
    vm.atStart = null;
    vm.atEnd = null;
    vm.frameHeight = 0;
    vm.moveDistance = 0;
    vm.nbrForwards = 100;
    vm.chunksize = 4;
    vm.index = 0;
    vm.initcb = null;
    vm.setHeightCB = null;
    vm.animating = false;
    vm.state = 'init';

    vm.register = function(cb, shcb) {
      vm.initcb = cb;
      vm.setHeightCB = shcb;
    };

    vm.callinit = function() {
      vm.initcb();
    };

    vm.initialiseHeight = function(height, cb) {
      //$log.info('init height called: ' + height);
      vm.chunksize = vm.lo.chunksize || 4;
      vm.frameHeight = vm.chunksize * height;
      vm.moveDistance = parseInt(vm.frameHeight / 2);
      cb(vm.frameHeight);
      //vm.index = 0;
    };

    // vm.getFrameHeight = function() {
    //   return vm.frameHeight;
    // };

    function adjust(length) {
      vm.nbrElems = vm.lo.listobj.elements.length;
      //$log.info('what is chunsize anyways: ' + vm.lo.chunksize);
      vm.chunksize = parseInt(vm.lo.chunksize) || 4;
      vm.nbrForwards = parseInt(vm.nbrElems / vm.chunksize);
      //$log.info('chunksize: ' + vm.chunksize + ' no. forwards: ' + vm.nbrForwards);
      if(vm.initcb) {
       vm.initcb();
      }
    }

    vm.didMouseWheelUp = function(value) {
      //$log.info('mouse wheel up event!');
      vm.back();
    };

    vm.didMouseWheelDown = function(value) {
      //$log.info('mouse wheel down event!');
      vm.forward();
    };


    function init(obj) {
      vm.lo = new ListViewerCtrlObj(obj, function(newState, updateData) {
        vm.state = newState;
        vm.setHeightCB();
      });

      vm.nbrElems = vm.lo.listobj.elements.length;
      vm.nbrForwards = parseInt(vm.nbrElems / 2);

      //$log.info('calling init of listviewer : ' + JSON.stringify(vm.lo));
      $log.info('nbr elems : ' + vm.nbrElems);

      vm.back = function() {
        if(vm.atStart()) return;
        if(vm.animating) return;
        vm.animating = true;
        vm.index = (vm.index === 0 ? 0 : vm.index - 1);
        //$scope.$broadcast('clickback', vm.moveDistance);
        $scope.$broadcast('clickback', {
          dist: vm.moveDistance,
          callback: function() {
            vm.animating = false;
          }
        });
      };

      vm.forward = function() {
        vm.setHeightCB();
        if(vm.atEnd()) return;
        if(vm.animating) return;
        vm.animating = true;
        //$log.info('clicked forward');
        //$log.info('number of elements: ' + vm.nbrElems + ' move distance: ' + vm.moveDistance + ' forwards: ' + vm.nbrForwards);
        vm.index = (vm.index === vm.nbrForwards ? vm.nbrForwards : vm.index + 1);
        //$scope.$broadcast('clickforward', vm.moveDistance);
        $scope.$broadcast('clickforward', { 
          dist: vm.moveDistance, 
          callback: function() { 
            vm.animating = false;
            //$log.info('set animating to false: ' + vm.animating); 
          }
        });
        vm.lo.listobj.appendElements();
      };

      vm.atStart = function() {
        return (vm.index === 0);
      };

      vm.atEnd = function() {
        return (vm.index === vm.nbrForwards);
      };

      if(vm.initcb) {
        vm.initcb();
      }

      $scope.$watch(function(scope) {
        return (vm.lo.listobj.elements.length);
      }, function(newVal, oldVal) {
        if(newVal) {
          $log.info('elements changed: ' + vm.lo.listobj.elements.length); 
          adjust(newVal);         
        }
      });
    }

    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      if(newval) {
        init(newval);
      }
    }); 
  }	

  function listviewerFtn($log, $timeout) {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'ListViewerCtrl',
      controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/list-viewer/_list-viewer-tpl.html',
      link: link
    };
    return directive;

    function link(scope, element, attrs, ctrl) {

      var frame = angular.element(element[0].querySelector('.list-viewer-elements'))
      var li = null;
      var ul = null;

      function newInit() {
        //frame = angular.element('#listviewerbox');
        frame = angular.element(element[0].querySelector('.list-viewer-elements'));
        ul = frame.find('ul');
        li = ul.find('li');
        var height = li.first().height();

        //$log.info('THE HEIGHT OF FIRST ELEM: ' + height);

        ctrl.initialiseHeight(height, function(scrollFrameHeight) {
          //$log.info('new init height of list element : ' + height + ' frame height: ' + scrollFrameHeight);
          frame.css({
            'height': scrollFrameHeight + 'px'
          });          
        });
      }

      scope.$on('clickback', function(event, data) {
        ul.velocity({
          'top': '+='+ data.dist
        }, 400, function() {
          // Animation complete.
          //$log.info('animating complete invoke cb...')
          data.callback();
        });          
      });

      scope.$on('clickforward', function(event, data) {
        //$log.info('click forwards event...');
        ul.velocity({
          'top': '-='+ data.dist
        }, 400, function() {
          // Animation complete.
          //$log.info('animating complete invoke cb...');
          data.callback();
        });                  
      });    

      scope.$on('adjustOffsetFromLeft', function(event, data) {
        ul.css({
          'left': '+=' + data
        });
      });        

      ctrl.register(function() {
        $timeout(function() {
          newInit();
        })
      }, function() {
        newInit();
      });
    }  
  }
})();
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('HeaderBarObj', HeaderBarFtn)
    .controller('HeaderBarCtrl', HeaderBarCtrl)
    .directive('headerBar', headerBarFtn);

  function HeaderBarFtn($log) {
    var HeaderBar = function(data) {
      var obj = this;
      obj.data = data || {};
      obj.message = 'hello there';

    };
    return HeaderBar;
  }

  /** @ngInject */
  function HeaderBarCtrl($log, $scope, HeaderBarObj) {
    var vm = this;  
    vm.o = null;

    //$log.info('header bar: ' + JSON.stringify(vm.tpl));
    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      if(newval) {
        vm.o = newval;
      }
    }); 
  }	

  function headerBarFtn($log) {
    var directive = {
      restrict: 'E',
        scope: {},
        controller: 'HeaderBarCtrl',
        controllerAs: 'ctrl',
      bindToController: {
        tpl : '=',
        obj : '='
      },
      template: '<div ng-include=\'ctrl.obj.headerbar\'></div>'
      //template: '<div ng-include=\'ctrl.tpl\'></div>{{ctrl.tpl}} {{ctrl.obj.headerbar}}'
    };
    return directive;   
  }
})();
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('JawboneDataObj', JawboneDataObjFtn)
    .factory('BatchObj', BatchObjFtn)
    .factory('JawboneService', JawboneService);

	//------------------------------------------------------
	//  JAWBONE DATA MODEL 
	//------------------------------------------------------  
	function JawboneDataObjFtn($log) {
		var JawboneDataObj = function(data) {
			this.data = data || {};
		};
		return JawboneDataObj;
	}

	//------------------------------------------------------
	//  GET BATCH REQUEST 
	//------------------------------------------------------  
	function BatchObjFtn($log, $q, $http) {
		var BatchObj = function(endpoint, params) {
			var obj = this;
			obj.endpoint = endpoint || '';
			obj.params = {};
			var paramsArg = params || {};
			obj.params.max = paramsArg.max || 4 ;
			obj.params.offset = paramsArg.offset || 0;
			obj.params.sortBy = paramsArg.sortBy || 'id';
			obj.params.total = paramsArg.total || 0;

			function makeBatch(batch, offset) {
				var newBatch = new BatchObj(batch.endpoint, batch.params);
				var os = newBatch.params.offset || 0;
				var newOS = parseInt(os + offset);
				newOS = (newOS < 0 ? 0 : newOS);
				newOS = (newOS < batch.params.total ? newOS : batch.params.total);
				newBatch.params.offset = newOS;
				return newBatch;			
			}

			function updateBatch(batch, response) {
				batch.params.total = response.data.total;
			}

			obj.get = function() {
				return $http.get(obj.endpoint, {params: obj.params})
				.then(function(response) {
					updateBatch(obj, response);
					return response.data;
				})
				.catch(function(errResponse) {
					return errResponse;
				});
			};

			obj.next = function() {
				return makeBatch(obj, obj.params.max);
			};

			obj.prev = function() {
				return makeBatch(obj, -(obj.params.max));
			};

			obj.more = function() {
				return (obj.params.offset < obj.params.total);
			};
		};
		
		return BatchObj;
	}

	//------------------------------------------------------
	//  JAWBONE DATA SERVICE 
	//------------------------------------------------------  
	function JawboneService($log, $q, $http, JawboneDataObj, BatchObj) {
		var jboneData = null;
		var setUserCB = [];
	    var service = {
	  		init : init,
	  		getMainUser : getMainUser,
	  		getUser : getUser,
	  		getUsers : getUsers,
	  		makeEndpoint : makeEndpoint,
	  		makeFieldGetter: makeFieldGetter,
	  		makeBatch : makeBatch,
	  		setUserCallback : setUserCallback,
	  		setUser : setUser,
	  		extractData : extractData,
	  		createNote : createNote,
	  		updateNote : updateNote,
	  		deleteNote : deleteNote
	  	};
	  	return service;    

	  	/*
	  	*	INITIALISE JAWBONE SERVICE
	  	*/
	  	function init(jbd) {
	  		jboneData = jbd
	  	}

	  	/*
	  	*	GET DATA
	  	* 	MODIFY THIS TO GET A SPECIFIED USER'S DATA FROM SERVER
	  	*/
	  	function getMainUser() {
	  		var deferred = $q.defer();
	  		deferred.resolve(jboneData);
	  		return deferred.promise;
	  	}

	  	function setUserCallback(ftn) {
	  		setUserCB.push(ftn);
	  	}

	  	function setUser(user) {
	  		angular.forEach(setUserCB, function(ftn) {
	  			ftn(user);
	  		}, setUserCB);
	  	}

	  	function getUser(userid) {
			return $http.get('/users/' + userid).then(function(result) {
				return result.data;
			})
	  		.catch(function(errResponse) {
	  			$log.info('error getting user: ' + JSON.stringify(errResponse));
	  		});
	  	}

	  	function makeEndpoint(endpoint, id) {
	  		var userid = id || 'me';
	  		return ('/' + endpoint + '/' + userid);
	  	}

	  	function makeFieldGetter(root, id, field) {
	  		return ('/' + root + '/' + id + '/' + field);
	  	}

	  	function makeBatch(endpoint, params) {
	  		// var userid = id || 'me';
	  		// endpoint = '/' + endpoint + '/' + userid; 
	  		// $log.info('endpoint: ' + endpoint);
			var paramsArg = params || {};
			paramsArg.max = paramsArg.max || 4 ;
			paramsArg.offset = paramsArg.offset || 0;
			paramsArg.sortBy = paramsArg.sortBy || 'id';
	  		return new BatchObj(endpoint, paramsArg);
	  	}

	  	/*
	  	*	GET USERS
	  	*/
	  	function getUsers() {
	  		var deferred = $q.defer();

	  		var p = {
	      		max : 8,
	      		offset : 0,
	      		sortBy : 'first'
	    	};

	  		$http.get('/users', {params: p})
	  		.then(function(result) {
	  			//$log.info('get users results: ' + JSON.stringify(result.data.data));
	  			deferred.resolve(result.data.data);
	  		})
	  		.catch(function(errResponse) {
	  			deferred.reject(errResponse);
	  		});
	  		return deferred.promise;
	  	}

	  	function createNote(note) {
	  		return $http.post('/notes', note)
	  		.then(function(response) {
	  			return response;
	  		})
	  		.catch(function(errResponse) {
	  			$log.info('error creating note: ' + JSON.stringify(errResponse));
	  		});
	  	}

	  	function updateNote(note) {
	  		return $http.put('/notes/' + note._id, note)
	  		.then(function(response) {
	  			return response;
	  		})
	  		.catch(function(errResponse) {
	  			$log.info('error updating note: ' + JSON.stringify(errResponse));
	  		});
	  	}

	  	function deleteNote(note) {
	  		return $http.delete('/notes/' + note._id)
	  		.then(function(response) {
	  			return response;
	  		})
	  		.catch(function(errResponse) {
	  			$log.info('error deleting note: ' + JSON.stringify(errResponse));
	  		});	  		
	  	}

	  	function extractData(dataname, data) {
	  		if(dataname === 'trends') {
	  			return extractTrends(data);
	  		}
	  		else if(dataname === 'profile') {
	  			return extractProfile(data);
	  		}
	  		else if(dataname === 'sleeps') {
	  			return extractSleeps(data);
	  		}
	  		else if(dataname === 'groups') {
	  			return extractGroups(data);
	  		}
	  		else if(dataname === 'userImage') {
	  			return extractUserImage(data);
	  		}
	  		$log.info('jawbone service: call to extract unknown data: ' + dataname);
	  		return {};
	  	}

	  	function extractTrends(data) {
	  		var jbdata = data.jbdata || {};
	  		var prof = jbdata.profile || {};  		
	  		var trends = prof[3] || {};
	  		return trends;
	  	}

	  	function extractProfile(data) {
	  		return data.profile || {};
	  	}

	  	function extractSleeps(data) {
	  		var jbdata = data.jbdata || {};
	  		var activities = jbdata.activities || {};
	  		var sleepspart = activities[2] || [];
	  		return sleepspart.items;
	  	}

	  	function extractGroups(data) {
	  		$log.info('groups from user: ' + JSON.stringify(data));
	  		return data.groups;
	  	}

	  	function extractUserImage(data) {

	  		var prof = data.profile || {};

	  		if(!prof.img) {
	  			$log.info('no image found - return null');
	  			return null;
	  		} else {
	  			return 'https://jawbone.com/' + prof.img;
	  		}
	  	}
	}
})();
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

(function() {
  'use strict';

  angular
    .module('run')
    .run(runBlock);

  // function runBlock($log, JawboneData, JawboneService) {
  // 	$log.info('we did execute the run block');
  // 	$log.info('pre loaded data: ' + JSON.stringify(JawboneData));
  // 	JawboneService.init(JawboneData);
  // }

  function runBlock() {
  	
  }
})();

(function() {
  'use strict';

  // angular
  //   .module('mainRoute')
  //   .config(routeConfig);

  // /** @ngInject */
  // function routeConfig($stateProvider, $urlRouterProvider) {
  //   $urlRouterProvider
  //   .when('/?code', 'profile.user');
    
  //   // this is required rather than the line above to prevent an
  //   // infinite digest loop
  //   $urlRouterProvider.otherwise(function($injector, $location) {
  //     var $state = $injector.get("$state");
  //     $state.go('profile.sleeps');
  //   });

  //   $stateProvider
  //     .state('profile', {
  //       abstract: true,
  //       url: '/?code',
  //       templateUrl: 'app/profile/profile-main.html',
  //       controller: 'ProfileCtrl',
  //       controllerAs: 'profile'
  //     })
  //     .state('profile.friends', {
  //       url: 'friends',
  //       templateUrl: 'app/profile/friends.html'
  //     })
  //     .state('profile.moves', {
  //       url: 'moves',
  //       templateUrl: 'app/profile/moves.html'
  //     })
  //     .state('profile.trends', {
  //       url: 'trends',
  //       templateUrl: 'app/profile/trends.html'
  //     })
  //     .state('profile.sleeps', {
  //       url: 'sleeps',
  //       templateUrl: 'app/profile/sleeps.html'
  //     });

  // }

})();

/* global malarkey:false, toastr:false, moment:false */
(function() {
  'use strict';

  angular
    .module('constants');
})();

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

(function() {
  'use strict';

  angular
    .module('jawboneApp')    
    .factory('GroupsComponentBuilder', GroupsComponentBuilderFtn)
    .factory('GroupObj', GroupObjFtn)
    .filter('defaultGroup', defaultGroupFtn)
    .controller('GroupCtrl', GroupCtrlFtn)
    .directive('groupMgr', groupMgrFtn);

  var log = null;
  var jbservice = null;
  var modalservice = null;
  var promiseService = null;

  function defaultGroupFtn($log) {
    return function(img) {  
      if(!img) {
        return 'assets/group.png';
      }
      return img;
    }     
  }

  function buildGroupSummary(obj, group, GroupSummObj) {
    obj.groupSummary = new GroupSummObj(group);
    obj.groupSummary.parent = {
      switchView: function() {
        obj.mode = 'view';
      },
      addPatient: function() {
        log.info('implement add patient');
        modalservice.onClick({
          tpl : 'app/patient/_patient-notes-viewer-tpl.html'
        })
        .then(function(result) {});
      },
      removePatients: function() {
        log.info('implement remove patients');
      },

      clickedOther: function() {
        log.info('user clicked other');
      }
    };
  }

  function buildCallbacks(obj, user, GroupsPatientsBuilder, GroupSummObj, PatientsComponentBuilder) {

    obj.mode = 'view';

    obj.groupViewer.onSelect = function(selectedGroup) {
      if(obj.groupViewer.listobj.state.deleteMode) {
        //log.info('delete the group: ' + JSON.stringify(selectedGroup, true, 3));
        return;
      }
      //log.info('on select event fired: delete mode? ' + obj.groupViewer.listobj.state.deleteMode);
      
      obj.patients = new GroupsPatientsBuilder(user, selectedGroup.data);
      buildGroupSummary(obj, selectedGroup.data, GroupSummObj);
      obj.mode = 'edit';
    };

    obj.groupViewer.onEvent = function(event, selectedGroup) {
      var deferred = promiseService.defer();
      switch(event) {
        case 'delete':
          //log.info('delete the group: ' + JSON.stringify(selectedGroup));
          deferred.resolve(true);
          break;
        default:
          break;
      }
      return deferred.promise;
    };

    // obj.onSelect = function(ss) {
    //   $log.info('on select event fired for group element: ' + JSON.stringify(ss));
    // };

    // obj.onConfirm = function() {
    // };

  }

  function buildListViewerHeader(obj) {
    obj.groupViewer.listobj.headerbar = 'app/groups/_group-header-bar-tpl.html';    
    obj.groupViewer.listobj.headerFtns = {
      createGroup: function() {
        log.info('implement create group ftn');
        modalservice.onClick({
          tpl : 'app/patient/_patient-notes-viewer-tpl.html'
        })
        .then(function(result) {});
      },
      deleteGroups: function() {
        log.info('implement delete groups ftn');
        obj.groupViewer.listobj.baseFtns.deselectAll();
        obj.groupViewer.listobj.state.deleteMode = !(obj.groupViewer.listobj.state.deleteMode);
        obj.groupViewer.listobj.baseFtns.propagateEvent('deleteMode', null);
      }, 
      clickElsewhere: function() {
        log.info('clicked the elsewhere...');
      }
    }    
  }

  function buildListViewer(obj, GroupObj) {
    obj.groupViewer.listobj = {};
    obj.groupViewer.listobj.state = {
      deleteMode : false
    };
    obj.groupViewer.listobj.template = 'app/groups/_group-element-tpl.html';
    obj.groupViewer.listobj.heading = 'Groups';
    obj.groupViewer.listobj.loaderMessage = 'Loading Groups...';
    obj.groupViewer.listobj.getElementsObj = jbservice.makeBatch(jbservice.makeEndpoint('groups'));

    obj.groupViewer.listobj.makeElement = function(objElement) {
      return new GroupObj(objElement)
    };    
  }

  function GroupsComponentBuilderFtn($q, $log, GroupObj, JawboneService, GroupsPatientsBuilder, PatientsComponentBuilder, GroupSummObj, ModalService) {
    var GroupsComponentBuilder = function(user) {
      var obj = this;

      obj.profile = JawboneService.extractData('profile', user);
      obj.name = obj.profile.first + ' ' + obj.profile.last;
      obj.groups = JawboneService.extractData('groups', user);
      obj.elems = obj.groups || [];
      obj.mode = 'view';

      log = $log;
      jbservice = JawboneService;
      modalservice = ModalService;
      promiseService = $q;

      obj.groupSummary = {};
      obj.groupViewer = {};
      obj.patientViewer = {};      
      // obj.downloader = {};

      $log.info('build the groups component..........');

      buildCallbacks(obj, user, GroupsPatientsBuilder, GroupSummObj, PatientsComponentBuilder);
      buildListViewer(obj, GroupObj);
      buildListViewerHeader(obj);      
    };
    return GroupsComponentBuilder;
  }

  function GroupObjFtn($log, ListElementAPIObj) {
    var GroupObj = function(data) {
      this.data = data || {};
      $log.info('group data: ' + JSON.stringify(data));
      this.name = data.name || 'blank';
      this.description = data.description || 'blank';
      this.size = data.members.length || 0;

      this.api = new ListElementAPIObj(this);
      
      // var o = this;
      // o.selected = false;
      // o.deleteMode = false;

      // o.activated = function() {
      //   o.selected = true;
      // };

      // o.deactivated = function() {
      //   o.selected = false;
      // };

      // o.handleEventFtn = function(event, data) {
      //   $log.info('group handle event ftn for event: ' + event);
      //   o.deleteMode = !o.deleteMode;
      // };

      // o.clickedDelete = function() {
      //   $log.info('clicked delete');
      //   o.notifyParent('delete');
      // };

      // o.clickedView = function() {
      //   $log.info('clicked view');
      //   o.selected = !o.selected;
      //   o.notifyParent('view', o.selected);
      // };

    };
    return GroupObj;
  }

  function GroupCtrlFtn($log) {
    var vm = this;
  }

  function groupMgrFtn($log) {
    var directive = {
      restrict: 'E',
        scope: {},
        controller: 'GroupCtrl',
        controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/groups/_group-mgr-tpl.html'
    };
    return directive;   
  }


})();

(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('GroupSummObj', GroupSummObjFtn)
    .controller('GroupSummCtrl', GroupSummCtrlFtn)
    .directive('groupSummary', GroupSummDirFtn);

  function GroupSummObjFtn() {
    var GroupSummObj = function(arg) {
    	var obj = this;
      	obj.actionBar = arg.tpl || 'app/groups/_group-summary-action-bar-tpl.html';
      	obj.group = arg || {};
    };
    return GroupSummObj;
  }

  function GroupSummCtrlFtn($scope, $log) {
    var vm = this;  

    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      if(newval) {
        $log.info('assign patient summ obj : ' + JSON.stringify(newval));
        vm.pso = vm.obj;        
      }
    }); 
  }

  function GroupSummDirFtn() {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'GroupSummCtrl',
      controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/groups/_group-summary-tpl.html'
    };
    return directive;   
  }
})();

 (function() {
  'use strict';

  angular
    .module('jawboneApp')    
    .factory('GroupsPatientsBuilder', GroupsPatientsBuilderFtn)

  var log = null;
  var jbservice = null;
  var modalservice = null;
  var promiseService = null;

  function buildPatientsActionBar(obj) {

    //log.info('the object for the patients is: ' + JSON.stringify(obj, true, 3));

    obj.patientViewer.listobj.headerbar = 'app/groups/_group-patients-action-bar-tpl.html';    
    obj.patientViewer.listobj.headerFtns = {
      addPatientToGroup: function() {
        log.info('implement add patient to group ftn');
        modalservice.onClick({
          tpl : 'app/patient/_patient-notes-viewer-tpl.html'
        })
        .then(function(result) {});
      },
      removePatientFromGroup: function() {
        log.info('implement remove patient from group ftn');
      }
    }    
  }

  function GroupsPatientsBuilderFtn($q, $log, JawboneService, ModalService, PatientsComponentBuilder) {
    var GroupsPatientsBuilder = function(user, userGroup) {
      var obj = this;

      // obj.profile = JawboneService.extractData('profile', user);
      // obj.name = obj.profile.first + ' ' + obj.profile.last;
      // obj.groups = JawboneService.extractData('groups', user);
      // obj.elems = obj.groups || [];
      // obj.mode = 'view';

      promiseService = $q;
      log = $log;
      jbservice = JawboneService;
      modalservice = ModalService;

      obj = new PatientsComponentBuilder(user, userGroup);

      log.info('obj: ' + JSON.stringify(obj));
      log.info('now build the patients group action bar...');

      buildPatientsActionBar(obj);  
      
      return obj;
    };
    return GroupsPatientsBuilder;
  }
})();

(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('GoalsComponentBuilder', GoalsComponentBuilderFtn)
    .factory('GoalsObj', GoalsObjFtn)
    .controller('GoalsCtrl', GoalsCtrl)
    .directive('goals', goalsFtn);

  function GoalsComponentBuilderFtn($log, GoalsObj) {
    
    var GoalsComponentBuilder = function() {
      var obj = this;
    };

    GoalsComponentBuilder.build = function(goalsdata) {
      //$log.info('goalsss data: ' + JSON.stringify(goalsdata));
      return new GoalsObj(goalsdata);
    };

    return GoalsComponentBuilder;
  }

  function GoalsObjFtn($log) {
    var GoalsObj = function(data) {
      $log.info('data: ' + JSON.stringify(data));
      this.data = data || {};
      this.moveSteps = data.move_steps || 0;
      this.sleepTotal = data.sleep_total || 0;
      this.remaining = data.remaining_for_day || {};
      this.sleepRem = this.remaining.sleep_seconds_remaining || 0;
      this.intakeCaloriesRem = this.remaining.intake_calories_remaining || 0;
      this.moveStepsRem = this.remaining.move_steps_remaining || 0;

    };
    return GoalsObj;
  }

  /** @ngInject */
  function GoalsCtrl($log, $scope, GoalsObj) {
    var vm = this;

    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      $log.info('get here?');
      if(newval) {
        vm.go = new GoalsObj(newval);
        $log.info('sleep rem: ' + vm.go.sleepRem);
      }
    }); 
  }	

  function goalsFtn($log) {
    var directive = {
      restrict: 'E',
        scope: {},
        controller: 'GoalsCtrl',
        controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/goals/_goals-tpl.html'
    };
    return directive;   
  }
})();
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

(function() {
  'use strict';

  angular
    .module('jawboneGatewayApp')
    .controller('GatewayCtrl', GatewayCtrl);

  /** @ngInject */
  function GatewayCtrl($log, $scope, ServerMessage, FileSaver, Blob) {

    var vm = this;

    // var content = 'file content for example';
    // var blob = new Blob([ content ], { type : 'text/plain' });
    // vm.url = (window.URL || window.webkitURL).createObjectURL( blob );
    // $log.info('url created: ' + vm.url);

    vm.val = {
      text: 'Hey ho lets go!'
    };

    vm.download = function(text) {
      var data = new Blob([text], { type: 'text/plain;charset=utf-8' });
      FileSaver.saveAs(data, 'text.txt');
    };

    vm.mode = 'patient';
    vm.loginUser = '/login/user';
    vm.loginSuperUser = '/login/superuser';
    vm.loginUserMsg = 'login to view Jawbone data';
    vm.loginSuperUserMsg = 'login to manage patients';

    $log.info('server message: ' + JSON.stringify(ServerMessage));

    vm.credentials =  {
      email: null,
      password : null
    };

    vm.showPatient = function() {
      $log.info('show patient');
      vm.mode = 'patient';
    };

    vm.showTherapist = function() {
      $log.info('show therapist');
      vm.mode = 'therapist';
    };

    vm.getLogin = function() {
      if(vm.mode === 'patient') {
        return vm.loginUser;
      }
      return vm.loginSuperUser;
    };

    vm.getLoginMessage = function() {
      if(vm.mode === 'patient') {
        return vm.loginUserMsg;        
      }
      return vm.loginSuperUserMsg;
    };

    $log.info('gateway ctrl ran');

  }	
})();
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('FriendsObj', FriendsObjFtn)
    .controller('FriendsCtrl', FriendsCtrl)
    .directive('friends', friendsFtn);

  function FriendsObjFtn($log) {
    var FriendsObj = function(data) {
      this.data = data || {};
    };
    return FriendsObj;
  }

  /** @ngInject */
  function FriendsCtrl($log, $scope, FriendsObj) {
    var vm = this;

    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      if(newval) {
        vm.fo = new FriendsObj(vm.obj[1]);
      }
    }); 

  }	

  function friendsFtn($log) {
    var directive = {
      restrict: 'E',
        scope: {},
        controller: 'FriendsCtrl',
        controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/friends/_friends-tpl.html'
    };
    return directive;   
  }
})();
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('FormInputObj', FormInputObjFtn)
    .controller('FormFieldCtrl', FormFieldCtrlFtn)
    .directive('jbvFormField', formFieldFtn)
    .directive('dynamicName', dynamicNameFtn)
    .directive('compareTo', compareToFtn)
    .directive('backgroundImg', backgroundImgFtn)
    .directive('minifier', minifierFtn)
    .directive('expander', expanderFtn)
    .directive('clickElsewhere', clickElsewhereFtn)
    .directive('visibleClickElsewhere', visibleClickElsewhereFtn)
    .directive('testDir', testDirFtn);

  function FormInputObjFtn($log) {
    var FormInputObj = function(obj) {
      var o = this;
      o.regobj = obj || {};
      o.form = o.regobj.form || {};
      o.email = o.form.email;
      o.name = 'email';

      //$log.info('obj: ' + JSON.stringify(obj));
    };
    return FormInputObj;
  }

  function FormFieldCtrlFtn($scope, $log, FormInputObj) {
    var vm = this;    
    vm.name = '';

    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      if(newval) {
        vm.name = newval.name;
        $log.info('name: ' + vm.name);
      }
    });
  }

  function formFieldFtn($log) {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'FormFieldCtrl',
      controllerAs: 'ctrl',
      bindToController: {
      obj : '='
      },
      templateUrl: 'app/form-utils/_form-input-tpl.html'
    };
    return directive;
  }

  function dynamicNameFtn($log, $parse, $compile) {
    var directive = {
      restrict: 'A',
      terminal: true,
      priority: 100000,
      link: function(scope, elem) {
        var name = $parse(elem.attr('dynamic-name'))(scope);
        elem.removeAttr('dynamic-name');
        elem.attr('name', name);
        $compile(elem)(scope);

        $log.info('name ' + name);
      }
    };
    return directive;
  }

  function compareToFtn($log) {
    var directive = {
      require: "ngModel",
      scope: {
        otherModelValue: "=compareTo"
      },
      link: function(scope, element, attributes, ngModel) {
             
        ngModel.$validators.compareTo = function(modelValue) {
            var same = (modelValue == scope.otherModelValue);
            $log.info('compare = ' + modelValue + " with " + scope.otherModelValue + " same: " + same);
            return same;
        };
 
        scope.$watch("otherModelValue", function() {
            ngModel.$validate();
        });
      }    
    };
    return directive;   
  }

  function backgroundImgFtn($log) {
    return function(scope, element, attrs){
        var url = attrs.backgroundImg;
        element.css({
            'background-image': 'url(' + url +')',
            'background-size' : 'cover'
        });
    };
  }

  function minifierFtn($log, $parse) {
    var directive = {
      restrict: 'E',
      scope: {
        text: '=',
        limit: '='
      },
      templateUrl: 'app/form-utils/_minifier-tpl.html',
      link : function(scope, elem, attrs) {
        scope.textLimit = scope.limit;
      }
    };
    return directive;     
  }

  function expanderFtn($log, $parse) {
    var directive = {
      restrict: 'E',
      scope: {
        text: '=',
        limit: '='
      },
      templateUrl: 'app/form-utils/_expander-tpl.html',
      link : function(scope, elem, attrs) {
        scope.textLimit = scope.limit;
        scope.expanded = false;
        scope.expanderClick = function() {
          if(scope.textLimit === scope.limit) {
            scope.textLimit = scope.text.length;
            scope.expanded = true;
          } else {
            scope.textLimit = scope.limit;
            scope.expanded = false;
          }
        };
      }
    };
    return directive;     
  }

  function clickElsewhereFtn($log, $parse, $document) {
    var directive = {
      restrict: 'A',
      link: function(scope, elem, attr) {
        $log.info('RUN CLICK ELSEWHERE');
        
        var ftn = $parse(attr['clickElsewhere']);
        var docClickHdlr = function(event) {

          $log.info('has delete confirm widget class?: ' + elem.hasClass('delete-confirm-widget'));
          $log.info('has ng-hide class?: ' + elem.hasClass('ng-hide'));

          var outside = (elem[0] !== event.target) && (0 === elem.find(event.target).length);
          if(outside) {
            scope.$apply(function() {
              ftn(scope, {});
            });
          }
        };

        $document.on("click", docClickHdlr);
        scope.$on("$destroy", function() {
          $document.off("click", docClickHdlr);
        });
      }
    };
    return directive;
  }

  function visibleClickElsewhereFtn($log, $parse, $document) {
    var directive = {
      restrict: 'A',
      link: function(scope, elem, attr) {
        //$log.info('RUN VISIBLE CLICK ELSEWHERE');
        
        var ftn = $parse(attr['visibleClickElsewhere']);
        var docClickHdlr = function(event) {

          // $log.info('has delete confirm widget class?: ' + elem.hasClass('delete-confirm-widget'));
          // $log.info('has ng-hide class?: ' + elem.hasClass('ng-hide'));

          if(elem.hasClass('ng-hide')) {
            return;
          }

          var outside = (elem[0] !== event.target) && (0 === elem.find(event.target).length);
          if(outside) {
            scope.$apply(function() {
              ftn(scope, {$event: event});
            });
          }
        };

        $document.on("click", docClickHdlr);
        scope.$on("$destroy", function() {
          $document.off("click", docClickHdlr);
        });
      }
    };
    return directive;
  }

  function testDirFtn($log) {
    var directive = {      
      restrict: 'A',
      scope: {},
      // template: '<div>hello</div>',
      link: function(scope, elem, attr) {
        $log.info('MY SIMPLE TEST DIR');
      }
    };
    return directive;
  }

})();
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('FileDownloadObj', FileDownloadObjFtn)
    .controller('FileDownloadCtrl', FileDownloadCtrl)
    .directive('fileDownloader', fileDownloader);

  function FileDownloadObjFtn($q, $log, FileSaver, Blob, JawboneService) {
    var FileDownloadObj = function(arg) {
      var obj = this;
      obj.arg = arg || {};
      obj.name = obj.arg.name || 'text.txt';
      obj.type = obj.arg.type || 'text/plain;charset=utf-8';
      obj.content = obj.arg.content || 'blank content';

      obj.download = function() {
        var data = new Blob([obj.content], { type: obj.type });
        FileSaver.saveAs(data, obj.name);
      };

    };
    return FileDownloadObj;
  }

  function FileDownloadCtrl($scope, $log, FileDownloadObj) {
    var vm = this;
    vm.do = null;

    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      if(newval) {
        vm.do = new FileDownloadObj(newval);
      }
    });
  }

  function fileDownloader() {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'FileDownloadCtrl',
      controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/fileHandler/_file-download-tpl.html'
    };
    return directive;       
  }

})();
(function() {
	'use strict';

	angular
		.module('jawboneApp')
		.factory('ObiDropdownObj', ObiDropdownObjFtn)
    	.controller('ObiDropdownCtrl', ObiDropdownCtrl)
		.directive('obiDropdown', obiDropdown);

	function ObiDropdownObjFtn($log) {
		var ObiDropdownObj = function(data) {
			data = data || {};
			//this.items = data.items || [];
			this.visible = data.visible || false;
			this.headings = data.headings || [];
			//this.items = data.items || [];
			//this.selected = 0;

		};
		return ObiDropdownObj;
	}

    function ObiDropdownCtrl($log, ObiBasicFiltersObject, $rootScope, $scope) {
      	var vm = this; 
      	//m.show = false;
      	vm.visible = false;

      	vm.ddobj = vm.dropdownObj || new ObiBasicFiltersObject();

      	$log.info('dropdown obj: ' + JSON.stringify(vm.dropdownObj));

		vm.show = function() {
			vm.visible = true;
		};

		vm.onDeselect = function() {
			vm.visible = false;
		};

		vm.setSelected = function(idx) {
			vm.ddobj.selectedFilterIdx = idx;
		};


		// 	$scope.$watch("selected", function(value) {
		// 		// scope.isPlaceholder = scope.selected[scope.property] === undefined;
		// 		// scope.display = scope.selected[scope.property];
		// 	});

    }

	function obiDropdown($log) {
	    var directive = {
	    	restrict: 'E',
	      	scope: {},
      		controller: 'ObiDropdownCtrl',
      		controllerAs: 'ctrl',
		    bindToController: {
		    	dropdownObj : '='
		    },
	      	templateUrl: 'app/dropdown/_dropdown-tpl.html'
	    };
	    return directive;

	    //////////////////
	}
})();
(function() {
	 'use strict';

  angular
    .module('jawboneApp')
    .factory('JawboneChartUtils', JawboneChartUtilsFtn)
    .factory('PlotGenerator', PlotGeneratorFtn);

	Date.prototype.addDays = function(days) {
		var dat = new Date(this.valueOf())
		dat.setDate(dat.getDate() + days);
		return dat;
	}

    function findIndexOf(arr, cond, startIdx) {
        startIdx = startIdx || 0;
        var i, x;
        for (var i = startIdx; i < arr.length; i++) {
            x = arr[i];
            if (cond(x)) return parseInt(i);
        }
        return (-1);
    }

    function createDateRange(startDate, endDate, addFn, interval) {

        addFn = addFn || Date.prototype.addDays;
        interval = interval || 1;

        var retVal = [];
        var current = new Date(startDate);

        while (current <= endDate) {
          retVal.push(new Date(current));
          current = addFn.call(current, interval);
        }
        return retVal;
    }

    function JawboneChartUtilsFtn($log) {
        var JawboneChartUtils = function() {
        };
      
        JawboneChartUtils.jawboneToJSDate = function(jbDateNbr) {
            var nbStr = jbDateNbr.toString();
            var year = nbStr.slice(0,4);
            var month = parseInt(nbStr.slice(4,6)) - 1; // javascript dates start from 0
            var day = nbStr.slice(6,8);
            return new Date(year, month, day);
        };        
        return JawboneChartUtils;
    }

    //--------------------------------------------------
    //
    //--------------------------------------------------
    function PlotGeneratorFtn($log, JawboneChartUtils) {
    	var PlotGenerator = function() {
    	};

    	PlotGenerator.createDateRange = createDateRange;

    	function createYAxisPlot(xVal, yAxis) {
    		var result = [];
    		angular.forEach(yAxis, function(value) {
    			//$log.info('xAxis: ' + JSON.stringify(xVal) + ' value: ' + JSON.stringify(value));
    		}, result);
    	}

    	PlotGenerator.createPlot = function(xVals, yAxis) {
    		var result = [];
    		angular.forEach(xVals, function(value) {
    			createYAxisPlot(value, yAxis);
    		}, result);

    		return [];
    	};

        PlotGenerator.createEmpty = function(date, makeFtn) {
            var ftn = makeFtn || function() {
                return 0;
            };

            return { x : date, y : [ftn() || 0 ] };
        }

        PlotGenerator.addToArray = function(arr, index, level, element) {
            var yPlotArr = arr[index].y;
            yPlotArr[level] = element;
        }

        PlotGenerator.printit = function(result) {
            angular.forEach(result, function(elem) {
                //$log.info('date: ' + elem.x.toDateString() + " val: " + elem.y);
            }, result);
        };

        //PlotGenerator.preparePlot = function(start, end, data, plotnames) {                    
        PlotGenerator.preparePlot = function(data, plotParams) {    
            $log.info('plot names: ' + JSON.stringify(plotParams));       
            var pname = plotParams.plotName || [ 'blank' ];
            pname = (Array.isArray(pname) ? pname : [pname]);
            var plotnames = pname;
            plotnames.unshift('date');

            var arr = [];
            //var dateArr = createDateRange(start, end); 
            var start = plotParams.range[0];
            var end = plotParams.range[1];
            var dateArr = createDateRange(start, end); 
            var idx = 0;

            // create an empty array between ranges
            angular.forEach(dateArr, function(value) {
                this.push(PlotGenerator.createEmpty(value));
            }, arr); 

            //$log.info('dae arr: ' + JSON.stringify(dateArr));
            //data = data.reverse();

            // populate for every data entry within the date range
            angular.forEach(data, function(value) {            
                //find the index into the date array to add this 'value'
                idx = findIndexOf(dateArr, function(elem) {
                    var jsdate = JawboneChartUtils.jawboneToJSDate(value.date);
                    // $log.info('elem: ' + elem);
                    // $log.info('date is ' + elem.toDateString() + ' jsdate: ' + jsdate.toDateString());
                    return (elem.toDateString() === jsdate.toDateString());  
                }, idx);     

                // $log.info('value: ' + JSON.stringify(value));
                // $log.info('position in date: ' + idx);

                if(idx === -1) {
                    return;
                } else {
                    //$log.info('value to add is : ' + JSON.stringify(value));
                    PlotGenerator.addToArray(this, idx, 0, value);
                }
            }, arr);

            return { names: plotnames, data: arr };
        };        

        PlotGenerator.appendPlot = function(original, dataToAppend, plotParams) {
            var arrData = original.data;
            // var start = arrData[0].x;
            // var end = arrData[arrData.length - 1].x;
            var append = PlotGenerator.preparePlot(dataToAppend, plotParams);
            var appArray = append.data;

            for(var i = 0; i < arrData.length; i++) {
                arrData[i].y.push(appArray[i].y[0]);
            }

            // add the labels
            append.names.shift();
            original.names = original.names.concat(append.names);                
            return original;
        };

    	return PlotGenerator;
    }
})();
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('ChartManager', ChartManagerFtn)
    .factory('ChartObj', ChartObjFtn)
    .controller('ChartCtrl', ChartCtrl)
    .directive('chart', chartFtn);

  function ChartManagerFtn($log, ModalService, UserSelectorObj, ChartObj, JawboneService) {
    var ChartManager = function(chartdata, onStateChange) {
      var obj = this;
      obj.chart = new ChartObj(chartdata, onStateChange);

      obj.clickFtn = chartdata.clickFtn || function() {        
        // create modal
        ModalService.onClick(new UserSelectorObj(function(userChoice) {
          JawboneService.getUser(userChoice.data._id)
          .then(function(response) {
            return chartdata.extractFromUser(response)
          })
          .then(function(data) {
            //$log.info('got data: ' + JSON.stringify(data));
            $log.info('user name: ' + JSON.stringify(userChoice.data.profile.first));
            obj.chart.addCompareData(data.data, userChoice.data.profile);
            JawboneService.setUser(userChoice);            
          });
        }))
        .then(function(result) {
        });
      };

      obj.onClick = function() {
        obj.clickFtn();
      };

    };
    return ChartManager;
  }

  function ChartObjFtn($log, PlotGenerator) {
    var ChartObj = function(data, onStateChange) {
      var obj = this;
      obj.data = data || {};
      obj.onStateChange = onStateChange || function(newState) {
        $log.info('supply a state change function to ChartObj');
      };

      obj.chart = {};
      obj.chart.type = "LineChart";
      obj.chartdata = [];
      obj.chart.options = {
        // 'title': 'blank',
        'chartArea': { 'left':'40','top':'40','width':'60%','height':'75%'},
        'backgroundColor.fill': '#00ffff',
        'explorer': { 
          'actions': ['dragToZoom', 'rightClickToReset'],
          'keepInBounds': true
        },
        'hAxis' : {
          'title': 'date'
        },
        'vAxis' : {
          'title' : 'minutes',
          'count' : 60
        }
      };

      // get the plot names
      obj.plots = data.getPlotNames();
      obj.graphData = [];

      // set the callback to access the graph data
      data.getGraphDataCB = function() {
          return obj.chartdata;
      };

      var extractFtn = data.extract || function(obj, field) {        
        return 0;
      };

      obj.onStateChange('loading');
      data.getElementsObj.get()
      .then(function(result) {
        processElements(result.data, data.makePlotParams());
      });

      function convertToArr(graphData, yValueField) {
        var arrData = [];
        arrData.push(graphData.names); // add the header
        angular.forEach(graphData.data, function(val) {
          var elem = [];
          elem.push(val.x); // push the date 
          
          angular.forEach(val.y, function(yplot) {
            elem.push(extractFtn(yplot, yValueField));
          },val.y);

          //elem.push(extracFtn(val.y[0], yValueField)); // push the y axis value
          this.push(elem);
        }, arrData);
        return arrData;
      }

      function removeNullPoints(arr) {
        for(var i = 1; i < arr.length; i++) {
          var elem = arr[i];
          if(!elem[1]) elem[1] = 0;
        }        
      }

      function processElements(elems, plotParams) {

        //$log.info('elements: ' + JSON.stringify(elems));

        obj.elements = [];
        angular.forEach(elems, function(value) {
          this.push(data.makeElement(value));
        }, obj.elements);

        data.preprocessElements(obj.elements);

        // preapare plot data
        //$log.info('plot params: ' + JSON.stringify(plotParams));
        obj.graphData = PlotGenerator.preparePlot(obj.elements, plotParams);  
        obj.selectPlot(0, obj.graphData);
      }

      obj.selectPlot = function(index, gdata) {
        gdata = gdata || obj.graphData;
        obj.selected = obj.plots[index];
        obj.chartdata = convertToArr(obj.graphData, index);

        removeNullPoints(obj.chartdata);

        //obj.chart.options.title = obj.selected;
        obj.chart.data = google.visualization.arrayToDataTable(obj.chartdata);
        obj.onStateChange('ready');
      };

      obj.addCompareData = function(dataToAdd, userProfile) {
          var result = [];
          angular.forEach(dataToAdd, function(val) {
            this.push(data.makeElement(val));
          }, result);      
          var plotParams = data.makePlotParams(userProfile);
          obj.graphData = PlotGenerator.appendPlot(obj.graphData, result, plotParams);   
          obj.selectPlot(0, obj.graphData); 
      };

    };
    return ChartObj;
  }

  /** @ngInject */
  function ChartCtrl($log, $scope, ChartManager, googleChartApiPromise) {
    var vm = this;
    vm.state = 'loading';

    function onLoadedFtn() {
      $log.info('google chart loaded now');
      vm.co = new ChartManager(vm.obj, function(newState) {
        vm.state = newState;
      });
    };

    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      if(newval) {
        googleChartApiPromise.then(onLoadedFtn);
      }
    }); 

  }	

  function chartFtn($log) {
    var directive = {
      restrict: 'E',
        scope: {},
        controller: 'ChartCtrl',
        controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/chart/_chart-tpl.html'
    };
    return directive;   
  }
})();
angular.module("jbtemplates").run(["$templateCache", function($templateCache) {$templateCache.put("app/_default-confirm-modal-tpl.html","<h3>{{ctrl.resolveArg.msg}}</h3>");
$templateCache.put("app/_default-modal-tpl.html","default modal template");
$templateCache.put("app/_modal-frame-tpl.html","<div class=\"modal-body\" id=\"modal-body\" style=\"padding: 4px;\"><div ng-include=\"ctrl.template\"></div></div><div class=\"modal-footer\" style=\"padding: 4px; background: rgba(221, 221, 221, 0.3);\"><div class=\"btn-group\"><div class=\"btn btn-default\" ng-click=\"ctrl.cancel()\">Cancel</div><div class=\"btn btn-default\" ng-disabled=\"true\">&nbsp;</div><div class=\"btn btn-default\" ng-click=\"ctrl.ok()\">OK</div></div></div>");
$templateCache.put("app/main.html","<div class=\"container\"><div ui-view=\"\"></div></div>");
$templateCache.put("app/user.html","<div class=\"container\"><a href=\"/login/jawbone\">login jawbone</a><div ui-view=\"\"></div></div>");
$templateCache.put("app/chart/_chart-tpl.html","<loader obj=\"ctrl.co.loaderMessage\" ng-show=\"ctrl.state !== \'ready\'\"></loader><div class=\"chart-area animated\" ng-show=\"ctrl.state === \'ready\'\"><div class=\"chart-header\"><span uib-dropdown=\"\"><a class=\"btn btn-default\" uib-dropdown-toggle=\"\">{{ctrl.co.chart.selected || \'select a plot...\'}} <span class=\"caret\"></span></a><ul uib-dropdown-menu=\"\"><li ng-repeat=\"item in ctrl.co.chart.plots track by $index\"><span ng-click=\"ctrl.co.chart.selectPlot($index)\">{{item}}</span></li></ul></span> <span class=\"btn btn-default\" ng-click=\"ctrl.co.onClick()\">compare with</span></div><div class=\"chart-body\"><div class=\"chart-element\"><div google-chart=\"\" chart=\"ctrl.co.chart.chart\" style=\"height:300px; width:570px; border: 1px solid #fff;\"></div></div></div></div>");
$templateCache.put("app/dropdown/_default-dropdown-tpl.html","<span class=\"glyphicon glyphicon-menu-hamburger obi-default-dropdown-box\"></span>");
$templateCache.put("app/dropdown/_dropdown-tpl.html","<div class=\"obi-dropdown-container\" ng-class=\"{ \'obi-show\': ctrl.visible }\" obi-click-elsewhere=\"ctrl.onDeselect()\"><div class=\"obi-dropdown-display\" ng-click=\"ctrl.show();\" ng-class=\"{ \'clicked\': ctrl.visible }\"><span ng-include=\"ctrl.ddobj.templateUrl\"></span></div><div class=\"obi-dropdown-list\"><ul><li ng-repeat=\"$item in ctrl.ddobj.filters track by $index\" ng-click=\"ctrl.setSelected($index)\"><h5 ng-if=\"ctrl.ddobj.selectedFilterIdx === $index\">{{$item}} <small><span class=\"glyphicon glyphicon-ok\"></span></small></h5><h5 ng-if=\"ctrl.ddobj.selectedFilterIdx !== $index\">{{$item}} &nbsp;</h5></li></ul></div></div>");
$templateCache.put("app/fileHandler/_file-download-tpl.html","<textarea class=\"download-textarea\" ng-model=\"ctrl.do.content\" name=\"textarea\" rows=\"20\">\r\n</textarea> <a href=\"\" class=\"btn btn-primary btn-small\" ng-click=\"ctrl.do.download()\">Download</a>");
$templateCache.put("app/form-utils/_expander-tpl.html","<span>{{text | limitTo: textLimit }}</span> <span ng-if=\"text.length > limit\"><a ng-if=\"expanded\" ng-click=\"expanderClick()\" style=\"font-size: 90%;\">...(less)</a> <a ng-if=\"!expanded\" ng-click=\"expanderClick()\" style=\"font-size: 90%;\">...(more)</a></span>");
$templateCache.put("app/form-utils/_form-input-tpl.html","<div class=\"form-group jbv-form-group\" ng-class=\"{ \'has-error\' : ctrl.fo.email.$invalid && !ctrl.fo.email.$pristine }\"><label for=\"email\">Email address:</label> {{ctrl.fo.email | json}}<p>{{ctrl.fo.name}}</p><p>{{ctrl.name}}</p><div class=\"jbv-input\"><p>{{ctrl.fo.name}}</p><input type=\"email\" name=\"{{ctrl.fo.name}}\" class=\"form-control\" id=\"email\" required=\"\" ng-minlength=\"5\" ng-model=\"ctrl.fo.model.email\"><div ng-if=\"ctrl.fo.email.$valid\" class=\"jbv-input-status-ok\"><span class=\"glyphicon glyphicon-ok ok\"></span></div><div ng-if=\"ctrl.fo.email.$dirty && ctrl.fo.email.$invalid\" class=\"jbv-input-status-bad\"><span class=\"glyphicon glyphicon-remove invalid\"></span></div></div><p ng-show=\"ctrl.fo.email.$invalid && ctrl.fo.email.$touched\" class=\"help-block jbv-input-status-msg\">invalid email!</p></div><div class=\"form-group\" ng-class=\"{ \'has-error\' : registerForm.emailrt.$invalid && !registerForm.emailrt.$pristine }\"><label for=\"email\">Confirm Email address:</label> <input type=\"email\" name=\"emailrt\" class=\"form-control\" id=\"emailrt\" compare-to=\"gateway.credentials.email\" ng-model=\"register.emailrt\"><p ng-show=\"registerForm.emailrt.$invalid && registerForm.emailrt.$touched\">Emails do not match!</p></div>");
$templateCache.put("app/form-utils/_minifier-tpl.html","<span>{{text | limitTo: textLimit }}</span> <span ng-if=\"text.length > limit\"><span style=\"font-size: 90%;\">...</span></span>");
$templateCache.put("app/friends/_friends-tpl.html","<div><h3>Friends</h3><p>Data: {{ctrl.fo.data | json}}</p></div>");
$templateCache.put("app/gateway/about.html","<h4>our about page</h4>");
$templateCache.put("app/gateway/gateway-main.html","<div ui-view=\"\"></div>");
$templateCache.put("app/gateway/home.html","<div id=\"mainarea\"><div id=\"sidebar\"><span class=\"btn btn-primary-outline\" ng-click=\"gateway.showPatient()\" ng-class=\"{ \'btn-default\' : gateway.mode === \'patient\'}\">Patient</span> <span class=\"btn btn-primary-outline\" ng-click=\"gateway.showTherapist()\" ng-class=\"{ \'btn-default\' : gateway.mode === \'therapist\'}\">Therapist</span><hr><div class=\"panel panel-default\" ng-show=\"gateway.mode === \'patient\' || gateway.mode === \'therapist\'\"><div class=\"panel-heading\">{{gateway.getLoginMessage()}}</div><div class=\"panel-body\"><form name=\"loginForm\" class=\"form-area\" action=\"{{gateway.getLogin()}}\" method=\"post\" novalidate=\"\"><div class=\"form-group\"><label for=\"email\">Email address:</label> <input type=\"email\" name=\"email\" class=\"form-control\" id=\"email\"></div><div class=\"form-group\"><label for=\"pwd\">Password:</label> <input type=\"password\" name=\"password\" class=\"form-control\" id=\"pwd\"></div><div class=\"checkbox\"><label><input type=\"checkbox\"> Remember me</label></div><button type=\"submit\" class=\"btn btn-default\">Login</button></form></div></div><div class=\"panel panel-default\" ng-show=\"gateway.mode === \'patient\'\"><div class=\"panel-heading\">or register as a new user</div><div class=\"panel-body\"><form name=\"registerForm\" class=\"form-area\" action=\"/register/user\" method=\"post\" novalidate=\"\"><div class=\"form-group jbv-form-group\" ng-class=\"{ \'has-error\' : registerForm.email.$invalid && !registerForm.email.$pristine }\"><label for=\"email\">Email address:</label><div class=\"jbv-input\"><input type=\"email\" name=\"email\" class=\"form-control\" id=\"email\" required=\"\" ng-minlength=\"5\" ng-model=\"gateway.credentials.email\"><div ng-if=\"registerForm.email.$touched && registerForm.email.$valid\" class=\"jbv-input-status-ok\"><span class=\"glyphicon glyphicon-ok ok\"></span></div><div ng-if=\"registerForm.email.$touched && registerForm.email.$invalid\" class=\"jbv-input-status-bad\"><span class=\"glyphicon glyphicon-remove invalid\"></span></div></div><p ng-show=\"registerForm.email.$invalid && registerForm.email.$touched\" class=\"help-block jbv-input-status-msg\">invalid email!</p></div><div class=\"form-group jbv-form-group\" ng-class=\"{ \'has-error\' : registerForm.emailrt.$invalid && !registerForm.emailrt.$pristine }\"><label for=\"email\">Confirm Email address:</label><div class=\"jbv-input\"><input type=\"email\" name=\"emailrt\" class=\"form-control\" id=\"emailrt\" compare-to=\"gateway.credentials.email\" ng-model=\"register.emailrt\"><div ng-if=\"registerForm.emailrt.$touched && registerForm.emailrt.$valid\" class=\"jbv-input-status-ok\"><span class=\"glyphicon glyphicon-ok ok\"></span></div><div ng-if=\"registerForm.emailrt.$touched && registerForm.emailrt.$invalid\" class=\"jbv-input-status-bad\"><span class=\"glyphicon glyphicon-remove invalid\"></span></div></div><p ng-show=\"registerForm.emailrt.$invalid && registerForm.emailrt.$touched\" class=\"help-block jbv-input-status-msg\">Emails do not match!</p></div><div class=\"form-group jbv-form-group\" ng-class=\"{ \'has-error\' : registerForm.password.$invalid && registerForm.password.$touched }\"><label for=\"pwd\">Password:</label><div class=\"jbv-input\"><input type=\"password\" name=\"password\" class=\"form-control\" id=\"pwd\" ng-model=\"gateway.credentials.password\" ng-minlength=\"4\" ng-maxlength=\"20\"><div ng-if=\"registerForm.password.$touched && registerForm.password.$valid\" class=\"jbv-input-status-ok\"><span class=\"glyphicon glyphicon-ok ok\"></span></div><div ng-if=\"registerForm.password.$touched && registerForm.password.$invalid\" class=\"jbv-input-status-bad\"><span class=\"glyphicon glyphicon-remove invalid\"></span></div></div><p ng-show=\"registerForm.password.$error.minlength && registerForm.password.$touched\" class=\"help-block jbv-input-status-msg\">password is too short.</p><p ng-show=\"registerForm.password.$error.maxlength\" class=\"help-block jbv-input-status-msg\">password is too long.</p></div><div class=\"form-group jbv-form-group\" ng-class=\"{ \'has-error\' : registerForm.pwdrt.$invalid && !registerForm.pwdrt.$pristine }\"><label for=\"pwdrt\">Confirm Password:</label><div class=\"jbv-input\"><input type=\"password\" name=\"pwdrt\" class=\"form-control\" id=\"pwdrt\" compare-to=\"gateway.credentials.password\" ng-model=\"register.pwdrt\"><div ng-if=\"registerForm.password.$touched && registerForm.pwdrt.$valid\" class=\"jbv-input-status-ok\"><span class=\"glyphicon glyphicon-ok ok\"></span></div><div ng-if=\"registerForm.pwdrt.$touched && registerForm.pwdrt.$invalid\" class=\"jbv-input-status-bad\"><span class=\"glyphicon glyphicon-remove invalid\"></span></div></div><p ng-show=\"registerForm.pwdrt.$invalid && registerForm.pwdrt.$touched\" class=\"help-block jbv-input-status-msg\">Passwords do not match!</p></div><button type=\"submit\" class=\"btn btn-default\" ng-disabled=\"registerForm.$invalid || registerForm.$pristine\">Register</button></form></div></div></div><div id=\"jbv-maincontent\"></div></div>");
$templateCache.put("app/goals/_goals-tpl.html","<div><h3>Goals</h3><p>Sleep Total: {{ctrl.go.sleepTotal}}</p><p>Move Steps: {{ctrl.go.moveSteps}}</p><p>Sleep Remaining: {{ctrl.go.sleepRem}}</p><p>Intake Calories Remaining: {{ctrl.go.intakeCaloriesRem | number:2}}</p><p>Move Steps Remaining: {{ctrl.go.moveStepsRem}}</p></div>");
$templateCache.put("app/groups/_group-element-tpl.html","<div class=\"user-list-element\" ng-class=\"{\'active\' : ctrl.obj.element.api.selected, \'deleteMode\' : ctrl.obj.element.api.deleteMode }\" ng-click=\"ctrl.obj.element.api.clickedView()\"><img ng-src=\"assets/group.png\" height=\"100px\" width=\"100px\"><div class=\"user-details\"><div class=\"name\">{{ctrl.obj.element.name}}</div><div class=\"features\"><p>{{ctrl.obj.element.description}}</p><p>{{ctrl.obj.element.size}} members</p></div></div><div ng-show=\"ctrl.obj.element.api.deleteMode\" class=\"delete-widget\"><p><span class=\"glyphicon glyphicon-remove faded-glyph\"></span></p></div><div ng-show=\"ctrl.obj.element.api.confirmDeleteMode\" class=\"delete-confirm-widget slider-anim\" visible-click-elsewhere=\"ctrl.obj.element.api.cancel($event)\"><span class=\"btn btn-default\" ng-click=\"ctrl.obj.element.api.delete($event)\">confirm</span> <span class=\"btn btn-default\" ng-click=\"ctrl.obj.element.api.cancel($event)\">cancel</span></div></div>");
$templateCache.put("app/groups/_group-header-bar-tpl.html","<div style=\"padding: 3px; border-top: 1px solid #ddd;\"><div class=\"btn-group\" style=\"float: right;\"><div class=\"btn btn-default\" ng-click=\"ctrl.obj.listobj.headerFtns.createGroup()\"><span class=\"glyphicon glyphicon-user faded-glyph\"></span> create group</div><div class=\"btn btn-default\" ng-click=\"ctrl.obj.listobj.headerFtns.deleteGroups()\"><span class=\"glyphicon glyphicon-remove faded-glyph\"></span> remove groups</div></div><div style=\"clear: both;\"></div></div>");
$templateCache.put("app/groups/_group-mgr-tpl.html","<div class=\"patient-area\" ng-if=\'ctrl.obj.mode === \"view\"\'><listviewer obj=\"ctrl.obj.groupViewer\"></listviewer></div><div class=\"patient-area\" ng-if=\'ctrl.obj.mode === \"edit\"\'><group-summary obj=\"ctrl.obj.groupSummary\"></group-summary><patient-mgr obj=\"ctrl.obj.patients\"></patient-mgr></div>");
$templateCache.put("app/groups/_group-patients-action-bar-tpl.html","<div class=\"btn-group\" style=\"float: right;\"><div class=\"btn btn-default\" ng-click=\"ctrl.pso.parent.addPatient()\"><span class=\"glyphicon glyphicon-user faded-glyph\"></span> add patient to group</div><div class=\"btn btn-default\" ng-click=\"ctrl.pso.parent.removePatients()\"><span class=\"glyphicon glyphicon-remove faded-glyph\"></span> remove patient from group</div></div><div style=\"clear: both;\"></div>");
$templateCache.put("app/groups/_group-summary-action-bar-tpl.html","<div class=\"btn btn-default\" ng-click=\"ctrl.pso.parent.switchView()\" style=\"float : left;\"><span class=\"glyphicon glyphicon-th-list faded-glyph\"></span> back to groups view</div><div class=\"btn-group\" style=\"float: right;\"><div class=\"btn btn-default\" ng-click=\"ctrl.pso.parent.addPatient()\"><span class=\"glyphicon glyphicon-pencil faded-glyph\"></span> edit group</div></div><div style=\"clear: both;\"></div>");
$templateCache.put("app/groups/_group-summary-tpl.html","<div class=\"patient-header\"><div class=\"patient-info\"><img ng-src=\"{{ctrl.pso.user.profile.image | defaultGroup }}\" height=\"100px\" width=\"100px\"><div class=\"user-details\"><div class=\"name\">{{ctrl.pso.group.name}}</div><div class=\"features\"><p>{{ctrl.pso.group.description}}</p><p>{{ctrl.pso.group.members.length}} members</p></div></div></div><hr><div style=\"clear: both;\"></div><div ng-include=\"ctrl.pso.actionBar\"></div></div>");
$templateCache.put("app/list-viewer/_default-headerbar-tpl.html","<div class=\"trends-header-bar\"><span>&nbsp;</span></div>");
$templateCache.put("app/list-viewer/_default-lve-tpl.html","<div class=\"trends-element-style\"><span>default</span></div>");
$templateCache.put("app/list-viewer/_list-viewer-tpl.html","<loader obj=\"ctrl.lo.listobj.loaderMessage\" ng-show=\"ctrl.state === \'loading\'\"></loader><div class=\"list-view-box animated\" ng-show=\"ctrl.state === \'ready\'\"><div class=\"heading\">{{ctrl.lo.listobj.heading}}</div><div class=\"filter-container\" ng-show=\"ctrl.hasFilter\"><input type=\"text\" class=\"form-control\" placeholder=\"search for...\" ng-model=\"searchtext\"></div><p></p><header-bar tpl=\"ctrl.lo.listobj.headerbar\" obj=\"ctrl.lo.listobj\"></header-bar><div id=\"listviewerbox\" class=\"list-viewer-elements\" mouse-wheel-up=\"ctrl.didMouseWheelUp()\" mouse-wheel-down=\"ctrl.didMouseWheelDown()\"><ul><li ng-repeat=\"elem in ctrl.lo.listobj.elements track by $index\"><lvelem tpl=\"ctrl.lo.listobj.template\" obj=\"elem\" i=\"{{$index}}\"></lvelem></li></ul></div><div class=\"scroll-control\" ng-show=\"ctrl.hasScrollers\"><span class=\"btn btn-default scroll-button\" ng-click=\"ctrl.back()\" ng-disabled=\"ctrl.atStart()\"><span class=\"glyphicon glyphicon-chevron-up\"></span></span> <span class=\"btn btn-default scroll-button\" ng-click=\"ctrl.forward()\" ng-disabled=\"ctrl.atEnd()\"><span class=\"glyphicon glyphicon-chevron-down\"></span></span></div></div>");
$templateCache.put("app/loaders/_basic-spinner-tpl.html","<div class=\"loader\"></div>");
$templateCache.put("app/loaders/_loader-frame-tpl.html","<div class=\"loader-area\"><div class=\"loader-header\">{{ctrl.message}}</div><div class=\"loader-body loader-outer\"><div class=\"loader-inner\"><div ng-include=\"ctrl.loader\"></div></div></div></div>");
$templateCache.put("app/loaders/_rectangles-tpl.html","<div class=\"spinner\"><div class=\"rect1\"></div><div class=\"rect2\"></div><div class=\"rect3\"></div><div class=\"rect4\"></div><div class=\"rect5\"></div></div>");
$templateCache.put("app/moods/_moods-tpl.html","<div><h3>Moods</h3><p>Data: {{ctrl.mo.data | json}}</p></div>");
$templateCache.put("app/moves/_move-tpl.html","<p>date : {{ctrl.mo.date | jbDate}} title : {{ctrl.mo.title}}</p>");
$templateCache.put("app/moves/_moves-tpl.html","<div><h3>Moves</h3><div ng-repeat=\"elem in ctrl.mo.elements\"><move obj=\"elem\"></move></div></div>");
$templateCache.put("app/notes-viewer/_notes-element-tpl.html","<div class=\"notes-element-style\" ng-class=\"{\'active\' : ctrl.obj.element.selected }\"><span>{{ctrl.obj.element.creationDate | date}}</span> <span>{{ctrl.obj.element.owner.profile.first}} {{ctrl.obj.element.owner.profile.last}}</span><div style=\"clear: both;\"></div><span><minifier text=\"ctrl.obj.element.text\" limit=\"60\"></minifier></span><div style=\"float: right;\" class=\"btn btn-primary-outline glyphicon glyphicon-remove faded-glyph\" ng-click=\"ctrl.obj.element.delete()\"></div></div>");
$templateCache.put("app/notes-viewer/_notes-header-tpl.html","<div class=\"jbv-new-note-hdr\"><div class=\"jbv-new-note-area\" ng-if=\"ctrl.obj.listobj.createMode()\"><textarea class=\"notes-textarea\" ng-model=\"ctrl.obj.listobj.tempnote.text\" name=\"textarea\" rows=\"5\" placeholder=\"create note...\">\r\n		</textarea><div style=\"float: right; margin-right: 14px; padding: 3px;\"><div class=\"btn-group\"><div class=\"btn btn-default\" ng-click=\"ctrl.obj.listobj.cancelNote()\" ng-disabled=\"!ctrl.obj.listobj.tempnote.text\">clear</div><div class=\"btn btn-default\" ng-disabled=\"true\">&nbsp;</div><div class=\"btn btn-default\" ng-click=\"ctrl.obj.listobj.createNote()\" ng-disabled=\"!ctrl.obj.listobj.tempnote.text\">save</div></div></div><div style=\"clear: both;\"></div></div><div class=\"jbv-new-note-area\" ng-if=\"ctrl.obj.listobj.editMode()\"><textarea class=\"notes-textarea\" ng-model=\"ctrl.obj.listobj.tempnote.text\" name=\"textarea\" rows=\"5\" placeholder=\"update note...\">\r\n		</textarea><div style=\"float: right; margin-right: 14px; padding: 3px;\"><div class=\"btn-group\"><div class=\"btn btn-default\" ng-click=\"ctrl.obj.listobj.baseFtns.deselectAll()\">cancel</div><div class=\"btn btn-default\" ng-disabled=\"true\">&nbsp;</div><div class=\"btn btn-default\" ng-click=\"ctrl.obj.listobj.updateNote()\" ng-disabled=\"!ctrl.obj.listobj.tempnote.text\">update</div></div></div><div style=\"clear: both;\"></div></div></div>");
$templateCache.put("app/notes-viewer/_notes-viewer-tpl.html","<listviewer obj=\"ctrl.o.notes\"></listviewer>");
$templateCache.put("app/patient/_patient-element-tpl.html","<div class=\"user-list-element\" ng-class=\"{\'active\' : ctrl.obj.element.selected }\" ng-click=\"ctrl.obj.element.api.clickedView()\"><img ng-src=\"assets/users.png\" height=\"100px\" width=\"100px\"><div class=\"user-details\"><div class=\"name\">{{ctrl.obj.element.first}} {{ctrl.obj.element.last}}</div><div class=\"features\"><p>Weight: {{ctrl.obj.element.weight | number: 2}}</p><p>Gender: {{ctrl.obj.element.gender}}</p><p>Height: {{ctrl.obj.element.height}}</p></div></div></div>");
$templateCache.put("app/patient/_patient-mgr-tpl.html","<div class=\"patient-area\" ng-if=\'ctrl.obj.mode === \"view\"\'><listviewer obj=\"ctrl.obj.patientViewer\"></listviewer></div><div class=\"patient-area\" ng-if=\'ctrl.obj.mode === \"edit\"\'><patient-summary obj=\"ctrl.obj.patientSummary\"></patient-summary><div ng-if=\"ctrl.obj.showWindow === true\"><h3>show this</h3></div><chart obj=\"ctrl.obj.sleepsChart\"></chart><listviewer obj=\"ctrl.obj.sleepsViewer\"></listviewer><notes-viewer obj=\"\" <=\"\" notes-viewer=\"\"></notes-viewer></div>");
$templateCache.put("app/patient/_patient-notes-viewer-tpl.html","<notes-viewer obj=\"\" <=\"\" notes-viewer=\"\"></notes-viewer>");
$templateCache.put("app/patient/_patient-summary-action-bar-tpl.html","<div class=\"btn btn-default\" ng-click=\"ctrl.pso.parent.switchView()\" style=\"float : left;\"><span class=\"glyphicon glyphicon-th-list faded-glyph\"></span> back to patients view</div><div class=\"btn-group\" style=\"float: right;\"><div class=\"btn btn-default\" ng-click=\"ctrl.pso.parent.showPatientNotes()\"><span class=\"glyphicon glyphicon-list-alt faded-glyph\"></span> show patient notes</div><div class=\"btn btn-default\" ng-click=\"ctrl.pso.parent.downloadToCSV()\"><span class=\"glyphicon glyphicon-stats faded-glyph\"></span> download to csv file</div></div><div style=\"clear: both;\"></div>");
$templateCache.put("app/patient/_patient-summary-tpl.html","<div class=\"patient-header\"><div class=\"patient-info\"><img ng-src=\"{{ctrl.pso.user.profile.image | defaultPatient }}\" height=\"100px\" width=\"100px\"><div class=\"user-details\"><div class=\"name\">{{ctrl.pso.user.profile.first}} {{ctrl.pso.user.profile.last}}</div><div class=\"features\"><p>Weight: {{ctrl.pso.user.profile.weight | number: 2}}</p><p>Gender: {{ctrl.pso.user.profile.gender}}</p><p>Height: {{ctrl.pso.user.profile.height}}</p></div></div></div><hr><div style=\"clear: both;\"></div><div ng-include=\"ctrl.pso.actionBar\"></div></div>");
$templateCache.put("app/profile/_sleeps-element-tpl.html","<div class=\"trends-element-style\">date : {{ctrl.obj.date | jbDate}} title : {{ctrl.obj.title}} sounds : {{ctrl.obj.sounds}} awakenings : {{ctrl.obj.awakenings}} light : {{ctrl.obj.light}}</div>");
$templateCache.put("app/profile/friends.html","friends");
$templateCache.put("app/profile/moves.html","");
$templateCache.put("app/profile/profile-main.html","<div class=\"profile-side-bar\"><user obj=\"profile.userprofile\"></user><ul><li><a ui-sref=\"profile.sleeps\"><span class=\"glyphicon glyphicon-bed\"></span> Sleeps</a></li><li><a ui-sref=\"profile.friends\"><span class=\"glyphicon glyphicon-user\"></span> Friends</a></li><li><a ui-sref=\"profile.moves\"><span class=\"glyphicon glyphicon-transfer\"></span> Moves</a></li><li><a ui-sref=\"profile.trends\"><span class=\"glyphicon glyphicon-stats\"></span> Trends</a></li></ul></div><div class=\"profile-main-panel slide-eff\" ui-view=\"\"></div>");
$templateCache.put("app/profile/sleeps.html","<chart obj=\"profile.sleepschart\"></chart><listviewer obj=\"profile.sleeps\"></listviewer>");
$templateCache.put("app/profile/trends.html","<chart obj=\"profile.trendschart\"></chart><listviewer obj=\"profile.trends\"></listviewer>");
$templateCache.put("app/profile/user.html","");
$templateCache.put("app/recent-users/_recent-users-tpl.html","");
$templateCache.put("app/side-menu/_side-menu-tpl.html","side menu tempate");
$templateCache.put("app/sleeps/_sleeps-chart-download-tpl.html","<h3>Sleeps Data as CSV</h3><file-downloader obj=\"ctrl.resolveArg.downloader\"></file-downloader>");
$templateCache.put("app/sleeps/_sleeps-element-tpl.html","<div class=\"trends-element-style\" ng-class=\"{\'active\' : ctrl.obj.element.selected }\"><span>{{ctrl.obj.element.date | jbDate}}</span> <span>{{ctrl.obj.element.title | minutesConverter:\'hrs-mins\'}}</span> <span>{{ctrl.obj.element.sounds}}</span> <span>{{ctrl.obj.element.awakenings}}</span> <span>{{ctrl.obj.element.light}}</span></div>");
$templateCache.put("app/sleeps/_sleeps-header-tpl.html","<div class=\"trends-header-bar\"><span>date</span> <span>duration</span> <span>sounds</span> <span>awakenings</span> <span>light</span></div>");
$templateCache.put("app/superuser/groups.html","<group-mgr obj=\"profile.groups\"></group-mgr>");
$templateCache.put("app/superuser/patients.html","<patient-mgr obj=\"profile.patients\"></patient-mgr>");
$templateCache.put("app/superuser/profile-main.html","<div class=\"profile-side-bar\"><user obj=\"profile.userprofile\"></user><ul><li><a ui-sref=\"profile.groups\"><span class=\"glyphicon glyphicon-bed\"></span> Groups ({{profile.userprofile.profiledata.stats.nbrGroups}})</a></li><li><a ui-sref=\"profile.patients\"><span class=\"glyphicon glyphicon-user\"></span> Patients ({{profile.userprofile.profiledata.stats.nbrPatients | json}})</a></li><li><a ui-sref=\"profile.moves\"><span class=\"glyphicon glyphicon-transfer\"></span> Moves</a></li><li><a ui-sref=\"profile.trends\"><span class=\"glyphicon glyphicon-stats\"></span> Trends</a></li></ul><listviewer obj=\"profile.recentUsers\"></listviewer></div><div class=\"profile-main-panel slide-eff\" ui-view=\"\"></div>");
$templateCache.put("app/trends/_trends-element-tpl.html","<div class=\"trends-element-style\" ng-class=\"{\'active\' : ctrl.obj.element.selected }\"><span>{{ctrl.obj.element.date | jbDate}}</span> <span>{{ctrl.obj.element.weight | number: 2}}</span> <span>{{ctrl.obj.element.height | number: 2}}</span> <span>{{ctrl.obj.element.bmr | number: 2}}</span> <span>{{ctrl.obj.element.totalCalories | number: 2}}</span> <span>{{ctrl.obj.element.age | number: 0}}</span></div>");
$templateCache.put("app/trends/_trends-header.html","<div class=\"trends-header-bar\"><span>date</span> <span>weight</span> <span>height</span> <span>bmr</span> <span>total calories</span> <span>age</span></div>");
$templateCache.put("app/user/_default-confirm-modal-tpl.html","confirm modal");
$templateCache.put("app/user/_default-modal-tpl.html","default modal template");
$templateCache.put("app/user/_default-user-detail-tpl.html","<h5>Weight {{ctrl.uo.profile.weight}}</h5><h5>Gender {{ctrl.uo.profile.gender}}</h5><h5>Height {{ctrl.uo.profile.height}}</h5>");
$templateCache.put("app/user/_user-element-tpl.html","<div class=\"user-list-element\" ng-class=\"{\'active\' : ctrl.obj.element.selected }\"><img ng-src=\"{{ctrl.uo.profile.image}}\" height=\"100px\" width=\"100px\"><div class=\"user-details\"><div class=\"name\">{{ctrl.obj.element.first}} {{ctrl.obj.element.last}}</div><div class=\"features\"><p>Weight: {{ctrl.obj.element.weight | number: 2}}</p><p>Gender: {{ctrl.obj.element.gender}}</p><p>Height: {{ctrl.obj.element.height}}</p></div></div></div>");
$templateCache.put("app/user/_user-select-modal-tpl.html","<listviewer obj=\"ctrl.resolveArg.userlist\"></listviewer>");
$templateCache.put("app/user/_user-tpl.html","<div class=\"user-outer-box\"><div class=\"img-container\" ng-click=\"ctrl.uo.onClick()\"><img ng-src=\"{{ctrl.uo.profile.image | defaultPatient }}\" alt=\"image\" width=\"200px\" height=\"200px\"><p>{{ctrl.uo.profile.first}} {{ctrl.uo.profile.last}}</p></div><div ng-include=\"\'app/user/_default-user-detail-tpl.html\'\"></div></div>");}]);