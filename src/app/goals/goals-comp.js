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