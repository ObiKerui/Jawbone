var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

module.exports = function(passport, configIds) {
	passport.use(new LocalStrategy(
		function(email, password, cb) {
			//return cb(null, {});
	   		User.getByEmail(email, function(err, user) {
	      		if (err) { 
	      			console.log('something went wrong in local strategy: ' + err);
	      			return cb(err); 
	      		}
	      		if (!user) { 
	      			console.log('problem with user in local strategy');
	      			return cb(null, false); 
	      		}
	      		if (!User.comparePassword(user, password)) { 
	      			return cb(null, false); 
	      		}
	      		return cb(null, user);
	    	});
		}
	));
}