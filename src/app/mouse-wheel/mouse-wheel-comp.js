(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .directive('mouseWheelDown', mouseWheelDown)
    .directive('mouseWheelUp', mouseWheelUp);

  function mouseWheelDown($log) {
    var directive = {
      link : link
    };
    return directive;

    function link(scope, elem, attrs) {
      elem.bind("DOMMouseScroll mousewheel onmousewheel", function(event) {
        // cross-browser wheel delta
        var ev = window.event || event; // old IE support
        ev = ev.originalEvent || event.originalEvent;
        var delta = (ev.wheelDelta || -ev.detail);

        if(delta < 0) {          
          scope.$apply(function(){
              scope.$eval(attrs.mouseWheelDown);
          });
        
          // for IE
          event.returnValue = false;
          // for Chrome and Firefox
          if(event.preventDefault) {
            event.preventDefault();                        
          }
        }
      });
    }    
  }

  function mouseWheelUp($log) {
    var directive = {
      link : link
    };
    return directive;

    function link(scope, elem, attrs) {      
      elem.bind("DOMMouseScroll mousewheel onmousewheel", function(event) {
        // cross-browser wheel delta
        var ev = window.event || event; // old IE support
        ev = ev.originalEvent || event.originalEvent;
        //var delta = Math.max(-1, Math.min(1, (ev.wheelDelta || -ev.detail)));
        var delta = (ev.wheelDelta || -ev.detail);

        //$log.info('mouse wheel delta: ' + delta);

        if(delta > 0) {          
          scope.$apply(function(){
              scope.$eval(attrs.mouseWheelUp);
          });
        
          // for IE
          event.returnValue = false;
          // for Chrome and Firefox
          if(event.preventDefault) {
              event.preventDefault();                        
          }
        }
      });
    }
  }
})();
