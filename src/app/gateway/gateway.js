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