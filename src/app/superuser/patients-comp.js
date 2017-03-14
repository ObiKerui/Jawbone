// (function() {
//   'use strict';

//   angular
//     .module('jawboneApp')
//     .factory('PatientsComponentBuilder', PatientsComponentBuilderFtn)
//     .factory('PatientObj', PatientObjFtn);

//   function buildCallbacks($log, obj, groupsdata) {

//     obj.onSelect = function(ss) {
//       $log.info('on select event fired for patients element: ' + JSON.stringify(ss));
//     };

//     obj.onConfirm = function() {
//     };
//   }

//   function buildListViewer($q, $log, obj, data, PatientObj, batchRetriever) {
//     obj.listobj = {};
//     obj.listobj.template = 'app/patient/_patient-element-tpl.html';
//     obj.listobj.heading = 'Patients';

//     obj.listobj.getElementsObj = batchRetriever;
//     obj.listobj.getElements = function() {
//       var deferred = $q.defer();
//       deferred.resolve(data || []);
//       return deferred.promise;
//     }

//     obj.listobj.makeElement = function(objElement) {
//       return new PatientObj(objElement)
//     };    

//   }

//   function PatientsComponentBuilderFtn($q, $log, PatientObj, JawboneService) {
//     var PatientsComponentBuilder = function(user) {
//       var obj = this;

//       obj.profile = JawboneService.extractData('profile', user);
//       obj.name = obj.profile.first + ' ' + obj.profile.last;
//       obj.patients = JawboneService.extractData('patients', user);
//       obj.elems = obj.patients || [];

//       var bobj = JawboneService.makeBatch('patients');
//       $log.info('bobj: ' + JSON.stringify(bobj));

//       buildCallbacks($log, obj, obj.elems);
//       buildListViewer($q, $log, obj, obj.elems, PatientObj, bobj);

//       $log.info('patient comp builder ran: ' );

//     };
//     return PatientsComponentBuilder;
//   }

//   function PatientObjFtn($log) {
//     var PatientObj = function(objElement) {

//       $log.info('obj element: ' + JSON.stringify(objElement));

//       var o = this;
//       o.data = objElement || {};
//       o.jawboneId = objElement.jawboneId || 'blank';
//       o.obj = objElement.user.profile || {};
//       o.first = o.obj.first || 'blank';
//       o.last = o.obj.last || 'blank';
//       o.weight = o.obj.weight || 'blank weight';
//       o.gender = o.obj.gender || 'no gender';
//       o.height = o.obj.height || 'no height';
//       o.joinDate = objElement.joinDate || null;

//       o.selected = false;

//       o.activated = function() {
//         o.selected = true;
//       };

//       o.deactivated = function() {
//         o.selected = false;
//       }
//     };
//     return PatientObj;
//   }

// })();