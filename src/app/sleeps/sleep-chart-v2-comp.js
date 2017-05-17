
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('SleepChartV2Interface', InterfaceFtn);

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  //function InterfaceFtn($log, BaseInterface, JawboneService, SleepObj) {
  function InterfaceFtn($log, ChartV2Interface, JawboneService, SleepObj) {
    var iface = function(config) {
    	var makePlotParams = makePlotParamsFtn;
		var ifaceInst = this;
		//angular.merge(ifaceInst, ifaceInst, new BaseInterface());
		angular.merge(ifaceInst, ifaceInst, new ChartV2Interface(config));

		var plotParams = makePlotParams(config.patient);

		ifaceInst.config = {          
			patient : config.patient || null,
			plots: [ 'title', 'sounds', 'awakenings', 'light' ],
			plotParams: plotParams,
			getElementsObj: JawboneService.makeBatch(JawboneService.makeEndpoint('sleeps')),
			makeElement : function(element) {
				return new SleepObj(element);
			},
			preprocessElements: function(arr) {
				return arr.reverse();
			},
			getAdditionalPlotData: function(cb) {
				$log.info('get additional plot data in SleepChartV2 Interface');
			}			
		};

		ifaceInst.notify = function(eventName) {
			var api = ifaceInst.getObjectAPI();
			api.notify(eventName);
		};

		ifaceInst.getAPI = function() {
			return ifaceInst.getObjectAPI();
		};

		//------------------------------------
		// make plot params function
		//------------------------------------
		function makePlotParamsFtn(patient) {
			$log.info('make plot params: ' + JSON.stringify(patient));
			return {
			  range : [new Date(2016, 11, 1), new Date(2017, 2, 20)],
			  plotName : patient.user.profile.first          
			}      	
		}
    };
    return iface;
  }
})();
