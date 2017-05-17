
(function(cutils) {
  'use strict';

  angular
    .module('jawboneApp')
    .filter('chartV2filter', FilterFtn)    
    .factory('ChartV2Interface', InterfaceFtn)  
    .factory('ChartV2Obj', ObjectFtn)
    .controller('ChartV2Ctrl', CtrlFtn)
    .directive('chartV2', DirFtn);

    var id = 'chart-v2/chart-comp: ';

  //----------------------------------------------------
  //  FILTER FUNCTION
  //----------------------------------------------------  
  function FilterFtn() {
    return function(arg) {  
      if(arg) {
      	// do something with arg
        return arg;
      }
      return arg;
    }     
  }

  //----------------------------------------------------
  //  INTERFACE FUNCTION
  //----------------------------------------------------  
  function InterfaceFtn($log, BaseInterface) {
    var iface = function(config) {
  		var ifaceInst = this;        
      angular.merge(ifaceInst, ifaceInst, new BaseInterface());

  		ifaceInst.config = {  
        plots : config.plots || [],
  			loaderMessage: config.loaderMessage || null,          
  			getElementsObj : config.getElementsObj || null,
  			makeElement : config.makeElement || null,
  			preprocessElements : config.preprocessElements || null,
  			plotParams : config.plotParams || null,
        getAdditionalPlotData : config.getAdditionalPlotData || function(cb) {
          $log.info('supply a getAdditionalPlotData ftn');
          cb(null);
        }
  		};

      ifaceInst.notify = function(eventName) {
        var api = ifaceInst.getObjectAPI();
        api.notify(eventName);
      };

      return ifaceInst;
    };
    return iface;
  }

  //----------------------------------------------------
  //  OBJECT FUNCTION
  //----------------------------------------------------  
  function ObjectFtn($log, BaseComp, ChartV2Interface, PlotGenerator) {
    var object = function(iface, onStateChange) {

      var initialise = initialiseFtn;
    	var processElements = processElementsFtn;
    	var selectPlot = selectPlotFtn;
    	var removeNullPoints = removeNullPointsFtn;
    	var convertToArr = convertToArrFtn;
    	var extract = extractFtn;
    	var obj = this;

      // extend from BaseObject
      angular.merge(obj, obj, new BaseComp());

      obj.api = {
        switchToPlot: function(index) {
          selectPlot(index, obj.graphData);
        },
        getGraphData: function() {
          $log.info('called get graph data');
          return obj.chart.data;
        },
        appendPlot: function() {
          $log.info('request to append plot');
          iface.config.getAdditionalPlotData(function(result) {
            $log.info('got the additional plot data...' + result);
          });
        }
      };
      obj.graphData = [];

      obj.connect(iface, obj.api, initialise);

      //----------------------------------------------
      // initialise function 
      //----------------------------------------------        
      function initialiseFtn(iface) {
        obj.chart = cutils.createJawboneChartLayout();

        onStateChange('loading');
        iface.config.getElementsObj.get()
        .then(function(result) {
          //$log.info(id + ' plot params: ' + JSON.stringify(obj.plotParams));
          processElements(iface, result.data, iface.config.plotParams);
        });
      }

    	//----------------------------------------------
    	// process elements 
    	//----------------------------------------------      	
    	function processElementsFtn(iface, elems, plotParams) {

    		//$log.info('elems for graph: ' + JSON.stringify(elems, true, 1));

        var elements = [];
        angular.forEach(elems, function(value) {
          this.push(iface.config.makeElement(value));
        }, elements);

        iface.config.preprocessElements(elements);
        obj.graphData = PlotGenerator.preparePlot(elements, plotParams);  

        //$log.info('graph data after prepare: ' + JSON.stringify(obj.graphData, true, 1));

        selectPlot(iface, 0, obj.graphData);
    	}

    	//----------------------------------------------
    	// process elements 
    	//----------------------------------------------      	
    	function selectPlotFtn(iface, index, gdata) {
        //gdata = gdata || obj.graphData;
        var selected = iface.config.plots[index];
        var chartdata = convertToArr(iface, gdata, index);

        removeNullPoints(chartdata);

        //obj.chart.options.title = obj.selected;
        //$log.info('chart data: ' + JSON.stringify(chartdata, true, 3));
        obj.chart.data = google.visualization.arrayToDataTable(chartdata);
        //$log.info('chart data: ' + JSON.stringify(obj.chart.data, true, 3));
        onStateChange('ready');
    	}

    	//----------------------------------------------
    	// process elements 
    	//----------------------------------------------      	
    	function removeNullPointsFtn(arr) {
        for(var i = 1; i < arr.length; i++) {
          var elem = arr[i];
          if(!elem[1]) elem[1] = 0;
        }        
	    }

    	//----------------------------------------------
    	// process elements 
    	//----------------------------------------------      	
  		function convertToArrFtn(iface, graphData, yValueField) {
  			var arrData = [];
  			arrData.push(graphData.names); // add the header
  			angular.forEach(graphData.data, function(val) {
  			  var elem = [];
  			  elem.push(val.x); // push the date 
  			  
  			  angular.forEach(val.y, function(yplot) {
  			    elem.push(extract(iface, yplot, yValueField));
  			  },val.y);

  			  //elem.push(extracFtn(val.y[0], yValueField)); // push the y axis value
  			  this.push(elem);
  			}, arrData);
  			return arrData;
  		}

    	//----------------------------------------------
    	// extract function 
    	//----------------------------------------------      	
  		function extractFtn(iface, yplot, fieldIdx) {
        var pnames = iface.config.plots;
        var fieldToGet = pnames[fieldIdx];
        // $log.info('field idx: ' + fieldIdx);
        // $log.info('pnames: ' + JSON.stringify(pnames));
        // $log.info('obj is : ' + JSON.stringify(yplot));
        // $log.info('get the field: ' + fieldToGet + ' result: ' + JSON.stringify(yplot[pnames[fieldIdx]]));  
        return yplot[pnames[fieldIdx]];
      }

      return obj;
    };
    return object;
  }

  //----------------------------------------------------
  //  CTRL FUNCTION
  //----------------------------------------------------  
  function CtrlFtn($scope, $log, ChartV2Obj, googleChartApiPromise) {
    var vm = this;  
    vm.obj = null;

    $scope.$watch(function(scope) {
      return (vm.iface);
    }, function(newval, oldval) {
      if(newval) {
        googleChartApiPromise.then(function() {
        	$log.info(id + ' loaded google chart api');
      		vm.obj = new ChartV2Obj(newval, function(newState) {
        		vm.state = newState;
      		});
        });
      }
    }); 
  }

  //----------------------------------------------------
  //  DIRECTIVE
  //----------------------------------------------------  
  function DirFtn() {
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'ChartV2Ctrl',
      controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      templateUrl: 'app/chart-v2/_chart-tpl.html'
    };
    return directive;   
  }
})(jbChartUtils);
