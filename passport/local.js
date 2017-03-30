var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

module.exports = function(passport, configIds) {
	passport.use('login', new LocalStrategy({
      usernameField: "email",
      passwordField: "password"
    },
		function(email, password, cb) {
			console.log('got email pwd: ' + email + ' ' + password);
	   		User.getByEmail(email, function(err, user) {
	      		if (err) { 
	      			console.log('something went wrong in login strategy getting user: ' + err);
	      			return cb(err); 
	      		}
	      		if (!user) { 
	      			console.log('problem with user in local strategy');
	      			return cb(null, false); 
	      		}
	      		if (!User.comparePassword(user, password)) { 
              console.log('incorrect password for user');
	      			return cb(null, false); 
	      		}
            console.log('success: return the user');
	      		return cb(null, user);
	    	});
		}
	)),

	passport.use('register', new LocalStrategy({
    		passReqToCallback : true,
        usernameField: "email", 
        passwordField:"password"
  		},
  		function(req, email, password, cb) {
  			console.log('email: ' + email);
  			console.log('password: ' + password);
  			console.log('req body in register: ' + JSON.stringify(req.body));
        console.log('req headers: ' + JSON.stringify(req.headers));

  			User.getByEmail(email, function(err, user) {
  				if(err) {
  					console.log('something went wrong in register strategy getting user: ' + err);
  					return cb(err);
  				}
  				if(!user) {
  					console.log('no user exists - create one');
  					User.createRaw(email, password, function(createErr, newUser) {
  						if(createErr) {
  							console.log('error creating new user in passport register');
  							return cb(createErr);
  						}
  						return cb(null, newUser);
  					});
  				} else {
  					console.log('this user already exists! Cannot register');
  					return cb('this user already exists! Cannot register');
  				}

  			});
  		}
	));
}