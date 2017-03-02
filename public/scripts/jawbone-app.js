(function() {
  'use strict';

  angular.module('config', [])
  angular.module('constants', [])
  angular.module('mainRoute', [
  	'ui.router'
  ])
  angular.module('run', [])
  angular.module('jawboneApp', [
    'PreloadedData',
  	'config',
  	'constants',
  	'mainRoute',
  	'run',
    'ngAnimate',
  	'ngSanitize',
    'ui.bootstrap',
    'googlechart'
  ]);

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

  function buildListViewer($log, obj, getUsers, UserObj) {
    //$log.info('profile data: ' + JSON.stringify());
    obj.listobj = {};
    obj.listobj.template = 'app/user/_user-element-tpl.html';
    obj.listobj.heading = 'Users';

    obj.listobj.getElements = function() {
      return getUsers().then(function(result) {
        $log.info('return dat result: ' + JSON.stringify(result));
        return result;
      }, function(err) {
        return [];
      });
    }

    obj.listobj.makeElement = function(objElement) {
      return new UserObj(objElement)
    };    
  }

  function UsersComponentBuilderFtn($log, UserObj) {
    var UsersComponentBuilder = function(getUsers, callbacks) {

      //$log.info('incoming data: ' + JSON.stringify(usersdata));
      var obj = this;

      // build the callbacks
      buildCallbacks($log, obj, callbacks);
      buildListViewer($log, obj, getUsers, UserObj);

    };
    return UsersComponentBuilder;
  }

  function UserSelectorObjFtn($log, UsersComponentBuilder) {
    var UserSelectorObj = function(getUsers, onConfirm) {
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

      obj.userlist = new UsersComponentBuilder(getUsers, obj.callbacks);
    };
    return UserSelectorObj;
  }

  function UserCompFtn($log, UserObj, ModalService, UserSelectorObj, JawboneService) {
    var UserComp = function(userdata, getUsers) {

      //$log.info('data to user control: ' + JSON.stringify(userdata.profile));

      var obj = this;
      obj.profiledata = userdata || {};
      obj.profile = new UserObj(obj.profiledata);
      
      obj.clickFtn = userdata.clickFtn || function() {        
        // create modal
        ModalService.onClick(new UserSelectorObj(getUsers, function(obj) {
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

  function UserObjFtn($log) {
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

  function buildListViewer($q, $log, obj, trendsdata, TrendObj) {
    //$log.info('trends data: ' + JSON.stringify(trendsdata));
    obj.listobj = {};
    obj.listobj.template = 'app/trends/_trends-element-tpl.html';
    obj.listobj.headerbar = 'app/trends/_trends-header.html';
    obj.listobj.heading = 'Trends';

    obj.listobj.getElements = function() {
      var deferred = $q.defer();
      deferred.resolve(trendsdata.data || []);
      return deferred.promise;
      //return (trendsdata.data || []);
    }

    obj.listobj.makeElement = function(objElement) {
      return new TrendObj(objElement)
    };    

  }

  function TrendsComponentBuilderFtn($q, $log, TrendObj) {
    var TrendsComponentBuilder = function(trendsdata) {
      var obj = this;

      buildCallbacks($log, obj, trendsdata);
      buildListViewer($q, $log, obj, trendsdata, TrendObj);

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
      o.trends = JawboneService.extractData('trends', user);
      o.earliest = o.trends.earliest || new Date();
      o.elems = o.trends.data || [];
      o.elements = [];

      // get the elements to construct the chart
      o.getElements = function(data) {        
        var deferred = $q.defer();
        deferred.resolve(data || o.elems);
        return deferred.promise;
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
        // fake some data for now
        var fakedata = o.elems.slice();

        angular.forEach(fakedata, function(val) {
          val[1].weight = randomrange(50, 100);
        }, fakedata);

        return fakedata;
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
    .module('jawboneApp')
    .factory('SleepsComponentBuilder', SleepsComponentBuilderFtn)
    //.factory('SleepsObj', SleepsObjFtn)
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

  function buildListViewer($q, $log, obj, sleepsdata, SleepObj) {
    $log.info('sleeps data: ' + JSON.stringify(sleepsdata));
    obj.listobj = {};
    obj.listobj.template = 'app/sleeps/_sleeps-element-tpl.html';
    obj.listobj.headerbar = 'app/sleeps/_sleeps-header-tpl.html';
    obj.listobj.heading = 'Sleeps';

    obj.listobj.getElements = function() {
      var deferred = $q.defer();
      deferred.resolve(sleepsdata || []);
      return deferred.promise;
    }

    obj.listobj.makeElement = function(objElement) {
      return new SleepObj(objElement)
    };    

  }

  function SleepsComponentBuilderFtn($q, $log, SleepObj) {
    var SleepsComponentBuilder = function(sleepsdata) {
      var obj = this;

      buildCallbacks($log, obj, sleepsdata);
      buildListViewer($q, $log, obj, sleepsdata, SleepObj);

    };
    return SleepsComponentBuilder;
  }

  // function SleepsObjFtn($log, SleepObj) {
  //   var SleepsObj = function(data) {
  //     var o = this;
  //     o.data = data || {};
      
  //     //$log.info('sleeps data: ' + JSON.stringify(o.data));
      
  //     o.elems = o.data.items || [];
  //     o.template = 'app/sleeps/_sleeps-element-tpl.html',
  //     o.heading = 'Sleeps',
  //     o.headerbar = 'app/sleeps/_sleeps-header-tpl.html'
  //     //o.image = 'https://jawbone.com' + o.elems[0].snapshot_image;

  //     this.getElements = function() {
  //       //$log.info('return elems: ' + JSON.stringify(o.elems));
  //       return o.elems;
  //     }

  //     this.makeElement = function(elemData) {
  //       return new SleepObj(elemData)
  //     };
      
  //     // this.sleepgraph = 'https://jawbone.com/nudge/api/v.1.1/sleeps/' + this.elements[0].xid + '/image';
  //     // $log.info('sleep graph: ' + this.sleepgraph);
  //   };
  //   return SleepsObj;
  // }

  function convertToMinutes(str, $log) {
    str = str.toString();
    var arr = str.match(/\d+/g);
    if(arr.length === 2) {
      return (parseInt(arr[0]) * 60) + (parseInt(arr[1]));
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
    .factory('SleepsChartBuilderObj', SleepsChartBuilderObjFtn);

  function SleepsChartBuilderObjFtn($q, $log, SleepObj, JawboneService) {
    var SleepsChartBuilderObj = function(user) {

      var o = this;      
      o.profile = JawboneService.extractData('profile', user);
      o.name = o.profile.first + ' ' + o.profile.last;
      o.elems = JawboneService.extractData('sleeps', user);
      o.elements = [];

      // get the elements to construct the chart
      o.getElements = function(data) {      
        //$log.info('sleeps chart builder call to get elements: ' + JSON.stringify(o.elems));  
        var deferred = $q.defer();
        deferred.resolve(data || o.elems);
        return deferred.promise;
      };

      // make an element
      o.makeElement = function(rawElem) {
        return new SleepObj(rawElem);
      };

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
        return Math.random() * (max - min) + min;
      }

      o.extractFromUser = function(user) {
        // fake some data for now
        var fakedata = o.elems.slice();
        angular.forEach(fakedata, function(val) {
          val.title = randomrange(50, 100);
        }, fakedata);

        return fakedata;
        //return JawboneService.extractData('trends', user);
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

  // function buildCallbacks($log, obj) {

  //   obj.onSelect = function(sel) {
  //   };

  //   obj.onConfirm = function() {
  //     $log.info('recent confirm it');
  //   };

  // }

  // function buildListViewer($q, $log, UserObj) {
  //   //$log.info('recent users data: ' + JSON.stringify(sleepsdata));
  //   obj.listobj = {};
  //   //obj.listobj.template = 'app/sleeps/_sleeps-element-tpl.html';
  //   //obj.listobj.headerbar = 'app/sleeps/_sleeps-header-tpl.html';
  //   obj.listobj.heading = 'Recent Users';

  //   obj.listobj.getElements = function() {
  //     var deferred = $q.defer();
  //     deferred.resolve(sleepsdata || []);
  //     return deferred.promise;
  //   }

  //   obj.listobj.makeElement = function(objElement) {
  //     return new SleepObj(objElement)
  //   };    

  // }

  // function SleepsComponentBuilderFtn($q, $log, UserObj) {
  //   var RecentUsersBuilder = function() {
  //     var obj = this;

  //     buildCallbacks($log, obj);
  //     buildListViewer($q, $log, UserObj);

  //   };
  //   return RecentUsersBuilder;
  // }


  function RecentUsersObjFtn($q, $log, JawboneService, UserObj) {
    var RecentUsersObj = function(jbdata, getUsers) {

      var obj = this;
      obj.data = jbdata || {};
      obj.recentUsers = [];

      function newUser(newUser) {
        $log.info('recent-user obj new user selected: ' + JSON.stringify(newUser.data));
        obj.recentUsers.push(newUser.data);
        obj.listobj.onPopulate();
      }

      JawboneService.setUserCallback(newUser);

      obj.listobj = obj.listobj || {};
      obj.listobj.heading = 'Recent Users';
      obj.listobj.template = obj.listobj.template || 'app/user/_user-element-tpl.html';
      obj.listobj.chunksize = obj.listobj.chunksize || 1;

      obj.listobj.getElements = function() {
        var deferred = $q.defer();
        deferred.resolve(obj.recentUsers);
        return deferred.promise;
      };

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

  function ProfileObjFtn($log, SleepsComponentBuilder, TrendsComponentBuilder, TrendsChartBuilderObj, SleepsChartBuilderObj, UserComp, RecentUsersObj) {
    var ProfileObj = function(jbUser, getUsers) {
      //$log.info('profile object jawbone user: ' + JSON.stringify(jbUser));
      //$log.info('users: ' + JSON.stringify(users));
      var obj = this;

      obj.user = jbUser || {};   
      obj.jbdata = obj.user.jbdata;   
      obj.sleeps =  new SleepsComponentBuilder(obj.jbdata.activities[2].items);
      obj.sleepschart = new SleepsChartBuilderObj(obj.user);
      obj.trends = new TrendsComponentBuilder(obj.jbdata.profile[3]);
      obj.trendschart = new TrendsChartBuilderObj(obj.user);
      obj.userprofile = new UserComp(jbUser, getUsers);
      obj.recentUsers = new RecentUsersObj(jbUser, getUsers);
    };
    return ProfileObj;
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
    .factory('ModalService', ModalService);

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
	  		$log.info('params: ' + JSON.stringify(params));
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
	          	animation: true,
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
    .factory('ListViewerElemObj', ListViewerElemObjFtn)
    .controller('ListViewerElemCtrl', ListViewerElemCtrl)
    .directive('lvelem', lvelemFtn);

  function ListViewerElemObjFtn($log) {
    var ListViewerElemObj = function(notify, data) {      

      //$log.info('create a list elem object from data: ' + JSON.stringify(data));
      this.data = data || {};      
      this.template = data.template || 'app/list-viewer/_default-lve-tpl.html';
      this.parent = parent || {};      
      this.element = data;

      this.activated = data.activated || function() {
        $log.info('default activated function');
      };

      this.deactivated = data.deactivated || function() {
        $log.info('default deactivated function');
      };

      this.onClick = function(index) {
        this.activated();
        notify(index);
      }

      this.onDeselected = function() {
        //$log.info('on deselected called');
        this.deactivated();
      };
    };
    return ListViewerElemObj;
  }

  /** @ngInject */
  function ListViewerElemCtrl($log, $scope, ListViewerElemObj) {
    var vm = this;  

    // $scope.$watch(function(scope) {
    //   return (vm.obj);
    // }, function(newval, oldval) {
    //   if(newval) {        
    //     vm.e = new ListViewerElemObj(vm.obj, vm.listobj);
    //   }
    // }); 
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
      template: '<div ng-include=\'ctrl.tpl\' ng-click=\'ctrl.obj.onClick(ctrl.i)\'></div>',
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
    var ListViewerCtrlObj = function(obj) {

      var o = this;

      //$log.info('run dat list viewer ctrl obj');
      
      o.onSelect = obj.onSelect || function(selected) {
        $log.info('selected: ' + JSON.stringify(selected));
      };
      
      o.onConfirm = obj.onConfirm || function() {
        $log.info('on confirm selection');
      };
      
      o.listobj = new ListViewerObj(obj);

    };
    return ListViewerCtrlObj;
  }

  function ListViewerObjFtn($log, ListViewerElemObj) {
    var ListViewerObj = function(obj) {

      //$log.info('obj to listviewer obj: ' + JSON.stringify(obj));

      var o = this;
      o.listobj = obj.listobj || {};
      o.heading = obj.listobj.heading || 'blank';
      o.headerbar = obj.listobj.headerbar || 'app/list-viewer/_default-headerbar-tpl.html';
      o.template = obj.listobj.template || 'app/list-viewer/_default-lve-tpl.html';
      o.chunksize = obj.listobj.chunksize || 4;
      o.getElements = o.listobj.getElements || function() {
        return [];
      };

      //var elems = o.getElements();

      //$log.info('the list heading is : ' + o.heading);

      o.makeElement = o.listobj.makeElement || function(value) {
        $log.info('supply a make element function');
        return {};
      };

      // set up callbacks
      //o.callbacks = obj.callbacks || {};
      o.onSelect = obj.onSelect || function() {
        $log.info('supply on select function');
      };

      o.elements = [];
      o.selected = -1;

      // notify list object that an element was clicked
      o.notifyClicked = function(index) {        
        if(o.selected !== -1 && o.selected < o.elements.length) {
          o.elements[o.selected].onDeselected();
        }

        if(o.selected !== index) {
          o.selected = index;          
          o.onSelect(o.elements[o.selected].element);
        } else {
          o.selected = -1;
        }

      };

      function populate() {
        o.getElements()
        .then(function(elems) {
          angular.forEach(elems, function(value) { 
            //$log.info('value gotten: ' + JSON.stringify(value));           
            var e = o.makeElement(value); 
            this.push(new ListViewerElemObj(o.notifyClicked, e));
          }, o.elements);
        })
        .catch(function(err) {
          $log.info('error getting elements: ' + err);
        });        
      }

      // TODO implement
      function appendElements() {

      }

      o.listobj.onPopulate = function() {
        populate();
      };

      populate();

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
    vm.index = 0;
    vm.initcb = null;

    vm.register = function(cb) {
      vm.initcb = cb;
    };

    vm.initialiseHeight = function(height) {
      //$log.info('init height called: ' + height);
      var chunksize = vm.lo.chunksize || 4;
      vm.frameHeight = chunksize * height;
      vm.moveDistance = parseInt(vm.frameHeight / 2);
      vm.index = 0;
    };

    vm.getFrameHeight = function() {
      return vm.frameHeight;
    };

    function adjust(length) {
      vm.nbrElems = vm.lo.listobj.elements.length;
      vm.nbrForwards = parseInt(vm.nbrElems / 2);
      //$log.info('no. forwards: ' + vm.nbrForwards);
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
      vm.lo = new ListViewerCtrlObj(obj);
      vm.nbrElems = vm.lo.listobj.elements.length;
      vm.nbrForwards = parseInt(vm.nbrElems / 2);

      vm.back = function() {
        if(vm.atStart()) return;
        vm.index = (vm.index === 0 ? 0 : vm.index - 1);
        //$log.info('clicked back: ' + vm.index);
        $scope.$broadcast('clickback', vm.moveDistance);
      };

      vm.forward = function() {
        if(vm.atEnd()) return;
        //$log.info('clicked forward');
        //$log.info('number of elements: ' + vm.nbrElems + ' move distance: ' + vm.moveDistance + ' forwards: ' + vm.nbrForwards);
        vm.index = (vm.index === vm.nbrForwards ? vm.nbrForwards : vm.index + 1);
        $scope.$broadcast('clickforward', vm.moveDistance);
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

        //height = 100;

        ctrl.initialiseHeight(height);
        var frameHeight = ctrl.getFrameHeight();
        $log.info('new init height of list element : ' + height + ' frame height: ' + frameHeight);
        frame.css({
          'height': frameHeight + 'px'
        });
      }

      //function init() {
        //$log.info('run the init futn');

        scope.$on('clickback', function(event, data) {
          ul.velocity({
            'top': '+='+ data
          }, 400, function() {
            // Animation complete.
          });          
        });

        scope.$on('clickforward', function(event, data) {
          ul.velocity({
            'top': '-='+ data
          }, 400, function() {
            // Animation complete.
          });                  
        });    

        scope.$on('adjustOffsetFromLeft', function(event, data) {
          ul.css({
            'left': '+=' + data
          });
        });        
      //}

      ctrl.register(function() {
        $timeout(function() {
          newInit();
        })
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
      this.data = data || {};
    };
    return HeaderBar;
  }

  /** @ngInject */
  function HeaderBarCtrl($log, $scope, HeaderBarObj) {
    var vm = this;  

    $log.info('header bar: ' + JSON.stringify(vm.tpl));
    // $scope.$watch(function(scope) {
    //   return (vm.obj);
    // }, function(newval, oldval) {
    //   if(newval) {
    //     vm.mo = new HeaderBarObj(vm.obj);
    //   }
    // }); 
  }	

  function headerBarFtn($log) {
    var directive = {
      restrict: 'E',
        scope: {},
        controller: 'HeaderBarCtrl',
        controllerAs: 'ctrl',
      bindToController: {
        tpl : '='
      },
      template: '<div ng-include=\'ctrl.tpl\'></div>'
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
			obj.params.max = paramsArg.max || 4;
			obj.params.offset = paramsArg.offset || 0;
			obj.params.sortBy = paramsArg.sortBy || 'id';

			function makeBatch(batch, offset) {
				var newBatch = new BatchObj(batch.endpoint, batch.params);
				var os = newBatch.params.offset || 0;
				var newOS = parseInt(os + offset);
				newOS = (newOS < 0 ? 0 : newOS);
				newBatch.params.offset = newOS;
				return newBatch;			
			}

			obj.get = function() {
				return $http.get(obj.endpoint, {params: obj.params})
				.then(function(response) {
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
			}
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
	  		makeBatch : makeBatch,
	  		setUserCallback : setUserCallback,
	  		setUser : setUser,
	  		extractData : extractData
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
	  			$log.info('error getting user: ' + errResponse);
	  		});
	  	}

	  	function makeBatch() {
	  		return new BatchObj('/users');
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

  function runBlock($log, JawboneData, JawboneService) {
  	$log.info('we did execute the run block');
  	$log.info('pre loaded data: ' + JSON.stringify(JawboneData));
  	JawboneService.init(JawboneData);
  }
})();

(function() {
  'use strict';

  angular
    .module('mainRoute')
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider, $urlRouterProvider) {
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
    $logProvider.debugEnabled(true);
    //$locationProvider.html5Mode(true);
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

        PlotGenerator.preparePlot = function(start, end, data, plotnames) {                    
            plotnames = plotnames || [];
            plotnames.unshift('date');

            var arr = [];
            var dateArr = createDateRange(start, end); 
            var idx = 0;

            // create an empty array between ranges
            angular.forEach(dateArr, function(value) {
                this.push(PlotGenerator.createEmpty(value));
            }, arr); 

            // populate for every data entry within the date range
            angular.forEach(data, function(value) {            
                //find the index into the date array to add this 'value'
                idx = findIndexOf(dateArr, function(elem) {
                    var jsdate = JawboneChartUtils.jawboneToJSDate(value.date);
                    //$log.info('date is ' + elem.toDateString() + ' jsdate: ' + jsdate.toDateString());
                    return (elem.toDateString() === jsdate.toDateString());  
                }, idx);     

                if(idx === -1) {
                    return;
                } else {
                    //$log.info('value to add is : ' + JSON.stringify(value));
                    PlotGenerator.addToArray(this, idx, 0, value);
                }
            }, arr);

            return { names: plotnames, data: arr };
        };        

        PlotGenerator.appendPlot = function(original, dataToAppend, plotnames) {
            var arrData = original.data;
            var start = arrData[0].x;
            var end = arrData[arrData.length - 1].x;
            var append = PlotGenerator.preparePlot(start, end, dataToAppend, plotnames);
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
    var ChartManager = function(chartdata, getUsers) {
      var obj = this;
      obj.chart = new ChartObj(chartdata);
      obj.getUsers = getUsers || function() {
        return JawboneService.getUsers();
      };

      obj.clickFtn = chartdata.clickFtn || function() {        
        // create modal
        ModalService.onClick(new UserSelectorObj(obj.getUsers, function(userChoice) {
          JawboneService.getUser(userChoice.jawboneId)
          .then(function(response) {
            obj.chart.addCompareData(chartdata.extractFromUser(response));
            JawboneService.setUser(userChoice);
          });
        }))
        .then(function(result) {
          //$log.info('result of modal: ' + JSON.stringify(result)); 
        });
      };

      obj.onClick = function() {
        obj.clickFtn();
      };

    };
    return ChartManager;
  }

  function ChartObjFtn($log, PlotGenerator) {
    var ChartObj = function(data) {
      var obj = this;
      obj.data = data || {};

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
        }
      };

      // get the plot names
      obj.plots = data.getPlotNames();
      obj.graphData = [];

      var extractFtn = data.extract || function(obj, field) {        
        return 0;
      };

      // get the elements
      data.getElements()
      .then(function(result) {
        processElements(result);
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

      function processElements(elems) {

        obj.elements = [];
        angular.forEach(elems, function(value) {
          this.push(data.makeElement(value));
        }, obj.elements);

        //var startDate = new Date(2017, 1, 10);
        var startDate = new Date(2016, 11, 1);
        var endDate = new Date(2017, 2, 10);

        // preapare plot data
        obj.graphData = PlotGenerator.preparePlot(startDate, endDate, obj.elements, ['craig']);  
        obj.selectPlot(0, obj.graphData);
      }

      obj.selectPlot = function(index, gdata) {
        gdata = gdata || obj.graphData;
        obj.selected = obj.plots[index];
        obj.chartdata = convertToArr(obj.graphData, index);

        removeNullPoints(obj.chartdata);

        //obj.chart.options.title = obj.selected;
        obj.chart.data = google.visualization.arrayToDataTable(obj.chartdata);
      };

      obj.addCompareData = function(dataToAdd) {
        data.getElements(dataToAdd)
        .then(function(response) {
          //$log.info('add compare data: ' + JSON.stringify(dataToAdd));
          var result = [];
          angular.forEach(response, function(val) {
            this.push(data.makeElement(val));
          }, result);      
          obj.graphData = PlotGenerator.appendPlot(obj.graphData, result, ['name']);   
          obj.selectPlot(0, obj.graphData); 
        });        
      };

    };
    return ChartObj;
  }

  /** @ngInject */
  function ChartCtrl($log, $scope, ChartManager, googleChartApiPromise) {
    var vm = this;

    function onLoadedFtn() {
      $log.info('google chart loaded now');
      vm.co = new ChartManager(vm.obj);
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
angular.module("jawboneApp").run(["$templateCache", function($templateCache) {$templateCache.put("app/_default-modal-tpl.html","default modal template");
$templateCache.put("app/_modal-frame-tpl.html","<div class=\"modal-body\" id=\"modal-body\" style=\"padding: 4px;\"><div ng-include=\"ctrl.template\"></div></div><div class=\"modal-footer\" style=\"padding: 4px;\"><button class=\"btn btn-primary\" type=\"button\" ng-click=\"ctrl.ok()\">OK</button> <button class=\"btn btn-warning\" type=\"button\" ng-click=\"ctrl.cancel()\">Cancel</button></div>");
$templateCache.put("app/main.html","<div class=\"container\"><div ui-view=\"\"></div></div>");
$templateCache.put("app/user.html","<div class=\"container\"><a href=\"/login/jawbone\">login jawbone</a><div ui-view=\"\"></div></div>");
$templateCache.put("app/chart/_chart-tpl.html","<div class=\"chart-area\"><div class=\"chart-header\"><span uib-dropdown=\"\"><a class=\"btn btn-default\" uib-dropdown-toggle=\"\">{{ctrl.co.chart.selected || \'select a plot...\'}} <span class=\"caret\"></span></a><ul uib-dropdown-menu=\"\"><li ng-repeat=\"item in ctrl.co.chart.plots track by $index\"><span ng-click=\"ctrl.co.chart.selectPlot($index)\">{{item}}</span></li></ul></span> <span class=\"btn btn-default\" ng-click=\"ctrl.co.onClick()\">add plot</span></div><div class=\"chart-body\"><div class=\"chart-element\"><div google-chart=\"\" chart=\"ctrl.co.chart.chart\" style=\"height:300px; width:570px; border: 1px solid #fff;\"></div></div></div></div>");
$templateCache.put("app/friends/_friends-tpl.html","<div><h3>Friends</h3><p>Data: {{ctrl.fo.data | json}}</p></div>");
$templateCache.put("app/dropdown/_default-dropdown-tpl.html","<span class=\"glyphicon glyphicon-menu-hamburger obi-default-dropdown-box\"></span>");
$templateCache.put("app/dropdown/_dropdown-tpl.html","<div class=\"obi-dropdown-container\" ng-class=\"{ \'obi-show\': ctrl.visible }\" obi-click-elsewhere=\"ctrl.onDeselect()\"><div class=\"obi-dropdown-display\" ng-click=\"ctrl.show();\" ng-class=\"{ \'clicked\': ctrl.visible }\"><span ng-include=\"ctrl.ddobj.templateUrl\"></span></div><div class=\"obi-dropdown-list\"><ul><li ng-repeat=\"$item in ctrl.ddobj.filters track by $index\" ng-click=\"ctrl.setSelected($index)\"><h5 ng-if=\"ctrl.ddobj.selectedFilterIdx === $index\">{{$item}} <small><span class=\"glyphicon glyphicon-ok\"></span></small></h5><h5 ng-if=\"ctrl.ddobj.selectedFilterIdx !== $index\">{{$item}} &nbsp;</h5></li></ul></div></div>");
$templateCache.put("app/goals/_goals-tpl.html","<div><h3>Goals</h3><p>Sleep Total: {{ctrl.go.sleepTotal}}</p><p>Move Steps: {{ctrl.go.moveSteps}}</p><p>Sleep Remaining: {{ctrl.go.sleepRem}}</p><p>Intake Calories Remaining: {{ctrl.go.intakeCaloriesRem | number:2}}</p><p>Move Steps Remaining: {{ctrl.go.moveStepsRem}}</p></div>");
$templateCache.put("app/list-viewer/_default-headerbar-tpl.html","<div class=\"trends-header-bar\"><span>&nbsp;</span></div>");
$templateCache.put("app/list-viewer/_default-lve-tpl.html","<div class=\"trends-element-style\"><span>default</span></div>");
$templateCache.put("app/list-viewer/_list-viewer-tpl.html","<div class=\"list-view-box\"><div class=\"heading\">{{ctrl.lo.listobj.heading}}</div><div class=\"filter-container\" ng-show=\"ctrl.hasFilter\"><input type=\"text\" class=\"form-control\" placeholder=\"search for...\" ng-model=\"searchtext\"></div><p></p><header-bar tpl=\"ctrl.lo.listobj.headerbar\"></header-bar><div id=\"listviewerbox\" class=\"list-viewer-elements\" mouse-wheel-up=\"ctrl.didMouseWheelUp()\" mouse-wheel-down=\"ctrl.didMouseWheelDown()\"><ul><li ng-repeat=\"elem in ctrl.lo.listobj.elements track by $index\"><lvelem tpl=\"ctrl.lo.listobj.template\" obj=\"elem\" i=\"{{$index}}\"></lvelem></li></ul></div><div class=\"scroll-control\" ng-show=\"ctrl.hasScrollers\"><span class=\"btn btn-default scroll-button\" ng-click=\"ctrl.back()\" ng-disabled=\"ctrl.atStart()\"><span class=\"glyphicon glyphicon-chevron-up\"></span></span> <span class=\"btn btn-default scroll-button\" ng-click=\"ctrl.forward()\" ng-disabled=\"ctrl.atEnd()\"><span class=\"glyphicon glyphicon-chevron-down\"></span></span></div></div>");
$templateCache.put("app/moods/_moods-tpl.html","<div><h3>Moods</h3><p>Data: {{ctrl.mo.data | json}}</p></div>");
$templateCache.put("app/moves/_move-tpl.html","<p>date : {{ctrl.mo.date | jbDate}} title : {{ctrl.mo.title}}</p>");
$templateCache.put("app/moves/_moves-tpl.html","<div><h3>Moves</h3><div ng-repeat=\"elem in ctrl.mo.elements\"><move obj=\"elem\"></move></div></div>");
$templateCache.put("app/profile/_sleeps-element-tpl.html","<div class=\"trends-element-style\">date : {{ctrl.obj.date | jbDate}} title : {{ctrl.obj.title}} sounds : {{ctrl.obj.sounds}} awakenings : {{ctrl.obj.awakenings}} light : {{ctrl.obj.light}}</div>");
$templateCache.put("app/profile/friends.html","friends");
$templateCache.put("app/profile/moves.html","");
$templateCache.put("app/profile/profile-main.html","<div class=\"profile-side-bar\"><user obj=\"profile.userprofile\"></user><ul><li><a ui-sref=\"profile.sleeps\"><span class=\"glyphicon glyphicon-bed\"></span> Sleeps</a></li><li><a ui-sref=\"profile.friends\"><span class=\"glyphicon glyphicon-user\"></span> Friends</a></li><li><a ui-sref=\"profile.moves\"><span class=\"glyphicon glyphicon-transfer\"></span> Moves</a></li><li><a ui-sref=\"profile.trends\"><span class=\"glyphicon glyphicon-stats\"></span> Trends</a></li></ul><listviewer obj=\"profile.recentUsers\"></listviewer></div><div class=\"profile-main-panel slide-eff\" ui-view=\"\"></div>");
$templateCache.put("app/profile/sleeps.html","<chart obj=\"profile.sleepschart\"></chart><listviewer obj=\"profile.sleeps\"></listviewer>");
$templateCache.put("app/profile/trends.html","<chart obj=\"profile.trendschart\"></chart><listviewer obj=\"profile.trends\"></listviewer>");
$templateCache.put("app/profile/user.html","");
$templateCache.put("app/recent-users/_recent-users-tpl.html","");
$templateCache.put("app/side-menu/_side-menu-tpl.html","side menu tempate");
$templateCache.put("app/sleeps/_sleeps-element-tpl.html","<div class=\"trends-element-style\" ng-class=\"{\'active\' : ctrl.obj.element.selected }\"><span>{{ctrl.obj.element.date | jbDate}}</span> <span>{{ctrl.obj.element.title | minutesConverter:\'hrs-mins\'}}</span> <span>{{ctrl.obj.element.sounds}}</span> <span>{{ctrl.obj.element.awakenings}}</span> <span>{{ctrl.obj.element.light}}</span></div>");
$templateCache.put("app/sleeps/_sleeps-header-tpl.html","<div class=\"trends-header-bar\"><span>date</span> <span>duration</span> <span>sounds</span> <span>awakenings</span> <span>light</span></div>");
$templateCache.put("app/trends/_trends-element-tpl.html","<div class=\"trends-element-style\" ng-class=\"{\'active\' : ctrl.obj.element.selected }\"><span>{{ctrl.obj.element.date | jbDate}}</span> <span>{{ctrl.obj.element.weight | number: 2}}</span> <span>{{ctrl.obj.element.height | number: 2}}</span> <span>{{ctrl.obj.element.bmr | number: 2}}</span> <span>{{ctrl.obj.element.totalCalories | number: 2}}</span> <span>{{ctrl.obj.element.age | number: 0}}</span></div>");
$templateCache.put("app/trends/_trends-header.html","<div class=\"trends-header-bar\"><span>date</span> <span>weight</span> <span>height</span> <span>bmr</span> <span>total calories</span> <span>age</span></div>");
$templateCache.put("app/user/_default-modal-tpl.html","default modal template");
$templateCache.put("app/user/_user-element-tpl.html","<div class=\"user-list-element\" ng-class=\"{\'active\' : ctrl.obj.element.selected }\"><img ng-src=\"assets/users.png\" height=\"100px\" width=\"100px\"><div class=\"user-details\"><div class=\"name\">{{ctrl.obj.element.first}} {{ctrl.obj.element.last}}</div><div class=\"features\"><p>Weight: {{ctrl.obj.element.weight | number: 2}}</p><p>Gender: {{ctrl.obj.element.gender}}</p><p>Height: {{ctrl.obj.element.height}}</p></div></div></div>");
$templateCache.put("app/user/_user-select-modal-tpl.html","<listviewer obj=\"ctrl.resolveArg.userlist\"></listviewer>");
$templateCache.put("app/user/_user-tpl.html","<div class=\"user-outer-box\"><div class=\"img-container\" ng-click=\"ctrl.uo.onClick()\"><img ng-src=\"/assets/me.png\" alt=\"image\" width=\"200px\" height=\"200px\"><p>{{ctrl.uo.profile.first}} {{ctrl.uo.profile.last}}</p></div><h5>Weight {{ctrl.uo.profile.weight}}</h5><h5>Gender {{ctrl.uo.profile.gender}}</h5><h5>Height {{ctrl.uo.profile.height}}</h5></div>");}]);