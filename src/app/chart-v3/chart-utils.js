var jbChartUtils = (function(angular) {
	'use strict';

	var id = 'chart-v2/chart-utils ';

	return {
		createJawboneChartLayout : createJawboneChartFtn
	};

	function createJawboneChartFtn() {
		console.log(id + ' create jawbone chart function');
      	var chart = {};
      	chart.type = "LineChart";
      	chart.data = [];
      	chart.options = {
	        // 'title': 'blank',
	        //'chartArea': { 'left':'40','top':'40','width':'60%','height':'75%'},
	        'chartArea': { 'left':'80','top':'40','width':'70%','height':'75%'},
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
      	return chart;
	}

	function setChartYAxisTitle(chart, title) {
		var options = chart.options || {};
		var vAxis = options.vAxis || {};
		vAxis.title = title;
		console.log('did set the v axis title to : ' + title); 
	}

})(angular);