(function() {
  'use strict';

  angular
    .module('run')
    .run(runBlock);

  function runBlock($log, JawboneData, JawboneService) {
  	$log.info('we did execute the run block');
  	$log.info('pre loaded data: ' + JSON.stringify(JawboneData));
  	JawboneService.init(JawboneData);
  }
})();
