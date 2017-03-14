var passport = require('passport');
var User = require('../models/user');
var ids = require('../config').ids;
var passportLocal = require('./local');
var passportJawbone = require('./jawbone');

// set up the user model
passport.serializeUser(function(user, done) {
	console.log('serialise the user');
	done(null, user._id);
});

passport.deserializeUser(function(id, done) {
	console.log('deserialise the user');
	User.get(id, function (err, user) {
	  done(err, user);
	});
});

// set up passport for google
passportLocal(passport, ids);
passportJawbone(passport, ids); // to implement

// export passport
module.exports = passport;