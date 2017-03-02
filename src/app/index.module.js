(function() {
  'use strict';

  angular.module('config', [])
  angular.module('constants', [])
  angular.module('mainRoute', [
  	'ui.router'
  ])
  angular.module('run', [])
  angular.module('jawboneApp', [
    'PreloadedData',
  	'config',
  	'constants',
  	'mainRoute',
  	'run',
    'ngAnimate',
  	'ngSanitize',
    'ui.bootstrap',
    'googlechart'
  ]);

})();