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