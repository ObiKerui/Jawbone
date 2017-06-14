
var utils = (function(angular) {
	'use strict';
	
	return {
		testUtils : function() {
			console.log('test utils function called!');
		}
	};
})(angular);
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
    'jbtemplates',
    'ngFileUpload',
    'ngImgCrop'
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
    .factory('BaseCtrl', BaseCtrlFtn)
    .factory('BaseComp', BaseCompFtn)  
    .factory('BaseInterface', BaseInterfaceFtn);

  //trying to pull common ctrl logic into base function
  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function BaseCtrlFtn($log, $rootScope, BaseInterface) {
    var ctrl = function(iface, createObjFtn, onRenderFtn) {

      $rootScope.$watch(function(scope) {
        return (iface);
      }, function(iface, oldval) {
        iface = (iface ? iface : new BaseInterface());
        var obj = createObjFtn(iface);
        iface.setAPI(obj.getAPI);
        obj.api.render(function(state) {
          onRenderFtn(obj);
        });        
      }); 
    };
    return ctrl;
  }

  //----------------------------------------------------
  //  BASE COMP FUNCTION
  //----------------------------------------------------  
  function BaseCompFtn($log) {
    var obj = function() {
      
      var objInst = this;
         
      objInst.api = { 
        render: function(cb) {
          $log.info('implement a render function');
          cb();
        },      
        notify: function(event, arg) {
          $log.info('implement notify function: event: ' + event);
        }
      };

      // get rid of this once all switched to v3
      objInst.connect = function(iface, api, init) {
        $log.info('iface to connect: ' + JSON.stringify(iface));
        iface.connectInterface(iface, function() {
          return api;
        }, function(connectedIface) {
          $log.info('iface right now: ' + JSON.stringify(connectedIface));
          init(connectedIface);
        });
      };

      objInst.getAPI = function() {
        return objInst.api;
      };

      return objInst;
    };
    return obj;
  }

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function BaseInterfaceFtn($log) {
    var iface = function() {
      var ifaceInst = this;
      ifaceInst.getObjectAPI = null;
      //ifaceInst.status = 'created';

      // ifaceInst.connectInterface = function(iface, getObject, cb) {
      //   $log.info('the iface instance: ' + JSON.stringify(ifaceInst));
      //   iface.getObjectAPI = getObject;
      //   iface.status = 'connected';
      //   cb(iface);
      // };

      ifaceInst.config = {};

      ifaceInst.setAPI = function(getAPI) {
        ifaceInst.getObjectAPI = getAPI;
      };

      ifaceInst.getAPI = function() {
        return ifaceInst.getObjectAPI();
      };

      ifaceInst.notify = function(event, arg) {
        var api = ifaceInst.getObjectAPI();
        $log.info('called notify on base interface. API: ' + JSON.stringify(api));
        api.notify(event, arg);
      };

      return ifaceInst;
    };
    return iface;
  }

})();


(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .filter('userViewerV3filter', FilterFtn)    
    .factory('UserViewerV3Interface', InterfaceFtn)
    .factory('UserViewerV3Service', ServiceFtn)  
    .factory('UserViewerV3Obj', ObjectFtn)
    .controller('UserViewerV3Ctrl', CtrlFtn)
    .directive('userViewerV3', DirFtn);

  //----------------------------------------------------
  //  FILTER FUNCTION
  //----------------------------------------------------  
  function FilterFtn() {
    return function(arg) {  
      if(arg) {
      	// do something with arg
        return arg;
      }
      return arg;
    }     
  }

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function InterfaceFtn($log, BaseInterface) {
    var iface = function(config) {
      var ifaceInst = new BaseInterface();
      var config = config || {};
      ifaceInst.selected = null;

      ifaceInst.config = {          
        setSelected : config.setSelected || function(selection) {
          this.selected = selection;
          $log.info('default set selected function for UserViewerV3Interface: ' + JSON.stringify(this.selected));
        },
        unsetSelected : config.unsetSelected || function() {
          this.selected = null;
          $log.info('default unset selected function for UserViewerV3Interface');          
        }
      };

      return ifaceInst;            
    };
    return iface;
  }

  //----------------------------------------------------
  //  SERVICE FUNCTION
  //----------------------------------------------------  
  function ServiceFtn($log) {
  	var service = {
  		getUser : getUserFtn
  	};
  	return service;

  	function getUserFtn() {

  	}
  }

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log, UserViewerV3Interface, BaseComp, UserListV3Interface) {
    var object = function(iface) {

      var objInst = new BaseComp();
      objInst.listIface = null;
      objInst.selectedUser = null;

      $log.info('iface passed to useer viewer: >>>>> ' + JSON.stringify(iface)); 

      objInst.api = {
      	render: function(cb) {
      		objInst.listIface = new UserListV3Interface({
            onSelect : function(element, index) {

              $log.info('user viewer on select function: element: ' + JSON.stringify(element.config.data));
              objInst.selectedUser = element.config.data;
              iface.config.setSelected(objInst.selectedUser);
            },
            onDeselect : function(element, index) {
              $log.info('user viewer on deselect function');
              objInst.selectedUser = null;
              iface.config.unsetSelected();
            }
      		});
      	}
      };

      return objInst;
    };
    return object;
  }

  //----------------------------------------------------
  //  CTRL FUNCTION
  //----------------------------------------------------  
  function CtrlFtn($log, $scope, BaseInterface, UserViewerV3Obj) {
    var vm = this;  
    vm.obj = null;

    // this is how a basectrl might work
    // var vm = new BaseCtrl($scope, function(iface) {
    //   return new UserViewerV3Obj(iface)
    // }, function(renderInfo) {
    //   $log.info('element is rendered');
    // });

    $scope.$watch(function(scope) {
      return (vm.iface);
    }, function(iface, oldval) {
      if(!iface) {
        $log.info('no iface was passed to the user viewer : ' + JSON.stringify(iface));

        var createdIface = new BaseInterface();
        vm.obj = new UserViewerV3Obj(createdIface);
        createdIface.setAPI(vm.obj.getAPI);
        
        vm.obj.api.render(function() {
          $log.info('called render function of user viewer');
        });         
               
      } else {
        $log.info('iface was passed to the user viewer : ' + JSON.stringify(iface));
        vm.obj = new UserViewerV3Obj(iface);
        iface.setAPI(vm.obj.getAPI);
        
        vm.obj.api.render(function() {
          $log.info('called render function of user viewer');
        });        
      }
      // }
    }); 
  }

  //----------------------------------------------------
  //  DIRECTIVE
  //----------------------------------------------------  
  function DirFtn() {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'UserViewerV3Ctrl',
      controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      templateUrl: 'app/user/user-viewer/_user-viewer-tpl.html'
    };
    return directive;   
  }
})();


(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .filter('userListV3filter', FilterFtn)    
    .factory('UserListV3Interface', InterfaceFtn)  
    .factory('UserV3Obj', ObjectFtn);

  //----------------------------------------------------
  //  FILTER FUNCTION
  //----------------------------------------------------  
  function FilterFtn() {
    return function(arg) {  
      if(arg) {
      	// do something with arg
        return arg;
      }
      return arg;
    }     
  }

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function InterfaceFtn($log, JawboneService, ListViewerV3Interface, ListViewerElemInterface, ListElemAPI, UserV3Obj) {
    var iface = function(config) {
  		var ifaceInst = new ListViewerV3Interface();
  		var config = config || {};

		  ifaceInst.config.getElementsObj = JawboneService.makeBatch(JawboneService.makeEndpoint('users'));
      ifaceInst.config.makeListElementFtn = function(listData) {
        return new ListViewerElemInterface({
          api : new ListElemAPI(listData),
          data : new UserV3Obj(listData.element)
        });
      };
      ifaceInst.config.onSelect = config.onSelect || function(element, index) {
        $log.info('supply on select function to UserListV3Interface');
      };
      ifaceInst.config.onDeselect = config.onDeselect || function(element, index) {
        $log.info('supply on deselect function to UserListV3Interface');
      };
		  return ifaceInst;            
    };
    return iface;
  }

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log) {
    var object = function(data) {
    	var objInst = this;

    	$log.info('data to user v3 object: ' + JSON.stringify(data));
    	var profile = data.profile || {};
    	objInst._id = data._id || null;
    	objInst.memberSince = data.createdAt || null;
    	objInst.email = data.email || null;
    	objInst.first = profile.first || null;
    	objInst.last = profile.last || null;
    	objInst.weight = profile.weight || null;
    	objInst.height = profile.height || null;
    	objInst.gender = profile.gender || null;
      	objInst.template = 'app/user/user-v3/_user-list-elem-tpl.html';

		return objInst;
    };
    return object;
  }
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
  function ProfileCtrl($log, $scope, JawboneService, ProfileComponentBuilder, GroupManagerV3Interface) {
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

        vm.groupMgrIface = new GroupManagerV3Interface({
          
        });

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
    .filter('sleepsListfilter', FilterFtn)    
    .factory('SleepsListInterface', InterfaceFtn)
    .factory('SleepV3Service', ServiceFtn)
    .factory('SleepsV3Obj', ObjFtn);

  //----------------------------------------------------
  //  FILTER FUNCTION
  //----------------------------------------------------  
  function FilterFtn() {
    return function(arg) {  
      if(arg) {
      	// do something with arg
        return arg;
      }
      return arg;
    }     
  }

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function InterfaceFtn($log, ListViewerV3Interface, JawboneService, ListViewerElemInterface, SleepsV3Obj, ListElemAPI) {
    var iface = function(config) {
      var ifaceInst = new ListViewerV3Interface();
      var config = config || {};

      var userId = config.userId || null;
      ifaceInst.config.getElementsObj = JawboneService.makeBatch(JawboneService.makeEndpoint('sleeps', userId));
      ifaceInst.config.makeListElementFtn = function(listData) {
        return new ListViewerElemInterface({
          api : new ListElemAPI(listData),
          data : new SleepsV3Obj(listData.element)
        });
      };
      ifaceInst.config.headerTpl = 'app/sleeps/sleeps-v3/_sleeps-header-tpl.html';

      return ifaceInst;
    };
    return iface;
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

  function convertToSeconds(str, $log) {
    var totalMins = convertToMinutes(str, $log);
    return (totalMins * 60.0);
  }

  function convertToHoursMins(durationInSeconds, $log) {
    var sec_num = parseInt(durationInSeconds, 10);    
    var hours   = Math.floor(sec_num / 3600) % 24;
    var minutes = Math.floor(sec_num / 60) % 60;
    $log.info('hours: ' + hours + ' mins rem: ' + minutes);
  }

  function percentageOf(percent, total, $log) {
    //$log.info('find x as % of y: ' + percent + ' of ' + total);
    return (percent / total) * 100;
  }

  function ServiceFtn($log) {
    var service = {

    };
    return service;
  }

  function ObjFtn($log, JawboneService) {
    var obj = function(data) {
    	var objInst = this;

      //$log.info('sleep data: ' + JSON.stringify(data, true, 3));

      // retrieve specific sleep details
      var sleepService = JawboneService.sleepService();
      sleepService.getSleepTicks(data.xid)
      .then(function(ticksResponse) {
        sleepService.getSleepDetails(data.xid)
        .then(function(detailsResponse) {
          // $log.info('sleep ticks: ' + JSON.stringify(ticksResponse));
          // $log.info('sleep details: ' + JSON.stringify(detailsResponse));
        });

        // var size = response.data.data.size;
        // var timeToSleepOnset = (size > 0 ? response.data.data.items[0].time : 0);
        // var timeCreated = (size > 0 ? objInst.timeCreated : 0);
        // objInst.timeToSleep = (timeToSleepOnset - objInst.timeCreated);

        // $log.info('time of first tick: ' + JSON.stringify(timeToSleepOnset));
        // $log.info('time created: ' + JSON.stringify(timeCreated));
        // $log.info('time asleep : ' + JSON.stringify(objInst.asleepTime));
        // $log.info('time to sleep: ' + (objInst.asleepTime - timeCreated));
        // $log.info('time to sleep: ' + (objInst.timeToSleep));
      });

      // sleeps breakpoint
      var details = data.details || {};
      var rem_seconds = details.rem || 0;
      var light_seconds = details.light || 0;
      var deep_seconds = details.sound || 0;
      var asleepTime = details.asleep_time || 0;

      var awakeTime = details.awake_time || 0;      
      var timeCreated = data.time_created || 0;
      var timeCompleted = data.time_completed || 0;
      var totalTime = (timeCompleted - timeCreated);

      objInst.date = data.date || new Date();
      objInst.image = 'https://jawbone.com' + data.snapshot_image;
      objInst.template = 'app/sleeps/sleeps-v3/_sleeps-list-elem-tpl.html';

      // these are the metrics requested by Janet they are in seconds apart from efficiency
      objInst.timeToSleep = (asleepTime - timeCreated);
      objInst.totalSleepTime = (awakeTime - asleepTime);
      objInst.wakeAfterSleep = (timeCompleted - awakeTime);
      objInst.sleepEfficiency = percentageOf(objInst.totalSleepTime, totalTime, $log);
      objInst.remSleep = rem_seconds;
      objInst.lightSleep = light_seconds;
      objInst.deepSleep = deep_seconds;

      objInst.getField = function(index) {
        switch(index) {
          case 0:
            return objInst.timeToSleep / 60.0;
          case 1:
            return objInst.totalSleepTime / 60.0;
          case 2:
            return objInst.wakeAfterSleep / 60.0;
          case 3: 
            return objInst.sleepEfficiency;
          case 4:
            return objInst.remSleep / 60.0;
          case 5:
            return objInst.lightSleep / 60.0;
          case 6:
            return objInst.deepSleep / 60.0;
          default:          
            return 0;
        }
      };

      // might be wanted
      //objInst.awakenings = details.awakenings || 0;
      //objInst.duration = details.duration || 0; // this is the same as total time

      // what is this?
      //objInst.sleep_time = details.sleep_time || 0;
      // var awake_seconds = details.awake || 0;
      // objInst.awake = awake_seconds / 60.0;
      //objInst.title = convertToSeconds(data.title, $log);

      // $log.info('time created: ' + objInst.timeCreated);
      // $log.info('time completed: ' + objInst.timeCompleted);
      // $log.info('asleep time: ' + objInst.asleepTime);
      // $log.info('awake time: ' + objInst.awakeTime);
      // var totalTime = (objInst.timeCompleted - objInst.timeCreated);
      // var sleepTime = (objInst.awakeTime - objInst.asleepTime);
      // $log.info('total time: ' + totalTime);
      // $log.info('asleep time: ' + sleepTime);
      // $log.info('title ' + (data.title) + ' secs : ' + objInst.title * 60.0);
      // $log.info('duration scored as: ' + objInst.duration);
      // $log.info('diff: ' + (totalTime - sleepTime));

      return objInst;
    };
    return obj;
  }

})();
	

(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('UserViewerV3Adaptor', AdaptorFtn)
    .factory('SleepsChartInterface', InterfaceFtn);

  //----------------------------------------------------
  //  ADAPTOR FUNCTION
  //----------------------------------------------------  
    function AdaptorFtn($log, UserViewerV3Interface) {
      var adaptor = function(config) {
        var adaptorInst = new UserViewerV3Interface();
        config = config || {};

        adaptorInst.config.onConfirm = config.onConfirm || function(element) {
          $log.info('supply an onConfirm function to UserViewerV3Adaptor');
        };  
        adaptorInst.config.canAddPlots = config.canAddPlots || false;      

        return adaptorInst;
      };
      return adaptor;
    }

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function InterfaceFtn($log, ChartV3Interface, JawboneService, SleepsV3Obj, CommonModals, BaseSelector, UserViewerV3Adaptor) {
    var iface = function(config) {

      var makePlotParams = makePlotParamsFtn;
      var extractFieldValue = extractFieldValueFtn;

      var ifaceInst = new ChartV3Interface();
      var config = config || {};

      ifaceInst.config = {      
        patient : config.patient || null,
        plots: [ 'time to sleep', 'total sleep', 'awake time', 'efficiency', 'rem', 'light', 'deep' ],
        extractFieldValue : function(obj, index) {
          return extractFieldValue(obj, index);
        },
        yAxisLabels: [ 'minutes', 'minutes', 'minutes', '%', 'minutes', 'minutes', 'minutes' ],
        plotParams: makePlotParams(config.patient),
        getElementsObj: JawboneService.makeBatch(JawboneService.makeEndpoint('sleeps')),
        makeElement : function(element) {
          return new SleepsV3Obj(element);
        },
        preprocessElements: function(arr) {
          return arr.reverse();
        },
        getAdditionalPlotData: function(cb) {
          // we will eventually pass this function in from the parent iface
          //$log.info('get additional plot data in SleepChartV3 Interface');
          CommonModals.selector(new BaseSelector({
            tpl : 'app/profile/_user-modal-tpl.html',
            iface : new UserViewerV3Adaptor({
              onConfirm : function(patient) {
                //$log.info('patient confirmed: ' + JSON.stringify(patient.config.selected));
                var patientId = patient.config.selected._id;
                var getElements = JawboneService.makeBatch(JawboneService.makeEndpoint('sleeps', patientId));
                cb(getElements);
              }
            })
          }));
        },
        canAddPlots : config.canAddPlots || false    
      };

      //------------------------------------
      // make plot params function
      //------------------------------------
      function makePlotParamsFtn(patient) {
        //$log.info('make plot params: ' + JSON.stringify(patient));
        //var profile = patient.profile || {};
        return {
          range : [new Date(2016, 11, 1), new Date(2017, 6, 30)],        
          plotName : patient.first || null
        }       
      }

      //------------------------------------
      // extract field value function
      //------------------------------------
      function extractFieldValueFtn(obj, field) {
        $log.info('from object : ' + JSON.stringify(obj));
        if(typeof obj.getField === "function") {
          return obj.getField(field);          
        } else {
          return 0;
        }
      }

      return ifaceInst;
    };

    return iface;
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

  function SleepObjFtn($log, ListElementAPIObj) {
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

      //this.api = new ListElementAPIObj(this);

      // var o = this;
      // o.selected = false;

      // o.activated = function() {
      //   o.selected = true;
      // };

      // o.deactivated = function() {
      //   o.selected = false;
      // }

    };
    return SleepObj;
  }

})();
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('SleepsChartV2DownloaderIface', InterfaceFtn);

  function InterfaceFtn($log, BaseInterface) {
  	var iface = function(chartV2Iface) {
      var ifaceInst = this;
      angular.merge(ifaceInst, ifaceInst, new BaseInterface());

      ifaceInst.config = {
        tpl : 'app/sleeps/_sleeps-chart-download-tpl.html',
        content : chartV2Iface.getAPI().getGraphData() || []
      };

      return ifaceInst;
  	};
  	return iface;
  }

})();


(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('SleepsChartDownloaderBuilder', SleepsChartDownloaderBuilderFtn)
    .factory('SleepsChartDownloaderObj', SleepsChartDownloaderObjFtn);

  function SleepsChartDownloaderBuilderFtn($log) {
  	var SleepsChartDownloaderBuilder = function(getSleepData) {
  		//$log.info('ran sleeps chart downloader with arg: ' + JSON.stringify(arg));
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
    .factory('SleepListV2Interface', InterfaceFtn);

    var id = 'sleeps/sleep-list-v2-comp: ';

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function InterfaceFtn($log, BaseInterface, SleepObj, JawboneService) {
    var iface = function(config) {

		var makeHeaderObj = makeHeaderObjFtn;
	  	var ifaceInst = this;

		angular.merge(ifaceInst, ifaceInst, new BaseInterface());      	

		ifaceInst.config = { 
			patient : config.patient || null,
			header : {
				heading: 'Sleeps',
				headerTemplate: 'app/sleeps/_sleeps-header-tpl.html',
				headerObj: makeHeaderObj()
			},
			events: {
				onCreated : function(api) {
					$log.info(id + ' on created');
				},
				onSelect : function(elem) {
					$log.info(id + ' on Select');
				},
				onDeselect : function(elem) {
					$log.info(id + ' on Deselect');
				},
				onConfirm : function() {
					$log.info(id + ' admin on Confirm function');
				},
				onStateChange : function() {
					$log.info(id + ' admin on State Change function');
				},
				onEvent : function() {
					$log.info(id + ' admin on Event function');
				}
			},
			loaderMessage: 'Loading Sleeps...',          
			getElementsObj : JawboneService.makeBatch(JawboneService.makeEndpoint('sleeps')),
			makeElement : function(element) {       
			  return new SleepObj(element);
			},
			elementTemplate: 'app/sleeps/_sleeps-element-tpl.html'                        
	    };

		function makeHeaderObjFtn() {
		}

		return ifaceInst;  
    };
    return iface;
  }
})();


(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('SleepChartV2Interface', InterfaceFtn);

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  //function InterfaceFtn($log, BaseInterface, JawboneService, SleepObj) {
  function InterfaceFtn($log, ChartV2Interface, JawboneService, SleepObj) {
    var iface = function(config) {
    	var makePlotParams = makePlotParamsFtn;
		var ifaceInst = this;
		//angular.merge(ifaceInst, ifaceInst, new BaseInterface());
		angular.merge(ifaceInst, ifaceInst, new ChartV2Interface(config));

		var plotParams = makePlotParams(config.patient);

		ifaceInst.config = {          
			patient : config.patient || null,
			plots: [ 'title', 'sounds', 'awakenings', 'light' ],
			plotParams: plotParams,
			getElementsObj: JawboneService.makeBatch(JawboneService.makeEndpoint('sleeps')),
			makeElement : function(element) {
				return new SleepObj(element);
			},
			preprocessElements: function(arr) {
				return arr.reverse();
			},
			getAdditionalPlotData: function(cb) {
				$log.info('get additional plot data in SleepChartV2 Interface');
			}			
		};

		ifaceInst.notify = function(eventName) {
			var api = ifaceInst.getObjectAPI();
			api.notify(eventName);
		};

		ifaceInst.getAPI = function() {
			return ifaceInst.getObjectAPI();
		};

		//------------------------------------
		// make plot params function
		//------------------------------------
		function makePlotParamsFtn(patient) {
			$log.info('make plot params: ' + JSON.stringify(patient));
			return {
			  range : [new Date(2016, 11, 1), new Date(2017, 2, 20)],
			  plotName : patient.user.profile.first          
			}      	
		}
    };
    return iface;
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
  function ProfileCtrl($log, $scope, JawboneService, ProfileComponentBuilder, SleepsListInterface, SleepsChartInterface, NotesViewerV3Interface) {
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

        var profile = mainUserFull.profile || {};
        var patient = {          
          _id: null,
          email: mainUserFull.email || null,
          first: profile.first || null,
          gender: profile.gender || null,
          height: profile.height || null,
          last: profile.last || null,
          weight: profile.weight || null
        };

        vm.sleepsListIface = new SleepsListInterface(mainUserFull);
        vm.notesViewerIface = new NotesViewerV3Interface(mainUserFull);
        vm.sleepsChartIface = new SleepsChartInterface({
          patient:  patient,
          canAddPlots: false
        });

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
    .directive('patientSummaryOld', patientSummaryFtn);

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
        //$log.info('assign patient summ obj : ' + JSON.stringify(newval));
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
    .factory('PatientV3Obj', ObjectFtn);

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log) {
    var object = function(data) {
    	var objInst = this;

    	$log.info('data passed to patientv3 obj: ' + JSON.stringify(data));

      var data = data || {};
      var user = data.user || {};
      var profile = user.profile || {};

      objInst._id = data._id || null;
      objInst.email = data.user.email || null;
      objInst.first = profile.first || null;
      objInst.last = profile.last || null;    
      objInst.weight = profile.weight || null; 
      objInst.gender =  profile.gender || null;
      objInst.height = profile.height || null;
      objInst.joinDate = data.joinDate || null;
      objInst.template = 'app/patient/patient-manager-v3/_patient-tpl.html';

		return objInst;
    };
    return object;
  }

})();


(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .filter('patientMgrV3filter', FilterFtn)    
    .factory('PatientMgrV3Interface', InterfaceFtn)  
    .factory('PatientMgrV3Obj', ObjectFtn)
    .controller('PatientMgrV3Ctrl', CtrlFtn)
    .directive('patientMgrV3', DirFtn);

  //----------------------------------------------------
  //  FILTER FUNCTION
  //----------------------------------------------------  
  function FilterFtn() {
    return function(arg) {  
      if(arg) {
      	// do something with arg
        return arg;
      }
      return arg;
    }     
  }

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function InterfaceFtn($log, BaseInterface) {
    var iface = function(config) {
      var ifaceInst = new BaseInterface();
      var config = config || {};

      ifaceInst.config = {   
      	groupId: config.groupId || 0      
      };

      return ifaceInst;            
    };
    return iface;
  }

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log, PatientMgrV3Interface, BaseComp, ListViewerV3Interface, ListViewerElemInterface, ListElemAPI, SleepsListInterface, SleepsChartInterface, PatientV3Obj, JawboneService) {
    var object = function(iface) {

    	var onRender = onRenderFtn;
    	var activateEditMode = activateEditModeFtn;

      var objInst = new BaseComp();
      objInst.mode = 'view';
      objInst.patientsListInterface = null;
      objInst.seletedPatient = null;
      objInst.sleepsChartInterface = null;
      objInst.sleepsListInterface = null;

      objInst.api = {
      	render: function(cb) {
      		onRender();
      		cb();
      	},
        
      	getMode : function() {
      		return objInst.mode;
      	},

        setViewMode: function() {
          objInst.mode = 'view';
        },

        refresh : function() {
          objInst.patientsListInterface.getAPI().refresh();
        }
      };

      function onRenderFtn() {

      	objInst.patientsListInterface = new ListViewerV3Interface({
    			getElementsObj : JawboneService.makeBatch(JawboneService.makeFieldGetter('groups', iface.config.groupId, 'members')),
    			makeListElementFtn : function(listData) {
    				return new ListViewerElemInterface({
    				  api : new ListElemAPI(listData),
    				  data : new PatientV3Obj(listData.element)
    				});
    			},
    			onSelect : function(element, index) {
            var config = element.config || {};
            var patient = config.data || {};
    				activateEditMode(patient);
    			},
    			headerTpl : 'app/patient/patient-manager-v3/_patient-list-action-bar-tpl.html',
          canEdit : false		        
    		});
      }

      function activateEditModeFtn(selectedPatient) {
        objInst.mode = 'edit';
        // objInst.selectedPatient = selectedPatient.config.data;
        // var patientId = selectedPatient.config.data;

        objInst.sleepsChartInterface = new SleepsChartInterface({
          patient : selectedPatient,
          canAddPlots : true
        });

        objInst.sleepsListInterface = new SleepsListInterface({
          patient : selectedPatient
        });
      }

      return objInst;
    };
    return object;
  }

  //----------------------------------------------------
  //  CTRL FUNCTION
  //----------------------------------------------------  
  function CtrlFtn($scope, PatientMgrV3Obj, BaseInterface) {
    var vm = this;  
    vm.obj = null;

    $scope.$watch(function(scope) {
      return (vm.iface);
    }, function(iface, oldval) {
      if(!iface) {
      	var iface = new BaseInterface()
      	vm.obj = new PatientMgrV3Obj(iface);
      	iface.setAPI(vm.obj.getAPI);
      	vm.obj.api.render(function() {

      	});
      } else {
        vm.obj = new PatientMgrV3Obj(iface);
        iface.setAPI(vm.obj.getAPI);
        vm.obj.api.render(function() {
        });
      }
    }); 
  }

  //----------------------------------------------------
  //  DIRECTIVE
  //----------------------------------------------------  
  function DirFtn() {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'PatientMgrV3Ctrl',
      controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      templateUrl: 'app/patient/patient-manager-v3/_patient-mgr-v3-tpl.html'
    };
    return directive;   
  }
})();

