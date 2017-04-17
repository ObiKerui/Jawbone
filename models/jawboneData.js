var ids = require('../config').ids;

//
// initialise JAWBONE UP
//
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

var profile = function(user, cb) {
	var up = init(user);
	up.me.get({}, function(err, profile) {
		if(err) {
			console.log('err retrieving profile: ' + err);
		} else {
			console.log('raw profile: ' + (profile));
			try {
   				var jsonProfile = JSON.parse(profile);
   				cb(null, jsonProfile);
  			} catch (e) {
    			cb('error parsing jawbone data');
  			}			
		}
	});
};

// 
// get sleeps
//
var sleeps = function(user, params, cb) {
	
	if(!validUser(user)) {
		console.log('invalid user: ' + JSON.stringify(user));
		return cb('invalid user');
	} 

	var up = init(user);
	up.sleeps.get({}, function(err, sleeps) {
		if(err) {
			console.log('err retrieving sleeps: ' + err);
			cb(err);
		} else {
			try {
				var jsonSleeps = JSON.parse(sleeps);
				console.log('result of sleeps request: ' + JSON.stringify(jsonSleeps, true, 3));

	  			result = {
			      total: jsonSleeps.data.items.length,
			      max: params.max,
			      offset: params.offset,
			      sortBy: params.sortBy,
			      data: jsonSleeps.data.items
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


module.exports.init = init;
module.exports.profile = profile;
module.exports.sleeps = sleeps;
module.exports.trends = trends;