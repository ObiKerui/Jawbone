var async = require('async');

var jawboneScope = [
	'basic_read',
	'extended_read',
	'sleep_read',
	'location_read',
	'move_read',
	'mood_read',
	'meal_read',
	'weight_read',
	'generic_event_read',
	'heartrate_read'
];

function parseResults(result, callback) {
	if(!Array.isArray(result)) {
		result = [result];
	}
	async.map(result, function(elem, cb) {
		// console.log('elem: ' + JSON.stringify(elem));
		// console.log('parsed: ' + JSON.stringify(JSON.parse(elem).data));
		cb(null, JSON.parse(elem).data);
	}, callback);
}

function collectAndParse(err, results, done) {
	if(err) {
		done(null);
		return;
	}
	parseResults(results, function(parseErr, parsed) {
		if(parseErr) {
			done(null);
			return;
		}
		done(parsed);
	})
}

var buildUserInfo = function(up, done) {

	async.series([
		// get user info
		function(callback) {
			up.me.get({}, callback);		
		},
		function(callback) {
			up.friends.get({}, callback);			
		},
		function(callback) {
			up.mood.get({}, callback);			
		},
		function(callback) {
			up.trends.get({}, callback);				
		},
		function(callback) {
			up.goals.get({}, callback);				
		}
	], function(err, results) {
		collectAndParse(err, results, done);
	});
};

var buildActivitiesInfo = function(up, done) {

	async.series([
		// get user info
		function(callback) {
			up.moves.get({}, callback);		
		},
		function(callback) {
			up.workouts.get({}, callback);			
		},
		function(callback) {
			up.sleeps.get({}, callback);			
		},
		function(callback) {
			up.meals.get({}, callback);				
		},
		function(callback) {
			up.mood.get({}, callback);				
		}
	], function(err, results) {
		collectAndParse(err, results, done);
	});
};

module.exports.scopes = jawboneScope;
module.exports.userInfo = buildUserInfo;
module.exports.activitiesInfo = buildActivitiesInfo;
