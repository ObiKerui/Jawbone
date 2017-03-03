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
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');

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
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); // read cookies (needed for auth)
app.use(session({ secret: 'anappsessionsecretkeepssecretyes'}));

// app.use(session({
// secret: 'anappsessionsecretkeepssecretyes',
//   resave: false,
//   saveUninitialized: true,
//   cookie: {
//     secure: true,
//     maxAge: new Date(Date.now() + 3600000)
//   }
// }));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());

require('./routes')(app, passport);

//app.use('/api', proxy);

// initialise the database
require('./init_db');

var secureServer = https.createServer(sslOptions, app).listen(config.PORT, function() {
  console.log('Up server listening on port: ' + config.PORT);
  console.log('environment: ' + app.get('env'));
});