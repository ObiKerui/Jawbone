(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('SleepsChartV2DownloaderIface', InterfaceFtn);

  function InterfaceFtn($log, BaseInterface) {
  	var iface = function(chartV2Iface) {
      var ifaceInst = this;
      angular.merge(ifaceInst, ifaceInst, new BaseInterface());

      ifaceInst.config = {
        tpl : 'app/sleeps/_sleeps-chart-download-tpl.html',
        content : chartV2Iface.getAPI().getGraphData() || []
      };

      return ifaceInst;
  	};
  	return iface;
  }

})();

