
(function(cutils) {
  'use strict';

  angular
    .module('jawboneApp')
    .filter('chartV3filter', FilterFtn)    
    .factory('ChartV3Interface', InterfaceFtn)  
    .factory('ChartV3Obj', ObjectFtn)
    .controller('ChartV3Ctrl', CtrlFtn)
    .directive('chartV3', DirFtn);

    var id = 'chart-v3/chart-comp: ';

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
      var ifaceInst = new BaseInterface();
      var config = config || {};

  		ifaceInst.config = {  
        plots : config.plots || [],
        extractFieldValue : config.extractFieldValue || function(obj, field) {
          $log.info('supply an extract field value function');
          return 0;
        },
        yAxisLabels : config.yAxisLabels || [],
  			loaderMessage: config.loaderMessage || null,          
  			getElementsObj : config.getElementsObj || null,
  			makeElement : config.makeElement || null,
  			preprocessElements : config.preprocessElements || null,
  			plotParams : config.plotParams || null,
        getAdditionalPlotData : config.getAdditionalPlotData || function(cb) {
          $log.info('supply a getAdditionalPlotData ftn');
          cb(null);
        },
        canAddPlots: config.canAddPlots || false
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
  function ObjectFtn($log, BaseComp, ChartV3Interface, PlotGenerator) {
    var object = function(iface) {

      //var initialise = initialiseFtn;
    	var processElements = processElementsFtn;
      var appendElements = appendElementsFtn;
    	var selectPlot = selectPlotFtn;
    	var removeNullPoints = removeNullPointsFtn;
    	var convertToArr = convertToArrFtn;
    	var extract = extractFtn;
      var setYAxisTitle = setYAxisTitleFtn;
    	var obj = new BaseComp();
      obj.graphData = [];
      obj.plots = iface.config.plots || [];
      obj.selected = 0;
      obj.state = 'loading';

      obj.api = {
        render: function(cb) {
          $log.info('called render function of chartv3obj with supplied iface: ' + JSON.stringify(iface));
          obj.chart = cutils.createJawboneChartLayout();
          iface.config.getElementsObj.get()
          .then(function(result) {
            processElements(iface, result.data, iface.config.plotParams);
            setYAxisTitleFtn(obj.chart, 0, iface.config.yAxisLabels);
            cb('done');
            obj.state = 'complete';
          });
        },
        getState: function() {
          return obj.state;
        },
        switchToPlot: function(index) {
          $log.info('selected: ' + index);
          setYAxisTitleFtn(obj.chart, index, iface.config.yAxisLabels);
          selectPlot(iface, index, obj.graphData);
        },
        getGraphData: function() {
          $log.info('called get graph data');
          return obj.chart.data;
        },
        canAddPlots: function() {
          return iface.config.canAddPlots;
        },
        appendPlot: function() {
          $log.info('request to append plot');
          iface.config.getAdditionalPlotData(function(getAdditionalPlotsObj, plotParams) {
            $log.info('got the additional plot data...' + JSON.stringify(getAdditionalPlotsObj));
            getAdditionalPlotsObj.get()
            .then(function(result) {
              //appendElements(iface, result.data, iface.config.plotParams);
              appendElements(iface, result.data, plotParams);
            });
          });
        },
        resetPlots: function() {
          obj.state = 'loading';
          this.render(function(arg) {

          });
        }
      };

      //----------------------------------------------
      // append elements ftn 
      //----------------------------------------------        
      function appendElementsFtn(iface, elems, plotParams) {
        var newElements = [];

        angular.forEach(elems, function(value) {
          this.push(iface.config.makeElement(value));
        }, newElements);

        iface.config.preprocessElements(newElements);
        obj.graphData = PlotGenerator.appendPlot(obj.graphData, newElements, plotParams);   

        selectPlot(iface, 0, obj.graphData);
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
        obj.selected = iface.config.plots[index];
        var chartdata = convertToArr(iface, gdata, index);

        removeNullPoints(chartdata);

        //obj.chart.options.title = obj.selected;
        //$log.info('chart data: ' + JSON.stringify(chartdata, true, 3));
        obj.chart.data = google.visualization.arrayToDataTable(chartdata);
        //$log.info('chart data: ' + JSON.stringify(obj.chart.data, true, 3));
        //onStateChange('ready');
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
            //$log.info('y value to push : ' + JSON.stringify(yplot));
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
        //$log.info('call to extract the field value with obj: ' + JSON.stringify(yplot));
        var fieldValue = iface.config.extractFieldValue(yplot, fieldIdx);
        return fieldValue;
        //var pnames = iface.config.plots;
        //var fieldToGet = pnames[fieldIdx];
        // $log.info('field idx: ' + fieldIdx);
        // $log.info('pnames: ' + JSON.stringify(pnames));
        // $log.info('obj is : ' + JSON.stringify(yplot));
        // $log.info('get the field: ' + fieldToGet + ' result: ' + JSON.stringify(yplot[pnames[fieldIdx]]));  
        //return yplot[pnames[fieldIdx]];
      }

      //----------------------------------------------
      // set the y axis title of the chart 
      //----------------------------------------------        
      function setYAxisTitleFtn(chart, index, labels) {
        $log.info('setting the Y Axis title: ' + labels[index]);
        chart.options.vAxis.title = labels[index];
      }      

      return obj;
    };
    return object;
  }

  //----------------------------------------------------
  //  CTRL FUNCTION
  //----------------------------------------------------  
  // function CtrlFtn($scope, $log, ChartV3Obj, googleChartApiPromise, BaseCtrl) {
  //   var vm = this;  
  //   vm.obj = null;

  //   googleChartApiPromise.then(function() {
  //     new BaseCtrl(vm.iface, function(createdIface) {
  //       return new ChartV3Obj(createdIface);
  //     }, function(obj) {
  //       vm.obj = obj;
  //     });
  //   });
  // }

  function CtrlFtn($scope, $log, ChartV3Obj, googleChartApiPromise) {
    var vm = this;  
    vm.obj = null;

    $scope.$watch(function(scope) {
      return (vm.iface);
    }, function(iface, oldval) {
      if(iface) {
        googleChartApiPromise.then(function() {
        	$log.info(id + ' loaded google chart api');
      		vm.obj = new ChartV3Obj(iface);
          iface.setAPI(vm.obj.getAPI);
          vm.obj.api.render(function() {
            $log.info('render the chart obj');
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
      controller: 'ChartV3Ctrl',
      controllerAs: 'ctrl',
      bindToController: {
        iface : '='
      },
      templateUrl: 'app/chart-v3/_chart-tpl.html'
    };
    return directive;   
  }
})(jbChartUtils);
