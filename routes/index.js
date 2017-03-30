var userCtrl = require('../controllers/users');
var groupCtrl = require('../controllers/jbGroups');
var JBDataCtrl = require('../controllers/jbData');
var jbbuilder = require('../passport/jawboneProfile');

var userModel = require('../models/user');

module.exports = function(app, passport) {

	app.get('/', function(req, res) {
	  res.render('pages/index');
	});

	app.get('/about', function(req, res) {
	  res.render('pages/about');
	});
	
	app.get('/users/me', isLoggedIn, userCtrl.getAll);
	app.get('/users/:id', isLoggedIn, userCtrl.getOne);
	app.get('/groups/me', isLoggedIn, groupCtrl.getAll);
	app.get('/groups/:id', isLoggedIn, groupCtrl.getOne);
	app.get('/sleeps/me', isLoggedIn, JBDataCtrl.getSleeps);
	app.get('/sleeps/:id', isLoggedIn, JBDataCtrl.getSleeps);
	app.get('/trends/me', isLoggedIn, JBDataCtrl.getTrends);
	app.get('/trends/:id', isLoggedIn, JBDataCtrl.getTrends);
	app.get('/patients/me', isLoggedIn, JBDataCtrl.getPatients);

	//------------------------------------------------------------------------
	// register a new user - need to have a jawbone account
	//------------------------------------------------------------------------
	app.post('/register/user', [
		passport.authenticate('register'), 
		passport.authenticate('jawbone', { scope: jbbuilder.scopes })], function(req, res) {

	});

	//------------------------------------------------------------------------
	// login the user - ensure has a jawbone account (isJBUser)
	//------------------------------------------------------------------------
	app.post('/login/user', [
		passport.authenticate('login', { failureRedirect: '/' }),
		isJBUser
	], function(req, res) {
		res.redirect('/userdata');
	});

	//------------------------------------------------------------------------
	// login the superuser
	//------------------------------------------------------------------------
	app.post('/login/superuser',
	  passport.authenticate('login', { failureRedirect: '/' }),
	  function(req, res) {
	  	res.redirect('/superuser');
	});

	//------------------------------------------------------------------------
	// login to jawbone - prompted by failing the isJBUser middleware
	//------------------------------------------------------------------------
	app.get('/login/jawbone', 
	  passport.authenticate('jawbone', {
	    scope: jbbuilder.scopes,
	    failureRedirect: '/'
	  })
	);

	//------------------------------------------------------------------------
	// callback for jawbone to complete the 3 way authentication
	//------------------------------------------------------------------------
	app.get('/sleepdata', [
			isLoggedIn, 
			passport.authenticate('jawbone', { scope: jbbuilder.scopes, failureRedirect: '/'})
		], 
		function(req, res) {
	    	res.redirect('/userdata');
	  	}
	);

	//------------------------------------------------------------------------
	// render the user data page - must be logged in and a valid jawbone user
	// create fake data to be removed eventually
	//------------------------------------------------------------------------	
	app.get('/userdata', [ isLoggedIn, isJBUser, createFakeData ], function(req, res) {
			res.render('pages/userdata', { user: req.user});
		}
	);

	//------------------------------------------------------------------------
	// render the super user data page - must be logged in and authorized
	//------------------------------------------------------------------------	
	app.get('/superuser', [isLoggedIn, isAuthorized], function(req, res) {
		res.render('pages/superuser', { user: req.user });
	});

	//------------------------------------------------------------------------
	// logout of the application
	//------------------------------------------------------------------------	
	app.get('/logout', function(req, res) {
	  req.logout();
	  res.redirect('/');
	});

	// If no route is matched by now, it must be a 404
	app.use(function(req, res, next) {
	  var err = new Error('Not Found: ' + req.url);
	  err.status = 404;
	  next(err);
	});

	// route middleware to make sure a user is logged in
	function isLoggedIn(req, res, next) {

	    // if user is authenticated in the session, carry on 
	    if (req.isAuthenticated()) {
	        return next();
	    }

	    // if they aren't redirect them to the home page
	    res.redirect('/');
	}	

	function isAuthorized(req, res, next) {
		var roles = req.user.roles || [];
		var roles = Array.isArray(roles) ? roles : [roles];

		for(var i = 0; i < roles.length; i++) {
			if(roles[i] === 'ROLE_ADMIN') {
				return next();
			}
		};

		// user is not authorized to login as superuser
		res.redirect(303, '/');
	}

	function isJBUser(req, res, next) {

		console.log('has access token: ' + req.user.jawboneData.access_token);

		if(req.user.jawboneData.access_token) {
			console.log('skip jb login');
			return next();
		}

		res.redirect('/login/jawbone');
	}

	function createFakeData(req, res, next) {
		// assume user is logged in and has jawbone credentials set up
		// copy those credentials to every other user for now to simulate 
		// a system with multiple users
		userModel.distributeJawboneCredentials(req.user, function(err, result) {
			if(err) {
				console.log('error distributing jawbone creds: ' + err);				
			}
			next();
		});
	}

};