(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('SleepsChartDownloaderBuilder', SleepsChartDownloaderBuilderFtn)
    .factory('SleepsChartDownloaderObj', SleepsChartDownloaderObjFtn);

  function SleepsChartDownloaderBuilderFtn($log) {
  	var SleepsChartDownloaderBuilder = function(getSleepData) {
  		//$log.info('ran sleeps chart downloader with arg: ' + JSON.stringify(arg));
      var obj = this;
      obj.tpl = 'app/sleeps/_sleeps-chart-download-tpl.html';
      obj.downloader = {};
      obj.downloader.getData = getSleepData || function() {
        $log.info('implement a getSleepData ftn in SleepsChartDownloaderBuilder');
        return [];
      };
      obj.downloader.content = obj.downloader.getData();
  	};
  	return SleepsChartDownloaderBuilder;
  }

  function SleepsChartDownloaderObjFtn($log) {
  	var SleepsChartDownloaderObj = function(obj) {
		$log.info('ran sleeps chart downloader obj with obj: ' + JSON.stringify(obj));
  	};
  	return SleepsChartDownloaderObj;
  }

})();

