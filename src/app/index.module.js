(function() {
  'use strict';

  angular.module('jbtemplates', [])
  angular.module('config', [])
  angular.module('constants', [])
  angular.module('mainRoute', [
  	'ui.router'
  ])
  angular.module('run', [])
  angular.module('jawboneApp', [
  	'config',
  	'constants',
  	'mainRoute',
  	'run',
    'ngAnimate',
  	'ngSanitize',
    'ngFileSaver',
    'ui.bootstrap',
    'ui.router',
    'googlechart',
    'jbtemplates',
    'ngFileUpload',
    'ngImgCrop'
  ])
  angular.module('jawboneGatewayApp', [
    'jawboneApp',
    'PreloadedData'
  ])
  angular.module('jawboneUApp', [
    'jawboneApp',
    'PreloadedData'
  ])
  angular.module('jawboneSUApp', [
    'jawboneApp',
    'PreloadedData'
  ]);

  // angular.module('jawboneSUApp', [
    
  // ]);

})();