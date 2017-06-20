var ids = require('../config').ids;
var db = require('../db');
var Schema = db.Schema;

//------------------------------------------------------
//	KEEP A RECORD OF ALLOWED USERS OF THE SYSTEM FOR NOW
//------------------------------------------------------
var jbUserIdsSchema = new Schema({
  admins: [ { type: String } ],
  patients: [ { type: String } ],
}, {
  timestamps: true
});

//------------------------------------------------------
//	JAWBONE USER ID MODEL OBJECT
//------------------------------------------------------
var UserIds = db.model('jbUserIds', jbUserIdsSchema);

//------------------------------------------------------
//	REMOVE JAWBONE IDS
//------------------------------------------------------
var removeIds = function(cb) {
	UserIds.remove(function(err, result) {
	    if(err) {
	      cb(err);
	    } else {
	      cb(null, result);
	    }
	});
};

//------------------------------------------------------
//	CREATE JAWBONE IDS
//------------------------------------------------------
var createIds = function(admins, patients, cb) {
  	var newJbUserIds = new UserIds({ admins : admins, patients: patients });
	newJbUserIds.save(function(err, newSavedUser) {
	    if(err) {
	      cb(err);
	    } else {
	      cb(null, newSavedUser);
	    }
	});
};

//------------------------------------------------------
//	CREATE JAWBONE IDS
//------------------------------------------------------
var getIds = function(cb) {
	UserIds.find({}, function(err, ids) {
	    if(err) {
	      	return cb(err);
	    } else {	    	
	    	console.log('ids returned: ' + JSON.stringify(ids[0]));
	      	return cb(null, ids[0]);
	    }
	});
};

//------------------------------------------------------
// initialise JAWBONE UP
//------------------------------------------------------
var init = function(user) {

	var options = {	
		access_token: user.jawboneData.access_token,
		client_id: ids.jawboneAuth.clientID,
		client_secret: ids.jawboneAuth.clientSecret
	};

	var up = require('jawbone-up')(options);
	return up;
};

var validUser = function(user) {
	if(!user.jawboneData.access_token) {
		return false;
	}
	return true;
};

// var profile = function(user, cb) {
// 	var up = init(user);
// 	up.me.get({}, function(err, profile) {
// 		if(err) {
// 			console.log('err retrieving profile: ' + err);
// 		} else {
// 			console.log('raw profile: ' + (profile));
// 			try {
//    				var jsonProfile = JSON.parse(profile);
//    				cb(null, jsonProfile);
//   			} catch (e) {
//     			cb('error parsing jawbone data');
//   			}			
// 		}
// 	});
// };

var profile = function(options, cb) {

	//console.log('>>>options getting raw profile: ' + options.access_token);
	var up = require('jawbone-up')(options);

	// up.sleeps.get({ limit : 1000 }, function(err, sleeps) {
	// 	var jsonSleeps = JSON.parse(sleeps);

	// 	console.log('result of sleeps request (jsonSleeps): ' + JSON.stringify(jsonSleeps));				
	// 	//console.log('result of sleeps request (jsonSleeps): ' + JSON.stringify(jsonSleeps, true, 3));				
	// });

	up.me.get({}, function(err, profile) {
		if(err) {
			console.log('err retrieving profile: ' + err);
		} else {
			//console.log('raw profile retrieved: ' + (profile));
			try {
   				var jsonProfile = JSON.parse(profile);
   				cb(null, jsonProfile);
  			} catch (e) {
    			cb('error parsing jawbone data');
  			}			
		}
	});
};

function paginate(array, page_size, offset, total) {
	console.log('page size: %d offset: %d total: %d', page_size, offset, total);
	offset = (offset < 0 ? 0 : offset);
	page_size = (page_size < 0 ? 0 : page_size);
	page_size = (page_size > total ? total : page_size);
  	var end = (parseInt(offset) + parseInt(page_size));

  console.log('start: %d end: %d', offset, end);

  return array.slice(offset, end);
}

