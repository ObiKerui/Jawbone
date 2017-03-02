(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('JawboneDataObj', JawboneDataObjFtn)
    .factory('BatchObj', BatchObjFtn)
    .factory('JawboneService', JawboneService);

	//------------------------------------------------------
	//  JAWBONE DATA MODEL 
	//------------------------------------------------------  
	function JawboneDataObjFtn($log) {
		var JawboneDataObj = function(data) {
			this.data = data || {};
		};
		return JawboneDataObj;
	}

	//------------------------------------------------------
	//  GET BATCH REQUEST 
	//------------------------------------------------------  
	function BatchObjFtn($log, $q, $http) {
		var BatchObj = function(endpoint, params) {
			var obj = this;
			obj.endpoint = endpoint || '';
			obj.params = {};
			var paramsArg = params || {};
			obj.params.max = paramsArg.max || 4;
			obj.params.offset = paramsArg.offset || 0;
			obj.params.sortBy = paramsArg.sortBy || 'id';

			function makeBatch(batch, offset) {
				var newBatch = new BatchObj(batch.endpoint, batch.params);
				var os = newBatch.params.offset || 0;
				var newOS = parseInt(os + offset);
				newOS = (newOS < 0 ? 0 : newOS);
				newBatch.params.offset = newOS;
				return newBatch;			
			}

			obj.get = function() {
				return $http.get(obj.endpoint, {params: obj.params})
				.then(function(response) {
					return response.data;
				})
				.catch(function(errResponse) {
					return errResponse;
				});
			};

			obj.next = function() {
				return makeBatch(obj, obj.params.max);
			};

			obj.prev = function() {
				return makeBatch(obj, -(obj.params.max));
			}
		};
		
		return BatchObj;
	}

	//------------------------------------------------------
	//  JAWBONE DATA SERVICE 
	//------------------------------------------------------  
	function JawboneService($log, $q, $http, JawboneDataObj, BatchObj) {
		var jboneData = null;
		var setUserCB = [];
	    var service = {
	  		init : init,
	  		getMainUser : getMainUser,
	  		getUser : getUser,
	  		getUsers : getUsers,
	  		makeBatch : makeBatch,
	  		setUserCallback : setUserCallback,
	  		setUser : setUser,
	  		extractData : extractData
	  	};
	  	return service;    

	  	/*
	  	*	INITIALISE JAWBONE SERVICE
	  	*/
	  	function init(jbd) {
	  		jboneData = jbd
	  	}

	  	/*
	  	*	GET DATA
	  	* 	MODIFY THIS TO GET A SPECIFIED USER'S DATA FROM SERVER
	  	*/
	  	function getMainUser() {
	  		var deferred = $q.defer();
	  		deferred.resolve(jboneData);
	  		return deferred.promise;
	  	}

	  	function setUserCallback(ftn) {
	  		setUserCB.push(ftn);
	  	}

	  	function setUser(user) {
	  		angular.forEach(setUserCB, function(ftn) {
	  			ftn(user);
	  		}, setUserCB);
	  	}

	  	function getUser(userid) {
			return $http.get('/users/' + userid).then(function(result) {
				return result.data;
			})
	  		.catch(function(errResponse) {
	  			$log.info('error getting user: ' + errResponse);
	  		});
	  	}

	  	function makeBatch() {
	  		return new BatchObj('/users');
	  	}

	  	/*
	  	*	GET USERS
	  	*/
	  	function getUsers() {
	  		var deferred = $q.defer();

	  		var p = {
	      		max : 8,
	      		offset : 0,
	      		sortBy : 'first'
	    	};

	  		$http.get('/users', {params: p})
	  		.then(function(result) {
	  			//$log.info('get users results: ' + JSON.stringify(result.data.data));
	  			deferred.resolve(result.data.data);
	  		})
	  		.catch(function(errResponse) {
	  			deferred.reject(errResponse);
	  		});
	  		return deferred.promise;
	  	}

	  	function extractData(dataname, data) {
	  		if(dataname === 'trends') {
	  			return extractTrends(data);
	  		}
	  		else if(dataname === 'profile') {
	  			return extractProfile(data);
	  		}
	  		else if(dataname === 'sleeps') {
	  			return extractSleeps(data);
	  		}
	  		return {};
	  	}

	  	function extractTrends(data) {
	  		var jbdata = data.jbdata || {};
	  		var prof = jbdata.profile || {};  		
	  		var trends = prof[3] || {};
	  		return trends;
	  	}

	  	function extractProfile(data) {
	  		return data.profile || {};
	  	}

	  	function extractSleeps(data) {
	  		var jbdata = data.jbdata || {};
	  		var activities = jbdata.activities || {};
	  		var sleepspart = activities[2] || [];
	  		return sleepspart.items;
	  	}
	}
})();