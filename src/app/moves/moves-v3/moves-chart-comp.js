
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('MovesChartV3Interface', InterfaceFtn)  

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function InterfaceFtn($log, ChartV3Interface, JawboneService, MovesV3Obj, CommonModals, BaseSelector, UserViewerV3Adaptor) {
    var iface = function(config) {
      var makePlotParams = makePlotParamsFtn;
      var extractFieldValue = extractFieldValueFtn;

      var ifaceInst = new ChartV3Interface();
      var config = config || {};

      ifaceInst.config = {      
        patient : config.patient || null,
        plots: [ 'calories', 'bmr', 'distance', 'steps' ],
        extractFieldValue : function(obj, index) {
          return extractFieldValue(obj, index);
        },
        yAxisLabels: [ 'number', 'number', 'metres', 'number' ],
        plotParams: makePlotParams(config.patient),
        //getElementsObj: JawboneService.makeBatch(JawboneService.makeEndpoint('sleeps', config.patient.jawboneId), { max: 1000 }),
        makeGetElementsObj: function() {
          return JawboneService.makeBatch(JawboneService.makeEndpoint('moves', config.patient.jawboneId), { max: 1000 });
        },
        makeElement : function(element) {
          return new MovesV3Obj(element);
        },
        preprocessElements: function(arr) {
          return arr.reverse();
        },
        getAdditionalPlotData: function(cb) {
          CommonModals.selector(new BaseSelector({
            tpl : 'app/profile/_user-modal-tpl.html',
            iface : new UserViewerV3Adaptor({
              onConfirm : function(patient) {
                //$log.info('patient confirmed: ' + JSON.stringify(patient));
                //$log.info('jbid patient confirmed: ' + JSON.stringify(patient.config.selected.jawboneId)); 
                $log.info('>>> >>> first name: ' + JSON.stringify(patient.config.selected));       
                var id = patient.config.selected.jawboneId;

                //var patientId = patient.config.selected._id;
                var getElements = JawboneService.makeBatch(JawboneService.makeEndpoint('moves', id), { max: 1000 });
                cb(getElements, makePlotParamsFtn(patient.config.selected));
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