// 
// get sleeps
//
var sleeps = function(user, params, cb) {
	
	if(!validUser(user)) {
		console.log('invalid user: ' + JSON.stringify(user));
		return cb('invalid user');
	} 

	//console.log('init user: ' + JSON.stringify(user));

	var up = init(user);

	up.sleeps.get({ limit : 1000 }, function(err, sleeps) {
		if(err) {
			console.log('err retrieving sleeps: ' + err);
			cb(err);
		} else {
			try {
				var jsonSleeps = JSON.parse(sleeps);

				//console.log('result of sleeps request (jsonSleeps): ' + JSON.stringify(jsonSleeps, true, 3));
				//console.log('>>>> sleeps access token : ' + JSON.stringify(user.jawboneData.access_token));

				console.log('params: ' + JSON.stringify(params));
				var total = jsonSleeps.data.items.length;
				console.log('call paginate with total: ' + JSON.stringify(total));
				var paginatedData = paginate(jsonSleeps.data.items, params.max, params.offset, total);
				
	  			result = {
			      total: jsonSleeps.data.items.length,
			      max: params.max,
			      offset: params.offset,
			      sortBy: params.sortBy,
			      data: paginatedData
			    };

				//console.log('result of sleeps request (result): ' + JSON.stringify(result, true, 3));

			    cb(null, result);		
			} catch(e) {
				cb('error parsing jawbone results');
			}

		}
	});
}

// 
// get sleep tick info
//
var sleepTicks = function(user, sleepId, cb) {
	if(!validUser(user)) {
		console.log('invalid user: ' + JSON.stringify(user));
		return cb('invalid user');
	} 

	var up = init(user);

	//console.log('getting the sleep ticks: ' + sleepId);

	up.sleeps.ticks({ xid : sleepId }, function(err, sleep) {
		//console.log('do we get here even?');
		if(err) {
			console.log('err retrieving sleeps: ' + err);
			cb(err);
		} else {
			//console.log('the retrieved sleep: ' + sleep)
			try {
				var jsonSleep = JSON.parse(sleep);
				//console.log('result of sleep tick request: ' + JSON.stringify(jsonSleep, true, 3));

	  			result = {
			      data: jsonSleep
			    };

			    cb(null, result);		
			} catch(e) {
				cb('error parsing jawbone results');
			}
		}
	});
}

// 
// get sleep tick info
//
var sleepDetails = function(user, sleepId, cb) {
	if(!validUser(user)) {
		console.log('invalid user: ' + JSON.stringify(user));
		return cb('invalid user');
	} 

	var up = init(user);

	//console.log('getting the sleep ticks: ' + sleepId);

	up.sleeps.get({ xid : sleepId }, function(err, sleep) {
		//console.log('do we get here even?');
		if(err) {
			console.log('err retrieving sleeps: ' + err);
			cb(err);
		} else {
			//console.log('the retrieved sleep: ' + sleep)
			try {
				var jsonSleep = JSON.parse(sleep);
				//console.log('result of sleep tick request: ' + JSON.stringify(jsonSleep, true, 3));

	  			result = {
			      data: jsonSleep
			    };

			    cb(null, result);		
			} catch(e) {
				cb('error parsing jawbone results');
			}
		}
	});
}

// 
// get sleeps
//
var trends = function(user, params, cb) {
	var up = init(user);
	up.trends.get({}, function(err, trends) {
		if(err) {
			console.log('err retrieving trends: ' + err);
			cb(err);
		} else {
			var jsonTrends = JSON.parse(trends);

			console.log('trends retreived: ' + JSON.stringify(jsonTrends));

  			result = {
		      total: jsonTrends.data.data.length,
		      max: params.max,
		      offset: params.offset,
		      sortBy: params.sortBy,
		      data: jsonTrends.data.data
		    }

			cb(null, result);		
		}
	});
}

// 
// get cardiac
//
var cardiac = function(user, params, cb) {

	if(!validUser(user)) {
		console.log('invalid user: ' + JSON.stringify(user));
		return cb('invalid user');
	} 

	var up = init(user);

	console.log('cardiac: ' + JSON.stringify(up, true, 1));

	up.events.cardiac.get({}, function(err, cardiacEvents) {
		if(err) {
			console.log('err retrieving cardiac events: ' + err);
			cb(err);
		} else {
			var jsonCardiac = JSON.parse(cardiacEvents);

			console.log('cardiac retreived: ' + JSON.stringify(jsonCardiac));

			result = {
				total: jsonCardiac.data.data.length,
				max: params.max,
				offset: params.offset,
				sortBy: params.sortBy,
				data: jsonCardiac.data.data
			};

			cb(null, result);
		}
	})
};

module.exports.UserIds = UserIds;
module.exports.removeIds = removeIds;
module.exports.createIds = createIds;
module.exports.getIds = getIds;
module.exports.init = init;
module.exports.profile = profile;
module.exports.sleeps = sleeps;
module.exports.sleepTicks = sleepTicks;
module.exports.sleepDetails = sleepDetails;
module.exports.trends = trends;
module.exports.cardiac = cardiac;