(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('PatientsComponentBuilder', PatientsComponentBuilderFtn)
    .factory('GroupMemberObj', GroupMemberObjFtn)
    .factory('PatientObj', PatientObjFtn)
    .filter('defaultPatient', defaultPatientFtn)
    .controller('PatientCtrl', PatientCtrlFtn)
    .directive('patientMgrOld', patientMgrFtn);

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
    obj.sleepsViewer.listobj.state = {
      deleteMode : false
    };
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

  function buildListViewer(obj, group, GroupMemberObj) {
    obj.patientViewer.listobj = {};
    obj.patientViewer.listobj.state = {
      deleteMode : false
    };    
    obj.patientViewer.listobj.template = 'app/patient/_group-member-element-tpl.html';
    obj.patientViewer.listobj.heading = 'Patients';
    obj.patientViewer.listobj.loaderMessage = 'Loading Patients...';

    var groupId = group._id || null;
    obj.patientViewer.listobj.getElementsObj = jbservice.makeBatch(jbservice.makeFieldGetter('groups', group._id, 'members'));

    obj.patientViewer.listobj.makeElement = function(objElement) {
      return new GroupMemberObj(objElement)
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

  function PatientsComponentBuilderFtn($q, $log, GroupMemberObj, PatientObj, SleepObj, JawboneService, SleepsChartBuilderObj, SleepsChartDownloaderBuilder, PatientSummObj, ModalService) {
    var PatientsComponentBuilder = function(user, userGroup) {

      // assign some scoped variables rather than pass these as args
      log = $log;
      jbservice = JawboneService;

      //log.info('user group: ' + JSON.stringify(userGroup));

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
      buildListViewer(obj, userGroup, GroupMemberObj);

    };
    return PatientsComponentBuilder;
  }

  function GroupMemberObjFtn($log, PatientObj, ListElementAPIObj) {
    var GroupMemberObj = function(objElement) {

      //$log.info('group member obj element: ' + JSON.stringify(objElement));

      var o = this;
      o.data = objElement || {};
      o.joinDate = o.data.user.joinDate || Date.now();
      o.user = new PatientObj(o.data.user);
      o.api = new ListElementAPIObj(this);
    };
    return GroupMemberObj;
  }

  function PatientObjFtn($log, ListElementAPIObj) {
    var PatientObj = function(objElement) {

      //$log.info('patient obj element: ' + JSON.stringify(objElement));

      var o = this;
      o.data = objElement || {};
      o._id = objElement._id || null;
      o.jawboneId = objElement.jawboneId || 'blank';
      o.obj = objElement.profile || {};
      o.first = o.obj.first || 'blank';
      o.last = o.obj.last || 'blank';
      o.weight = o.obj.weight || 'blank weight';
      o.gender = o.obj.gender || 'no gender';
      o.height = o.obj.height || 'no height';

      this.api = new ListElementAPIObj(this);

      // var o = this;
      // o.data = objElement || {};
      // o._id = objElement.user._id || null;
      // o.jawboneId = objElement.jawboneId || 'blank';
      // o.obj = objElement.user.profile || {};
      // o.first = o.obj.first || 'blank';
      // o.last = o.obj.last || 'blank';
      // o.weight = o.obj.weight || 'blank weight';
      // o.gender = o.obj.gender || 'no gender';
      // o.height = o.obj.height || 'no height';
      // o.joinDate = objElement.joinDate || null;

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
    .filter('notesViewerV3filter', FilterFtn)    
    .factory('NotesViewerV3Interface', InterfaceFtn)  
    .factory('NotesViewerV3Obj', ObjectFtn)
    .controller('NotesViewerV3Ctrl', CtrlFtn)
    .directive('notesViewerV3', DirFtn);

  //----------------------------------------------------
  //  FILTER FUNCTION
  //----------------------------------------------------  
  function FilterFtn() {
    return function(arg) {  
      if(arg) {
      	// do something with arg
        return arg;
      }
      return arg;
    }     
  }

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function InterfaceFtn($log, BaseInterface) {
    var iface = function(config) {
      var ifaceInst = new BaseInterface();
      var config = config || {};

      ifaceInst.config = {          
      };

      return ifaceInst;            
    };
    return iface;
  }

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log, JawboneService, NotesViewerV3Interface, NoteService, BaseComp, ListViewerV3Interface, NoteV3Interface, ListElemAPI, NoteV3Obj, NotesHeaderV3Interface) {
    var object = function(iface) {

      var handleElementClick = handleElementClickFtn;

      var objInst = new BaseComp();
      objInst.notesList = null;

      objInst.api = {
        message: 'notes viewer api',
      	render : renderFtn,
        nofity : function(event, arg) {
          $log.info('notes viewer notified of event: ' + event);
        }
      };

      function renderFtn(cb) {
        // the notes list
      	objInst.notesList = new ListViewerV3Interface({
      		getElementsObj : JawboneService.makeBatch(JawboneService.makeEndpoint('notes')),
      		makeListElementFtn : function(elemInfo) {
	          return new NoteV3Interface({
	          	data: elemInfo
	          });
      		},
          onElementClicked : function(action, element, index) {
            handleElementClick(action, element, index);
          },
          onDelete : function(elem, idx, cb) {
            $log.info('delete the note: ' + JSON.stringify(elem.config.data));
            NoteService.deleteNote(elem.config.data)
            .then(function(response) {
              cb();
            })
          },
          headerTpl : 'app/notes-viewer/notes-viewer-v3/_notes-list-action-bar-tpl.html'
      	});

        // the notes header
        objInst.notesHeader = new NotesHeaderV3Interface({
          onCreatedNote : function(createdNote) {
            objInst.notesList.notify('refresh');
          },
          onEditedNote : function(editedNote) {
            objInst.notesList.notify('refresh');
          }
        });

      	cb();
      }

      //--------------------------------------------------
      //  HANDLE ELEMENT CLICKED FTN
       //--------------------------------------------------     
      function handleElementClickFtn(action, element, index) {
        if(action === 'selected' || action === 'deselected') {
          objInst.notesHeader.notify(action, { 'elem': element, 'idx' : index });
        } 
      }

      return objInst;
    };
    return object;
  }

  //----------------------------------------------------
  //  CTRL FUNCTION
  //----------------------------------------------------  
  function CtrlFtn($log, $scope, NotesViewerV3Obj) {
    var vm = this;  
    vm.obj = null;

    $scope.$watch(function(scope) {
      return (vm.iface);
    }, function(iface, oldval) {
		if(iface) {
        	vm.obj = new NotesViewerV3Obj(iface);
        	iface.setAPI(vm.obj.getAPI);
        	vm.obj.api.render(function() {
        	});
      	}
    }); 
  }

  //----------------------------------------------------
  //  DIRECTIVE
  //----------------------------------------------------  
  function DirFtn() {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'NotesViewerV3Ctrl',
      controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      templateUrl: 'app/notes-viewer/notes-viewer-v3/_notes-viewer-tpl.html'
    };
    return directive;   
  }
})();


(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .filter('notesHeaderV3filter', FilterFtn)    
    .factory('NotesHeaderV3Interface', InterfaceFtn)
    .factory('NoteService', ServiceFtn)  
    .factory('NotesHeaderV3Obj', ObjectFtn)
    .controller('NotesHeaderV3Ctrl', CtrlFtn)
    .directive('notesHeaderV3', DirFtn);

  //----------------------------------------------------
  //  FILTER FUNCTION
  //----------------------------------------------------  
  function FilterFtn() {
    return function(arg) {  
      if(arg) {
      	// do something with arg
        return arg;
      }
      return arg;
    }     
  }

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function InterfaceFtn($log, BaseInterface) {
    var iface = function(config) {
      var ifaceInst = new BaseInterface();
      var config = config || {};

      ifaceInst.config = {    
        onCreatedNote : config.onCreatedNote || function(createdNote) {
          $log.info('supply an on created note function');
        },
        onEditedNote : config.onEditedNote || function(editedNote) {
          $log.info('supply an on edited note function');
        }
      };

      return ifaceInst;            
    };
    return iface;
  }

  //----------------------------------------------------
  //  SERVICE OBJECT
  //----------------------------------------------------  
  function ServiceFtn($log, NoteV3Obj, $http) {
      var serviceInst = {
        createNote : createNoteFtn,
        deleteNote : deleteNoteFtn,
        editNote : editNoteFtn
      };

      function createNoteFtn(note) {
        $log.info('note service create note: ' + JSON.stringify(note));
        return $http.post('/notes', note)
        .then(function(response) {
          return response;
        })
        .catch(function(errResponse) {
          $log.info('error creating note: ' + JSON.stringify(errResponse));
        });
      };

      function deleteNoteFtn(note) {
        return $http.delete('/notes/' + note._id)
        .then(function(response) {
          return response;
        })
        .catch(function(errResponse) {
          $log.info('error deleting note: ' + JSON.stringify(errResponse));
        });       
      };

      function editNoteFtn(note) {
        return $http.put('/notes/' + note._id, note)
        .then(function(response) {
          return response;
        })
        .catch(function(errResponse) {
          $log.info('error updating note: ' + JSON.stringify(errResponse));
        });
      };

      return serviceInst;
  }

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log, NotesHeaderV3Interface, NoteV3Obj, BaseComp, NoteService) {
    var object = function(iface) {
      
      var render = renderFtn;
      var notify = notifyFtn;
      var handleSelect = handleSelectFtn;
      var reset = resetFtn;
      var mode = 'create';
      var tempNote = null;

      var objInst = new BaseComp();

      objInst.api = {
        render : renderFtn,
        notify : notifyFtn,
      	inCreateMode : function() {
      		return mode === 'create';
      	},
      	inEditMode : function() {
      		return mode === 'edit';
      	},
      	inDeleteMode : function() {
      		return mode === 'delete';
      	},
      	cancelNote : function() {
      		$log.info('clicked to cancel note');
          tempNote = new NoteV3Obj();
      	},
        prepareNewNote : function() {
          $log.info('prepare a new note');
          tempNote = new NoteV3Obj();
        },
        createNote : function() {
          $log.info('clicked to create note');
          NoteService.createNote(tempNote).then(function(response) {
            iface.config.onCreatedNote(angular.copy(tempNote));
            reset();
            $log.info('response when created note: ' + JSON.stringify(response));
          });
      	},
        editNote : function() {
          $log.info('clicked to update note');
          NoteService.editNote(tempNote).then(function(response) {
            iface.config.onEditedNote(angular.copy(tempNote));
            reset();
            $log.info('response when updating note: ' + JSON.stringify(response));
          });
        },
      	getTempNote : function() {
      		return tempNote;
      	}
      };

      function renderFtn(cb) {
        cb();
      }

      function notifyFtn(event, arg) {
        $log.info('notes header notified of event: ' + event);
        if(event === 'selected') {
          handleSelect(arg);
        } else if(event === 'deselected') {
          reset();
        }
      }

      function handleSelectFtn(arg) {
        mode = 'edit';
        tempNote = new NoteV3Obj(arg.elem.config.data);
      }

      function resetFtn() {
        mode = 'create';
        tempNote = null;

      }

      return objInst;
    };
    return object;
  }

  //----------------------------------------------------
  //  CTRL FUNCTION
  //----------------------------------------------------  
  function CtrlFtn($scope, NotesHeaderV3Obj) {
    var vm = this;  
    vm.obj = null;

    $scope.$watch(function(scope) {
      return (vm.iface);
    }, function(iface, oldval) {
      if(iface) {
        vm.obj = new NotesHeaderV3Obj(iface);
        iface.setAPI(vm.obj.getAPI);
        vm.obj.api.render(function() {
        });
      }
    }); 
  }

  //----------------------------------------------------
  //  DIRECTIVE
  //----------------------------------------------------  
  function DirFtn() {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'NotesHeaderV3Ctrl',
      controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      templateUrl: 'app/notes-viewer/notes-viewer-v3/_notes-header-tpl.html'
    };
    return directive;   
  }
})();


(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('NoteV3Interface', InterfaceFtn)  
    .factory('NoteV3Obj', ObjectFtn);


  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function InterfaceFtn($log, ListViewerElemInterface, ListElemAPI, NoteV3Obj) {
    var iface = function(config) {
      var ifaceInst = new ListViewerElemInterface();
      var config = config || {};

      ifaceInst.config = {
      	api: new ListElemAPI(config.data),
      	data: new NoteV3Obj(config.data.element)          
      };

      return ifaceInst;            
    };
    return iface;
  }

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log) {
    var object = function(notedata) {

      var objInst = this;
      var notedata = notedata || {};
      objInst._id = notedata._id || null;
      objInst.text = notedata.text || '';
      objInst.owner = notedata.owner || null;
      objInst.creationDate = notedata.creationDate || Date.now();
      objInst.textLimit = 50;
      objInst.template = 'app/notes-viewer/notes-viewer-v3/_note-elem-tpl.html';

      $log.info('notedata to NoteV3Obj: ' + JSON.stringify(objInst));

		return objInst;
    };
    return object;
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

  function NoteObjFtn($log, ListElementAPIObj) {
    var NoteObj = function(notedata, callbacks) {
      $log.info('the note data: ' + JSON.stringify(notedata));
      var obj = this;
      obj._id = notedata._id;
      obj.text = notedata.text || 'blank';
      obj.owner = notedata.owner || null;
      obj.creationDate = notedata.creationDate || null;
      obj.textLimit = 50;
      // obj.selected = false;

      // obj.cbs = callbacks || {};      
      // obj.delete = function() {
      //   $log.info('delete me: ' + JSON.stringify(obj));
      //   obj.cbs.onDelete(obj);
      // };

      // obj.clicked = function() {
      //   //$log.info('note obj was clicked...not necessarily selected!');
      // };

      // obj.onSelected = function() {
      //   obj.selected = true;
      // };

      // obj.onDeselected = function() {
      //   obj.selected = false;
      // };

      this.api = new ListElementAPIObj(this);

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

        listobj.headerFtns = {
          deleteNotes : function() {
            $log.info('call to delete notes');
            listobj.baseFtns.deselectAll();
            listobj.state.deleteMode = !(listobj.state.deleteMode);
            listobj.baseFtns.propagateEvent('deleteMode', null);
          }
        };
      }

      function createlist() {
        var args = arg || {};
        obj.notes = {};
        obj.notes.listobj = {};
        obj.notes.listobj.state = {
          deleteMode : false
        };
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
          $log.info('supplied on select function: ');
          //elem.onSelected();
          obj.callbacks.onSelect(elem);
        };

        obj.notes.onDeselect = function(elem) {
          $log.info('supplied on deselect function: ');
          //elem.onDeselected();
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
        ev = ev.originalEvent || event.originalEvent;
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
        ev = ev.originalEvent || event.originalEvent;
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
    .factory('BaseSelector', BaseSelectorFtn)
    .factory('ModalService', ModalService)
    .factory('CommonModals', CommonModals);

    //--------------------------------------------------------------------
    // DEFAULT MODAL INSTANCE CTRL
    //--------------------------------------------------------------------
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

    //--------------------------------------------------------------------
    // BASE SELECTOR
    //--------------------------------------------------------------------
	 function BaseSelectorFtn($log, BaseInterface) {
	 	var selector = function(config) {
	 		var selectorInst = new BaseInterface();
	 		config = config || {};
	 		var selection = null;

	 		selectorInst.iface = config.iface;
	 		selectorInst.tpl = config.tpl;
	 		selectorInst.onSelect = function(arg) {
	 			$log.info('selection made: ' + JSON.stringify(arg.iface));
	 		};
	 		selectorInst.onConfirm = function(arg) {
	 			$log.info('base selector was confirmed: ' + JSON.stringify(arg.iface));
	 			selectorInst.iface.config.onConfirm(arg.iface);
	 		};

	 		return selectorInst;
	 	};
	 	return selector;
	 }

    //--------------------------------------------------------------------
    // COMMON MODAL TYPES
    //--------------------------------------------------------------------
	function CommonModals($log, $q, ModalService) {
		var service = {
			confirm: confirm,
			selector: selector
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

		function selector(selectObj) {
			return ModalService.onClick(selectObj)
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
	  	function onClick(ps) {
	  		//$log.info('params: ' + JSON.stringify(params));
	  		ps = ps || {};
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
	         	modalObj.onConfirm(ps);
	         	deferred.resolve(modalObj);
	        }, function(modalObj) {
	          modalObj.onDismiss(ps);
	          deferred.resolve(modalObj);
	        });

	        return deferred.promise;        
	  	}


	  	// function onClick(params) {
	  	// 	//$log.info('params: ' + JSON.stringify(params));
	  	// 	var ps = params || {};
	  	// 	var ctrl = ps.ctrl || 'DefaultModalInstanceCtrl';
	  	// 	var modalSize = ps.size || 'md';
	  	// 	ps.tpl = ps.tpl || 'app/_default-modal-tpl.html';
	  	// 	ps.onConfirm = ps.onConfirm || function() {
	  	// 		$log.info('supply on confirm ftn');
	  	// 	};
	  	// 	ps.onDismiss = ps.onDismiss || function() {
	  	// 		$log.info('supply on dismiss ftn');
	  	// 	};

	  	// 	var deferred = $q.defer();
    //     	var modalInstance = $uibModal.open({
	   //        	animation: false,
    // 	      	ariaLabelledBy: 'modal-title',
    //     	  	ariaDescribedBy: 'modal-body',
    //       		templateUrl: 'app/_modal-frame-tpl.html',
    //       		controller: ctrl,
    //       		controllerAs: 'ctrl',
    //       		size: modalSize,
    //       		resolve: {
    //         		resolveArg : function () {
    //           			return ps;
    //         		}
    //       		}
    //     	});

	   //      modalInstance.result.then(function(modalObj) {
	   //       	modalObj.onConfirm(ps);
	   //       	deferred.resolve(modalObj);
	   //      }, function(modalObj) {
	   //        modalObj.onDismiss(ps);
	   //        deferred.resolve(modalObj);
	   //      });

	   //      return deferred.promise;        
	  	// }

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
    .factory('ListElemAPI', APIFtn)  
    .factory('ListViewerElemInterface', InterfaceFtn)  
    .factory('ListViewerV3ElemObj', ObjectFtn)
    .controller('ListViewerV3ElemCtrl', CtrlFtn)
    .directive('listViewerElem', DirFtn);

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function APIFtn($log) {
    var adaptor = function(config) {
      var adaptorInst = this;

      //$log.info('config passed to APIFtn: ' + JSON.stringify(config));

      adaptorInst.listAPI = config.api;
      adaptorInst.index = config.index;
      adaptorInst.selected = false;
      adaptorInst.deleteMode = false;
      adaptorInst.confirmDeleteMode = false;

      adaptorInst.onClick = function() {
        $log.info('element was clicked...');
        if(this.deleteMode) {
          this.confirmDeleteMode = !this.confirmDeleteMode;
        } else {
          this.selected = !this.selected;
          this.listAPI.elementClicked(this.index);                  
        }
      };

      adaptorInst.notify = function(event, arg) {
        switch(event) {
          case 'deleteMode':
            this.deleteMode = !this.deleteMode;
            break;
          case 'deselect':
            this.selected = false;
            break;
          default:
            break;
        }
      };

      adaptorInst.cancel = function(event) {
        this.confirmDeleteMode = false;
        event.stopPropagation();
      };

      adaptorInst.delete = function(event) {
        this.confirmDeleteMode = false;
        this.listAPI.deleteElement(this.index);
        event.stopPropagation();        
      };

      $log.info('is the list in delete mode? ' + adaptorInst.listAPI.isDeleteMode());
      if(adaptorInst.listAPI.isDeleteMode()) {
        adaptorInst.deleteMode = true;
      }

      return adaptorInst;            
    };
    return adaptor;
  }

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function InterfaceFtn($log, BaseInterface) {
    var iface = function(config) {
      var ifaceInst = new BaseInterface();
      var config = config || {};

      ifaceInst.config = {          
      	api: config.api || null,
      	data: config.data || null
      };

      return ifaceInst;            
    };
    return iface;
  }

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log, ListViewerElemInterface, BaseComp) {
    var object = function(iface) {
      var obj = new BaseComp();

      obj.api = {
        render : function(cb) {
          cb();
        },
        getData : function() {
          return iface.config.data;
        },
        getAPI : function() {
          return iface.config.api;
        },
        notify : function(event, arg) {
          $log.info('notified of event in list elem: ' + event);
          iface.config.api.notify(event, arg);
        }
      };

      return obj;
    };
    return object;
  }

  //----------------------------------------------------
  //  CTRL FUNCTION
  //----------------------------------------------------  
  function CtrlFtn($log, $scope, ListViewerV3ElemObj) {
    var vm = this;  
    vm.obj = null;

    $scope.$watch(function(scope) {
      return (vm.iface);
    }, function(iface, oldval) {
      if(iface) {
      	vm.obj = new ListViewerV3ElemObj(iface);
      	iface.setAPI(vm.obj.getAPI);
        vm.obj.getAPI().render(function(result) {

        });
      }
    }); 
  }

  //----------------------------------------------------
  //  DIRECTIVE
  //----------------------------------------------------  
  function DirFtn() {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'ListViewerV3ElemCtrl',
      controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      template: '<div ng-include=\'ctrl.obj.api.getData().template\'></div>'
      //template: '<h4>ctrl: {{ctrl.obj.api.getElement() | json}}</h4>'
    };
    return directive;   
  }
})();


