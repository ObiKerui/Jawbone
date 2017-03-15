var userCtrl = require('../controllers/users');
var groupCtrl = require('../controllers/jbGroups');
var JBDataCtrl = require('../controllers/jbData');
var jbbuilder = require('../passport/jawboneProfile');

module.exports = function(app, passport) {
	
	app.get('/users/me', isLoggedIn, userCtrl.getAll);
	app.get('/users/:id', isLoggedIn, userCtrl.getOne);
	app.get('/groups/me', isLoggedIn, groupCtrl.getAll);
	app.get('/groups/:id', isLoggedIn, groupCtrl.getOne);
	app.get('/sleeps/me', isLoggedIn, JBDataCtrl.getSleeps);
	app.get('/sleeps/:id', isLoggedIn, JBDataCtrl.getSleeps);
	app.get('/trends/me', isLoggedIn, JBDataCtrl.getTrends);
	app.get('/trends/:id', isLoggedIn, JBDataCtrl.getTrends);
	app.get('/patients/me', isLoggedIn, JBDataCtrl.getPatients);

	app.get('/login/jawbone', 
	  passport.authorize('jawbone', {
	    scope: jbbuilder.scopes,
	    failureRedirect: '/'
	  })
	);

	app.post('/login/superuser',
	  passport.authenticate('local', { 
	    successRedirect: '/superuser',
	    failureRedirect: '/login'
	  })
	);

	app.get('/superuser', isLoggedIn, function(req, res) {
		res.render('pages/superuser', { user: req.user });
	});

	app.get('/sleepdata',
	  passport.authenticate('jawbone', {
	    failureRedirect: '/'
	  }), function(req, res) {
	    res.render('pages/userdata', { data: req.user });
	  }
	);

	app.get('/logout', function(req, res) {
	  req.logout();
	  res.redirect('/');
	});

	app.get('/login', function(req, res) {
	  res.render('pages/login');
	});

	app.get('/about', function(req, res) {
	  res.render('pages/about');
	});

	app.get('/', function(req, res) {
	  res.render('pages/index');
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
	    	//console.log('user is authenticated');
	    	//console.log('user is ' + JSON.stringify(req.user));
	        return next();
	    } else {
	    	//console.log('no user? ' + JSON.stringify(req.user));
	    }

	    // if they aren't redirect them to the home page
	    res.redirect('/');
	}	

};