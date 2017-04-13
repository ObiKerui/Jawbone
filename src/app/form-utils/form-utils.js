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
    .directive('expander', expanderFtn);

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

})();