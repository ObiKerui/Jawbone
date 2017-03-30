(function() {
  'use strict';

  angular
    .module('jawboneGatewayApp')
    .controller('GatewayCtrl', GatewayCtrl);

  /** @ngInject */
  function GatewayCtrl($log, $scope) {

    var vm = this;
    vm.mode = 'patient';
    vm.loginUser = '/login/user';
    vm.loginSuperUser = '/login/superuser';
    vm.loginUserMsg = 'login to view Jawbone data';
    vm.loginSuperUserMsg = 'login to manage patients';

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