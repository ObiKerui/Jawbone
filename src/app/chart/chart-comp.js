(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('ChartManager', ChartManagerFtn)
    .factory('ChartObj', ChartObjFtn)
    .controller('ChartCtrl', ChartCtrl)
    .directive('chart', chartFtn);

  function ChartManagerFtn($log, ModalService, UserSelectorObj, ChartObj, JawboneService) {
    var ChartManager = function(chartdata, onStateChange) {
      var obj = this;
      obj.chart = new ChartObj(chartdata, onStateChange);

      obj.clickFtn = chartdata.clickFtn || function() {        
        // create modal
        ModalService.onClick(new UserSelectorObj(function(userChoice) {
          JawboneService.getUser(userChoice.data._id)
          .then(function(response) {
            return chartdata.extractFromUser(response)
          })
          .then(function(data) {
            //$log.info('got data: ' + JSON.stringify(data));
            $log.info('user name: ' + JSON.stringify(userChoice.data.profile.first));
            obj.chart.addCompareData(data.data, userChoice.data.profile);
            JawboneService.setUser(userChoice);            
          });
        }))
        .then(function(result) {
        });
      };

      obj.onClick = function() {
        obj.clickFtn();
      };

    };
    return ChartManager;
  }

  function ChartObjFtn($log, PlotGenerator) {
    var ChartObj = function(data, onStateChange) {
      var obj = this;
      obj.data = data || {};
      obj.onStateChange = onStateChange || function(newState) {
        $log.info('supply a state change function to ChartObj');
      };

      obj.chart = {};
      obj.chart.type = "LineChart";
      obj.chartdata = [];
      obj.chart.options = {
        // 'title': 'blank',
        'chartArea': { 'left':'40','top':'40','width':'60%','height':'75%'},
        'backgroundColor.fill': '#00ffff',
        'explorer': { 
          'actions': ['dragToZoom', 'rightClickToReset'],
          'keepInBounds': true
        },
        'hAxis' : {
          'title': 'date'
        },
        'vAxis' : {
          'title' : 'minutes',
          'count' : 60
        }
      };

      // get the plot names
      obj.plots = data.getPlotNames();
      obj.graphData = [];

      // set the callback to access the graph data
      data.getGraphDataCB = function() {
          return obj.chartdata;
      };

      var extractFtn = data.extract || function(obj, field) {        
        return 0;
      };

      obj.onStateChange('loading');
      data.getElementsObj.get()
      .then(function(result) {
        processElements(result.data, data.makePlotParams());
      });

      function convertToArr(graphData, yValueField) {
        var arrData = [];
        arrData.push(graphData.names); // add the header
        angular.forEach(graphData.data, function(val) {
          var elem = [];
          elem.push(val.x); // push the date 
          
          angular.forEach(val.y, function(yplot) {
            elem.push(extractFtn(yplot, yValueField));
          },val.y);

          //elem.push(extracFtn(val.y[0], yValueField)); // push the y axis value
          this.push(elem);
        }, arrData);
        return arrData;
      }

      function removeNullPoints(arr) {
        for(var i = 1; i < arr.length; i++) {
          var elem = arr[i];
          if(!elem[1]) elem[1] = 0;
        }        
      }

      function processElements(elems, plotParams) {

        //$log.info('elements: ' + JSON.stringify(elems));

        obj.elements = [];
        angular.forEach(elems, function(value) {
          this.push(data.makeElement(value));
        }, obj.elements);

        data.preprocessElements(obj.elements);

        // preapare plot data
        //$log.info('plot params: ' + JSON.stringify(plotParams));
        obj.graphData = PlotGenerator.preparePlot(obj.elements, plotParams);  
        
        //$log.info('prepared plot: ' + JSON.stringify(obj.graphData, true, 1));
        obj.selectPlot(0, obj.graphData);
      }

      obj.selectPlot = function(index, gdata) {
        gdata = gdata || obj.graphData;
        obj.selected = obj.plots[index];
        obj.chartdata = convertToArr(obj.graphData, index);

        removeNullPoints(obj.chartdata);

        //obj.chart.options.title = obj.selected;
        //$log.info('chart data: ' + JSON.stringify(obj.chartdata, true, 3));
        obj.chart.data = google.visualization.arrayToDataTable(obj.chartdata);
        //$log.info('chart data: ' + JSON.stringify(obj.chart.data, true, 3));
        obj.onStateChange('ready');
      };

      obj.addCompareData = function(dataToAdd, userProfile) {
          var result = [];
          angular.forEach(dataToAdd, function(val) {
            this.push(data.makeElement(val));
          }, result);      
          var plotParams = data.makePlotParams(userProfile);
          obj.graphData = PlotGenerator.appendPlot(obj.graphData, result, plotParams);   
          obj.selectPlot(0, obj.graphData); 
      };

    };
    return ChartObj;
  }

  /** @ngInject */
  function ChartCtrl($log, $scope, ChartManager, googleChartApiPromise) {
    var vm = this;
    vm.state = 'loading';

    function onLoadedFtn() {
      $log.info('google chart loaded now');
      vm.co = new ChartManager(vm.obj, function(newState) {
        vm.state = newState;
      });
    };

    $scope.$watch(function(scope) {
      return (vm.obj);
    }, function(newval, oldval) {
      if(newval) {
        googleChartApiPromise.then(onLoadedFtn);
      }
    }); 

  }	

  function chartFtn($log) {
    var directive = {
      restrict: 'E',
        scope: {},
        controller: 'ChartCtrl',
        controllerAs: 'ctrl',
      bindToController: {
        obj : '='
      },
      templateUrl: 'app/chart/_chart-tpl.html'
    };
    return directive;   
  }
})();