(function() {
  'use strict';

  angular
    .module('jawboneApp')  
    .factory('ListViewerV3Interface', InterfaceFtn)  
    .factory('ListViewerV3Obj', ObjectFtn)
    .controller('ListViewerV3Ctrl', CtrlFtn)
    .directive('listViewerV3', DirFtn);

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function InterfaceFtn($log, BaseInterface) {
    var iface = function(config) {
      var ifaceInst = new BaseInterface();
      var config = config || {};

      ifaceInst.config = {
      	getElementsObj : config.getElementsObj || null,
      	makeListElementFtn : config.makeListElementFtn || null,
        onElementClicked : config.onElementClicked || function(action, element, index) {
          $log.info('passed to iface: element of index clicked ' + index);
        },
        onSelect : config.onSelect || function(element, index) {
          $log.info('supply an onSelect function');
        },
        onDeselect : config.onDeselect || function(element, index) {
          $log.info('supply on onDeselect function');
        },
        onDelete : config.onDelete || function(elem, index, cb) {
          $log.info('supply on Delete function..');
          cb();
        },
        headerTpl : config.headerTpl || null,
        canEdit : config.canEdit || false
      };

      return ifaceInst;
    };
    return iface;
  }

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log, ListViewerElemInterface, HeaderBarV3Interface, BaseComp) {
    var obj = function(iface) {

      var refreshList = refreshListFtn;

    	var objInst = new BaseComp();
    	objInst.elements = [];
      objInst.deleteMode = false;
      objInst.selected = parseInt(-1);
      objInst.state = 'loading';

    	// private functions
    	var populate = populateFtn;
      var handleClick = handleClickFtn;

		  objInst.api = {

        // POPULATE THE LIST
        render: function(cb) {

          // create the heading bar
          objInst.header = new HeaderBarV3Interface({
            tpl : iface.config.headerTpl,
            getListAPI : objInst.getAPI
          });

          populate(objInst.elements, iface.config.getElementsObj, cb);
          objInst.state = 'done';
        },

        getState: function() {
          return objInst.state;
        },

        canEdit: function() {
          return iface.config.canEdit;
        }, 

        // HANDLE ELEMENT CLICKED EVENT
        elementClicked: function(index) {
          handleClick(objInst, iface, index);
        },

        deleteElement: function(index) {
          iface.config.onDelete(objInst.elements[index], index, function() {
            objInst.elements.splice(index, 1);
          });
        },

        isDeleteMode : function() {
          return objInst.deleteMode;
        },

        // DESELECT ALL ELEMENTS OF LIST
        deselectAll : function() {
          $log.info('deselect all called');
          var selected = objInst.selected;
          objInst.selected = -1;
          angular.forEach(objInst.elements, function(element) {
            element.notify('deselect');
            iface.config.onDeselect(element);
          });          
        },

        // PROPAGATE EVENT TO EVERY LIST ELEMENT
        propagateEvent: function(event, data) {
          angular.forEach(objInst.elements, function(element) {
            element.notify(event, data);
          });
        },

        // REFRESH THE LIST
        refresh: function() {
        	$log.info('refresh list');
          this.deselectAll();
          refreshList();
        },

        // APPEND ELEMENTS TO THE LIST
  			appendElements: function(cb) {        

  				iface.config.getElementsObj = iface.config.getElementsObj.next();
  				$log.info('next batch..params: ' + JSON.stringify(iface.config.getElementsObj.params));

  				if(!iface.config.getElementsObj.more()) {
  				  $log.info('no more to get w/ params: ' + JSON.stringify(iface.config.getElementsObj.params));
  				  $log.info('no more to get w/ elems :  ' + objInst.elements.length);
  				  return cb();          
  				}
  				populate(objInst.elements, iface.config.getElementsObj, cb);
        },

        // HANDLE AN EVENT
        notify: function(event, data, index) {
          switch(event) {
            case 'clicked':
              //objInst.handleClick(index);
              break;
            case 'deleteMode':
              objInst.deleteMode = !objInst.deleteMode;
  						objInst.api.deselectAll();
  						objInst.api.propagateEvent(event, null);
  						break;
		        case 'delete':
  						objInst.onEvent(event, objInst.elements[index].element)
  						.then(function(response) {
  							$log.info('event handled with response : ' + response);
  							objInst.deleteElement(index);
  						});   
  						break; 
		        case 'reveal':
  						$log.info('list was revealed...reinitialise height');
  						objInst.api.refresh();
              break;
            case 'refresh':
              $log.info('refresh the list');
              objInst.api.refresh();
              break;
		        default:
  						$log.info('list obj received event: ' + event);
  						break;
          }
        }
      };

      return objInst;

      //----------------------------------------------
      // REFRESH THE LIST
      //----------------------------------------------
      function refreshListFtn() {
        objInst.elements = [];
        populate(objInst.elements, iface.config.getElementsObj, function(listdata) {
          $log.info('list refreshed: ' + JSON.stringify(listdata));
        });
      }

      //----------------------------------------------
      // HANDLE POPULATE OF LIST
      //----------------------------------------------
    	function populateFtn(list, getElementsObj, onDone) {
        if(!getElementsObj) {
          onDone({
            nbrElems: 0,
            totalElems: 0
          });
          return;
        }

        getElementsObj.get()
        .then(function(batch) {
          $log.info('batch in populate: ' + JSON.stringify(getElementsObj.params));
          $log.info('batch total: ' + batch.total);
          $log.info('total no. of objects: ' + getElementsObj.params.total);
          var i = list.length;
          angular.forEach(batch.data, function(value) { 
            this.push(iface.config.makeListElementFtn({
            	api: objInst.api,
            	element: value,
            	index: parseInt(i)
            }));
            i++;
          }, list);

          $log.info('size of list: ' + JSON.stringify(list.length));
          //$log.info('elements : ' + JSON.stringify(list));

          if(onDone) {
            onDone({
              nbrElems: list.length,
              totalElems: batch.total,
              elems: list
            });
          }
        })
        .catch(function(err) {
          $log.info('error getting elements: ' + err);
        });            		
    	}

      //----------------------------------------------
      // HANDLE WHEN NOTIFIED OF AN ELEMENT CLICK
      //----------------------------------------------
      function handleClickFtn(obj, iface, index) {   
                  
        $log.info('handle click function was called: idx: ' + index);

        // tell an element and the interface if it was deselected
        if(obj.selected !== -1 && obj.selected < obj.elements.length) {
          obj.elements[obj.selected].notify('deselect');  
          iface.config.onDeselect(obj.elements[obj.selected], index);          
        }

        // tell the interface of click event
        //iface.notify('clicked', obj.elements[index], index);
        iface.config.onElementClicked('clicked', obj.elements[index], index);

        if(obj.selected !== index) {
          obj.selected = index;          
          //iface.notify('selected', obj.elements[index], index);
          iface.config.onSelect(obj.elements[index], index);
        } else {
          obj.selected = -1;
        }
      }
    };
    return obj;    
  }

  var log = null;

  //-------------------------------------------
  // LIST SCROLLER IMPLEMENTATION
  //-------------------------------------------
  function ListScroller(initCB, refreshCB) {
    var scroller = this;
    var initCB = initCB;
    var refreshCB = refreshCB;
    var chunksize = 4;
    var index = 0;
    var nbrForwards = 0;
    var moveDistance = 0;
    var scrollforward = null;
    var scrollback = null;
    var animating = false;
    var onScrollForwardFtn = null;

    function atEnd() {
      return (index === nbrForwards);
    };

    function atStart() {
      return (index === 0);
    }

    // SET THE HEIGHT
    var setHeight = function(height, cb) {
      //$log.info('init height called: ' + height);
      var frameHeight = (chunksize * height);
      moveDistance = parseInt(frameHeight / 2);
      cb(frameHeight);
    };

    // CALCULATE THE NBR FORWARDS
    var calculateNoForwards = function(listdata, chunksize) {

      var total = listdata.totalElems;
      var totalPages = Math.ceil(total / chunksize);
      var nbrOnLastPage = parseInt(total % chunksize);
      var lessThanHalfOnLastPage = (nbrOnLastPage !== 0 && (nbrOnLastPage <= chunksize / 2))
      var nbrForwards = (lessThanHalfOnLastPage ? totalPages - 1 : totalPages);
      //log.info('total elements: ' + total);
      //log.info('number of pages: ' + totalPages + ' number of forwards: ' + nbrForwards);
      return nbrForwards;
    }

    // PUBLIC ON-SHOW
    scroller.onShow = function(data) {
      //log.info('on show called with list data: ' + JSON.stringify(data.listdata));
      initCB(function(scrollInfo, cb) {
        //log.info('the height of list element is: ' + height);
        setHeight(scrollInfo.height, cb);
        nbrForwards = calculateNoForwards(data.listdata, chunksize);
        scrollforward = scrollInfo.forward;
        scrollback = scrollInfo.back;
        //log.info('nbr forwards: ' + nbrForwards);
      });
    };

    scroller.setOnScrollForward = function(onScrollForward) {
      onScrollForwardFtn = onScrollForward;
    };

    // PUBLIC FORWARD
    scroller.forward = function() {
      //log.info('scroll forward...');
      // set height
      if(atEnd() || (animating == true)) return;
      animating = true;
      index = (index === nbrForwards ? nbrForwards : index + 1);
      scrollforward(moveDistance, function() {
        animating = false;
        if(onScrollForwardFtn) {
          onScrollForwardFtn();
        }
      });
    };

    // PUBLIC BACK
    scroller.back = function() {
      //log.info('scroll back...');
      if(atStart() || (animating == true)) return;
      animating = true;
      index = (index === 0 ? 0 : index - 1);
      scrollback(moveDistance, function() {
        animating = false;
      });
    };

    return scroller;
  }

  //----------------------------------------------------
  //  CTRL FUNCTION
  //----------------------------------------------------  
  function CtrlFtn($log, $scope, ListViewerV3Obj) {
    var vm = this;  
    vm.obj = null;
    vm.scroller = null;
    vm.didMouseWheelUp = function() {
      $log.info('did mouse wheel up..');
    };
    vm.didMouseWheelDown = function() {
      $log.info('did mouse wheel down..');
    };

    log = $log;

    vm.registerLink = function(initCB, refreshCB) {
      $log.info('called register link');
      vm.scroller = new ListScroller(initCB, refreshCB);
    };

    $scope.$watch(function(scope) {
      return (vm.iface);
    }, function(iface, oldval) {
      if(iface) {
      	vm.obj = new ListViewerV3Obj(iface);
      	iface.setAPI(vm.obj.getAPI);
        vm.obj.api.render(function(listdata) {
          vm.scroller.setOnScrollForward(function() {
            vm.obj.api.appendElements(function(listdata) {
              $log.info('appended elements: ' + JSON.stringify(listdata));
            });
          });
          vm.didMouseWheelUp = vm.scroller.forward,
          vm.didMouseWheelDown = vm.scroller.back,
          vm.scroller.onShow({
            listdata : listdata
          });
        });
      }
    }); 
  }

  //----------------------------------------------------
  //  DIRECTIVE
  //----------------------------------------------------  
  function DirFtn($log, $timeout) {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'ListViewerV3Ctrl',
      controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      templateUrl: 'app/list-viewer/list-viewer-v3/_list-viewer-tpl.html',
      link: linkFtn
    };
    return directive;

    function linkFtn(scope, element, attrs, ctrl) {
      //var frame = angular.element(element[0].querySelector('.list-viewer-elements'))
      var frame = null;
      var li = null;
      var ul = null;

      var forward = null;
      var back = null;

      function initialise(callback) {
        frame = angular.element(element[0].querySelector('.list-viewer-elements'));
        ul = frame.find('ul');
        li = ul.find('li');
        var height = li.first().height();

        forward = function(dist, onDone) {
          ul.velocity({
            'top': '-='+ dist
          }, 400, function() {
            onDone();
          });                  
        };

        back = function(dist, onDone) {
          ul.velocity({
            'top': '+='+ dist
          }, 400, function() {
            onDone();
          });                  
        };

        callback({ 
          height: height,
          forward: forward,
          back: back
        }, function(scrollFrameHeight) {
          //$log.info('new init height of list element : ' + height + ' frame height: ' + scrollFrameHeight);
          frame.css({
            'height': scrollFrameHeight + 'px'
          });          
        });
      }

      ctrl.registerLink(function(cb) {
        $timeout(function() {
          initialise(cb);
        })
      }, function(cb) {
        initialise(cb);
      });
    }   
  }
})();

