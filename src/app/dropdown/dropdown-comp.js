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