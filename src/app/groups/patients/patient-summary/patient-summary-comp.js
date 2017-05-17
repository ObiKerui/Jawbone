
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
