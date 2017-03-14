var JawboneStrategy = require('passport-oauth').OAuth2Strategy;
var jbbuilder = require('./jawboneProfile');
var user = require('../models/user');

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
  
  user.getByJawboneId(prof.xid, function(getErr, userResult) {
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
*   PASSPORT JAWBONE STRATEGY
*/
module.exports = function(passport, configIds) {
	passport.use('jawbone', new JawboneStrategy({
	  clientID: configIds.jawboneAuth.clientID,
	  clientSecret: configIds.jawboneAuth.clientSecret,
	  authorizationURL: configIds.jawboneAuth.authorizationURL,
	  tokenURL: configIds.jawboneAuth.tokenURL,
	  callbackURL: configIds.jawboneAuth.callbackURL
	}, function(token, refreshToken, profile, done) {
	  var options = {
	    access_token: token,
	    client_id: configIds.jawboneAuth.clientID,
	    client_secret: configIds.jawboneAuth.clientSecret
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
}
