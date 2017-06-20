
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('UserViewerV3Adaptor', AdaptorFtn)
    .factory('SleepsChartInterface', InterfaceFtn);

  //----------------------------------------------------
  //  ADAPTOR FUNCTION
  //----------------------------------------------------  
    function AdaptorFtn($log, UserViewerV3Interface) {
      var adaptor = function(config) {
        var adaptorInst = new UserViewerV3Interface();
        config = config || {};

        adaptorInst.config.onConfirm = config.onConfirm || function(element) {
          $log.info('supply an onConfirm function to UserViewerV3Adaptor');
        };  
        adaptorInst.config.canAddPlots = config.canAddPlots || false;      

        return adaptorInst;
      };
      return adaptor;
    }

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function InterfaceFtn($log, ChartV3Interface, JawboneService, SleepsV3Obj, CommonModals, BaseSelector, UserViewerV3Adaptor) {
    var iface = function(config) {

      var makePlotParams = makePlotParamsFtn;
      var extractFieldValue = extractFieldValueFtn;

      var ifaceInst = new ChartV3Interface();
      var config = config || {};

      ifaceInst.config = {      
        patient : config.patient || null,
        plots: [ 'time to sleep', 'total sleep', 'awake time', 'efficiency', 'rem', 'light', 'deep' ],
        extractFieldValue : function(obj, index) {
          return extractFieldValue(obj, index);
        },
        yAxisLabels: [ 'minutes', 'minutes', 'minutes', '%', 'minutes', 'minutes', 'minutes' ],
        plotParams: makePlotParams(config.patient),
        getElementsObj: JawboneService.makeBatch(JawboneService.makeEndpoint('sleeps', config.patient.jawboneId), { max: 1000 }),
        makeElement : function(element) {
          return new SleepsV3Obj(element);
        },
        preprocessElements: function(arr) {
          return arr.reverse();
        },
        getAdditionalPlotData: function(cb) {
          // we will eventually pass this function in from the parent iface
          //$log.info('get additional plot data in SleepChartV3 Interface');
          CommonModals.selector(new BaseSelector({
            tpl : 'app/profile/_user-modal-tpl.html',
            iface : new UserViewerV3Adaptor({
              onConfirm : function(patient) {
                //$log.info('patient confirmed: ' + JSON.stringify(patient.config.selected));
                var patientId = patient.config.selected._id;
                var getElements = JawboneService.makeBatch(JawboneService.makeEndpoint('sleeps', patientId));
                cb(getElements);
              }
            })
          }));
        },
        canAddPlots : config.canAddPlots || false    
      };

      //------------------------------------
      // make plot params function
      //------------------------------------
      function makePlotParamsFtn(patient) {
        //$log.info('make plot params: ' + JSON.stringify(patient));
        //var profile = patient.profile || {};
        return {
          range : [new Date(2016, 11, 1), new Date(2017, 6, 30)],        
          plotName : patient.first || null
        }       
      }

      //------------------------------------
      // extract field value function
      //------------------------------------
      function extractFieldValueFtn(obj, field) {
        $log.info('from object : ' + JSON.stringify(obj));
        if(typeof obj.getField === "function") {
          return obj.getField(field);          
        } else {
          return 0;
        }
      }

      return ifaceInst;
    };

    return iface;
  }
})();
	