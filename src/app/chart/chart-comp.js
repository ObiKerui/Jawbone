(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('ChartManager', ChartManagerFtn)
    .factory('ChartObj', ChartObjFtn)
    .controller('ChartCtrl', ChartCtrl)
    .directive('chart', chartFtn);

  function ChartManagerFtn($log, ModalService, UserSelectorObj, ChartObj, JawboneService) {
    var ChartManager = function(chartdata, getUsers) {
      var obj = this;
      obj.chart = new ChartObj(chartdata);
      obj.getUsers = getUsers || function() {
        return JawboneService.getUsers();
      };

      obj.clickFtn = chartdata.clickFtn || function() {        
        // create modal
        ModalService.onClick(new UserSelectorObj(obj.getUsers, function(userChoice) {
          JawboneService.getUser(userChoice.jawboneId)
          .then(function(response) {
            obj.chart.addCompareData(chartdata.extractFromUser(response));
            JawboneService.setUser(userChoice);
          });
        }))
        .then(function(result) {
          //$log.info('result of modal: ' + JSON.stringify(result)); 
        });
      };

      obj.onClick = function() {
        obj.clickFtn();
      };

    };
    return ChartManager;
  }

  function ChartObjFtn($log, PlotGenerator) {
    var ChartObj = function(data) {
      var obj = this;
      obj.data = data || {};

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
        }
      };

      // get the plot names
      obj.plots = data.getPlotNames();
      obj.graphData = [];

      var extractFtn = data.extract || function(obj, field) {        
        return 0;
      };

      // get the elements
      data.getElements()
      .then(function(result) {
        processElements(result);
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

      function processElements(elems) {

        obj.elements = [];
        angular.forEach(elems, function(value) {
          this.push(data.makeElement(value));
        }, obj.elements);

        //var startDate = new Date(2017, 1, 10);
        var startDate = new Date(2016, 11, 1);
        var endDate = new Date(2017, 2, 10);

        // preapare plot data
        obj.graphData = PlotGenerator.preparePlot(startDate, endDate, obj.elements, ['craig']);  
        obj.selectPlot(0, obj.graphData);
      }

      obj.selectPlot = function(index, gdata) {
        gdata = gdata || obj.graphData;
        obj.selected = obj.plots[index];
        obj.chartdata = convertToArr(obj.graphData, index);

        removeNullPoints(obj.chartdata);

        //obj.chart.options.title = obj.selected;
        obj.chart.data = google.visualization.arrayToDataTable(obj.chartdata);
      };

      obj.addCompareData = function(dataToAdd) {
        data.getElements(dataToAdd)
        .then(function(response) {
          //$log.info('add compare data: ' + JSON.stringify(dataToAdd));
          var result = [];
          angular.forEach(response, function(val) {
            this.push(data.makeElement(val));
          }, result);      
          obj.graphData = PlotGenerator.appendPlot(obj.graphData, result, ['name']);   
          obj.selectPlot(0, obj.graphData); 
        });        
      };

    };
    return ChartObj;
  }

  /** @ngInject */
  function ChartCtrl($log, $scope, ChartManager, googleChartApiPromise) {
    var vm = this;

    function onLoadedFtn() {
      $log.info('google chart loaded now');
      vm.co = new ChartManager(vm.obj);
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