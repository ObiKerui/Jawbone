
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
