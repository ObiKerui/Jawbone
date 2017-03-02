var express = require('express');
var proxyMiddleware = require('http-proxy-middleware');
var path = require('path');
var logger = require('morgan');
var ejs = require('ejs');
var https = require('https');
var fs = require('fs');
var bodyParser = require('body-parser');
var passport = require('passport');
var JawboneStrategy = require('passport-oauth').OAuth2Strategy;
var config = require('./config');
var app = express();
var request = require('request');
var jbbuilder = require('./jawboneProfile');
var user = require('./models/user');
var userCtrl = require('./controllers/users');


var jawboneAuth = {
  clientID: 'eITeu_Bla0s',
  clientSecret: '1ec2f5878fa5701a1a8991e7ffb3ba654dd6a6e6',
  authorizationURL: 'https://jawbone.com/auth/oauth2/auth',
  tokenURL: 'https://jawbone.com/auth/oauth2/token',
  callbackURL: 'https://localhost:5000/sleepdata'
};

var sslOptions = {
  key: fs.readFileSync('./server.key'),
  cert: fs.readFileSync('./server.crt')
};

app.use(logger('dev'));


var proxy = proxyMiddleware('/api', {
  target: 'https://restapi.com', // here we can specify a rest backend for api calls
  changeOrigin: true,             // for vhosted sites, changes host header to match to target's host
  secure: true
});

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Accept, Origin, Referer, User-Agent, Content-Type, Authorization');

    if ('OPTIONS' == req.method) {
      res.send(200);
    } else {
      next();
    }
};

console.log(__dirname);

app.use('/fonts', express.static(__dirname + '/public/fonts'));
app.use('/assets', express.static(__dirname + '/public/assets'));
app.use('/styles', express.static(__dirname + '/public/styles'));
app.use('/scripts', express.static(__dirname + '/public/scripts'));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(allowCrossDomain);
app.use(passport.initialize());

// app.use(express.static('public'));

/*
* GET UP DATA
*/
var getUPData = function(up, callback) {
  jbbuilder.userInfo(up, function(profile) {
    jbbuilder.activitiesInfo(up, function(activities) {
      callback({ profile, activities });
    });
  })
};

/*
*   STORE THE UP/JAWBONE DATA
*/
var storeUpData = function(data, callback) {

  var prof = data.profile[0];
  //console.log('profile: ' + JSON.stringify(prof));
  
  user.get(prof.xid, function(getErr, userResult) {
    if(getErr) {
      console.log('error getting user: ' + JSON.stringify(getErr));
      return callback(getErr, null);
    }
    if(userResult) {
      user.update(prof, data, function(updateErr, updateResult) {
        if(updateErr) {
          console.log('error updating user: ' + JSON.stringify(updateErr));          
        }
        callback(updateErr, updateResult);
      });
    } else {
      user.create(prof, data, function(createErr, createResult) {
        if(createErr) {
          console.log('error creating user: ' + JSON.stringify(createErr));  
        }
        callback(createErr, createResult);
      });
    }
  });
}

/*
*   DISCONNECT
*/
var disconnect = function(access_token, data, done) {
  request({
    method: 'delete',
    url: 'https://jawbone.com/nudge/api/v.1.0/users/@me/PartnerAppMembership',
    headers: {
      'Authorization': 'Bearer ' + access_token,
      'Accept': 'application/json'
    }
  },
  function(error, response, body) {
    console.log('disconnected i hope : ' + JSON.stringify(response));
    done(null, data, console.log('diconnect with data'));
  });
};

/*
*   PASSPORT JAWBONE STRATEGY
*/
passport.use('jawbone', new JawboneStrategy({
  clientID: jawboneAuth.clientID,
  clientSecret: jawboneAuth.clientSecret,
  authorizationURL: jawboneAuth.authorizationURL,
  tokenURL: jawboneAuth.tokenURL,
  callbackURL: jawboneAuth.callbackURL
}, function(token, refreshToken, profile, done) {
  var options = {
    access_token: token,
    client_id: jawboneAuth.clientID,
    client_secret: jawboneAuth.clientSecret
  },
  
  up = require('jawbone-up')(options);
  getUPData(up, function(data) {
    storeUpData(data, function(err, user) {
      //console.log('user result: ' + JSON.stringify(user));
      if(user) {
        return done(null, user, console.log('Jawbone UP user ready to be displayed.'));              
      }
        return done(null, data, console.log('No User. Jawbone UP data ready to be displayed.'));              
    })
  });
}));

//app.use('/api', proxy);

app.get('/users', userCtrl.getAll);
app.get('/users/:id', userCtrl.getOne);

app.get('/login/jawbone', 
  passport.authorize('jawbone', {
    scope: jbbuilder.scopes,
    failureRedirect: '/'
  })
);

app.get('/sleepdata',
  passport.authorize('jawbone', {
    failureRedirect: '/'
  }), function(req, res) {
    res.render('pages/userdata', { data: req.account });
  }
);

app.get('/disconnect', 
  passport.authorize('jawbone', {
    failureRedirect: '/'
  }), function(req, res) {
    res.render('pages/about');
  }
);

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
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

// initialise the database
require('./init_db');

var secureServer = https.createServer(sslOptions, app).listen(config.PORT, function() {
  console.log('Up server listening on port: ' + config.PORT);
  console.log('environment: ' + app.get('env'));
});