var express = require('express');
var proxyMiddleware = require('http-proxy-middleware');
var path = require('path');
var logger = require('morgan');
var ejs = require('ejs');
var https = require('https');
var fs = require('fs');
var bodyParser = require('body-parser');
var passport = require('./passport');
var config = require('./config');
var app = express();
var request = require('request');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');

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

app.use(logger('dev'));
app.use('/fonts', express.static(__dirname + '/public/fonts'));
app.use('/assets', express.static(__dirname + '/public/assets'));
app.use('/styles', express.static(__dirname + '/public/styles'));
app.use('/scripts', express.static(__dirname + '/public/scripts'));
app.set('trust proxy', true);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(cookieParser('keyboard cat')); // read cookies (needed for auth)

// //app.use(session({ secret: 'anappsessionsecretkeepssecretyes'}));
// app.use(session({
//   secret: 'anappsessionsecretkeepssecretyes',
//   resave: false,
//   saveUninitialized: true,
//   cookie: {
//     secure: true,
//     maxAge: new Date(Date.now() + 3600000)
//   }
// }));

// //app.use(flash());
// //app.use(bodyParser.json({limit: '5mb'}));
// app.use(bodyParser.json({ type: 'application/json' }));
// app.use(bodyParser.urlencoded({ extended: true }));

// app.use(passport.initialize());
// app.use(passport.session()); // persistent login sessions
// app.use(flash());

// app.use(allowCrossDomain);

// todo 
// remove this
//app.use(cookieParser('secret'));
app.use(cookieParser());
app.enable('trust proxy'); // optional, not needed for secure cookies
app.use(session({
  secret: 'anappsessionsecretkeepssecretyes',
  resave: true,
  saveUninitialized: true,
  proxy: true,
  cookie: {
    secure: true,
    maxAge: 3600000,
    store: new MongoStore({ url: config.DB_URL })
    //maxAge: new Date(Date.now() + 3600000)
  }
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

require('./routes')(app, passport);

//app.use('/api', proxy);

// initialise the database
require('./init_db');

function createSecureServer(app) {
  var sslOptions = {
    key: fs.readFileSync('./ssl/server.key'),
    cert: fs.readFileSync('./ssl/server.crt')
  };

  return https.createServer(sslOptions, app).listen(config.PORT, function() {
    console.log('Up server listening on port: ' + config.PORT);
    console.log('environment: ' + app.get('env'));
  });  
}

function createServer(app) {
  return app.listen(config.PORT, function() {
   console.log('Express server listening on port ' + config.PORT);
   console.log('environment: ' + app.get('env'));
  });  
}

var env = process.env.NODE_ENV;
env = env.trim();

// on local machine development environment we create a secure server
if(env === 'development') {
  createSecureServer(app);
} else { // on heroku should be secure anyway
  createServer(app);
}
