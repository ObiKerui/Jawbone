(function() {
	 'use strict';

  angular
    .module('jawboneApp')
    .factory('JawboneChartUtils', JawboneChartUtilsFtn)
    .factory('PlotGenerator', PlotGeneratorFtn);

	Date.prototype.addDays = function(days) {
		var dat = new Date(this.valueOf())
		dat.setDate(dat.getDate() + days);
		return dat;
	}

    function findIndexOf(arr, cond, startIdx) {
        startIdx = startIdx || 0;
        var i, x;
        for (var i = startIdx; i < arr.length; i++) {
            x = arr[i];
            // console.log('startIdx is : ' + startIdx);
            // console.log('i is : ' + i);
            // console.log('x is : ' + arr[i]);            
            if (cond(x)) return parseInt(i);
        }
        return (-1);
    }

    function createDateRange(startDate, endDate, addFn, interval) {

        addFn = addFn || Date.prototype.addDays;
        interval = interval || 1;

        var retVal = [];
        var current = new Date(startDate);

        while (current <= endDate) {
          retVal.push(new Date(current));
          current = addFn.call(current, interval);
        }
        return retVal;
    }

    function JawboneChartUtilsFtn($log) {
        var JawboneChartUtils = function() {
        };
      
        JawboneChartUtils.jawboneToJSDate = function(jbDateNbr) {
            var nbStr = jbDateNbr.toString();
            var year = nbStr.slice(0,4);
            var month = parseInt(nbStr.slice(4,6)) - 1; // javascript dates start from 0
            var day = nbStr.slice(6,8);
            return new Date(year, month, day);
        };        
        return JawboneChartUtils;
    }

    //--------------------------------------------------
    //
    //--------------------------------------------------
    function PlotGeneratorFtn($log, JawboneChartUtils) {
    	var PlotGenerator = function() {
    	};

    	PlotGenerator.createDateRange = createDateRange;

    	function createYAxisPlot(xVal, yAxis) {
    		var result = [];
    		angular.forEach(yAxis, function(value) {
    			//$log.info('xAxis: ' + JSON.stringify(xVal) + ' value: ' + JSON.stringify(value));
    		}, result);
    	}

    	PlotGenerator.createPlot = function(xVals, yAxis) {
    		var result = [];
    		angular.forEach(xVals, function(value) {
    			createYAxisPlot(value, yAxis);
    		}, result);

    		return [];
    	};

        PlotGenerator.createEmpty = function(date, makeFtn) {
            var ftn = makeFtn || function() {
                return 0;
            };

            return { x : date, y : [ftn() || 0 ] };
        }

        PlotGenerator.addToArray = function(arr, index, level, element) {
            var yPlotArr = arr[index].y;
            yPlotArr[level] = element;
        }

        PlotGenerator.printit = function(result) {
            angular.forEach(result, function(elem) {
                //$log.info('date: ' + elem.x.toDateString() + " val: " + elem.y);
            }, result);
        };

        //PlotGenerator.preparePlot = function(start, end, data, plotnames) {                    
        PlotGenerator.preparePlot = function(data, plotParams) {    
            //$log.info('plot names: ' + JSON.stringify(plotParams));       
            var pname = plotParams.plotName || [ 'blank' ];
            pname = (Array.isArray(pname) ? pname : [pname]);
            var plotnames = pname;
            plotnames.unshift('date');

            var arr = [];
            //var dateArr = createDateRange(start, end); 
            var start = plotParams.range[0];
            var end = plotParams.range[1];
            var dateArr = createDateRange(start, end); 
            var idx = 0;

            // create an empty array between ranges
            angular.forEach(dateArr, function(value) {
                this.push(PlotGenerator.createEmpty(value));
            }, arr); 

            for(var i = 0; i < data.length; i++) {
                //find the index into the date array to add this 'value'
                idx = findIndexOf(dateArr, function(elem) {
                    var jsdate = JawboneChartUtils.jawboneToJSDate(data[i].date);
                    //$log.info('elem: ' + elem);
                    //$log.info('date is ' + elem.toDateString() + ' jsdate: ' + jsdate.toDateString());
                    // if(elem.toDateString() === jsdate.toDateString()) {
                    //     $log.info('have a matching date: ' + JSON.stringify(data[i]));
                    // }
                    return (elem.toDateString() === jsdate.toDateString());  
                }, idx);     

                // $log.info('value: ' + JSON.stringify(value));

                if(idx === -1) {
                    break;
                } else {
                    //$log.info('value to add is : ' + JSON.stringify(value));
                    PlotGenerator.addToArray(arr, idx, 0, data[i]);
                }
            }

            //$log.info('data arry: ' + JSON.stringify(arr));

            return { names: plotnames, data: arr };
        };        

        PlotGenerator.appendPlot = function(original, dataToAppend, plotParams) {

            var arrData = original.data;
            // var start = arrData[0].x;
            // var end = arrData[arrData.length - 1].x;
            var append = PlotGenerator.preparePlot(dataToAppend, plotParams);
            var appArray = append.data;

            for(var i = 0; i < arrData.length; i++) {
                arrData[i].y.push(appArray[i].y[0]);
            }

            // add the labels
            append.names.shift();
            original.names = original.names.concat(append.names);                
            return original;
        };

    	return PlotGenerator;
    }
})();