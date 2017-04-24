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