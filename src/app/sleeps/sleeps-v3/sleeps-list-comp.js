
(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .filter('sleepsListfilter', FilterFtn)    
    .factory('SleepsListInterface', InterfaceFtn)
    .factory('SleepV3Service', ServiceFtn)
    .factory('SleepsV3Obj', ObjFtn);

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
  function InterfaceFtn($log, ListViewerV3Interface, JawboneService, ListViewerElemInterface, SleepsV3Obj, ListElemAPI) {
    var iface = function(config) {
      var ifaceInst = new ListViewerV3Interface();
      var config = config || {};

      var userId = config.userId || null;
      ifaceInst.config.getElementsObj = JawboneService.makeBatch(JawboneService.makeEndpoint('sleeps', userId));
      ifaceInst.config.makeListElementFtn = function(listData) {
        return new ListViewerElemInterface({
          api : new ListElemAPI(listData),
          data : new SleepsV3Obj(listData.element)
        });
      };
      ifaceInst.config.headerTpl = 'app/sleeps/sleeps-v3/_sleeps-header-tpl.html';

      return ifaceInst;
    };
    return iface;
  }

  function convertToMinutes(str, $log) {
    str = str.toString();

    var arr = str.match(/\d+/g);
    if(arr.length === 2) { // hours and minutes
      return (parseInt(arr[0]) * 60) + (parseInt(arr[1]));
    } else if(arr.length === 1 ) { // only minutes
      return (parseInt(arr[0]));
    } else { 
      return str;
    }
  }  

  function convertToSeconds(str, $log) {
    var totalMins = convertToMinutes(str, $log);
    return (totalMins * 60.0);
  }

  function convertToHoursMins(durationInSeconds, $log) {
    var sec_num = parseInt(durationInSeconds, 10);    
    var hours   = Math.floor(sec_num / 3600) % 24;
    var minutes = Math.floor(sec_num / 60) % 60;
    $log.info('hours: ' + hours + ' mins rem: ' + minutes);
  }

  function percentageOf(percent, total, $log) {
    //$log.info('find x as % of y: ' + percent + ' of ' + total);
    return (percent / total) * 100;
  }

  function ServiceFtn($log) {
    var service = {

    };
    return service;
  }

  function ObjFtn($log, JawboneService) {
    var obj = function(data) {
    	var objInst = this;

      //$log.info('sleep data: ' + JSON.stringify(data, true, 3));

      // retrieve specific sleep details
      var sleepService = JawboneService.sleepService();
      sleepService.getSleepTicks(data.xid)
      .then(function(ticksResponse) {
        sleepService.getSleepDetails(data.xid)
        .then(function(detailsResponse) {
          // $log.info('sleep ticks: ' + JSON.stringify(ticksResponse));
          // $log.info('sleep details: ' + JSON.stringify(detailsResponse));
        });

        // var size = response.data.data.size;
        // var timeToSleepOnset = (size > 0 ? response.data.data.items[0].time : 0);
        // var timeCreated = (size > 0 ? objInst.timeCreated : 0);
        // objInst.timeToSleep = (timeToSleepOnset - objInst.timeCreated);

        // $log.info('time of first tick: ' + JSON.stringify(timeToSleepOnset));
        // $log.info('time created: ' + JSON.stringify(timeCreated));
        // $log.info('time asleep : ' + JSON.stringify(objInst.asleepTime));
        // $log.info('time to sleep: ' + (objInst.asleepTime - timeCreated));
        // $log.info('time to sleep: ' + (objInst.timeToSleep));
      });

      // sleeps breakpoint
      var details = data.details || {};
      var rem_seconds = details.rem || 0;
      var light_seconds = details.light || 0;
      var deep_seconds = details.sound || 0;
      var asleepTime = details.asleep_time || 0;

      var awakeTime = details.awake_time || 0;      
      var timeCreated = data.time_created || 0;
      var timeCompleted = data.time_completed || 0;
      var totalTime = (timeCompleted - timeCreated);

      objInst.date = data.date || new Date();
      objInst.image = 'https://jawbone.com' + data.snapshot_image;
      objInst.template = 'app/sleeps/sleeps-v3/_sleeps-list-elem-tpl.html';

      // these are the metrics requested by Janet they are in seconds apart from efficiency
      objInst.timeToSleep = (asleepTime - timeCreated);
      objInst.totalSleepTime = (awakeTime - asleepTime);
      objInst.wakeAfterSleep = (timeCompleted - awakeTime);
      objInst.sleepEfficiency = percentageOf(objInst.totalSleepTime, totalTime, $log);
      objInst.remSleep = rem_seconds;
      objInst.lightSleep = light_seconds;
      objInst.deepSleep = deep_seconds;

      objInst.getField = function(index) {
        switch(index) {
          case 0:
            return objInst.timeToSleep / 60.0;
          case 1:
            return objInst.totalSleepTime / 60.0;
          case 2:
            return objInst.wakeAfterSleep / 60.0;
          case 3: 
            return objInst.sleepEfficiency;
          case 4:
            return objInst.remSleep / 60.0;
          case 5:
            return objInst.lightSleep / 60.0;
          case 6:
            return objInst.deepSleep / 60.0;
          default:          
            return 0;
        }
      };

      // might be wanted
      //objInst.awakenings = details.awakenings || 0;
      //objInst.duration = details.duration || 0; // this is the same as total time

      // what is this?
      //objInst.sleep_time = details.sleep_time || 0;
      // var awake_seconds = details.awake || 0;
      // objInst.awake = awake_seconds / 60.0;
      //objInst.title = convertToSeconds(data.title, $log);

      // $log.info('time created: ' + objInst.timeCreated);
      // $log.info('time completed: ' + objInst.timeCompleted);
      // $log.info('asleep time: ' + objInst.asleepTime);
      // $log.info('awake time: ' + objInst.awakeTime);
      // var totalTime = (objInst.timeCompleted - objInst.timeCreated);
      // var sleepTime = (objInst.awakeTime - objInst.asleepTime);
      // $log.info('total time: ' + totalTime);
      // $log.info('asleep time: ' + sleepTime);
      // $log.info('title ' + (data.title) + ' secs : ' + objInst.title * 60.0);
      // $log.info('duration scored as: ' + objInst.duration);
      // $log.info('diff: ' + (totalTime - sleepTime));

      return objInst;
    };
    return obj;
  }

})();
	