(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('HeaderBarV3Interface', InterfaceFtn)
    .factory('HeaderBarV3Obj', ObjFtn)
    .controller('HeaderBarV3Ctrl', CtrlFtn)
    .directive('headerBarV3', directiveFtn);

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function InterfaceFtn($log, BaseInterface) {
    var iface = function(config) {
      var ifaceInst = new BaseInterface();
      var config = config || {};

      ifaceInst.config = {          
        tpl: config.tpl || null,
        getListAPI : config.getListAPI || null
      };

      return ifaceInst;            
    };
    return iface;
  }

  function ObjFtn($log, BaseComp) {
    var object = function(iface) {
      var objInst = new BaseComp();

      objInst.api = {
        render : function(cb) {
          $log.info('render function of header bar');          
        },
        getListAPI: function() {
          $log.info('called get list api');
          return iface.config.getListAPI();
        }
      };     

      return objInst;
    };
    return object;
  }

  /** @ngInject */
  function CtrlFtn($log, $scope, HeaderBarV3Obj) {
    var vm = this;  

    $scope.$watch(function(scope) {
      return (vm.iface);
    }, function(iface, oldval) {
      if(iface) {
        vm.obj = new HeaderBarV3Obj(iface);
        iface.setAPI(vm.obj.getAPI);
        vm.obj.getAPI().render(function(result) {
          $log.info('>>> >>> >>> header bar v3 render function...');
        });
      }
    }); 
  }	

  function directiveFtn($log) {
    var directive = {
      restrict: 'E',
        scope: {},
        controller: 'HeaderBarV3Ctrl',
        controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      template: '<div ng-include=\'ctrl.iface.config.tpl\'></div>'
    };
    return directive;   
  }
})();
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('ListV2Interface', InterfaceFtn)
    .factory('ListV2Obj', ObjectFtn)
    .controller('ListV2Ctrl', ControllerFtn)
    .directive('listviewerV2', DirectiveFtn);

  /**
  * IMPLEMENT THIS OBJECT TO CREATE A LIST OBJECT
  */
  function InterfaceFtn($log, BaseInterface) {
    var iface = function(config) {
      var name = 'list-viewer-v2/ListV2InterfaceObj : ';
      var ifaceInst = this;

      angular.merge(ifaceInst, ifaceInst, new BaseInterface());      

      // initialise config
      var config = config || {};
      config.header = config.header || {};
      config.events = config.events || {};

      // this can be put into a common base object
      ifaceInst.notify = function(eventName) {
        $log.info('notify listobj of event (came from higher level object): ' + eventName);
        var api = ifaceInst.getObjectAPI();
        api.handleChildEvent(eventName);
      };

      ifaceInst.config = {
          header : {
            heading: config.header.heading || null,
            headerTemplate: config.header.headerTemplate || null,
            headerObj: config.header.headerObj || null
          },
          events: {
            onCreated : config.events.onCreated || function(api) {
              $log.info(name + ' supply on created function. API passed: ' + JSON.stringify(api));
              //obj.EventHandler.events.register(api);
            },
            onSelect : config.events.onSelect || function(elem) {
              $log.info(name + ' supply on Select function');
            },
            onDeselect : config.events.onDeselect || function(elem) {
              $log.info(name + ' supply on deselect function');
            },
            onConfirm : config.events.onConfirm || function() {
              $log.info(name + ' supply on Confirm function');
            },
            onStateChange : config.events.onStateChange || function() {
              $log.info(name + ' supply on State Change function');
            },
            onEvent : config.events.onEvent || function() {
              $log.info(name + ' supply on Event function');
            }
          },
          loaderMessage: config.loaderMessage || null,          
          getElementsObj : config.getElementsObj || null,
          makeElement : config.makeElement || null,
          elementTemplate: config.elementTemplate || 'app/list-viewer/_default-lve-tpl.html'        
      };

      return ifaceInst;
    };
    return iface;
  }

  function ObjectFtn($q, $log, BaseComp, ListV2Interface, ListViewerElemObj) {
    var object = function(iface, onStateChange, onRefresh) {

      var initialise = initialiseFtn;

      var obj = this;
      obj.elements = [];
      obj.selected = -1;

      angular.merge(obj, obj, new BaseComp());

      // the list API - functions an external object can call
      obj.api = {
        // ensure all elements deselected
        deselectAll : function() {
          obj.selected = -1;
          angular.forEach(obj.elements, function(value) {
            //value.onDeselected();
            value.handleParentEvent('deselect');
            iface.config.events.onDeselect(value.element);
          }, obj.elements);          
        },

        // send an event to every member of the list
        propagateEvent: function(event, data) {
          angular.forEach(obj.elements, function(value) {
            $log.info('event action for elem: ' + event);
            value.handleParentEvent(event, data);
          }, obj.elements);
        },

        // handle an event
        handleChildEvent: function(event, data, index) {
          switch(event) {
            case 'clicked':
              obj.handleClick(index);
              break;
            case 'deleteMode':
              obj.api.deselectAll();
              obj.api.propagateEvent(event, null);
              break;
            case 'delete':
              obj.onEvent(event, obj.elements[index].element)
              .then(function(response) {
                $log.info('event handled with response : ' + response);
                obj.deleteElement(index);
              });   
              break; 
            case 'reveal':
              $log.info('list was revealed...reinitialise height');
              onRefresh();
            default:
              $log.info('list obj received event: ' + event);
              break;
          }
        }
      };

      obj.onStateChange = onStateChange || function(newState) {
        $log.info('supply a state change function to ChartObj');
      };

      obj.connect(iface, obj.api, initialise);

      // attach this object to the interface
      // iface.connectInterface(iface, function() {
      //   return (obj.api);
      // }, function(connectedIface) {
      //   // will want to call merge here
      //   obj.onStateChange('loading');
      //   initialise(connectedIface);
      // });

      // notify list object that an element was clicked
      obj.handleClick = function(index) {   
        // sets selected and notifies the list implementation type selected/deselected     
        if(obj.selected !== -1 && obj.selected < obj.elements.length) {
          //o.elements[o.selected].onDeselected();
          obj.elements[obj.selected].handleParentEvent('deselect');
          obj.events.onDeselect(obj.elements[obj.selected].element);
        }

        if(obj.selected !== index) {
          obj.selected = index;          
          obj.events.onSelect(obj.elements[obj.selected].element);
        } else {
          obj.selected = -1;
        }
      };

      function populate(list, batchObj, onComplete) {

        if(!batchObj) {
          onComplete({
            nbrElems: 0,
            totalElems: 0
          });
          return;
        }

        batchObj.get()
        .then(function(batch) {
          $log.info('batch in populate: ' + JSON.stringify(batchObj.params));
          $log.info('batch total: ' + batch.total);
          $log.info('total no. of objects: ' + batchObj.params.total);
          var i = list.length;
          angular.forEach(batch.data, function(value) { 
            //$log.info('value gotten: ' + JSON.stringify(value));           
            var e = obj.makeElement(value); 
            // $log.info('index to pass: ' + i);
            //$log.info('push a new element onto elements list: ' + JSON.stringify(value));
            this.push(new ListViewerElemObj(obj.api, e, parseInt(i)));
            i++;
          }, list);

          $log.info('size of list: ' + JSON.stringify(list.length));
          if(onComplete) {
            onComplete({
              nbrElems: list.length,
              totalElems: batch.total
            });
          }
        })
        .catch(function(err) {
          $log.info('error getting elements: ' + err);
        });        
      }

      obj.deleteElement = function(index) {
        obj.elements = [];
        populate(obj.elements, obj.getElementsObj);
      };

      // TODO implement
      obj.appendElements = function(cb) {        

        obj.getElementsObj = obj.getElementsObj.next();
        $log.info('next batch..params: ' + JSON.stringify(obj.getElementsObj.params));

        if(!obj.getElementsObj.more()) {
          $log.info('no more to get w/ params: ' + JSON.stringify(obj.getElementsObj.params));
          $log.info('no more to get w/ elems :  ' + obj.elements.length);
          return cb();          
        }
        
        populate(obj.elements, obj.getElementsObj, cb);
      };

      obj.onPopulate = function() {
        populate(obj.elements, obj.getElementsObj);
      };

      function initialiseFtn(iface) {
        angular.merge(obj, obj, iface.config);
        populate(obj.elements, obj.getElementsObj, function(updateData) {
          obj.onStateChange('ready', updateData);
        });        
      }

      return obj;
    };
    return object;
  }

  /** @ngInject */
  function ControllerFtn($log, $scope, ListV2Obj) {
    var vm = this;  
    vm.obj = null;
    vm.lo = {};
    vm.atStart = null;
    vm.atEnd = null;
    vm.frameHeight = 0;
    vm.totalElements = 0;
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

    function calculateNoForwards(total, chunksize) {
      var totalPages = Math.ceil(total / chunksize);
      var nbrOnLastPage = parseInt(total % chunksize);
      var lessThanHalfOnLastPage = (nbrOnLastPage !== 0 && (nbrOnLastPage <= chunksize / 2))
      var nbrForwards = (lessThanHalfOnLastPage ? totalPages - 1 : totalPages);
      //$log.info('total elements: ' + total);
      //$log.info('number of pages: ' + totalPages + ' number of forwards: ' + nbrForwards);
      return nbrForwards;
    }

    vm.didMouseWheelUp = function(value) {
      //$log.info('mouse wheel up event!');
      vm.back();
    };

    vm.didMouseWheelDown = function(value) {
      //$log.info('mouse wheel down event!');
      vm.forward();
    };

    function init(iface) {
      vm.obj = new ListV2Obj(iface, function(newState, updateData) {
        //$log.info('update data: ' + JSON.stringify(updateData));
        completeInit(newState, updateData);
      }, function() {
        $log.info('refresh the list');
        //vm.setHeightCB();
        vm.initcb();
      });    
    }

    function completeInit(newState, updateData) {
        $log.info('update data: ' + JSON.stringify(updateData));
        var update = updateData || {};
        vm.nbrElems = update.nbrElems || 0;
        vm.totalElements = update.totalElems || 0;
        vm.nbrForwards = calculateNoForwards(vm.totalElements, vm.chunksize);
        $log.info('nbr forwards: ' + vm.nbrForwards);
        vm.state = newState;
        vm.setHeightCB();

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
          $log.info('forward invoked...nbr forwards: ' + vm.nbrForwards);
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
          
          // tell the list obj to append elements in response to forwards request
          vm.obj.appendElements(function(updateData) {
            if(updateData) {
              //$log.info('more elements where added...');
            }
          });
        };

        vm.atStart = function() {
          return (vm.index === 0);
        };

        // why is this getting called so many times?
        vm.atEnd = function() {
          //$log.info('atEnd invoked... index : ' + vm.index + ' nbr forwards: ' + vm.nbrForwards);
          return (vm.index === vm.nbrForwards);
        };

        if(vm.initcb) {
          //$log.info('call init cb');
          vm.initcb();
        }
      }

    $scope.$watch(function(scope) {
      return (vm.iface);
    }, function(newval, oldval) {      
      if(newval) {        
        init(newval);
      }
    }); 
  }	

  function DirectiveFtn($log, $timeout) {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'ListV2Ctrl',
      controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      templateUrl: 'app/list-viewer/list-viewer-v2/_listviewer-tpl.html',
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
          $log.info('new init height of list element : ' + height + ' frame height: ' + scrollFrameHeight);
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
    .factory('HeaderBarV2Obj', ObjFtn)
    .controller('HeaderBarV2Ctrl', CtrlFtn)
    .directive('headerBarV2', directiveFtn);

  function ObjFtn($log) {
    var object = function(data) {
      // var obj = this;
      // obj.data = data || {};
      // obj.message = 'hello there';

    };
    return object;
  }

  /** @ngInject */
  function CtrlFtn($log, $scope, HeaderBarV2Obj) {
    var vm = this;  
    // vm.o = null;

    //$log.info('header bar: ' + JSON.stringify(vm.tpl));
    // $scope.$watch(function(scope) {
    //   return (vm.iface);
    // }, function(newval, oldval) {
    //   if(newval) {
    //     $log.info('header bar v2: new value: ' + JSON.stringify(newval));
    //     vm.o = newval;
    //   }
    // }); 
  }	

  function directiveFtn($log) {
    var directive = {
      restrict: 'E',
        scope: {},
        controller: 'HeaderBarV2Ctrl',
        controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      template: '<div ng-include=\'ctrl.iface.header.headerTemplate\'></div>'
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

      o.handleParentEvent = function(event, data) {
        //$log.info('handle parent event: ' + event);
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

    };
    return ListElementAPIObj;
  }

  function ListViewerElemObjFtn($log) {
    var ListViewerElemObj = function(listAPI, data, indexArg) {      

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
        //$log.info('notify parent of event: ' + event);
        //$log.info('my index is  ' + o.index);

        // to replace with just the truth statement
        if(listAPI.handleChildEvent) {
          listAPI.handleChildEvent(event, data, o.index);          
        } else {
          listAPI(event, data, o.index);
        }
      };

      o.handleParentEvent = function(event, data) {
        o.element.api.handleParentEvent(event, data);
      };

      o.element.api.setContainer(o);
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
    .factory('ListInterfaceObj', ListInterfaceObjFtn)
    .factory('ListViewerCtrlObj', ListViewerCtrlObjFtn)
    .factory('ListViewerObj', ListViewerObjFtn)
    .controller('ListViewerCtrl', ListViewerCtrl)
    .directive('listviewer', listviewerFtn);

  /**
  * IMPLEMENT THIS OBJECT TO CREATE A LIST OBJECT
  */
  function ListInterfaceObjFtn($log) {
    var ListInterfaceObj = function(config) {
      var name = 'list-viewer//ListInterfaceObj : ';
      var obj = this;
      obj.config = {
          header : {
            heading: config.header.heading || null,
            headerTemplate: config.header.headerTemplate || null,
            headerObj: config.header.headerObj || null
          },
          events: {
            onSelect : config.events.onSelect || function() {
              $log.info(name + ' supply on Select function');
            },
            onConfirm : config.events.onConfirm || function() {
              $log.info(name + ' supply on Confirm function');
            },
            onStateChange : config.events.onStateChange || function() {
              $log.info(name + ' supply on State Change function');
            },
            onEvent : config.events.onEvent || function() {
              $log.info(name + ' supply on Event function');
            }
          },
          loaderMessage: config.loaderMessage || null,          
          getElementsObj : config.getElementsObj || null,
          makeElement : config.makeElement || null,
          elementTemplate: config.elementTemplate || 'app/list-viewer/_default-lve-tpl.html'         
      };

      obj.getInterface = function() {
        return obj.config;        
      };
    };
  }

  function ListViewerCtrlObjFtn($log, ListViewerObj) {
    var ListViewerCtrlObj = function(obj, onStateChange) {

      var o = this;
      
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
              //$log.info('event handled with response : ' + response);
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
            //$log.info('event action for elem: ' + event);
            value.handleParentEvent(event, data);
          }, o.elements);
        }
      };

      function populate(list, batchObj, onComplete) {

        batchObj.get()
        .then(function(batch) {
          //$log.info('total no. of objects: ' + batchObj.params.total);
          var i = list.length;
          angular.forEach(batch.data, function(value) { 
            //$log.info('value gotten: ' + JSON.stringify(value));           
            var e = o.makeElement(value); 
            // $log.info('index to pass: ' + i);
            this.push(new ListViewerElemObj(o.handleChildEvent, e, parseInt(i)));
            i++;
          }, list);

          //$log.info('size of list: ' + JSON.stringify(list.length));
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
      o.appendElements = function(cb) {        

        o.getElementsObj = o.getElementsObj.next();
        $log.info('next batch..params: ' + JSON.stringify(o.getElementsObj.params));

        if(!o.getElementsObj.more()) {
          $log.info('no more to get w/ params: ' + JSON.stringify(o.getElementsObj.params));
          $log.info('no more to get w/ elems :  ' + o.elements.length);
          return cb();          
        }
        
        populate(o.elements, o.getElementsObj, cb);
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
    vm.totalElements = 0;
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

    function calculateNoForwards(total, chunksize) {
      var totalPages = Math.ceil(total / chunksize);
      var nbrOnLastPage = parseInt(total % chunksize);
      var lessThanHalfOnLastPage = (nbrOnLastPage !== 0 && (nbrOnLastPage <= chunksize / 2))
      var nbrForwards = (lessThanHalfOnLastPage ? totalPages - 1 : totalPages);
      // $log.info('total elements: ' + total);
      // $log.info('number of pages: ' + totalPages + ' number of forwards: ' + nbrForwards);
      return nbrForwards;
    }

    // function adjust(length) {
    //   vm.nbrElems = vm.lo.listobj.elements.length;
    //   //$log.info('what is chunsize anyways: ' + vm.lo.chunksize);
    //   vm.chunksize = parseInt(vm.lo.chunksize) || 4;
    //   var nbrWindows = Math.ceil(vm.nbrElems / vm.chunksize);
    //   //$log.info('no. of windows: ' + nbrWindows + ' nbrelems: ' + vm.nbrElems + ' chunksize: ' + vm.chunksize);

    //   //vm.nbrForwards = parseInt(vm.nbrElems / (vm.chunksize / 2));
    //   vm.nbrForwards = nbrWindows > 1 ? parseInt(nbrWindows * 2) : 0;
    //   //$log.info('nb elems: ' + vm.nbrElems + ' chunksize: ' + vm.chunksize + ' no. forwards: ' + vm.nbrForwards);
    //   //$log.info('calculate: ' + (vm.nbrElems / (vm.chunksize / 2)));
    //   if(vm.initcb) {
    //    vm.initcb();
    //   }
    // }

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
        //$log.info('update data: ' + JSON.stringify(updateData));
        completeInit(newState, updateData);
      });    

      // watch the size of the array of elements
      // consider removing this in favour of a callback from listviewerctrlobj
      // $scope.$watch(function(scope) {
      //   return (vm.lo.listobj.elements.length);
      // }, function(newVal, oldVal) {
      //   if(newVal) {
      //     $log.info('elements changed: ' + vm.lo.listobj.elements.length); 
      //     adjust(newVal);         
      //   }
      // });
    }

    function completeInit(newState, updateData) {
        //$log.info('update data: ' + JSON.stringify(updateData));
        var update = updateData || {};
        vm.nbrElems = update.nbrElems || 0;
        vm.totalElements = update.totalElems || 0;
        vm.nbrForwards = calculateNoForwards(vm.totalElements, vm.chunksize);
        //$log.info('nbr forwards: ' + vm.nbrForwards);
        vm.state = newState;
        vm.setHeightCB();

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
          //$log.info('forward invoked...');
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
          
          // tell the list obj to append elements in response to forwards request
          vm.lo.listobj.appendElements(function(updateData) {
            if(updateData) {
              //$log.info('more elements where added...');
            }
          });
        };

        vm.atStart = function() {
          return (vm.index === 0);
        };

        // why is this getting called so many times?
        vm.atEnd = function() {
          //$log.info('atEnd invoked... index : ' + vm.index + ' nbr forwards: ' + vm.nbrForwards);
          return (vm.index === vm.nbrForwards);
        };

        if(vm.initcb) {
          vm.initcb();
        }
      }
    //}

    // function init(obj) {
    //   //$log.info('calling init...');
    //   vm.lo = new ListViewerCtrlObj(obj, function(newState, updateData) {
    //     $log.info('update data: ' + JSON.stringify(updateData));
    //     var update = updateData || {};
    //     vm.totalElements = update.totalElems || 0;
    //     vm.state = newState;
    //     vm.setHeightCB();
    //   });

    //   vm.nbrElems = vm.lo.listobj.elements.length;
    //   //vm.nbrForwards = parseInt(vm.nbrElems / 2);
    //   vm.nbrForwards = calculateNoForwards(vm.totalElements, vm.chunksize);

    //   //$log.info('calling init of listviewer : ' + JSON.stringify(vm.lo));
    //   //$log.info('nbr elems : ' + vm.nbrElems);

    //   vm.back = function() {
    //     if(vm.atStart()) return;
    //     if(vm.animating) return;
    //     vm.animating = true;
    //     vm.index = (vm.index === 0 ? 0 : vm.index - 1);
    //     //$scope.$broadcast('clickback', vm.moveDistance);
    //     $scope.$broadcast('clickback', {
    //       dist: vm.moveDistance,
    //       callback: function() {
    //         vm.animating = false;
    //       }
    //     });
    //   };

    //   vm.forward = function() {
    //     vm.setHeightCB();
    //     if(vm.atEnd()) return;
    //     if(vm.animating) return;
    //     vm.animating = true;
    //     //$log.info('clicked forward');
    //     //$log.info('number of elements: ' + vm.nbrElems + ' move distance: ' + vm.moveDistance + ' forwards: ' + vm.nbrForwards);
    //     vm.index = (vm.index === vm.nbrForwards ? vm.nbrForwards : vm.index + 1);
    //     //$scope.$broadcast('clickforward', vm.moveDistance);
    //     $scope.$broadcast('clickforward', { 
    //       dist: vm.moveDistance, 
    //       callback: function() { 
    //         vm.animating = false;
    //         //$log.info('set animating to false: ' + vm.animating); 
    //       }
    //     });
    //     vm.lo.listobj.appendElements();
    //   };

    //   vm.atStart = function() {
    //     return (vm.index === 0);
    //   };

    //   vm.atEnd = function() {
    //     //$log.info('index : ' + vm.index + ' nbr forwards: ' + vm.nbrForwards);
    //     return (vm.index === vm.nbrForwards);
    //   };

    //   if(vm.initcb) {
    //     vm.initcb();
    //   }

    //   $scope.$watch(function(scope) {
    //     return (vm.lo.listobj.elements.length);
    //   }, function(newVal, oldVal) {
    //     if(newVal) {
    //       $log.info('elements changed: ' + vm.lo.listobj.elements.length); 
    //       adjust(newVal);         
    //     }
    //   });
    // }

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
      //template: '<div ng-include=\'ctrl.obj.headerbar\'></div>'
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
    .factory('GroupService', GroupServiceFtn)
    .factory('SleepService', SleepServiceFtn)
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
					$log.info('error retrieving data: ' + JSON.stringify(errResponse));
					return [];
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
	function JawboneService($log, $q, $http, JawboneDataObj, BatchObj, GroupService, SleepService) {
		var jboneData = null;
		var setUserCB = [];
		var groupService = new GroupService();
		var sleepService = new SleepService();
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
	  		deleteNote : deleteNote,
	  		groupService : getGroupService,
	  		sleepService : getSleepService
	  	};
	  	return service;    

	  	function getGroupService() {
	  		return groupService;
	  	}

	  	function getSleepService() {
	  		return sleepService;
	  	}

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
	  		var id = id || 'default';
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

	function GroupServiceFtn($log, $q, $http) {
		var GroupService = function() {
			var obj = this;
			obj.createGroup = createGroup;
			obj.getGroup = getGroup;
			obj.updateGroup = updateGroup;
			obj.deleteGroup = deleteGroup;
			obj.addMemberToGroup = addMemberToGroup;
			obj.removeMemberFromGroup = removeMemberFromGroup;
		};
		return GroupService;

		function createGroup() {

		}

		function getGroup() {

		}

		function updateGroup() {

		}

		function deleteGroup() {

		}

		function addMemberToGroup(group, member) {
			$log.info('add a member to group');
			return $http.put('/groups/' + group._id + '/members/' + member._id)
			.then(function(response) {
				return true;
			})
			.catch(function(err) {
				return false;
			});
		}

		function removeMemberFromGroup(group, member) {
			$log.info('remove a member from group : ' + group._id);
			$log.info('remove a member from group : ' + member._id);	
			return $http.delete('/groups/' + group._id + '/members/' + member._id)
			.then(function(response) {
				$log.info('response: ' + JSON.stringify(response));
				return true;
			})			
			.catch(function(err) {
				$log.info('err removing member from group: ' + JSON.stringify(err));
				return false;
			});
		}
	} 

	//-----------------------------------------
	//	SLEEP SERVICE
	//-----------------------------------------	
	function SleepServiceFtn($log, $q, $http) {
		var SleepService = function() {
			var obj = this;
			obj.getSleepTicks = getSleepTicks;
			obj.getSleepDetails = getSleepDetails;
		};
		return SleepService;

		function getSleepTicks(sleepId) {
			return $http.get('/sleeps/ticks/' + sleepId)
			.then(function(response) {
				//$log.info('response to get sleep: ' + JSON.stringify(response));
				return response.data;
			})
			.catch(function(errResponse) {
				$log.info('err response to get sleep ticks: ' + JSON.stringify(errResponse));
				return errResponse;
			});
		}

		function getSleepDetails(sleepId) {
			return $http.get('/sleeps/details/' + sleepId)
			.then(function(response) {
				//$log.info('response to get sleep: ' + JSON.stringify(response));
				return response.data;
			})
			.catch(function(errResponse) {
				$log.info('err response to get sleep details: ' + JSON.stringify(errResponse));
				return errResponse;
			});
		}

	} 

})();
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .filter('minutesConverter', minutesConverterFtn)
    .filter('secondsToHrsMins', secondsToHrsMinsFtn)
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

  function secondsToHrsMinsFtn($log) {
    return function(seconds, arg) {
      var hours = Math.floor(parseInt(seconds) / 3600);
      var totalSeconds = parseInt(seconds) % 3600;
      var minutes = Math.floor(totalSeconds / 60);
      var seconds = totalSeconds % 60;      

      var hrs = (hours > 0 ? hours + 'h ' : '');
      var hrsMins = (hrs + minutes + 'm');
      return hrsMins;
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
    .filter('imgUploaderfilter', FilterFtn)    
    .factory('ImgUploaderInterface', InterfaceFtn)  
    .factory('ImgUploaderObj', ObjectFtn)
    .controller('ImgUploaderCtrl', CtrlFtn)
    .directive('imgUploader', DirFtn);

  //----------------------------------------------------
  //  FILTER FUNCTION
  //----------------------------------------------------  
  function FilterFtn() {
    return function(arg) {  
      if(arg) {
      	// do something with arg
        return arg;
      }
      return arg;
    }     
  }

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function InterfaceFtn($log, BaseInterface) {
    var iface = function(config) {
      var ifaceInst = this;
      var config = config || {};

      angular.merge(ifaceInst, ifaceInst, new BaseInterface());

      ifaceInst.config = {          
      };

      ifaceInst.notify = function(eventName) {
        var api = ifaceInst.getObjectAPI();
        api.notify(eventName);
      };

      return ifaceInst;            
    };
    return iface;
  }

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log, ImgUploaderInterface, BaseComp) {
    var object = function(iface) {

      var initialise = initialiseFtn;
      var obj = this;
      angular.merge(obj, obj, new BaseComp());

      obj.api = {

      };

      obj.connect(iface, obj.api, initialise);      

      function initialiseFtn(iface) {

      }

      return obj;
    };
    return object;
  }

  //----------------------------------------------------
  //  CTRL FUNCTION
  //----------------------------------------------------  
  function CtrlFtn($scope, ImgUploaderObj) {
    var vm = this;  
    vm.obj = null;
    vm.newImage = null;
    vm.newCroppedImage = null;

    $scope.$watch(function(scope) {
      return (vm.iface);
    }, function(newval, oldval) {
      if(newval) {
        vm.obj = new ImgUploaderObj(newval);
      }
    }); 
  }

  //----------------------------------------------------
  //  DIRECTIVE
  //----------------------------------------------------  
  function DirFtn() {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'ImgUploaderCtrl',
      controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      templateUrl: 'app/img-uploader/_img-uploader-tpl.html'
    };
    return directive;   
  }
})();


(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('PatientMgrInterface', InterfaceFtn)  
    .factory('PatientMgrObj', ObjectFtn)
    .controller('PatientMgrCtrl', CtrlFtn)
    .directive('patientMgr', DirFtn);

  var id = 'groups/patients/PatientMgrComp : '

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function InterfaceFtn($log, BaseInterface) {
    var iface = function(config) {
      var ifaceInst = this;
      var config = config || {};

      angular.merge(ifaceInst, ifaceInst, new BaseInterface());

      ifaceInst.config = {
          groupId : config.groupId || null
      };

      ifaceInst.notify = function(eventName) {
        var api = ifaceInst.getObjectAPI();
        api.notify(eventName);
      };

      return ifaceInst;
    };
    return iface;
  }

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log, BaseComp, ModalService, PatientMgrInterface, JawboneService, GroupMemberObj, ListV2Interface, PatientSummaryInterface, SleepChartV2Interface, SleepListV2Interface, SleepsChartDownloaderBuilder) {
    var object = function(iface) {

      var initialise = initialiseFtn;
    	var makeHeaderObj = makeHeaderObjFtn;
    	var createPatientData = createPatientDataFtn;
    	var makeActionBar = makeActionBarFtn;
      var addPatient = addPatientFtn;

    	var obj = this;
     	var listapi = null;   
      var ifaceObj = null;   	

      // extend from BaseObject
      angular.merge(obj, obj, new BaseComp());

      var api = {
        id: 'patientMgrObject API: ',
        notify: function(eventName) {
          $log.info(id + ' handle event: ' + eventName);
          switch(eventName) {
            case 'reveal':
              obj.listIface.notify(eventName);
              break;
            case 'addMode':
              addPatientFtn();
              break;
            default:
              obj.listIface.notify(eventName);
          }
        }
      };

      obj.connect(iface, api, initialise);

  		// set the mode
  		obj.mode = 'view';

      function initialiseFtn(iface) {

        obj.listIface = new ListV2Interface({
          header : {
            //heading: 'Patients',
            headerTemplate: 'app/groups/patients/_patient-action-bar-tpl.html',
            headerObj: makeHeaderObj(iface, api)
          },
          events: {
            onCreated : function(api) {
              $log.info(id + ' on created');
            },
            onSelect : function(elem) {
              $log.info(id + ' on Select');
              createPatientData(elem.data);
              obj.mode = 'edit';
            },
            onDeselect : function(elem) {
              $log.info(id + ' on Deselect');
            },
            onConfirm : function() {
              $log.info(id + ' admin on Confirm function');
            },
            onStateChange : function() {
              $log.info(id + ' admin on State Change function');
            },
            onEvent : function() {
              $log.info(id + ' admin on Event function');
            }
          },
          loaderMessage: 'Loading Patients...',          
          getElementsObj : JawboneService.makeBatch(JawboneService.makeFieldGetter('groups', iface.config.groupId, 'members')),
          makeElement : function(element) {       
            return new GroupMemberObj(element);
          },
          elementTemplate: 'app/patient/_group-member-element-tpl.html'               
        });        
      }

  	   // make the header for the group patients list
    	function makeHeaderObjFtn(iface) {
      	return {
        		addPatient : function() {
	            $log.info(id + ' call to add patient');
              api.notify('addMode');
          	},
          	removePatients : function() {
            	$log.info(id + ' call to delete patient');
              api.notify('deleteMode');
          	}
      	};
    	} 

    	function createPatientDataFtn(patient) {
    		$log.info('create patient data: ' + JSON.stringify(patient));
    		obj.patientSummaryInterface = new PatientSummaryInterface({
    			patient : patient,
			    actionBarObj : makeActionBar(patient)
    		});
    		obj.sleepChartInterface = new SleepChartV2Interface({
    			patient : patient
    		});
        obj.sleepsListIface = new SleepListV2Interface({
          patient : patient
        });
    	}

    	function makeActionBarFtn(patient) {
    		return {
    			template: 'app/groups/patients/patient-summary/_patient-summary-action-bar-tpl.html',
    			actions: {
    				backToPatients : function() {
    					obj.mode = 'view';
    				},
    				showPatientNotes : function() {
    					$log.info(id + 'show patient notes');
              ModalService.onClick({
                tpl : 'app/patient/_patient-notes-viewer-tpl.html'
              });
    				},
    				downloadToCSV : function() {
    					$log.info(id + 'download to CSV file');

              ModalService.onClick(new SleepsChartDownloaderBuilder(function() {
                // TODO improve this by using object can pass to modal
                var graphdata = obj.sleepChartInterface.getAPI().getGraphData();
                return graphdata;
              })).then(function(response) {

              });
    				}
    			}
    		}
    	}

      function addPatientFtn() {
        $log.info('add a new patient...');
        ModalService.onClick({
          tpl : 'app/patient/_patient-notes-viewer-tpl.html'
        })
        .then(function(result) {
          
        });
      }

    	return obj;      	     	
    };
    return object;
  }

  //----------------------------------------------------
  //  CTRL FUNCTION
  //----------------------------------------------------  
  function CtrlFtn($scope, PatientMgrObj) {
    var vm = this;  
    vm.obj = null;

    $scope.$watch(function(scope) {
      return (vm.iface);
    }, function(newval, oldval) {
      if(newval) {
        vm.obj = new PatientMgrObj(newval);
      }
    }); 
  }

  //----------------------------------------------------
  //  DIRECTIVE FUNCTION
  //----------------------------------------------------  
  function DirFtn() {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'PatientMgrCtrl',
      controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      templateUrl: 'app/groups/patients/_patient-mgr-tpl.html'
    };
    return directive;   
  }
})();


(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('PatientSummaryInterface', InterfaceFtn)  
    .factory('PatientSummaryObj', ObjectFtn)
    .controller('PatientSummaryCtrl', CtrlFtn)
    .directive('patientSummary', DirFtn);

    var id = 'groups/patients/patient-summary: ';

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function InterfaceFtn($log) {
    var iface = function(config) {
      var obj = this;
      
      obj.config = { 
      	patient : config.patient || null,     
        actionBarObj : config.actionBarObj || null    
      };

      obj.getInterface = function() {
        return obj.config;        
      };            
    };
    return iface;
  }

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log, PatientSummaryInterface) {
    var object = function(iface) {
    	var obj = this;
      var ifaceObj = iface || new PatientSummaryInterface();
      obj = ifaceObj.getInterface();

      $log.info(id + ' patient interface: ' + JSON.stringify(obj));

      return obj;
    };
    return object;
  }

  //----------------------------------------------------
  //  CTRL FUNCTION
  //----------------------------------------------------  
  function CtrlFtn($log, $scope, PatientSummaryObj) {
    var vm = this;  
    vm.obj = null;

    $scope.$watch(function(scope) {
      return (vm.iface);
    }, function(newval, oldval) {
      if(newval) {

        vm.obj = new PatientSummaryObj(newval);
      }
    }); 
  }

  //----------------------------------------------------
  //  DIRECTIVE
  //----------------------------------------------------  
  function DirFtn() {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'PatientSummaryCtrl',
      controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      templateUrl: 'app/groups/patients/patient-summary/_patient-summary-tpl.html'
    };
    return directive;   
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

  function buildCallbacks(obj, user, GroupsPatientsBuilder, GroupSummObj, PatientsComponentBuilder, AdminMgrInterface, PatientMgrInterface) {

    obj.mode = 'view';

    obj.groupViewer.onSelect = function(selectedGroup) {
      if(obj.groupViewer.listobj.state.deleteMode) {
        //log.info('delete the group: ' + JSON.stringify(selectedGroup, true, 3));
        return;
      }
      //log.info('on select event fired: delete mode? ' + obj.groupViewer.listobj.state.deleteMode);
      
      //obj.patients = new GroupsPatientsBuilder(user, selectedGroup.data);      
      
      obj.patientMgrInterface = new PatientMgrInterface({
        groupId : selectedGroup.data._id
      });

      obj.adminMgrInterface = new AdminMgrInterface({
        groupId : selectedGroup.data._id
      });
      
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
        obj.mode = 'create';
        // modalservice.onClick({
        //   tpl : 'app/patient/_patient-notes-viewer-tpl.html'
        // })
        // .then(function(result) {});
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
      return new GroupObj(objElement);
    };    
  }

  function buildGroupCreator(obj, user, GroupCreatorInterface) {
    obj.groupCreatorInterface = new GroupCreatorInterface({
      user : user
    });
  }

  function GroupsComponentBuilderFtn($q, $log, GroupObj, JawboneService, GroupsPatientsBuilder, PatientsComponentBuilder, GroupSummObj, ModalService, GroupCreatorInterface, AdminMgrInterface, PatientMgrInterface) {
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
      obj.adminMgr = {};
      
      // obj.downloader = {};

      $log.info('build the groups component..........');

      buildCallbacks(obj, user, GroupsPatientsBuilder, GroupSummObj, PatientsComponentBuilder, AdminMgrInterface, PatientMgrInterface);
      buildListViewer(obj, GroupObj);
      buildListViewerHeader(obj);    
      buildGroupCreator(obj, user, GroupCreatorInterface);  

            // handle the views
      obj.adminPatientView = 'patient';

      obj.api = {
        setPatientView : function() {
          $log.info('set the patient view');
          obj.adminPatientView = 'patient';
          obj.patientMgrInterface.notify('reveal');
        },

        setAdminView : function() {
          $log.info('set admin view');
          obj.adminPatientView = 'admin';
          obj.adminMgrInterface.notify('reveal');
        },

        isPatientView : function() {
          return obj.adminPatientView === 'patient';
        },
      
        isAdminView : function() {
          return obj.adminPatientView === 'admin';
        }
      }
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
        //$log.info('assign patient summ obj : ' + JSON.stringify(newval));
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

  function buildCallbacks(obj, userGroup) {
    obj.patientViewer.onEvent = function(event, selectedPatient) {
      var deferred = promiseService.defer();
      switch(event) {
        case 'delete':
          log.info('remove patient from the group: ' + selectedPatient);
          jbservice.groupService().removeMemberFromGroup(userGroup, selectedPatient);
          deferred.resolve(true);
          break;
        default:
          break;
      }
      return deferred.promise;
    };
  }

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
        obj.patientViewer.listobj.baseFtns.deselectAll();
        obj.patientViewer.listobj.state.deleteMode = !(obj.patientViewer.listobj.state.deleteMode);
        obj.patientViewer.listobj.baseFtns.propagateEvent('deleteMode', null);

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
      buildCallbacks(obj, userGroup);
      
      return obj;
    };
    return GroupsPatientsBuilder;
  }
})();



