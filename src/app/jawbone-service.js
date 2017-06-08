(function() {
  'use strict';

  angular
    .module('jawboneApp')
    .factory('JawboneDataObj', JawboneDataObjFtn)
    .factory('BatchObj', BatchObjFtn)
    .factory('GroupService', GroupServiceFtn)
    .factory('SleepService', SleepServiceFtn)
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
			obj.params.max = paramsArg.max || 4 ;
			obj.params.offset = paramsArg.offset || 0;
			obj.params.sortBy = paramsArg.sortBy || 'id';
			obj.params.total = paramsArg.total || 0;

			function makeBatch(batch, offset) {
				var newBatch = new BatchObj(batch.endpoint, batch.params);
				var os = newBatch.params.offset || 0;
				var newOS = parseInt(os + offset);
				newOS = (newOS < 0 ? 0 : newOS);
				newOS = (newOS < batch.params.total ? newOS : batch.params.total);
				newBatch.params.offset = newOS;
				return newBatch;			
			}

			function updateBatch(batch, response) {
				batch.params.total = response.data.total;
			}

			obj.get = function() {
				return $http.get(obj.endpoint, {params: obj.params})
				.then(function(response) {
					updateBatch(obj, response);
					return response.data;
				})
				.catch(function(errResponse) {
					$log.info('error retrieving data: ' + JSON.stringify(errResponse));
					return [];
				});
			};

			obj.next = function() {
				return makeBatch(obj, obj.params.max);
			};

			obj.prev = function() {
				return makeBatch(obj, -(obj.params.max));
			};

			obj.more = function() {
				return (obj.params.offset < obj.params.total);
			};
		};
		
		return BatchObj;
	}

	//------------------------------------------------------
	//  JAWBONE DATA SERVICE 
	//------------------------------------------------------  
	function JawboneService($log, $q, $http, JawboneDataObj, BatchObj, GroupService, SleepService) {
		var jboneData = null;
		var setUserCB = [];
		var groupService = new GroupService();
		var sleepService = new SleepService();
	    var service = {
	  		init : init,
	  		getMainUser : getMainUser,
	  		getUser : getUser,
	  		getUsers : getUsers,
	  		makeEndpoint : makeEndpoint,
	  		makeFieldGetter: makeFieldGetter,
	  		makeBatch : makeBatch,
	  		setUserCallback : setUserCallback,
	  		setUser : setUser,
	  		extractData : extractData,
	  		createNote : createNote,
	  		updateNote : updateNote,
	  		deleteNote : deleteNote,
	  		groupService : getGroupService,
	  		sleepService : getSleepService
	  	};
	  	return service;    

	  	function getGroupService() {
	  		return groupService;
	  	}

	  	function getSleepService() {
	  		return sleepService;
	  	}

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
	  			$log.info('error getting user: ' + JSON.stringify(errResponse));
	  		});
	  	}

	  	function makeEndpoint(endpoint, id) {
	  		var userid = id || 'me';
	  		return ('/' + endpoint + '/' + userid);
	  	}

	  	function makeFieldGetter(root, id, field) {
	  		var id = id || 'default';
	  		return ('/' + root + '/' + id + '/' + field);
	  	}

	  	function makeBatch(endpoint, params) {
	  		// var userid = id || 'me';
	  		// endpoint = '/' + endpoint + '/' + userid; 
	  		// $log.info('endpoint: ' + endpoint);
			var paramsArg = params || {};
			paramsArg.max = paramsArg.max || 4 ;
			paramsArg.offset = paramsArg.offset || 0;
			paramsArg.sortBy = paramsArg.sortBy || 'id';
	  		return new BatchObj(endpoint, paramsArg);
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

	  	function createNote(note) {
	  		return $http.post('/notes', note)
	  		.then(function(response) {
	  			return response;
	  		})
	  		.catch(function(errResponse) {
	  			$log.info('error creating note: ' + JSON.stringify(errResponse));
	  		});
	  	}

	  	function updateNote(note) {
	  		return $http.put('/notes/' + note._id, note)
	  		.then(function(response) {
	  			return response;
	  		})
	  		.catch(function(errResponse) {
	  			$log.info('error updating note: ' + JSON.stringify(errResponse));
	  		});
	  	}

	  	function deleteNote(note) {
	  		return $http.delete('/notes/' + note._id)
	  		.then(function(response) {
	  			return response;
	  		})
	  		.catch(function(errResponse) {
	  			$log.info('error deleting note: ' + JSON.stringify(errResponse));
	  		});	  		
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
	  		else if(dataname === 'groups') {
	  			return extractGroups(data);
	  		}
	  		else if(dataname === 'userImage') {
	  			return extractUserImage(data);
	  		}
	  		$log.info('jawbone service: call to extract unknown data: ' + dataname);
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

	  	function extractGroups(data) {
	  		$log.info('groups from user: ' + JSON.stringify(data));
	  		return data.groups;
	  	}

	  	function extractUserImage(data) {

	  		var prof = data.profile || {};

	  		if(!prof.img) {
	  			$log.info('no image found - return null');
	  			return null;
	  		} else {
	  			return 'https://jawbone.com/' + prof.img;
	  		}
	  	}
	}

	function GroupServiceFtn($log, $q, $http) {
		var GroupService = function() {
			var obj = this;
			obj.createGroup = createGroup;
			obj.getGroup = getGroup;
			obj.updateGroup = updateGroup;
			obj.deleteGroup = deleteGroup;
			obj.addMemberToGroup = addMemberToGroup;
			obj.removeMemberFromGroup = removeMemberFromGroup;
		};
		return GroupService;

		function createGroup() {

		}

		function getGroup() {

		}

		function updateGroup() {

		}

		function deleteGroup() {

		}

		function addMemberToGroup(group, member) {
			$log.info('add a member to group');
			return $http.put('/groups/' + group._id + '/members/' + member._id)
			.then(function(response) {
				return true;
			})
			.catch(function(err) {
				return false;
			});
		}

		function removeMemberFromGroup(group, member) {
			$log.info('remove a member from group : ' + group._id);
			$log.info('remove a member from group : ' + member._id);	
			return $http.delete('/groups/' + group._id + '/members/' + member._id)
			.then(function(response) {
				$log.info('response: ' + JSON.stringify(response));
				return true;
			})			
			.catch(function(err) {
				$log.info('err removing member from group: ' + JSON.stringify(err));
				return false;
			});
		}
	} 

	//-----------------------------------------
	//	SLEEP SERVICE
	//-----------------------------------------	
	function SleepServiceFtn($log, $q, $http) {
		var SleepService = function() {
			var obj = this;
			obj.getSleepTicks = getSleepTicks;
			obj.getSleepDetails = getSleepDetails;
		};
		return SleepService;

		function getSleepTicks(sleepId) {
			return $http.get('/sleeps/ticks/' + sleepId)
			.then(function(response) {
				//$log.info('response to get sleep: ' + JSON.stringify(response));
				return response.data;
			})
			.catch(function(errResponse) {
				$log.info('err response to get sleep ticks: ' + JSON.stringify(errResponse));
				return errResponse;
			});
		}

		function getSleepDetails(sleepId) {
			return $http.get('/sleeps/details/' + sleepId)
			.then(function(response) {
				//$log.info('response to get sleep: ' + JSON.stringify(response));
				return response.data;
			})
			.catch(function(errResponse) {
				$log.info('err response to get sleep details: ' + JSON.stringify(errResponse));
				return errResponse;
			});
		}

	} 

})();