
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('ChartDownloaderV3', ChartDownloaderV3Ftn)

	function ChartDownloaderV3Ftn($log, CommonModals, BaseSelector, FileHandlerV3Interface) {
		var service = {
			csvDownloader: csvDownloader
		};
		return service;

		function csvDownloader(CSVData, fileName) {

			function getCVSData() {
				return CSVData;
			} 

			function getFileName() {
				return fileName;
			}

			CommonModals.selector(new BaseSelector({
				tpl : 'app/chart-v3/_downloader-tpl.html',
				iface : new FileHandlerV3Interface({
		  			getContents: getCVSData,
		  			getFileName: getFileName
				})
			}));
		}
	}
})();