(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('GroupV3Obj', ObjectFtn);

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log) {
    var object = function(data) {

    	$log.info('data passed to group obj: ' + JSON.stringify(data));
   		var objInst = this;
      objInst._id = data._id;
   		objInst.name = data.name || null;
   		objInst.description = data.description || null;
   		objInst.size = data.members.length || 0;
   		objInst.template = 'app/groups/group-manager-v3/_group-element-tpl.html';
      objInst.permissions = data.permissions || {};

		return objInst;
    };
    return object;
  }
})();


(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .filter('groupManagerV3filter', FilterFtn)    
    .factory('GroupManagerV3Interface', InterfaceFtn)  
    .factory('GroupManagerV3Obj', ObjectFtn)
    .controller('GroupManagerV3Ctrl', CtrlFtn)
    .directive('groupManagerV3', DirFtn);

  //----------------------------------------------------
  //  FILTER FUNCTION
  //----------------------------------------------------  
  function FilterFtn() {
    return function(arg) {  
      if(arg) {
      	// do something with arg
        return arg;
      }
      return arg;
    }     
  }

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function InterfaceFtn($log, BaseInterface) {
    var iface = function(config) {
      var ifaceInst = new BaseInterface();
      var config = config || {};

      ifaceInst.config = {          
      };

      return ifaceInst;            
    };
    return iface;
  }

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log, GroupManagerV3Interface, BaseComp, ListViewerV3Interface, ListViewerElemInterface, ListElemAPI, GroupV3Obj, JawboneService, PatientMgrV3Interface, AdminMgrInterface) {
    var object = function(iface) {

    	var activateEditMode = activateEditModeFtn;

      var objInst = new BaseComp();
      objInst.groupList = null;
      objInst.patientMgrInterface = null;
      objInst.adminMgrInterface = null;
      objInst.mode = 'view';
      objInst.patientAdminView = 'patient';
      objInst.selectedGroup = null;

      objInst.api = {
      	render: function(cb) {
      		// create out group list
      		objInst.groupList = new ListViewerV3Interface({
      			getElementsObj : JawboneService.makeBatch(JawboneService.makeEndpoint('groups')),
      			makeListElementFtn : function(listData) {
			        return new ListViewerElemInterface({
			          api : new ListElemAPI(listData),
			          data : new GroupV3Obj(listData.element)
			        });
      			},
		        onSelect : function(element, index) {
		          activateEditMode(element);
		        },
          		headerTpl : 'app/groups/group-manager-v3/_group-list-action-bar-tpl.html'	        
      		});
      	},

      	getMode: function() {
      		return objInst.mode;
      	},

      	setViewMode: function() {
      		objInst.mode = 'view';
      	},

        isPatientView : function() {
          return (objInst.patientAdminView === 'patient');
        },

        isAdminView : function() {
          return (objInst.patientAdminView === 'admin');
        },

        setPatientView : function() {
          objInst.patientAdminView = 'patient';
          objInst.patientMgrInterface.getAPI().refresh();
          //tell the patient manager interface to refresh
        },

        setAdminView : function() {
          objInst.patientAdminView = 'admin';
          objInst.adminMgrInterface.getAPI().refresh();
          //tell the admin manager interface to refresh
        }

      };

      function activateEditModeFtn(selectedGroup) {
      	objInst.mode = 'edit';
        objInst.selectedGroup = selectedGroup.config.data;
        var groupId = selectedGroup.config.data._id;
        $log.info('create with id: ' + JSON.stringify(groupId));

        objInst.patientMgrInterface = new PatientMgrV3Interface({
          groupId : groupId
        });

        objInst.adminMgrInterface = new AdminMgrInterface({
          groupId : groupId
        });

        $log.info('group element was selected: ' + JSON.stringify(selectedGroup));
      }

      return objInst;
    };
    return object;
  }

  //----------------------------------------------------
  //  CTRL FUNCTION
  //----------------------------------------------------  
  function CtrlFtn($scope, GroupManagerV3Obj, BaseInterface) {
    var vm = this;  
    vm.obj = null;

    $scope.$watch(function(scope) {
      return (vm.iface);
    }, function(iface, oldval) {
    	if(!iface) {
    		var iface = new BaseInterface();
    		vm.obj = new GroupManagerV3Obj(iface);
    		iface.setAPI(vm.obj.getAPI);
    		vm.obj.api.render(function(arg) {

    		});	
    	} else {
	        vm.obj = new GroupManagerV3Obj(iface);
	        iface.setAPI(vm.obj.getAPI);
	        vm.obj.api.render(function(arg) {
        	});
      	}
    }); 
  }

  //----------------------------------------------------
  //  DIRECTIVE
  //----------------------------------------------------  
  function DirFtn() {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'GroupManagerV3Ctrl',
      controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      templateUrl: 'app/groups/group-manager-v3/_group-manager-v3-tpl.html'
    };
    return directive;   
  }
})();


(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .filter('groupEditorfilter', GroupEditorfilterFtn)    
    .factory('GroupEditorObj', GroupEditorObjFtn)
    .controller('GroupEditorCtrl', GroupEditorCtrlFtn)
    .directive('groupEditor', GroupEditorDirFtn);

  var jbservice = null;
  var modalservice = null;

  function GroupEditorfilterFtn() {
    return function(arg) {  
      if(arg) {
      	// do something with arg
        return arg;
      }
      return arg;
    }     
  }

  function buildPatientViewer(obj, PatientObj) {
    obj.patientViewer.listobj = {};
    obj.patientViewer.listobj.state = {
      deleteMode : false
    };
    obj.patientViewer.listobj.template = 'app/groups/_group-element-tpl.html';
    obj.patientViewer.listobj.heading = 'Current Members';
    obj.patientViewer.listobj.loaderMessage = 'Loading Current Members...';
    obj.patientViewer.listobj.getElementsObj = jbservice.makeBatch(jbservice.makeEndpoint('users'));

    obj.patientViewer.listobj.makeElement = function(objElement) {
      return new PatientObj(objElement)
    };    

  }

  function buildPatientViewerHeader(obj) {
    obj.patientViewer.listobj.headerbar = 'app/groups/_group-header-bar-tpl.html';    
    obj.patientViewer.listobj.headerFtns = {
      addMember: function() {      
        //obj.mode = 'create';
        modalservice.onClick({
          tpl : 'app/groups/_group-member-modal-tpl.html'
        })
        .then(function(result) {});
      },
      deleteMember: function() {
        log.info('implement delete member ftn');
        obj.patientViewer.listobj.baseFtns.deselectAll();
        obj.patientViewer.listobj.state.deleteMode = !(obj.patientViewer.listobj.state.deleteMode);
        obj.patientViewer.listobj.baseFtns.propagateEvent('deleteMode', null);
      }
    }    
  }

  function GroupEditorObjFtn($log, ModalService, JawboneService, PatientObj) {
    var GroupEditorObj = function(arg, onCommitCB) {

      jbservice = JawboneService;
      modalservice = ModalService;

    	var obj = this;
      var args = arg || {};

      obj.patientViewer = {};
      buildPatientViewer(obj, PatientObj);
      buildPatientViewerHeader(obj);

      obj.message = 'the group creator';
      obj.onCommitCB = onCommitCB || function() {
        $log.info('supply on commit cb');
      };    

      obj.onAddPatient = function() {
        $log.info('on add patient');
        modalservice.onClick({
          tpl : 'app/groups/_group-member-modal-tpl.html',
          obj : obj
        }).then(function(result) {});      
      };

      obj.onAddAdmin = function() {
        $log.info('on add admin');
        modalservice.onClick({
          tpl : 'app/groups/_group-member-modal-tpl.html'
        }).then(function(result) {});      

      };
    };
    return GroupEditorObj;
  }

  function GroupEditorCtrlFtn($scope, GroupEditorObj) {
    var vm = this;  

    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      if(newval) {
        vm.obj = newval;        
      }
    }); 
  }

  function GroupEditorDirFtn() {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'GroupEditorCtrl',
      controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/groups/_group-edit-form-tpl.html'
    };
    return directive;   
  }
})();


(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .filter('groupCreatorfilter', FilterFtn)    
    .factory('GroupCreatorInterface', InterfaceFtn)  
    .factory('GroupCreatorObj', ObjectFtn)
    .controller('GroupCreatorCtrl', CtrlFtn)
    .directive('groupCreator', DirFtn);

  //----------------------------------------------------
  //  FILTER FUNCTION
  //----------------------------------------------------  
  function FilterFtn() {
    return function(arg) {  
      if(arg) {
      	// do something with arg
        return arg;
      }
      return arg;
    }     
  }

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function InterfaceFtn($log, BaseInterface) {
    var iface = function(config) {
      var ifaceInst = this;
      var config = config || {};

      angular.merge(ifaceInst, ifaceInst, new BaseInterface());

      ifaceInst.config = {       
      	user : config.user   
      };

      ifaceInst.notify = function(eventName) {
        var api = ifaceInst.getObjectAPI();
        api.notify(eventName);
      };

      return ifaceInst;            
    };
    return iface;
  }

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log, GroupCreatorInterface, BaseComp, ModalService) {
    var object = function(iface) {

      var initialise = initialiseFtn;
      var obj = this;
      angular.merge(obj, obj, new BaseComp());

      obj.api = {
      	getUser : function() {
      		return iface.config.user
      	},
      	getGroupDetails : function() {
      		return 'app/groups/group-creator/_group-details-form-tpl.html';
      	},
      	editImage : function() {
      		ModalService.onClick({
				tpl : 'app/groups/group-creator/_group-image-editor-tpl.html'
      		});
      	}
      };

      obj.connect(iface, obj.api, initialise);      

      function initialiseFtn(iface) {


      }

      return obj;
    };
    return object;
  }

  //----------------------------------------------------
  //  CTRL FUNCTION
  //----------------------------------------------------  
  function CtrlFtn($scope, $log, GroupCreatorObj) {
    var vm = this;  
    vm.obj = null;

    $log.info('ran the group creator ctrl');

    $scope.$watch(function(scope) {
      return (vm.iface);
    }, function(newval, oldval) {
      if(newval) {
      	$log.info('create the group creator...');
        vm.obj = new GroupCreatorObj(newval);
      }
    }); 
  }

  //----------------------------------------------------
  //  DIRECTIVE
  //----------------------------------------------------  
  function DirFtn() {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'GroupCreatorCtrl',
      controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      templateUrl: 'app/groups/group-creator/_group-creator-tpl.html'
    };
    return directive;   
  }
})();


(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('AdminMgrInterface', InterfaceFtn)  
    .factory('AdminMgrObj', ObjectFtn)
    .controller('AdminMgrCtrl', AdminMgrCtrlFtn)
    .directive('adminMgr', AdminMgrDirFtn);

  var name = 'groups/admins/AdminMgrComp : ';
  var log = null;
  var jbservice = null;
  var modalservice = null;
  var promiseService = null;

  /**
  * IMPLEMENT THIS OBJECT TO CREATE AN ADMIN MANAGER OBJ
  */
  function InterfaceFtn($log, BaseInterface) {
    var iface = function(config) {
      var ifaceInst = this;
      var config = config || {};

      angular.merge(ifaceInst, ifaceInst, new BaseInterface());

      ifaceInst.config = {
          groupId : config.groupId || null
      };

      ifaceInst.notify = function(eventName) {
        var api = ifaceInst.getObjectAPI();
        api.notify(eventName);
      };

      return ifaceInst;
    };
    return iface;
  }

  function ObjectFtn($log, BaseComp, AdminMgrInterface, ListV2Interface, GroupMemberObj, JawboneService) {
    var object = function(iface) {

      var makeHeaderObj = makeHeaderObjFtn;
      var initialise = initialiseFtn;

    	var obj = this;
      var listapi = null;

      // extend from BaseObject
      angular.merge(obj, obj, new BaseComp());

      var api = {
        message: 'adminMgrObject API',
        notify: function(eventName) {
          $log.info('admin mgr handle event: ' + eventName);
          switch(eventName) {
            case 'reveal':
              obj.listIface.notify(eventName);
          }
        }
      };

      obj.connect(iface, api, initialise);

      function initialiseFtn(iface) {
        obj.listIface = new ListV2Interface({
          header : {
            //heading: 'Admins',
            headerTemplate: 'app/groups/admins/_admin-action-bar-tpl.html',
            headerObj: makeHeaderObj()
          },
          events: {
            onCreated : function(api) {
              $log.info(name + ' on created');
            },
            onSelect : function(elem) {
              $log.info(name + ' on Select');
            },
            onDeselect : function(elem) {
              $log.info(name + ' on Deselect');
            },
            onConfirm : function() {
              $log.info(name + ' admin on Confirm function');
            },
            onStateChange : function() {
              $log.info(name + ' admin on State Change function');
            },
            onEvent : function() {
              $log.info(name + ' admin on Event function');
            }
          },
          loaderMessage: 'Loading Admins...',          
          getElementsObj : JawboneService.makeBatch(JawboneService.makeFieldGetter('groups', iface.config.groupId, 'admins')),
          makeElement : function(element) {       
            return new GroupMemberObj(element);
          },
          elementTemplate: 'app/patient/_group-member-element-tpl.html'               
        });        
      }

      function makeHeaderObjFtn() {
        return {
          createAdmin : function() {
            $log.info(name + ' call to create admin');
          },

          deleteAdmins : function() {
            $log.info(name + ' call to delete admin');
          }
        };
      }

      return obj;
    };
    return object;
  }

  function AdminMgrCtrlFtn($scope, $log, AdminMgrObj) {
    var vm = this;  
    vm.obj = null;

    $scope.$watch(function(scope) {
      return (vm.iface);
    }, function(newval, oldval) {
      if(newval) {
        //$log.info('create AdminMrgObj with iface: ' + JSON.stringify(newval));
        vm.obj = new AdminMgrObj(newval);
      }
    }); 
  }

  function AdminMgrDirFtn() {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'AdminMgrCtrl',
      controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      templateUrl: 'app/groups/admins/_admin-mgr-tpl.html'
    };
    return directive;   
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

      $log.info('content to file downloader: ' + JSON.stringify(obj.content));

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
var jbChartUtils = (function(angular) {
	'use strict';

	var id = 'chart-v2/chart-utils ';

	return {
		createJawboneChartLayout : createJawboneChartFtn
	};

	function createJawboneChartFtn() {
		console.log(id + ' create jawbone chart function');
      	var chart = {};
      	chart.type = "LineChart";
      	chart.data = [];
      	chart.options = {
	        // 'title': 'blank',
	        //'chartArea': { 'left':'40','top':'40','width':'60%','height':'75%'},
	        'chartArea': { 'left':'80','top':'40','width':'70%','height':'75%'},
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
      	return chart;
	}	
})(angular);

(function(cutils) {
  'use strict';

  angular
    .module('jawboneApp')
    .filter('chartV3filter', FilterFtn)    
    .factory('ChartV3Interface', InterfaceFtn)  
    .factory('ChartV3Obj', ObjectFtn)
    .controller('ChartV3Ctrl', CtrlFtn)
    .directive('chartV3', DirFtn);

    var id = 'chart-v3/chart-comp: ';

  //----------------------------------------------------
  //  FILTER FUNCTION
  //----------------------------------------------------  
  function FilterFtn() {
    return function(arg) {  
      if(arg) {
      	// do something with arg
        return arg;
      }
      return arg;
    }     
  }

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function InterfaceFtn($log, BaseInterface) {
    var iface = function(config) {
      var ifaceInst = new BaseInterface();
      var config = config || {};

  		ifaceInst.config = {  
        plots : config.plots || [],
        extractFieldValue : config.extractFieldValue || function(obj, field) {
          $log.info('supply an extract field value function');
          return 0;
        },
        yAxisLabels : config.yAxisLabels || [],
  			loaderMessage: config.loaderMessage || null,          
  			getElementsObj : config.getElementsObj || null,
  			makeElement : config.makeElement || null,
  			preprocessElements : config.preprocessElements || null,
  			plotParams : config.plotParams || null,
        getAdditionalPlotData : config.getAdditionalPlotData || function(cb) {
          $log.info('supply a getAdditionalPlotData ftn');
          cb(null);
        },
        canAddPlots: config.canAddPlots || false
  		};

      ifaceInst.notify = function(eventName) {
        var api = ifaceInst.getObjectAPI();
        api.notify(eventName);
      };

      return ifaceInst;
    };
    return iface;
  }

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log, BaseComp, ChartV3Interface, PlotGenerator) {
    var object = function(iface) {

      //var initialise = initialiseFtn;
    	var processElements = processElementsFtn;
      var appendElements = appendElementsFtn;
    	var selectPlot = selectPlotFtn;
    	var removeNullPoints = removeNullPointsFtn;
    	var convertToArr = convertToArrFtn;
    	var extract = extractFtn;
      var setYAxisTitle = setYAxisTitleFtn;
    	var obj = new BaseComp();
      obj.graphData = [];
      obj.plots = iface.config.plots || [];
      obj.selected = 0;
      obj.state = 'loading';

      obj.api = {
        render: function(cb) {
          $log.info('called render function of chartv3obj with supplied iface: ' + JSON.stringify(iface));
          obj.chart = cutils.createJawboneChartLayout();
          iface.config.getElementsObj.get()
          .then(function(result) {
            processElements(iface, result.data, iface.config.plotParams);
            setYAxisTitleFtn(obj.chart, 0, iface.config.yAxisLabels);
            cb('done');
            obj.state = 'complete';
          });
        },
        getState: function() {
          return obj.state;
        },
        switchToPlot: function(index) {
          $log.info('selected: ' + index);
          selectPlot(iface, index, obj.graphData);
        },
        getGraphData: function() {
          $log.info('called get graph data');
          return obj.chart.data;
        },
        canAddPlots: function() {
          return iface.config.canAddPlots;
        },
        appendPlot: function() {
          $log.info('request to append plot');
          iface.config.getAdditionalPlotData(function(getAdditionalPlotsObj) {
            $log.info('got the additional plot data...' + JSON.stringify(getAdditionalPlotsObj));
            getAdditionalPlotsObj.get()
            .then(function(result) {
              appendElements(iface, result.data, iface.config.plotParams);
            });
          });
        },
        resetPlots: function() {
          obj.state = 'loading';
          this.render(function(arg) {

          });
        }
      };

      //----------------------------------------------
      // append elements ftn 
      //----------------------------------------------        
      function appendElementsFtn(iface, elems, plotParams) {
        var newElements = [];

        angular.forEach(elems, function(value) {
          this.push(iface.config.makeElement(value));
        }, newElements);

        iface.config.preprocessElements(newElements);
        obj.graphData = PlotGenerator.appendPlot(obj.graphData, newElements, plotParams);   

        selectPlot(iface, 0, obj.graphData);
      }

    	//----------------------------------------------
    	// process elements 
    	//----------------------------------------------      	
    	function processElementsFtn(iface, elems, plotParams) {

    		//$log.info('elems for graph: ' + JSON.stringify(elems, true, 1));

        var elements = [];
        angular.forEach(elems, function(value) {
          this.push(iface.config.makeElement(value));
        }, elements);

        iface.config.preprocessElements(elements);
        obj.graphData = PlotGenerator.preparePlot(elements, plotParams);  

        //$log.info('graph data after prepare: ' + JSON.stringify(obj.graphData, true, 1));

        selectPlot(iface, 0, obj.graphData);
    	}

    	//----------------------------------------------
    	// process elements 
    	//----------------------------------------------      	
    	function selectPlotFtn(iface, index, gdata) {
        //gdata = gdata || obj.graphData;
        obj.selected = iface.config.plots[index];
        var chartdata = convertToArr(iface, gdata, index);

        removeNullPoints(chartdata);

        //obj.chart.options.title = obj.selected;
        //$log.info('chart data: ' + JSON.stringify(chartdata, true, 3));
        obj.chart.data = google.visualization.arrayToDataTable(chartdata);
        //$log.info('chart data: ' + JSON.stringify(obj.chart.data, true, 3));
        //onStateChange('ready');
    	}

    	//----------------------------------------------
    	// process elements 
    	//----------------------------------------------      	
    	function removeNullPointsFtn(arr) {
        for(var i = 1; i < arr.length; i++) {
          var elem = arr[i];
          if(!elem[1]) elem[1] = 0;
        }        
	    }

    	//----------------------------------------------
    	// process elements 
    	//----------------------------------------------      	
  		function convertToArrFtn(iface, graphData, yValueField) {
  			var arrData = [];
  			arrData.push(graphData.names); // add the header
  			angular.forEach(graphData.data, function(val) {
  			  var elem = [];
  			  elem.push(val.x); // push the date 
  			  
  			  angular.forEach(val.y, function(yplot) {
            $log.info('y value to push : ' + JSON.stringify(yplot));
  			    elem.push(extract(iface, yplot, yValueField));
  			  },val.y);

  			  //elem.push(extracFtn(val.y[0], yValueField)); // push the y axis value
  			  this.push(elem);
  			}, arrData);
  			return arrData;
  		}

    	//----------------------------------------------
    	// extract function 
    	//----------------------------------------------      	
  		function extractFtn(iface, yplot, fieldIdx) {
        $log.info('call to extract the field value with obj: ' + JSON.stringify(yplot));
        var fieldValue = iface.config.extractFieldValue(yplot, fieldIdx);
        return fieldValue;
        //var pnames = iface.config.plots;
        //var fieldToGet = pnames[fieldIdx];
        // $log.info('field idx: ' + fieldIdx);
        // $log.info('pnames: ' + JSON.stringify(pnames));
        // $log.info('obj is : ' + JSON.stringify(yplot));
        // $log.info('get the field: ' + fieldToGet + ' result: ' + JSON.stringify(yplot[pnames[fieldIdx]]));  
        //return yplot[pnames[fieldIdx]];
      }

      //----------------------------------------------
      // set the y axis title of the chart 
      //----------------------------------------------        
      function setYAxisTitleFtn(chart, index, labels) {
        chart.options.vAxis.title = labels[index];
      }      

      return obj;
    };
    return object;
  }

  //----------------------------------------------------
  //  CTRL FUNCTION
  //----------------------------------------------------  
  // function CtrlFtn($scope, $log, ChartV3Obj, googleChartApiPromise, BaseCtrl) {
  //   var vm = this;  
  //   vm.obj = null;

  //   googleChartApiPromise.then(function() {
  //     new BaseCtrl(vm.iface, function(createdIface) {
  //       return new ChartV3Obj(createdIface);
  //     }, function(obj) {
  //       vm.obj = obj;
  //     });
  //   });
  // }

  function CtrlFtn($scope, $log, ChartV3Obj, googleChartApiPromise) {
    var vm = this;  
    vm.obj = null;

    $scope.$watch(function(scope) {
      return (vm.iface);
    }, function(iface, oldval) {
      if(iface) {
        googleChartApiPromise.then(function() {
        	$log.info(id + ' loaded google chart api');
      		vm.obj = new ChartV3Obj(iface);
          iface.setAPI(vm.obj.getAPI);
          vm.obj.api.render(function() {
            $log.info('render the chart obj');
          });
        });
      }
    }); 
  }

  //----------------------------------------------------
  //  DIRECTIVE
  //----------------------------------------------------  
  function DirFtn() {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'ChartV3Ctrl',
      controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      templateUrl: 'app/chart-v3/_chart-tpl.html'
    };
    return directive;   
  }
})(jbChartUtils);

