
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
  function ObjectFtn($log, MovesChartV3Interface, MovesListV3Interface, SleepsDownloaderAdaptor, CommonModals, BaseSelector, PatientMgrV3Interface, BaseComp, ListViewerV3Interface, ListViewerElemInterface, ListElemAPI, SleepsListInterface, SleepsChartInterface, SleepsDownloaderInterface, PatientV3Obj, JawboneService) {
    var object = function(iface) {

    	var onRender = onRenderFtn;
    	var activateEditMode = activateEditModeFtn;

      var objInst = new BaseComp();
      objInst.mode = 'view';
      objInst.sleepStepsMode = 'sleeps';
      objInst.patientsListInterface = null;
      objInst.seletedPatient = null;
      objInst.sleepsChartInterface = null;
      objInst.sleepsListInterface = null;
      objInst.sleepsDownloaderInterface = null;
      objInst.movesListInterface = null;
      objInst.movesChartInterface = null;

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

        setSleepsMode: function() {
          activateSleepsMode(objInst.selectedPatient);
          objInst.sleepStepsMode = 'sleeps';
        },

        setStepsMode: function() {
          activateMovesMode(objInst.selectedPatient);
          objInst.sleepStepsMode = 'steps';
        },

        isSleepsMode: function() {
          return (objInst.sleepStepsMode === 'sleeps');
        },

        isStepsMode: function() {
          return (objInst.sleepStepsMode === 'steps');
        },

        downloadData: function() {

          CommonModals.selector(new BaseSelector({
            tpl : 'app/sleeps/sleeps-v3/_sleeps-downloader-modal-tpl.html',
            iface : new SleepsDownloaderAdaptor({
              getSleepData: objInst.sleepsChartInterface.getAPI().getGraphData,
              onConfirm : function(arg) {
                $log.info('sleeps downloader confirm download');
              }
            })
          }));
        },

        refresh : function() {
          objInst.patientsListInterface.getAPI().refresh();
        }
      };

      function onRenderFtn() {

      	objInst.patientsListInterface = new ListViewerV3Interface({
    			//getElementsObj : JawboneService.makeBatch(JawboneService.makeFieldGetter('groups', iface.config.groupId, 'members')),
          makeGetElementsObj : function() {
            return JawboneService.makeBatch(JawboneService.makeFieldGetter('groups', iface.config.groupId, 'members'));
          },
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

      function activateSleepsMode(selectedPatient) {
        objInst.sleepsChartInterface = new SleepsChartInterface({
          patient : selectedPatient,
          canAddPlots : true
        });

        objInst.sleepsListInterface = new SleepsListInterface({
          patient : selectedPatient
        });
      }

      function activateMovesMode(selectedPatient) {

        objInst.movesChartInterface = new MovesChartV3Interface({
          patient : selectedPatient,
          canAddPlots : true
        });

        objInst.movesListInterface = new MovesListV3Interface({
          patient : selectedPatient
        });        
      }

      function activateEditModeFtn(selectedPatient) {
        objInst.mode = 'edit';
        console.log('selected patient: ' + JSON.stringify(selectedPatient));
        objInst.selectedPatient = selectedPatient;
        
        if(objInst.api.isSleepsMode()) {
          activateSleepsMode(selectedPatient);
        } else {
          activateMovesMode(selectedPatient);
        }
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
