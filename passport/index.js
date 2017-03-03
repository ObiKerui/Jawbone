var passport = require('passport');
var User = require('../models/user');
var ids = require('../config').ids;
var passportLocal = require('./local');
var passportJawbone = require('./jawbone');

// set up the user model
passport.serializeUser(function(user, done) {
	done(null, user.email);
});

passport.deserializeUser(function(email, done) {
	User.getByEmail(email, function (err, user) {
	  done(err, user);
	});
});

// set up passport for google
passportLocal(passport, ids);
passportJawbone(passport, ids); // to implement

// export passport
module.exports = passport;