var jbChartUtils = (function(angular) {
	'use strict';

	var id = 'chart-v2/chart-utils ';

	return {
		createJawboneChartLayout : createJawboneChartFtn
	};

	function createJawboneChartFtn() {
		console.log(id + ' create jawbone chart function');
      	var chart = {};
      	chart.type = "LineChart";
      	chart.data = [];
      	chart.options = {
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
      	return chart;
	}	
})(angular);

(function(cutils) {
  'use strict';

  angular
    .module('jawboneApp')
    .filter('chartV2filter', FilterFtn)    
    .factory('ChartV2Interface', InterfaceFtn)  
    .factory('ChartV2Obj', ObjectFtn)
    .controller('ChartV2Ctrl', CtrlFtn)
    .directive('chartV2', DirFtn);

    var id = 'chart-v2/chart-comp: ';

  //----------------------------------------------------
  //  FILTER FUNCTION
  //----------------------------------------------------  
  function FilterFtn() {
    return function(arg) {  
      if(arg) {
      	// do something with arg
        return arg;
      }
      return arg;
    }     
  }

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function InterfaceFtn($log, BaseInterface) {
    var iface = function(config) {
  		var ifaceInst = this;        
      angular.merge(ifaceInst, ifaceInst, new BaseInterface());

  		ifaceInst.config = {  
        plots : config.plots || [],
  			loaderMessage: config.loaderMessage || null,          
  			getElementsObj : config.getElementsObj || null,
  			makeElement : config.makeElement || null,
  			preprocessElements : config.preprocessElements || null,
  			plotParams : config.plotParams || null,
        getAdditionalPlotData : config.getAdditionalPlotData || function(cb) {
          $log.info('supply a getAdditionalPlotData ftn');
          cb(null);
        }
  		};

      ifaceInst.notify = function(eventName) {
        var api = ifaceInst.getObjectAPI();
        api.notify(eventName);
      };

      return ifaceInst;
    };
    return iface;
  }

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log, BaseComp, ChartV2Interface, PlotGenerator) {
    var object = function(iface, onStateChange) {

      var initialise = initialiseFtn;
    	var processElements = processElementsFtn;
    	var selectPlot = selectPlotFtn;
    	var removeNullPoints = removeNullPointsFtn;
    	var convertToArr = convertToArrFtn;
    	var extract = extractFtn;
    	var obj = this;

      // extend from BaseObject
      angular.merge(obj, obj, new BaseComp());

      obj.api = {
        switchToPlot: function(index) {
          selectPlot(index, obj.graphData);
        },
        getGraphData: function() {
          $log.info('called get graph data');
          return obj.chart.data;
        },
        appendPlot: function() {
          $log.info('request to append plot');
          iface.config.getAdditionalPlotData(function(result) {
            $log.info('got the additional plot data...' + result);
          });
        }
      };
      obj.graphData = [];

      obj.connect(iface, obj.api, initialise);

      //----------------------------------------------
      // initialise function 
      //----------------------------------------------        
      function initialiseFtn(iface) {
        obj.chart = cutils.createJawboneChartLayout();

        onStateChange('loading');
        iface.config.getElementsObj.get()
        .then(function(result) {
          //$log.info(id + ' plot params: ' + JSON.stringify(obj.plotParams));
          processElements(iface, result.data, iface.config.plotParams);
        });
      }

    	//----------------------------------------------
    	// process elements 
    	//----------------------------------------------      	
    	function processElementsFtn(iface, elems, plotParams) {

    		//$log.info('elems for graph: ' + JSON.stringify(elems, true, 1));

        var elements = [];
        angular.forEach(elems, function(value) {
          this.push(iface.config.makeElement(value));
        }, elements);

        iface.config.preprocessElements(elements);
        obj.graphData = PlotGenerator.preparePlot(elements, plotParams);  

        //$log.info('graph data after prepare: ' + JSON.stringify(obj.graphData, true, 1));

        selectPlot(iface, 0, obj.graphData);
    	}

    	//----------------------------------------------
    	// process elements 
    	//----------------------------------------------      	
    	function selectPlotFtn(iface, index, gdata) {
        //gdata = gdata || obj.graphData;
        var selected = iface.config.plots[index];
        var chartdata = convertToArr(iface, gdata, index);

        removeNullPoints(chartdata);

        //obj.chart.options.title = obj.selected;
        //$log.info('chart data: ' + JSON.stringify(chartdata, true, 3));
        obj.chart.data = google.visualization.arrayToDataTable(chartdata);
        //$log.info('chart data: ' + JSON.stringify(obj.chart.data, true, 3));
        onStateChange('ready');
    	}

    	//----------------------------------------------
    	// process elements 
    	//----------------------------------------------      	
    	function removeNullPointsFtn(arr) {
        for(var i = 1; i < arr.length; i++) {
          var elem = arr[i];
          if(!elem[1]) elem[1] = 0;
        }        
	    }

    	//----------------------------------------------
    	// process elements 
    	//----------------------------------------------      	
  		function convertToArrFtn(iface, graphData, yValueField) {
  			var arrData = [];
  			arrData.push(graphData.names); // add the header
  			angular.forEach(graphData.data, function(val) {
  			  var elem = [];
  			  elem.push(val.x); // push the date 
  			  
  			  angular.forEach(val.y, function(yplot) {
  			    elem.push(extract(iface, yplot, yValueField));
  			  },val.y);

  			  //elem.push(extracFtn(val.y[0], yValueField)); // push the y axis value
  			  this.push(elem);
  			}, arrData);
  			return arrData;
  		}

    	//----------------------------------------------
    	// extract function 
    	//----------------------------------------------      	
  		function extractFtn(iface, yplot, fieldIdx) {
        var pnames = iface.config.plots;
        var fieldToGet = pnames[fieldIdx];
        // $log.info('field idx: ' + fieldIdx);
        // $log.info('pnames: ' + JSON.stringify(pnames));
        // $log.info('obj is : ' + JSON.stringify(yplot));
        // $log.info('get the field: ' + fieldToGet + ' result: ' + JSON.stringify(yplot[pnames[fieldIdx]]));  
        return yplot[pnames[fieldIdx]];
      }

      return obj;
    };
    return object;
  }

  //----------------------------------------------------
  //  CTRL FUNCTION
  //----------------------------------------------------  
  function CtrlFtn($scope, $log, ChartV2Obj, googleChartApiPromise) {
    var vm = this;  
    vm.obj = null;

    $scope.$watch(function(scope) {
      return (vm.iface);
    }, function(newval, oldval) {
      if(newval) {
        googleChartApiPromise.then(function() {
        	$log.info(id + ' loaded google chart api');
      		vm.obj = new ChartV2Obj(newval, function(newState) {
        		vm.state = newState;
      		});
        });
      }
    }); 
  }

  //----------------------------------------------------
  //  DIRECTIVE
  //----------------------------------------------------  
  function DirFtn() {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'ChartV2Ctrl',
      controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      templateUrl: 'app/chart-v2/_chart-tpl.html'
    };
    return directive;   
  }
})(jbChartUtils);

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
            // console.log('startIdx is : ' + startIdx);
            // console.log('i is : ' + i);
            // console.log('x is : ' + arr[i]);            
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
            //$log.info('plot names: ' + JSON.stringify(plotParams));       
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

            for(var i = 0; i < data.length; i++) {
                //find the index into the date array to add this 'value'
                idx = findIndexOf(dateArr, function(elem) {
                    var jsdate = JawboneChartUtils.jawboneToJSDate(data[i].date);
                    //$log.info('elem: ' + elem);
                    //$log.info('date is ' + elem.toDateString() + ' jsdate: ' + jsdate.toDateString());
                    // if(elem.toDateString() === jsdate.toDateString()) {
                    //     $log.info('have a matching date: ' + JSON.stringify(data[i]));
                    // }
                    return (elem.toDateString() === jsdate.toDateString());  
                }, idx);     

                // $log.info('value: ' + JSON.stringify(value));

                if(idx === -1) {
                    break;
                } else {
                    //$log.info('value to add is : ' + JSON.stringify(data[i]));
                    PlotGenerator.addToArray(arr, idx, 0, data[i]);
                }
            }

            //$log.info('data arry: ' + JSON.stringify(arr));

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
        
        //$log.info('prepared plot: ' + JSON.stringify(obj.graphData, true, 1));
        obj.selectPlot(0, obj.graphData);
      }

      obj.selectPlot = function(index, gdata) {
        gdata = gdata || obj.graphData;
        obj.selected = obj.plots[index];
        obj.chartdata = convertToArr(obj.graphData, index);

        removeNullPoints(obj.chartdata);

        //obj.chart.options.title = obj.selected;
        //$log.info('chart data: ' + JSON.stringify(obj.chartdata, true, 3));
        obj.chart.data = google.visualization.arrayToDataTable(obj.chartdata);
        //$log.info('chart data: ' + JSON.stringify(obj.chart.data, true, 3));
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

(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .filter('adminManagerV3filter', FilterFtn)    
    .factory('AdminManagerV3Interface', InterfaceFtn)  
    .factory('AdminManagerV3Obj', ObjectFtn)
    .controller('AdminManagerV3Ctrl', CtrlFtn)
    .directive('adminMgrV3', DirFtn);

  //----------------------------------------------------
  //  FILTER FUNCTION
  //----------------------------------------------------  
  function FilterFtn() {
    return function(arg) {  
      if(arg) {
      	// do something with arg
        return arg;
      }
      return arg;
    }     
  }

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function InterfaceFtn($log, BaseInterface) {
    var iface = function(config) {
      var ifaceInst = new BaseInterface();
      var config = config || {};

      ifaceInst.config = {   
        groupId: config.groupId || 0      
      };

      return ifaceInst;            
    };
    return iface;
  }

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log, AdminManagerV3Interface, BaseComp, ListViewerV3Interface, ListViewerElemInterface, ListElemAPI, PatientV3Obj, JawboneService) {
    var object = function(iface) {

      var onRender = onRenderFtn;
      var activateEditMode = activateEditModeFtn;

      var objInst = new BaseComp();
      objInst.mode = 'view';
      objInst.adminsListInterface = null;
      objInst.seletedAdmin = null;
      //objInst.sleepsChartInterface = null;
      //objInst.sleepsListInterface = null;

      objInst.api = {
        render: function(cb) {
          onRender();
          cb();
        },
        getMode : function() {
          return objInst.mode;
        },
        refresh : function() {
          $log.info('refresh the admin manager');
          objInst.adminsListInterface.getAPI().refresh();
        }       
      };

      function onRenderFtn() {

        objInst.adminsListInterface = new ListViewerV3Interface({
          getElementsObj : JawboneService.makeBatch(JawboneService.makeFieldGetter('groups', iface.config.groupId, 'admins')),
          makeListElementFtn : function(listData) {
            return new ListViewerElemInterface({
              api : new ListElemAPI(listData),
              data : new PatientV3Obj(listData.element)
            });
          },
          onSelect : function(element, index) {
            activateEditMode(element);
          },
          headerTpl : 'app/groups/group-manager-v3/_group-list-action-bar-tpl.html'           
        });
      }

      function activateEditModeFtn(selectedAdmin) {
        objInst.mode = 'edit';
        //var patientId = selectedPatient.config.data._id;
        var adminId = selectedAdmin.config.data;
      }

      return objInst;
    };
    return object;
  }

  //----------------------------------------------------
  //  CTRL FUNCTION
  //----------------------------------------------------  
  function CtrlFtn($scope, AdminManagerV3Obj, BaseCtrl) {
    var vm = this;  
    vm.obj = null;

    new BaseCtrl(vm.iface, function(createdIface) {
      return new AdminManagerV3Obj(createdIface);
    }, function(obj) {
      vm.obj = obj;
    });

    // $scope.$watch(function(scope) {
    //   return (vm.iface);
    // }, function(iface, oldval) {
    //   if(iface) {
    //     vm.obj = new AdminManagerV3Obj(iface);
    //     iface.setAPI(vm.obj.getAPI);
    //     vm.obj.api.render(function() {
    //     });
    //   }
    // }); 
  }

  //----------------------------------------------------
  //  DIRECTIVE
  //----------------------------------------------------  
  function DirFtn() {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'AdminManagerV3Ctrl',
      controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      templateUrl: 'app/admins/admin-manager-v3/_admin-manager-tpl.html'
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
$templateCache.put("app/chart-v2/_chart-tpl.html","<loader obj=\"ctrl.co.loaderMessage\" ng-show=\"ctrl.state !== \'ready\'\"></loader><div class=\"chart-area animated\" ng-show=\"ctrl.state === \'ready\'\"><div class=\"chart-header\"><span uib-dropdown=\"\"><a class=\"btn btn-default\" uib-dropdown-toggle=\"\">{{ctrl.obj.selected || \'select a plot...\'}} <span class=\"caret\"></span></a><ul uib-dropdown-menu=\"\"><li ng-repeat=\"item in ctrl.obj.plots track by $index\"><span ng-click=\"ctrl.obj.api.switchToPlot($index)\">{{item}}</span></li></ul></span> <span class=\"btn btn-default\" ng-click=\"ctrl.obj.api.appendPlot()\">compare with</span></div><div class=\"chart-body\"><div class=\"chart-element\"><div google-chart=\"\" chart=\"ctrl.obj.chart\" style=\"height:300px; width:570px; border: 1px solid #fff;\"></div></div></div></div>");
$templateCache.put("app/chart-v3/_chart-tpl.html","<loader obj=\"ctrl.co.loaderMessage\" ng-show=\"ctrl.obj.api.getState() === \'loading\'\"></loader><div class=\"chart-area animated\" ng-show=\"ctrl.obj.api.getState() === \'complete\'\"><div class=\"chart-header\"><span uib-dropdown=\"\"><a class=\"btn btn-default\" uib-dropdown-toggle=\"\">{{ctrl.obj.selected || \'select a plot...\'}} <span class=\"caret\"></span></a><ul uib-dropdown-menu=\"\"><li ng-repeat=\"item in ctrl.obj.plots track by $index\"><span ng-click=\"ctrl.obj.api.switchToPlot($index)\">{{item}}</span></li></ul></span><div class=\"btn-group\" ng-show=\"ctrl.obj.api.canAddPlots()\"><div class=\"btn btn-default\" ng-click=\"ctrl.obj.api.appendPlot()\">compare with</div><div class=\"btn btn-default\" ng-disabled=\"true\">&nbsp;</div><div class=\"btn btn-default\" ng-click=\"ctrl.obj.api.resetPlots()\">reset</div></div></div><div class=\"chart-body\"><div class=\"chart-element\"><div google-chart=\"\" chart=\"ctrl.obj.chart\" style=\"height:300px; width:745px; border: 1px solid #fff;\"></div></div></div></div>");
$templateCache.put("app/dropdown/_default-dropdown-tpl.html","<span class=\"glyphicon glyphicon-menu-hamburger obi-default-dropdown-box\"></span>");
$templateCache.put("app/dropdown/_dropdown-tpl.html","<div class=\"obi-dropdown-container\" ng-class=\"{ \'obi-show\': ctrl.visible }\" obi-click-elsewhere=\"ctrl.onDeselect()\"><div class=\"obi-dropdown-display\" ng-click=\"ctrl.show();\" ng-class=\"{ \'clicked\': ctrl.visible }\"><span ng-include=\"ctrl.ddobj.templateUrl\"></span></div><div class=\"obi-dropdown-list\"><ul><li ng-repeat=\"$item in ctrl.ddobj.filters track by $index\" ng-click=\"ctrl.setSelected($index)\"><h5 ng-if=\"ctrl.ddobj.selectedFilterIdx === $index\">{{$item}} <small><span class=\"glyphicon glyphicon-ok\"></span></small></h5><h5 ng-if=\"ctrl.ddobj.selectedFilterIdx !== $index\">{{$item}} &nbsp;</h5></li></ul></div></div>");
$templateCache.put("app/fileHandler/_file-download-tpl.html","<textarea class=\"download-textarea\" ng-model=\"ctrl.do.content | json\" name=\"textarea\" rows=\"20\">\r\n</textarea> <a href=\"\" class=\"btn btn-primary btn-small\" ng-click=\"ctrl.do.download()\">Download</a>");
$templateCache.put("app/form-utils/_expander-tpl.html","<span>{{text | limitTo: textLimit }}</span> <span ng-if=\"text.length > limit\"><a ng-if=\"expanded\" ng-click=\"expanderClick()\" style=\"font-size: 90%;\">...(less)</a> <a ng-if=\"!expanded\" ng-click=\"expanderClick()\" style=\"font-size: 90%;\">...(more)</a></span>");
$templateCache.put("app/form-utils/_form-input-tpl.html","<div class=\"form-group jbv-form-group\" ng-class=\"{ \'has-error\' : ctrl.fo.email.$invalid && !ctrl.fo.email.$pristine }\"><label for=\"email\">Email address:</label> {{ctrl.fo.email | json}}<p>{{ctrl.fo.name}}</p><p>{{ctrl.name}}</p><div class=\"jbv-input\"><p>{{ctrl.fo.name}}</p><input type=\"email\" name=\"{{ctrl.fo.name}}\" class=\"form-control\" id=\"email\" required=\"\" ng-minlength=\"5\" ng-model=\"ctrl.fo.model.email\"><div ng-if=\"ctrl.fo.email.$valid\" class=\"jbv-input-status-ok\"><span class=\"glyphicon glyphicon-ok ok\"></span></div><div ng-if=\"ctrl.fo.email.$dirty && ctrl.fo.email.$invalid\" class=\"jbv-input-status-bad\"><span class=\"glyphicon glyphicon-remove invalid\"></span></div></div><p ng-show=\"ctrl.fo.email.$invalid && ctrl.fo.email.$touched\" class=\"help-block jbv-input-status-msg\">invalid email!</p></div><div class=\"form-group\" ng-class=\"{ \'has-error\' : registerForm.emailrt.$invalid && !registerForm.emailrt.$pristine }\"><label for=\"email\">Confirm Email address:</label> <input type=\"email\" name=\"emailrt\" class=\"form-control\" id=\"emailrt\" compare-to=\"gateway.credentials.email\" ng-model=\"register.emailrt\"><p ng-show=\"registerForm.emailrt.$invalid && registerForm.emailrt.$touched\">Emails do not match!</p></div>");
$templateCache.put("app/form-utils/_minifier-tpl.html","<span>{{text | limitTo: textLimit }}</span> <span ng-if=\"text.length > limit\"><span style=\"font-size: 90%;\">...</span></span>");
$templateCache.put("app/friends/_friends-tpl.html","<div><h3>Friends</h3><p>Data: {{ctrl.fo.data | json}}</p></div>");
$templateCache.put("app/gateway/about.html","<h4>our about page</h4>");
$templateCache.put("app/gateway/gateway-main.html","<div ui-view=\"\"></div>");
$templateCache.put("app/gateway/home.html","<div id=\"mainarea\"><div id=\"sidebar\"><span class=\"btn btn-primary-outline\" ng-click=\"gateway.showPatient()\" ng-class=\"{ \'btn-default\' : gateway.mode === \'patient\'}\">Patient</span> <span class=\"btn btn-primary-outline\" ng-click=\"gateway.showTherapist()\" ng-class=\"{ \'btn-default\' : gateway.mode === \'therapist\'}\">Therapist</span><hr><div class=\"panel panel-default\" ng-show=\"gateway.mode === \'patient\' || gateway.mode === \'therapist\'\"><div class=\"panel-heading\">{{gateway.getLoginMessage()}}</div><div class=\"panel-body\"><form name=\"loginForm\" class=\"form-area\" action=\"{{gateway.getLogin()}}\" method=\"post\" novalidate=\"\"><div class=\"form-group\"><label for=\"email\">Email address:</label> <input type=\"email\" name=\"email\" class=\"form-control\" id=\"email\"></div><div class=\"form-group\"><label for=\"pwd\">Password:</label> <input type=\"password\" name=\"password\" class=\"form-control\" id=\"pwd\"></div><div class=\"checkbox\"><label><input type=\"checkbox\"> Remember me</label></div><button type=\"submit\" class=\"btn btn-default\">Login</button></form></div></div><div class=\"panel panel-default\" ng-show=\"gateway.mode === \'patient\'\"><div class=\"panel-heading\">or register as a new user</div><div class=\"panel-body\"><form name=\"registerForm\" class=\"form-area\" action=\"/register/user\" method=\"post\" novalidate=\"\"><div class=\"form-group jbv-form-group\" ng-class=\"{ \'has-error\' : registerForm.email.$invalid && !registerForm.email.$pristine }\"><label for=\"email\">Email address:</label><div class=\"jbv-input\"><input type=\"email\" name=\"email\" class=\"form-control\" id=\"email\" required=\"\" ng-minlength=\"5\" ng-model=\"gateway.credentials.email\"><div ng-if=\"registerForm.email.$touched && registerForm.email.$valid\" class=\"jbv-input-status-ok\"><span class=\"glyphicon glyphicon-ok ok\"></span></div><div ng-if=\"registerForm.email.$touched && registerForm.email.$invalid\" class=\"jbv-input-status-bad\"><span class=\"glyphicon glyphicon-remove invalid\"></span></div></div><p ng-show=\"registerForm.email.$invalid && registerForm.email.$touched\" class=\"help-block jbv-input-status-msg\">invalid email!</p></div><div class=\"form-group jbv-form-group\" ng-class=\"{ \'has-error\' : registerForm.emailrt.$invalid && !registerForm.emailrt.$pristine }\"><label for=\"email\">Confirm Email address:</label><div class=\"jbv-input\"><input type=\"email\" name=\"emailrt\" class=\"form-control\" id=\"emailrt\" compare-to=\"gateway.credentials.email\" ng-model=\"register.emailrt\"><div ng-if=\"registerForm.emailrt.$touched && registerForm.emailrt.$valid\" class=\"jbv-input-status-ok\"><span class=\"glyphicon glyphicon-ok ok\"></span></div><div ng-if=\"registerForm.emailrt.$touched && registerForm.emailrt.$invalid\" class=\"jbv-input-status-bad\"><span class=\"glyphicon glyphicon-remove invalid\"></span></div></div><p ng-show=\"registerForm.emailrt.$invalid && registerForm.emailrt.$touched\" class=\"help-block jbv-input-status-msg\">Emails do not match!</p></div><div class=\"form-group jbv-form-group\" ng-class=\"{ \'has-error\' : registerForm.password.$invalid && registerForm.password.$touched }\"><label for=\"pwd\">Password:</label><div class=\"jbv-input\"><input type=\"password\" name=\"password\" class=\"form-control\" id=\"pwd\" ng-model=\"gateway.credentials.password\" ng-minlength=\"4\" ng-maxlength=\"20\"><div ng-if=\"registerForm.password.$touched && registerForm.password.$valid\" class=\"jbv-input-status-ok\"><span class=\"glyphicon glyphicon-ok ok\"></span></div><div ng-if=\"registerForm.password.$touched && registerForm.password.$invalid\" class=\"jbv-input-status-bad\"><span class=\"glyphicon glyphicon-remove invalid\"></span></div></div><p ng-show=\"registerForm.password.$error.minlength && registerForm.password.$touched\" class=\"help-block jbv-input-status-msg\">password is too short.</p><p ng-show=\"registerForm.password.$error.maxlength\" class=\"help-block jbv-input-status-msg\">password is too long.</p></div><div class=\"form-group jbv-form-group\" ng-class=\"{ \'has-error\' : registerForm.pwdrt.$invalid && !registerForm.pwdrt.$pristine }\"><label for=\"pwdrt\">Confirm Password:</label><div class=\"jbv-input\"><input type=\"password\" name=\"pwdrt\" class=\"form-control\" id=\"pwdrt\" compare-to=\"gateway.credentials.password\" ng-model=\"register.pwdrt\"><div ng-if=\"registerForm.password.$touched && registerForm.pwdrt.$valid\" class=\"jbv-input-status-ok\"><span class=\"glyphicon glyphicon-ok ok\"></span></div><div ng-if=\"registerForm.pwdrt.$touched && registerForm.pwdrt.$invalid\" class=\"jbv-input-status-bad\"><span class=\"glyphicon glyphicon-remove invalid\"></span></div></div><p ng-show=\"registerForm.pwdrt.$invalid && registerForm.pwdrt.$touched\" class=\"help-block jbv-input-status-msg\">Passwords do not match!</p></div><button type=\"submit\" class=\"btn btn-default\" ng-disabled=\"registerForm.$invalid || registerForm.$pristine\">Register</button></form></div></div></div><div id=\"jbv-maincontent\"></div></div>");
$templateCache.put("app/goals/_goals-tpl.html","<div><h3>Goals</h3><p>Sleep Total: {{ctrl.go.sleepTotal}}</p><p>Move Steps: {{ctrl.go.moveSteps}}</p><p>Sleep Remaining: {{ctrl.go.sleepRem}}</p><p>Intake Calories Remaining: {{ctrl.go.intakeCaloriesRem | number:2}}</p><p>Move Steps Remaining: {{ctrl.go.moveStepsRem}}</p></div>");
$templateCache.put("app/groups/_group-edit-form-tpl.html","<p>show create form</p><div class=\"btn btn-default\" ng-click=\"ctrl.obj.onCommitCB()\">done</div><div class=\"btn btn-default\" ng-click=\"ctrl.obj.onAddPatient()\">add patient</div><div class=\"btn btn-default\" ng-click=\"ctrl.obj.onAddAdmin()\">add admin</div>");
$templateCache.put("app/groups/_group-element-tpl.html","<div class=\"user-list-element\" ng-class=\"{\'active\' : ctrl.obj.element.api.selected, \'deleteMode\' : ctrl.obj.element.api.deleteMode }\" ng-click=\"ctrl.obj.element.api.clickedView()\"><img ng-src=\"assets/group.png\" height=\"100px\" width=\"100px\"><div class=\"user-details\"><div class=\"name\">{{ctrl.obj.element.name}}</div><div class=\"features\"><p>{{ctrl.obj.element.description}}</p><p>{{ctrl.obj.element.size}} members</p></div></div><div ng-show=\"ctrl.obj.element.api.deleteMode\" class=\"delete-widget pulser-anim\"><p><span class=\"glyphicon glyphicon-remove faded-glyph\"></span></p></div><div ng-show=\"ctrl.obj.element.api.confirmDeleteMode\" class=\"delete-confirm-widget slider-anim\" visible-click-elsewhere=\"ctrl.obj.element.api.cancel($event)\"><span class=\"btn btn-default\" ng-click=\"ctrl.obj.element.api.delete($event)\">confirm</span> <span class=\"btn btn-default\" ng-click=\"ctrl.obj.element.api.cancel($event)\">cancel</span></div></div>");
$templateCache.put("app/groups/_group-header-bar-tpl.html","<div style=\"padding: 3px; border-top: 1px solid #ddd;\"><div class=\"btn-group\" style=\"float: right;\"><div class=\"btn btn-default\" ng-click=\"ctrl.obj.listobj.headerFtns.createGroup()\"><span class=\"glyphicon glyphicon-user faded-glyph\"></span> create group</div><div class=\"btn btn-default\" ng-click=\"ctrl.obj.listobj.headerFtns.deleteGroups()\"><span class=\"glyphicon glyphicon-remove faded-glyph\"></span> remove groups</div></div><div style=\"clear: both;\"></div></div>");
$templateCache.put("app/groups/_group-member-modal-tpl.html","<p>argument to modal</p><p>{{ctrl.resolveArg | json}}</p><listviewer obj=\"ctrl.resolveArg.obj.patientViewer\"></listviewer>");
$templateCache.put("app/groups/_group-mgr-tpl.html","<div class=\"patient-area\" ng-if=\'ctrl.obj.mode === \"view\"\'><listviewer obj=\"ctrl.obj.groupViewer\"></listviewer></div><div class=\"patient-area\" ng-if=\'ctrl.obj.mode === \"create\"\'><div class=\"btn btn-default\" ng-click=\'ctrl.obj.mode = \"view\"\'>back</div><group-creator iface=\"ctrl.obj.groupCreatorInterface\"></group-creator></div><div class=\"patient-area\" ng-if=\'ctrl.obj.mode === \"edit\"\'><group-summary obj=\"ctrl.obj.groupSummary\"></group-summary><div><ul class=\"header-titles\"><li ng-class=\"{\'selected\' : ctrl.obj.api.isPatientView()}\"><a ng-click=\"ctrl.obj.api.setPatientView()\">Patients</a></li><li ng-class=\"{\'selected\' : ctrl.obj.api.isAdminView()}\"><a ng-click=\"ctrl.obj.api.setAdminView()\">Admins</a></li></ul></div><patient-mgr ng-show=\"ctrl.obj.api.isPatientView()\" iface=\"ctrl.obj.patientMgrInterface\"></patient-mgr><admin-mgr ng-show=\"ctrl.obj.api.isAdminView()\" iface=\"ctrl.obj.adminMgrInterface\"></admin-mgr></div>");
$templateCache.put("app/groups/_group-patients-action-bar-tpl.html","<div class=\"btn-group\" style=\"float: right;\"><div class=\"btn btn-default\" ng-click=\"ctrl.obj.listobj.headerFtns.addPatientToGroup()\"><span class=\"glyphicon glyphicon-user faded-glyph\"></span> add patient to group</div><div class=\"btn btn-default\" ng-click=\"ctrl.obj.listobj.headerFtns.removePatientFromGroup()\"><span class=\"glyphicon glyphicon-remove faded-glyph\"></span> remove patient from group</div></div><div style=\"clear: both;\"></div>");
$templateCache.put("app/groups/_group-summary-action-bar-tpl.html","<div class=\"btn btn-default\" ng-click=\"ctrl.pso.parent.switchView()\" style=\"float : left;\"><span class=\"glyphicon glyphicon-th-list faded-glyph\"></span> back to groups view</div><div class=\"btn-group\" style=\"float: right;\"><div class=\"btn btn-default\" ng-click=\"ctrl.pso.parent.addPatient()\"><span class=\"glyphicon glyphicon-pencil faded-glyph\"></span> edit group</div></div><div style=\"clear: both;\"></div>");
$templateCache.put("app/groups/_group-summary-tpl.html","<div class=\"patient-header\"><div class=\"patient-info\"><img ng-src=\"{{ctrl.pso.user.profile.image | defaultGroup }}\" height=\"100px\" width=\"100px\"><div class=\"user-details\"><div class=\"name\">{{ctrl.pso.group.name}}</div><div class=\"features\"><p>{{ctrl.pso.group.description}}</p><p>{{ctrl.pso.group.members.length}} members</p></div></div></div><hr><div style=\"clear: both;\"></div><div ng-include=\"ctrl.pso.actionBar\"></div></div>");
$templateCache.put("app/img-uploader/_img-uploader-tpl.html","<p>image length: {{ctrl.image.length}}</p><p>new image length: {{ctrl.newImage}}</p><p>new cropped length: {{ctrl.newCroppedImage.length}}</p><button class=\"btn btn-primary\" ngf-select=\"\" ng-model=\"ctrl.newImage\" accept=\"image/*\">Select Image</button><hr><div ngf-drop=\"\" ng-model=\"ctrl.newImage\" ngf-pattern=\"image/*\" class=\"cropArea\"><img-crop image=\"ctrl.newImage | ngfDataUrl\" area-type=\"square\" result-image=\"ctrl.newCroppedImage\"></img-crop></div>");
$templateCache.put("app/list-viewer/_default-headerbar-tpl.html","<div class=\"trends-header-bar\"><span>&nbsp;</span></div>");
$templateCache.put("app/list-viewer/_default-lve-tpl.html","<div class=\"trends-element-style\"><span>default</span><h3>hello!</h3></div>");
$templateCache.put("app/list-viewer/_list-viewer-tpl.html","<loader obj=\"ctrl.lo.listobj.loaderMessage\" ng-show=\"ctrl.state === \'loading\'\"></loader><div class=\"list-view-box animated\" ng-show=\"ctrl.state === \'ready\'\"><div class=\"heading\">{{ctrl.lo.listobj.heading}}</div><div class=\"filter-container\" ng-show=\"ctrl.hasFilter\"><input type=\"text\" class=\"form-control\" placeholder=\"search for...\" ng-model=\"searchtext\"></div><p></p><header-bar tpl=\"ctrl.lo.listobj.headerbar\" obj=\"ctrl.lo.listobj\"></header-bar><div id=\"listviewerbox\" class=\"list-viewer-elements\" mouse-wheel-up=\"ctrl.didMouseWheelUp()\" mouse-wheel-down=\"ctrl.didMouseWheelDown()\"><ul><li ng-repeat=\"elem in ctrl.lo.listobj.elements track by $index\"><lvelem tpl=\"ctrl.lo.listobj.template\" obj=\"elem\" i=\"{{$index}}\"></lvelem></li></ul></div><div class=\"scroll-control\" ng-show=\"ctrl.hasScrollers\"><span class=\"btn btn-default scroll-button\" ng-click=\"ctrl.back()\" ng-disabled=\"ctrl.atStart()\"><span class=\"glyphicon glyphicon-chevron-up\"></span></span> <span class=\"btn btn-default scroll-button\" ng-click=\"ctrl.forward()\" ng-disabled=\"ctrl.atEnd()\"><span class=\"glyphicon glyphicon-chevron-down\"></span></span></div></div>");
$templateCache.put("app/loaders/_basic-spinner-tpl.html","<div class=\"loader\"></div>");
$templateCache.put("app/loaders/_loader-frame-tpl.html","<div class=\"loader-area\"><div class=\"loader-header\">{{ctrl.message}}</div><div class=\"loader-body loader-outer\"><div class=\"loader-inner\"><div ng-include=\"ctrl.loader\"></div></div></div></div>");
$templateCache.put("app/loaders/_rectangles-tpl.html","<div class=\"spinner\"><div class=\"rect1\"></div><div class=\"rect2\"></div><div class=\"rect3\"></div><div class=\"rect4\"></div><div class=\"rect5\"></div></div>");
$templateCache.put("app/moods/_moods-tpl.html","<div><h3>Moods</h3><p>Data: {{ctrl.mo.data | json}}</p></div>");
$templateCache.put("app/moves/_move-tpl.html","<p>date : {{ctrl.mo.date | jbDate}} title : {{ctrl.mo.title}}</p>");
$templateCache.put("app/moves/_moves-tpl.html","<div><h3>Moves</h3><div ng-repeat=\"elem in ctrl.mo.elements\"><move obj=\"elem\"></move></div></div>");
$templateCache.put("app/notes-viewer/_notes-element-tpl.html","<div class=\"notes-element-style\" ng-class=\"{\'active\' : ctrl.obj.element.api.selected, \'deleteMode\' : ctrl.obj.element.api.deleteMode }\" ng-click=\"ctrl.obj.element.api.clickedView()\"><span>{{ctrl.obj.element.creationDate | date}}</span> <span>{{ctrl.obj.element.owner.profile.first}} {{ctrl.obj.element.owner.profile.last}}</span><div style=\"clear: both;\"></div><span><minifier text=\"ctrl.obj.element.text\" limit=\"60\"></minifier></span><div ng-show=\"ctrl.obj.element.api.deleteMode\" class=\"delete-widget pulser-anim\"><p><span class=\"glyphicon glyphicon-remove faded-glyph\"></span></p></div><div ng-show=\"ctrl.obj.element.api.confirmDeleteMode\" class=\"notes-delete-confirm-widget slider-anim\" visible-click-elsewhere=\"ctrl.obj.element.api.cancel($event)\"><span class=\"btn btn-default\" ng-click=\"ctrl.obj.element.api.delete($event)\">confirm</span> <span class=\"btn btn-default\" ng-click=\"ctrl.obj.element.api.cancel($event)\">cancel</span></div></div>");
$templateCache.put("app/notes-viewer/_notes-header-tpl.html","<div class=\"jbv-new-note-hdr\"><div class=\"jbv-new-note-area\" ng-if=\"ctrl.obj.listobj.createMode()\"><textarea class=\"notes-textarea\" ng-model=\"ctrl.obj.listobj.tempnote.text\" name=\"textarea\" rows=\"5\" placeholder=\"create note...\">\r\n		</textarea><div style=\"float: right; margin-right: 14px; padding: 3px;\"><div class=\"btn-group\"><div class=\"btn btn-default\" ng-click=\"ctrl.obj.listobj.cancelNote()\" ng-disabled=\"!ctrl.obj.listobj.tempnote.text\">clear</div><div class=\"btn btn-default\" ng-disabled=\"true\">&nbsp;</div><div class=\"btn btn-default\" ng-click=\"ctrl.obj.listobj.createNote()\" ng-disabled=\"!ctrl.obj.listobj.tempnote.text\">save</div></div></div><div style=\"clear: both;\"></div></div><div class=\"jbv-new-note-area\" ng-if=\"ctrl.obj.listobj.editMode()\"><textarea class=\"notes-textarea\" ng-model=\"ctrl.obj.listobj.tempnote.text\" name=\"textarea\" rows=\"5\" placeholder=\"update note...\">\r\n		</textarea><div style=\"float: right; margin-right: 14px; padding: 3px;\"><div class=\"btn-group\"><div class=\"btn btn-default\" ng-click=\"ctrl.obj.listobj.baseFtns.deselectAll()\">cancel</div><div class=\"btn btn-default\" ng-disabled=\"true\">&nbsp;</div><div class=\"btn btn-default\" ng-click=\"ctrl.obj.listobj.updateNote()\" ng-disabled=\"!ctrl.obj.listobj.tempnote.text\">update</div></div></div><div style=\"clear: both;\"></div></div><hr><div style=\"padding: 3px; border-top: 1px solid #ddd;\"><div class=\"btn-group\" style=\"float: right;\"><div class=\"btn btn-default\" ng-click=\"ctrl.obj.listobj.headerFtns.deleteNotes()\"><span class=\"glyphicon glyphicon-remove faded-glyph\"></span> remove notes</div></div><div style=\"clear: both;\"></div></div></div>");
$templateCache.put("app/notes-viewer/_notes-viewer-tpl.html","<listviewer obj=\"ctrl.o.notes\"></listviewer>");
$templateCache.put("app/patient/_group-member-element-tpl.html","<div class=\"user-list-element\" ng-class=\"{\'active\' : ctrl.obj.element.api.selected, \'deleteMode\' : ctrl.obj.element.api.deleteMode }\" ng-click=\"ctrl.obj.element.api.clickedView()\"><img ng-src=\"assets/users.png\" height=\"100px\" width=\"100px\"><div class=\"user-details\"><div class=\"name\">{{ctrl.obj.element.user.first}} {{ctrl.obj.element.user.last}}</div><div class=\"features\"><p>Weight: {{ctrl.obj.element.user.weight | number: 2}}</p><p>Gender: {{ctrl.obj.element.user.gender}}</p><p>Height: {{ctrl.obj.element.user.height}}</p><p>Join date: {{ctrl.obj.element.joinDate | date}}</p></div></div><div ng-show=\"ctrl.obj.element.api.deleteMode\" class=\"delete-widget pulser-anim\"><p><span class=\"glyphicon glyphicon-remove faded-glyph\"></span></p></div><div ng-show=\"ctrl.obj.element.api.confirmDeleteMode\" class=\"delete-confirm-widget slider-anim\" visible-click-elsewhere=\"ctrl.obj.element.api.cancel($event)\"><span class=\"btn btn-default\" ng-click=\"ctrl.obj.element.api.delete($event)\">confirm</span> <span class=\"btn btn-default\" ng-click=\"ctrl.obj.element.api.cancel($event)\">cancel</span></div></div>");
$templateCache.put("app/patient/_patient-download-to-csv-tpl.html","<file-downloader obj=\"\"></file-downloader>");
$templateCache.put("app/patient/_patient-element-tpl.html","<div class=\"user-list-element\" ng-class=\"{\'active\' : ctrl.obj.element.api.selected, \'deleteMode\' : ctrl.obj.element.api.deleteMode }\" ng-click=\"ctrl.obj.element.api.clickedView()\"><img ng-src=\"assets/users.png\" height=\"100px\" width=\"100px\"><div class=\"user-details\"><div class=\"name\">{{ctrl.obj.element.first}} {{ctrl.obj.element.last}}</div><div class=\"features\"><p>Weight: {{ctrl.obj.element.weight | number: 2}}</p><p>Gender: {{ctrl.obj.element.gender}}</p><p>Height: {{ctrl.obj.element.height}}</p></div></div><div ng-show=\"ctrl.obj.element.api.deleteMode\" class=\"delete-widget pulser-anim\"><p><span class=\"glyphicon glyphicon-remove faded-glyph\"></span></p></div><div ng-show=\"ctrl.obj.element.api.confirmDeleteMode\" class=\"delete-confirm-widget slider-anim\" visible-click-elsewhere=\"ctrl.obj.element.api.cancel($event)\"><span class=\"btn btn-default\" ng-click=\"ctrl.obj.element.api.delete($event)\">confirm</span> <span class=\"btn btn-default\" ng-click=\"ctrl.obj.element.api.cancel($event)\">cancel</span></div></div>");
$templateCache.put("app/patient/_patient-mgr-tpl.html","<div class=\"patient-area\" ng-if=\'ctrl.obj.mode === \"view\"\'><listviewer obj=\"ctrl.obj.patientViewer\"></listviewer></div><div class=\"patient-area\" ng-if=\'ctrl.obj.mode === \"edit\"\'><patient-summary obj=\"ctrl.obj.patientSummary\"></patient-summary><div ng-if=\"ctrl.obj.showWindow === true\"><h3>show this</h3></div><chart obj=\"ctrl.obj.sleepsChart\"></chart><listviewer obj=\"ctrl.obj.sleepsViewer\"></listviewer><notes-viewer obj=\"\" <=\"\" notes-viewer=\"\"></notes-viewer></div>");
$templateCache.put("app/patient/_patient-notes-viewer-tpl.html","<notes-viewer obj=\"\"></notes-viewer>");
$templateCache.put("app/patient/_patient-summary-action-bar-tpl.html","<div class=\"btn btn-default\" ng-click=\"ctrl.pso.parent.switchView()\" style=\"float : left;\"><span class=\"glyphicon glyphicon-th-list faded-glyph\"></span> back to patients view</div><div class=\"btn-group\" style=\"float: right;\"><div class=\"btn btn-default\" ng-click=\"ctrl.pso.parent.showPatientNotes()\"><span class=\"glyphicon glyphicon-list-alt faded-glyph\"></span> show patient notes</div><div class=\"btn btn-default\" ng-click=\"ctrl.pso.parent.downloadToCSV()\"><span class=\"glyphicon glyphicon-stats faded-glyph\"></span> download to csv file</div></div><div style=\"clear: both;\"></div>");
$templateCache.put("app/patient/_patient-summary-tpl.html","<div class=\"patient-header\"><div class=\"patient-info\"><img ng-src=\"{{ctrl.pso.user.profile.image | defaultPatient }}\" height=\"100px\" width=\"100px\"><div class=\"user-details\"><div class=\"name\">{{ctrl.pso.user.profile.first}} {{ctrl.pso.user.profile.last}}</div><div class=\"features\"><p>Weight: {{ctrl.pso.user.profile.weight | number: 2}}</p><p>Gender: {{ctrl.pso.user.profile.gender}}</p><p>Height: {{ctrl.pso.user.profile.height}}</p></div></div></div><hr><div style=\"clear: both;\"></div><div ng-include=\"ctrl.pso.actionBar\"></div></div>");
$templateCache.put("app/profile/_sleeps-element-tpl.html","<div class=\"trends-element-style\">date : {{ctrl.obj.date | jbDate}} title : {{ctrl.obj.title}} sounds : {{ctrl.obj.sounds}} awakenings : {{ctrl.obj.awakenings}} light : {{ctrl.obj.light}}</div>");
$templateCache.put("app/profile/_user-modal-tpl.html","<h3>choose a user</h3><user-viewer-v3 iface=\"ctrl.resolveArg.iface\"></user-viewer-v3>ctrler: {{ctrl.resolveArg | json}}");
$templateCache.put("app/profile/friends.html","friends");
$templateCache.put("app/profile/moves.html","");
$templateCache.put("app/profile/profile-main.html","<div class=\"profile-side-bar\"><user obj=\"profile.userprofile\"></user></div><div class=\"profile-main-panel slide-eff\" ui-view=\"\"></div>");
$templateCache.put("app/profile/sleeps.html","<chart-v3 iface=\"profile.sleepsChartIface\"></chart-v3><list-viewer-v3 iface=\"profile.sleepsListIface\"></list-viewer-v3>");
$templateCache.put("app/profile/trends.html","<chart obj=\"profile.trendschart\"></chart><listviewer obj=\"profile.trends\"></listviewer>");
$templateCache.put("app/profile/user.html","");
$templateCache.put("app/recent-users/_recent-users-tpl.html","");
$templateCache.put("app/side-menu/_side-menu-tpl.html","side menu tempate");
$templateCache.put("app/sleeps/_sleeps-chart-download-tpl.html","<h3>Sleeps Data as CSV</h3><file-downloader obj=\"ctrl.resolveArg.downloader\"></file-downloader>");
$templateCache.put("app/sleeps/_sleeps-element-tpl.html","<div class=\"trends-element-style\" ng-class=\"{\'active\' : ctrl.obj.element.api.selected }\" ng-click=\"ctrl.obj.element.api.clickedView()\"><span>{{ctrl.obj.element.date | jbDate}}</span> <span>{{ctrl.obj.element.title | minutesConverter:\'hrs-mins\'}}</span> <span>{{ctrl.obj.element.sounds}}</span> <span>{{ctrl.obj.element.awakenings}}</span> <span>{{ctrl.obj.element.light}}</span></div>");
$templateCache.put("app/sleeps/_sleeps-header-tpl.html","<div class=\"trends-header-bar\"><span>date</span> <span>duration</span> <span>sounds</span> <span>awakenings</span> <span>light</span></div>");
$templateCache.put("app/superuser/groups.html","<group-manager-v3 obj=\"profile.groupMgrIface\"></group-manager-v3>");
$templateCache.put("app/superuser/patients.html","<patient-mgr obj=\"profile.patients\"></patient-mgr>");
$templateCache.put("app/superuser/profile-main.html","<div class=\"profile-side-bar\"><user obj=\"profile.userprofile\"></user><listviewer obj=\"profile.recentUsers\"></listviewer></div><div class=\"profile-main-panel slide-eff\" ui-view=\"\"></div>");
$templateCache.put("app/trends/_trends-element-tpl.html","<div class=\"trends-element-style\" ng-class=\"{\'active\' : ctrl.obj.element.selected }\"><span>{{ctrl.obj.element.date | jbDate}}</span> <span>{{ctrl.obj.element.weight | number: 2}}</span> <span>{{ctrl.obj.element.height | number: 2}}</span> <span>{{ctrl.obj.element.bmr | number: 2}}</span> <span>{{ctrl.obj.element.totalCalories | number: 2}}</span> <span>{{ctrl.obj.element.age | number: 0}}</span></div>");
$templateCache.put("app/trends/_trends-header.html","<div class=\"trends-header-bar\"><span>date</span> <span>weight</span> <span>height</span> <span>bmr</span> <span>total calories</span> <span>age</span></div>");
$templateCache.put("app/user/_default-confirm-modal-tpl.html","confirm modal");
$templateCache.put("app/user/_default-modal-tpl.html","default modal template");
$templateCache.put("app/user/_default-user-detail-tpl.html","<h5>Weight {{ctrl.uo.profile.weight}}</h5><h5>Gender {{ctrl.uo.profile.gender}}</h5><h5>Height {{ctrl.uo.profile.height}}</h5>");
$templateCache.put("app/user/_user-element-tpl.html","<div class=\"user-list-element\" ng-class=\"{\'active\' : ctrl.obj.element.selected }\"><img ng-src=\"{{ctrl.uo.profile.image}}\" height=\"100px\" width=\"100px\"><div class=\"user-details\"><div class=\"name\">{{ctrl.obj.element.first}} {{ctrl.obj.element.last}}</div><div class=\"features\"><p>Weight: {{ctrl.obj.element.weight | number: 2}}</p><p>Gender: {{ctrl.obj.element.gender}}</p><p>Height: {{ctrl.obj.element.height}}</p></div></div></div>");
$templateCache.put("app/user/_user-select-modal-tpl.html","<listviewer obj=\"ctrl.resolveArg.userlist\"></listviewer>");
$templateCache.put("app/user/_user-tpl.html","<div class=\"user-outer-box\"><div class=\"img-container\" ng-click=\"ctrl.uo.onClick()\"><img ng-src=\"{{ctrl.uo.profile.image | defaultPatient }}\" alt=\"image\" width=\"200px\" height=\"200px\"><p>{{ctrl.uo.profile.first}} {{ctrl.uo.profile.last}}</p></div><div ng-include=\"\'app/user/_default-user-detail-tpl.html\'\"></div></div>");
$templateCache.put("app/admins/admin-manager-v3/_admin-manager-tpl.html","<div class=\"patient-area\" ng-if=\'ctrl.obj.api.getMode() === \"view\"\'><list-viewer-v3 iface=\"ctrl.obj.adminsListInterface\"></list-viewer-v3></div><div class=\"patient-area\" ng-if=\'ctrl.obj.api.getMode() === \"edit\"\'><h3>the admin summary</h3></div>");
$templateCache.put("app/groups/admins/_admin-action-bar-tpl.html","<div style=\"padding: 3px; border-top: 1px solid #ddd;\"><div class=\"btn-group\" style=\"float: right;\"><div class=\"btn btn-default\" ng-click=\"ctrl.iface.header.headerObj.createAdmin()\"><span class=\"glyphicon glyphicon-user faded-glyph\"></span> add admin</div><div class=\"btn btn-default\" ng-click=\"ctrl.iface.header.headerObj.deleteAdmins()\"><span class=\"glyphicon glyphicon-remove faded-glyph\"></span> remove admins</div></div><div style=\"clear: both;\"></div></div>");
$templateCache.put("app/groups/admins/_admin-mgr-tpl.html","<listviewer-v2 iface=\"ctrl.obj.listIface\"></listviewer-v2>");
$templateCache.put("app/groups/group-creator/_group-creator-tpl.html","<div ng-include=\"ctrl.obj.api.getGroupDetails()\"></div><div class=\"btn btn-default\">save</div><div class=\"btn btn-default\">cancel</div>");
$templateCache.put("app/groups/group-creator/_group-details-form-tpl.html","<div class=\"patient-header\"><div class=\"patient-info\"><img ng-src=\"{{ctrl.pso.user.profile.image | defaultGroup }}\" ng-click=\"ctrl.obj.api.editImage()\" height=\"100px\" width=\"100px\"><div class=\"user-details\"><div class=\"name\"><input type=\"text\" class=\"form-control\" id=\"name\" placeholder=\"enter group name\"></div><div class=\"features\"><textarea class=\"form-control notes-textarea\" rows=\"4\" id=\"comment\" placeholder=\"enter group description\"></textarea></div></div></div><hr><div style=\"clear: both;\"></div><div ng-include=\"ctrl.pso.actionBar\"></div></div><p>obj {{ctrl.obj | json}}</p>");
$templateCache.put("app/groups/group-creator/_group-image-editor-tpl.html","<img-uploader obj=\"\"></img-uploader>");
$templateCache.put("app/groups/group-manager-v3/_group-element-tpl.html","<div class=\"user-list-element\" ng-class=\"{\'active\' : ctrl.obj.api.getAPI().selected, \'deleteMode\' : ctrl.obj.api.getAPI().deleteMode }\" ng-click=\"ctrl.obj.api.getAPI().onClick()\"><img ng-src=\"assets/group.png\" height=\"100px\" width=\"100px\"><div class=\"user-details\"><div class=\"name\">{{ctrl.obj.api.getData().name}} <span class=\"glyphicon glyphicon-lock faded-glyph\" ng-show=\"ctrl.obj.api.getData().permissions.canEdit === false\"></span></div><div class=\"features\"><p>{{ctrl.obj.api.getData().description}}</p><p>{{ctrl.obj.api.getData().size}} members</p></div></div><div ng-show=\"ctrl.obj.api.getAPI().deleteMode\" class=\"delete-widget pulser-anim\"><p><span class=\"glyphicon glyphicon-remove faded-glyph\" ng-show=\"ctrl.obj.api.getData().permissions.canDelete\"></span></p><p><span class=\"glyphicon glyphicon-lock faded-glyph\" ng-show=\"ctrl.obj.api.getData().permissions.canDelete === false\"></span></p></div><div ng-show=\"ctrl.obj.api.getData().permissions.canDelete\"><div ng-show=\"ctrl.obj.api.getAPI().confirmDeleteMode\" class=\"delete-confirm-widget slider-anim\" visible-click-elsewhere=\"ctrl.obj.element.api.cancel($event)\"><span class=\"btn btn-default\" ng-click=\"ctrl.obj.api.getAPI().delete($event)\">confirm</span> <span class=\"btn btn-default\" ng-click=\"ctrl.obj.api.getAPI().cancel($event)\">cancel</span></div></div></div>");
$templateCache.put("app/groups/group-manager-v3/_group-list-action-bar-tpl.html","<div style=\"padding: 3px; border-top: 1px solid #ddd;\"><div class=\"btn-group\" style=\"float: right;\"><div class=\"btn btn-default\" ng-click=\'ctrl.obj.api.getListAPI().notify(\"deleteMode\")\'><span class=\"glyphicon glyphicon-remove faded-glyph\"></span> remove groups</div></div><div style=\"clear: both;\"></div></div>");
$templateCache.put("app/groups/group-manager-v3/_group-manager-v3-tpl.html","<div class=\"panel-area\" ng-if=\'ctrl.obj.api.getMode() === \"view\"\'><list-viewer-v3 iface=\"ctrl.obj.groupList\"></list-viewer-v3></div><div class=\"panel-area\" ng-if=\'ctrl.obj.api.getMode() === \"create\"\'><div class=\"btn btn-default\" ng-click=\'ctrl.obj.mode = \"view\"\'>back</div><group-creator iface=\"ctrl.obj.groupCreatorInterface\"></group-creator></div><div class=\"panel-area\" ng-if=\'ctrl.obj.api.getMode() === \"edit\"\'><div class=\"panel-header\"><div class=\"patient-info\"><img ng-src=\"{{ctrl.obj.selectedGroup.image | defaultGroup }}\" height=\"100px\" width=\"100px\"><div class=\"user-details\"><div class=\"name\">{{ctrl.obj.selectedGroup.name}} <span class=\"glyphicon glyphicon-lock faded-glyph\" ng-show=\"ctrl.obj.selectedGroup.permissions.canEdit === false\"></span></div><div class=\"features\"><p>{{ctrl.obj.selectedGroup.description}}</p><p>{{ctrl.obj.selectedGroup.members.length}} members</p></div></div></div></div><div class=\"panel-header\"><ul target=\"panel-buttons\"><li><div class=\"btn btn-default\" ng-click=\"ctrl.obj.api.setViewMode()\" style=\"float : left;\"><span class=\"glyphicon glyphicon-th-list faded-glyph\"></span> back to groups view</div></li><li><div class=\"btn-group\" style=\"float: right;\"><div class=\"btn btn-default\" ng-click=\"ctrl.obj.api.setViewMode()\" ng-disabled=\"ctrl.obj.selectedGroup.permissions.canEdit === false\"><span class=\"glyphicon glyphicon-pencil faded-glyph\"></span> edit group</div></div><div style=\"clear: both;\"></div></li></ul></div><div><ul class=\"header-titles\"><li ng-class=\"{\'selected\' : ctrl.obj.api.isPatientView()}\"><a ng-click=\"ctrl.obj.api.setPatientView()\">Patients</a></li><li ng-class=\"{\'selected\' : ctrl.obj.api.isAdminView()}\"><a ng-click=\"ctrl.obj.api.setAdminView()\">Admins</a></li></ul></div><patient-mgr-v3 ng-show=\"ctrl.obj.api.isPatientView()\" iface=\"ctrl.obj.patientMgrInterface\"></patient-mgr-v3><admin-mgr-v3 ng-show=\"ctrl.obj.api.isAdminView()\" iface=\"ctrl.obj.adminMgrInterface\"></admin-mgr-v3></div>");
$templateCache.put("app/groups/patients/_patient-action-bar-tpl.html","<div style=\"padding: 3px; border-top: 1px solid #ddd;\"><div class=\"btn-group\" style=\"float: right;\"><div class=\"btn btn-default\" ng-click=\"ctrl.iface.header.headerObj.addPatient()\"><span class=\"glyphicon glyphicon-user faded-glyph\"></span> add patient</div><div class=\"btn btn-default\" ng-click=\"ctrl.iface.header.headerObj.removePatients()\"><span class=\"glyphicon glyphicon-remove faded-glyph\"></span> remove patient</div></div><div style=\"clear: both;\"></div></div>");
$templateCache.put("app/groups/patients/_patient-mgr-tpl.html","<div class=\"patient-area\" ng-if=\'ctrl.obj.mode === \"view\"\'><listviewer-v2 iface=\"ctrl.obj.listIface\"></listviewer-v2></div><div class=\"patient-area\" ng-if=\'ctrl.obj.mode === \"edit\"\'><patient-summary iface=\"ctrl.obj.patientSummaryInterface\"></patient-summary><chart-v2 iface=\"ctrl.obj.sleepChartInterface\"></chart-v2><listviewer-v2 iface=\"ctrl.obj.sleepsListIface\"></listviewer-v2></div>");
$templateCache.put("app/list-viewer/list-viewer-v2/_listviewer-tpl.html","<loader obj=\"ctrl.obj.loaderMessage\" ng-show=\"ctrl.state === \'loading\'\"></loader><div class=\"list-view-box animated\" ng-show=\"ctrl.state === \'ready\'\"><div class=\"heading\">{{ctrl.obj.header.heading}}</div><div class=\"filter-container\" ng-show=\"ctrl.hasFilter\"><input type=\"text\" class=\"form-control\" placeholder=\"search for...\" ng-model=\"searchtext\"></div><p></p><header-bar-v2 iface=\"ctrl.obj\"></header-bar-v2><div id=\"listviewerbox\" class=\"list-viewer-elements\" mouse-wheel-up=\"ctrl.didMouseWheelUp()\" mouse-wheel-down=\"ctrl.didMouseWheelDown()\"><ul><li ng-repeat=\"elem in ctrl.obj.elements track by $index\"><lvelem tpl=\"ctrl.obj.elementTemplate\" obj=\"elem\" i=\"{{$index}}\"></lvelem></li></ul></div><div class=\"scroll-control\" ng-show=\"ctrl.hasScrollers\"><span class=\"btn btn-default scroll-button\" ng-click=\"ctrl.back()\" ng-disabled=\"ctrl.atStart()\"><span class=\"glyphicon glyphicon-chevron-up\"></span></span> <span class=\"btn btn-default scroll-button\" ng-click=\"ctrl.forward()\" ng-disabled=\"ctrl.atEnd()\"><span class=\"glyphicon glyphicon-chevron-down\"></span></span></div></div>");
$templateCache.put("app/list-viewer/list-viewer-v3/_list-viewer-tpl.html","<loader obj=\"ctrl.obj.loaderMessage\" ng-show=\"ctrl.obj.api.getState() === \'loading\'\"></loader><div class=\"list-view-box animated\" ng-show=\"ctrl.obj.api.getState() === \'done\'\"><div class=\"heading\">{{ctrl.obj.header.heading}}</div><div class=\"filter-container\" ng-show=\"ctrl.hasFilter\"><input type=\"text\" class=\"form-control\" placeholder=\"search for...\" ng-model=\"searchtext\"></div><p></p><header-bar-v3 iface=\"ctrl.obj.header\"></header-bar-v3><div id=\"listviewerbox\" class=\"list-viewer-elements\" mouse-wheel-up=\"ctrl.didMouseWheelUp()\" mouse-wheel-down=\"ctrl.didMouseWheelDown()\"><ul><li ng-repeat=\"elem in ctrl.obj.elements\"><list-viewer-elem iface=\"elem\"></list-viewer-elem></li></ul></div><div class=\"scroll-control\" ng-show=\"ctrl.hasScrollers\"><span class=\"btn btn-default scroll-button\" ng-click=\"ctrl.back()\" ng-disabled=\"ctrl.atStart()\"><span class=\"glyphicon glyphicon-chevron-up\"></span></span> <span class=\"btn btn-default scroll-button\" ng-click=\"ctrl.forward()\" ng-disabled=\"ctrl.atEnd()\"><span class=\"glyphicon glyphicon-chevron-down\"></span></span></div></div>");
$templateCache.put("app/notes-viewer/notes-viewer-v3/_note-elem-tpl.html","<div class=\"notes-element-style\" ng-class=\"{\'active\' : ctrl.obj.api.getAPI().selected, \'deleteMode\' : ctrl.obj.api.getAPI().deleteMode }\" ng-click=\"ctrl.obj.api.getAPI().onClick()\"><span>{{ctrl.obj.api.getData().creationDate | date}}</span> <span>{{ctrl.obj.api.getData().owner.profile.first}} {{ctrl.obj.api.getData().owner.profile.last}}</span><div style=\"clear: both;\"></div><span><minifier text=\"ctrl.obj.api.getData().text\" limit=\"60\"></minifier></span><div ng-show=\"ctrl.obj.api.getAPI().deleteMode\" class=\"notes-delete-widget pulser-anim\"><p><span class=\"glyphicon glyphicon-remove faded-glyph\"></span></p></div><div ng-show=\"ctrl.obj.api.getAPI().confirmDeleteMode\" class=\"notes-delete-confirm-widget slider-anim\" visible-click-elsewhere=\"ctrl.obj.api.getAPI().cancel($event)\"><span class=\"btn btn-default\" ng-click=\"ctrl.obj.api.getAPI().delete($event)\">confirm</span> <span class=\"btn btn-default\" ng-click=\"ctrl.obj.api.getAPI().cancel($event)\">cancel</span></div></div>");
$templateCache.put("app/notes-viewer/notes-viewer-v3/_notes-header-tpl.html","<div class=\"list-view-box animated\"><div class=\"jbv-new-note-hdr\"><div class=\"jbv-new-note-area\" ng-if=\"ctrl.obj.api.inCreateMode()\"><textarea class=\"notes-textarea\" ng-focus=\"ctrl.obj.api.prepareNewNote()\" ng-model=\"ctrl.obj.api.getTempNote().text\" name=\"textarea\" rows=\"5\" placeholder=\"create note...\">\r\n			</textarea><div style=\"float: right; margin-right: 14px; padding: 3px;\"><div class=\"btn-group\"><div class=\"btn btn-default\" ng-click=\"ctrl.obj.api.cancelNote()\" ng-disabled=\"!ctrl.obj.api.getTempNote().text\">clear</div><div class=\"btn btn-default\" ng-disabled=\"true\">&nbsp;</div><div class=\"btn btn-default\" ng-click=\"ctrl.obj.api.createNote()\" ng-disabled=\"!ctrl.obj.api.getTempNote().text\">save</div></div></div><div style=\"clear: both;\"></div></div><div class=\"jbv-new-note-area\" ng-if=\"ctrl.obj.api.inEditMode()\"><textarea class=\"notes-textarea\" ng-model=\"ctrl.obj.api.getTempNote().text\" name=\"textarea\" rows=\"5\" placeholder=\"update note...\">\r\n			</textarea><div style=\"float: right; margin-right: 14px; padding: 3px;\"><div class=\"btn-group\"><div class=\"btn btn-default\" ng-click=\"ctrl.obj.api.getList().api.deselectAll()\">cancel</div><div class=\"btn btn-default\" ng-disabled=\"true\">&nbsp;</div><div class=\"btn btn-default\" ng-click=\"ctrl.obj.api.editNote()\" ng-disabled=\"!ctrl.obj.api.getTempNote().text\">update</div></div></div><div style=\"clear: both;\"></div></div></div></div>");
$templateCache.put("app/notes-viewer/notes-viewer-v3/_notes-list-action-bar-tpl.html","<div style=\"padding: 3px; border-top: 1px solid #ddd;\"><div class=\"btn-group\" style=\"float: right;\"><div class=\"btn btn-default\" ng-click=\'ctrl.obj.api.getListAPI().notify(\"deleteMode\")\'><span class=\"glyphicon glyphicon-remove faded-glyph\"></span> remove notes</div></div><div style=\"clear: both;\"></div></div>");
$templateCache.put("app/notes-viewer/notes-viewer-v3/_notes-viewer-tpl.html","<notes-header-v3 iface=\"ctrl.obj.notesHeader\"></notes-header-v3><list-viewer-v3 iface=\"ctrl.obj.notesList\"></list-viewer-v3>");
$templateCache.put("app/patient/patient-manager-v3/_patient-list-action-bar-tpl.html","<div style=\"padding: 3px; border-top: 1px solid #ddd;\"><div class=\"btn-group\" style=\"float: right;\"><div class=\"btn btn-default\" ng-click=\'ctrl.obj.api.getListAPI().notify(\"deleteMode\")\' ng-disabled=\"ctrl.obj.api.getListAPI().canEdit() === false\"><span class=\"glyphicon glyphicon-remove faded-glyph\"></span> remove patient</div></div><div style=\"clear: both;\"></div></div>");
$templateCache.put("app/patient/patient-manager-v3/_patient-mgr-v3-tpl.html","<div class=\"patient-area\" ng-if=\'ctrl.obj.api.getMode() === \"view\"\'><list-viewer-v3 iface=\"ctrl.obj.patientsListInterface\"></list-viewer-v3></div><div class=\"patient-area\" ng-if=\'ctrl.obj.api.getMode() === \"edit\"\'><div class=\"patient-header\"><div class=\"patient-info\"><img ng-src=\"{{ctrl.obj.selectedPatient.image | defaultPatient }}\" height=\"100px\" width=\"100px\"><div class=\"user-details\"><div class=\"name\">{{ctrl.obj.selectedPatient.first}} {{ctrl.obj.selectedPatient.last}}</div><div class=\"features\"><p>Weight: {{ctrl.obj.selectedPatient.weight | number: 2}}</p><p>Gender: {{ctrl.obj.selectedPatient.gender}}</p><p>Height: {{ctrl.obj.selectedPatient.height}}</p></div></div></div></div><div class=\"panel-header\"><ul target=\"panel-buttons\"><li><div class=\"btn btn-default\" ng-click=\"ctrl.obj.api.setViewMode()\" style=\"float : left;\"><span class=\"glyphicon glyphicon-th-list faded-glyph\"></span> back to patients view</div></li><li><div class=\"btn-group\" style=\"float: right;\"><div class=\"btn btn-default\" ng-click=\"ctrl.obj.api.setViewMode()\"><span class=\"glyphicon glyphicon-pencil faded-glyph\"></span> edit group</div></div><div style=\"clear: both;\"></div></li></ul></div><chart-v3 iface=\"ctrl.obj.sleepsChartInterface\"></chart-v3><list-viewer-v3 iface=\"ctrl.obj.sleepsListInterface\"></list-viewer-v3></div>");
$templateCache.put("app/patient/patient-manager-v3/_patient-tpl.html","<div class=\"user-list-element\" ng-class=\"{\'active\' : ctrl.obj.api.getAPI().selected, \'deleteMode\' : ctrl.obj.api.getAPI().deleteMode }\" ng-click=\"ctrl.obj.api.getAPI().onClick()\"><img ng-src=\"assets/users.png\" height=\"100px\" width=\"100px\"><div class=\"user-details\"><div class=\"name\">{{ctrl.obj.api.getData().first}} {{ctrl.obj.api.getData().last}}</div><div class=\"features\"><p>Weight: {{ctrl.obj.api.getData().weight | number: 2}}</p><p>Gender: {{ctrl.obj.api.getData().gender}}</p><p>Height: {{ctrl.obj.api.getData().height}}</p><p>Join date: {{ctrl.obj.api.getData().joinDate | date}}</p></div></div><div ng-show=\"ctrl.obj.api.getAPI().deleteMode\" class=\"delete-widget pulser-anim\"><p><span class=\"glyphicon glyphicon-remove faded-glyph\"></span></p></div><div ng-show=\"ctrl.obj.api.getAPI().confirmDeleteMode\" class=\"delete-confirm-widget slider-anim\" visible-click-elsewhere=\"ctrl.obj.api.getAPI().cancel($event)\"><span class=\"btn btn-default\" ng-click=\"ctrl.obj.api.getAPI().delete($event)\">confirm</span> <span class=\"btn btn-default\" ng-click=\"ctrl.obj.api.getAPI().cancel($event)\">cancel</span></div></div>");
$templateCache.put("app/sleeps/sleeps-v3/_sleeps-header-tpl.html","<div class=\"trends-header-bar\"><span>date</span> <span>time to sleep</span> <span>total sleep</span> <span>awake time</span> <span>efficiency</span> <span>rem</span> <span>light</span> <span>deep</span></div>");
$templateCache.put("app/sleeps/sleeps-v3/_sleeps-list-elem-tpl.html","<div class=\"trends-element-style\" ng-class=\"{\'active\' : ctrl.obj.api.getAPI().selected }\" ng-click=\"ctrl.obj.api.getAPI().onClick()\"><span>{{ctrl.obj.api.getData().date | jbDate}}</span> <span>{{ctrl.obj.api.getData().timeToSleep | secondsToHrsMins}}</span> <span>{{ctrl.obj.api.getData().totalSleepTime | secondsToHrsMins}}</span> <span>{{ctrl.obj.api.getData().wakeAfterSleep | secondsToHrsMins}}</span> <span>{{ctrl.obj.api.getData().sleepEfficiency | number:1}}</span> <span>{{ctrl.obj.api.getData().remSleep | secondsToHrsMins}}</span> <span>{{ctrl.obj.api.getData().lightSleep | secondsToHrsMins}}</span> <span>{{ctrl.obj.api.getData().deepSleep | secondsToHrsMins}}</span></div>");
$templateCache.put("app/user/user-v3/_user-list-elem-tpl.html","<div class=\"user-list-element\" ng-class=\"{\'active\' : ctrl.obj.api.getAPI().selected }\" ng-click=\"ctrl.obj.api.getAPI().onClick()\"><img ng-src=\"{{ctrl.obj.api.getData().profile.image}}\" height=\"100px\" width=\"100px\"><div class=\"user-details\"><div class=\"name\">{{ctrl.obj.api.getData().first}} {{ctrl.obj.api.getData().last}}</div><div class=\"features\"><p>Weight: {{ctrl.obj.api.getData().weight | number: 2}}</p><p>Gender: {{ctrl.obj.api.getData().gender}}</p><p>Height: {{ctrl.obj.api.getData().height}}</p></div></div></div>");
$templateCache.put("app/user/user-viewer/_user-viewer-tpl.html","<list-viewer-v3 iface=\"ctrl.obj.listIface\"></list-viewer-v3>user viewer: {{ctrl.obj | json}}");
$templateCache.put("app/groups/patients/patient-summary/_patient-summary-action-bar-tpl.html","<div class=\"btn btn-default\" ng-click=\"ctrl.obj.actionBarObj.actions.backToPatients()\" style=\"float : left;\"><span class=\"glyphicon glyphicon-th-list faded-glyph\"></span> back to patients view</div><div class=\"btn-group\" style=\"float: right;\"><div class=\"btn btn-default\" ng-click=\"ctrl.obj.actionBarObj.actions.showPatientNotes()\"><span class=\"glyphicon glyphicon-list-alt faded-glyph\"></span> show patient notes</div><div class=\"btn btn-default\" ng-click=\"ctrl.obj.actionBarObj.actions.downloadToCSV()\"><span class=\"glyphicon glyphicon-stats faded-glyph\"></span> download to csv file</div></div><div style=\"clear: both;\"></div>");
$templateCache.put("app/groups/patients/patient-summary/_patient-summary-tpl.html","<div class=\"patient-header\"><div class=\"patient-info\"><img ng-src=\"{{ctrl.obj.patient.user.profile.image | defaultPatient }}\" height=\"100px\" width=\"100px\"><div class=\"user-details\"><div class=\"name\">{{ctrl.obj.patient.user.profile.first}} {{ctrl.obj.patient.user.profile.last}}</div><div class=\"features\"><p>Weight: {{ctrl.obj.patient.user.profile.weight | number: 2}}</p><p>Gender: {{ctrl.obj.patient.user.profile.gender}}</p><p>Height: {{ctrl.obj.patient.user.profile.height}}</p></div></div></div><hr><div style=\"clear: both;\"></div><div ng-include=\"ctrl.obj.actionBarObj.template\"></div></div>");}]);