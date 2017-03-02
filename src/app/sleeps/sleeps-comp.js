(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('SleepsComponentBuilder', SleepsComponentBuilderFtn)
    //.factory('SleepsObj', SleepsObjFtn)
    .factory('SleepObj', SleepObjFtn);

  function buildCallbacks($log, obj, sleepsdata) {
    obj.selectedSleep = null
    obj.onSelect = function(ss) {
      obj.selectedSleep = ss;
    };

    obj.onConfirm = function() {
      $log.info('sleep: yah confirm it');
    };

  }

  function buildListViewer($q, $log, obj, sleepsdata, SleepObj) {
    $log.info('sleeps data: ' + JSON.stringify(sleepsdata));
    obj.listobj = {};
    obj.listobj.template = 'app/sleeps/_sleeps-element-tpl.html';
    obj.listobj.headerbar = 'app/sleeps/_sleeps-header-tpl.html';
    obj.listobj.heading = 'Sleeps';

    obj.listobj.getElements = function() {
      var deferred = $q.defer();
      deferred.resolve(sleepsdata || []);
      return deferred.promise;
    }

    obj.listobj.makeElement = function(objElement) {
      return new SleepObj(objElement)
    };    

  }

  function SleepsComponentBuilderFtn($q, $log, SleepObj) {
    var SleepsComponentBuilder = function(sleepsdata) {
      var obj = this;

      buildCallbacks($log, obj, sleepsdata);
      buildListViewer($q, $log, obj, sleepsdata, SleepObj);

    };
    return SleepsComponentBuilder;
  }

  // function SleepsObjFtn($log, SleepObj) {
  //   var SleepsObj = function(data) {
  //     var o = this;
  //     o.data = data || {};
      
  //     //$log.info('sleeps data: ' + JSON.stringify(o.data));
      
  //     o.elems = o.data.items || [];
  //     o.template = 'app/sleeps/_sleeps-element-tpl.html',
  //     o.heading = 'Sleeps',
  //     o.headerbar = 'app/sleeps/_sleeps-header-tpl.html'
  //     //o.image = 'https://jawbone.com' + o.elems[0].snapshot_image;

  //     this.getElements = function() {
  //       //$log.info('return elems: ' + JSON.stringify(o.elems));
  //       return o.elems;
  //     }

  //     this.makeElement = function(elemData) {
  //       return new SleepObj(elemData)
  //     };
      
  //     // this.sleepgraph = 'https://jawbone.com/nudge/api/v.1.1/sleeps/' + this.elements[0].xid + '/image';
  //     // $log.info('sleep graph: ' + this.sleepgraph);
  //   };
  //   return SleepsObj;
  // }

  function convertToMinutes(str, $log) {
    str = str.toString();
    var arr = str.match(/\d+/g);
    if(arr.length === 2) {
      return (parseInt(arr[0]) * 60) + (parseInt(arr[1]));
    } else {
      return str;
    }
  }

  function SleepObjFtn($log) {
    var SleepObj = function(data) {
      this.data = data || {};
      $log.info('sleep data: ' + JSON.stringify(data));
      this.date = data.date || new Date();
      this.title = convertToMinutes(data.title, $log);
      this.details = data.details || {};
      this.sounds = this.details.sound || 'blank';
      this.awakenings = this.details.awakenings || 0;
      this.light = this.details.light || 0;
      this.sleep_time = this.details.sleep_time || 0;
      this.awake_time = this.details.awake_time || 0;
      this.awake = this.details.awake || 0;
      this.rem = this.details.rem || 0;
      this.duration = this.details.duration || 0;
      this.image = 'https://jawbone.com' + this.data.snapshot_image;

      var o = this;
      o.selected = false;

      o.activated = function() {
        o.selected = true;
      };

      o.deactivated = function() {
        o.selected = false;
      }

    };
    return SleepObj;
  }

})();