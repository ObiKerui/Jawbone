var JawboneStrategy = require('passport-oauth').OAuth2Strategy;
var jbbuilder = require('./jawboneProfile');
var user = require('../models/user');
var jawboneMgr = require('../models/jawboneData');

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

  // console.log('client id: ' + configIds.jawboneAuth.clientID);
  // console.log('client secret: ' + configIds.jawboneAuth.clientSecret);
  // console.log('auth url: ' + configIds.jawboneAuth.authorizationURL);
  // console.log('token url: ' + configIds.jawboneAuth.tokenURL);
  // console.log('cb url: ' + configIds.jawboneAuth.callbackURL);

	passport.use('jawbone', new JawboneStrategy({
	  clientID: configIds.jawboneAuth.clientID,
	  clientSecret: configIds.jawboneAuth.clientSecret,
	  authorizationURL: configIds.jawboneAuth.authorizationURL,
	  tokenURL: configIds.jawboneAuth.tokenURL,
	  callbackURL: configIds.jawboneAuth.callbackURL,
    passReqToCallback: true
	}, function(req, token, refreshToken, profile, done) {

	  var options = {
	    access_token: token,
	    client_id: configIds.jawboneAuth.clientID,
	    client_secret: configIds.jawboneAuth.clientSecret
	  };

	  //up = require('jawbone-up')(options);
    req.user.jawboneData = req.user.jawboneData || {};
    req.user.jawboneData.access_token = token;
    req.user.jawboneData.refresh_token = refreshToken;

    console.log('Here or what? AUTHENTICATE WITH JAWBONE');

    // get the user's jawbone profile - pain in the ass this was't returned in their profile above!
    jawboneMgr.profile(req.user, function(profileErr, profileResult) {
      if(profileErr) {
        console.log('error getting the user profile: ' + profileErr);
        return done(profileErr);
      }

      //console.log('got the user profile: ' + JSON.stringify(profileResult));
  
      // fill in the profile fields
      req.user.jawboneData.jawboneId = profileResult.data.xid;
  
      // we may not want to store these for privacy reasons
      req.user.profile = req.user.profile || {};
      req.user.profile.weight = profileResult.data.weight;
      req.user.profile.img = profileResult.data.image;
      req.user.profile.first = profileResult.data.first;
      req.user.profile.last = profileResult.data.last;
      req.user.profile.height = profileResult.data.height;
      req.user.profile.gender = profileResult.data.gender;

      // update the user
      user.update(req.user.email, req.user, function(updateErr, result) {
        if(updateErr) {
          console.log('error updating user: ' + updateErr);
          return done(updateErr);
        } else {
          console.log('updated user: ' + JSON.stringify(result));
          return done(null, result);
        }
      });
    });
	}));
}
