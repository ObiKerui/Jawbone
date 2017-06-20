var JawboneStrategy = require('passport-oauth').OAuth2Strategy;
var jbbuilder = require('./jawboneProfile');
var user = require('../models/user');
var groups = require('../models/jbGroup');
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

//---------------------------------------------
//
//---------------------------------------------
function createRoles(profileData, cb) {

  var xid = profileData.data.xid;
  var roles = ['ROLE_GUEST'];

  //console.log('xid to create roles: ' + JSON.stringify(xid));

  jawboneMgr.getIds(function(err, authUsers, authAdmins) {
    if(err) {
      console.log('error getting those xid to create roles: ' + JSON.stringify(err));
      return cb(roles);
    } else {
      console.log('got those xid to create roles: %s %s', JSON.stringify(authUsers), JSON.stringify(authAdmins));

      for(var i = 0; i < authUsers.length; i++) {
        if(authUsers[i] === profileData.data.xid) {
          roles.push('ROLE_USER');        
        }
      } 

      for(var i = 0; i < authAdmins.length; i++) {
        if(authAdmins[i] === profileData.data.xid) {
          roles.push('ROLE_ADMIN');        
        }
      } 

      return cb(roles);     
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
    callbackURL: configIds.jawboneAuth.callbackURL,
    passReqToCallback: true
  }, function(req, token, refreshToken, profile, done) {

    var options = {
      access_token: token,
      client_id: configIds.jawboneAuth.clientID,
      client_secret: configIds.jawboneAuth.clientSecret
    };

    //up = require('jawbone-up')(options);
    // req.user.jawboneData = req.user.jawboneData || {};
    // req.user.jawboneData.access_token = token;
    // req.user.jawboneData.refresh_token = refreshToken;

    //console.log('Here or what? AUTHENTICATE WITH JAWBONE');

    // get the user's jawbone profile - pain in the ass this was't returned in their profile above!
    jawboneMgr.profile(options, function(profileErr, profileResult) {
      if(profileErr) {
        console.log('error getting the user profile: ' + profileErr);
        return done(profileErr);
      }

      // create new jawbone credentials
      var jawboneData = {
        jawboneId : profileResult.data.xid,
        access_token : token,
        refresh_token : refreshToken
      };

      console.log('got the profile: ' + JSON.stringify(jawboneData.jawboneId));

      createRoles(profileResult, function(roles) {
        user.getByJawboneId(jawboneData.jawboneId, function(err, userResult) {
          if(err) {
            console.log('error retrieving user by jawbone id: ' + err);
            return done(err);                      
          } else if(!userResult) {  // create a new user

            user.create(profileResult.data, jawboneData, roles, function(createErr, createdUser) {
              if(createErr) {
                console.log('error creating user : ' + createErr);
                return done(createErr);
              } else {
                req.user = createdUser;

                // add the user to the default group
                groups.addMemberToDefault(createdUser, function(err, result) {
                  if(err) {
                    console.log('error adding created user to default group: ' + err);
                  } else {
                    console.log('added created user to default group');
                  }
                  return done(null, createdUser);
                });
              }
            });            

          } else { // user already existed

            console.log('found this user: ' + JSON.stringify(userResult));
            userResult.jawboneData = jawboneData;

            user.update(jawboneData.jawboneId, userResult, function(updatedErr, updatedUser) {
              if(updatedErr) {
                return done(updatedErr);
              } else {
                console.log('updated user to: ' + JSON.stringify(updatedUser));
                req.user = updatedUser;
                return done(null, updatedUser);              
              }
            });

          }
        }); // end get user
      }); // end create roles

      // get user by jawbone-id
      // user.getByJawboneId(jawboneData.jawboneId, function(err, userResult) {
      //   if(err) {
      //     console.log('error retrieving user by jawbone id: ' + err);
      //     return done(err);          
      //   } else if(!userResult) {

      //     console.log('the user is null - create one');
      //     createRoles(profileResult, function(roles) {
      //       user.create(profileResult.data, jawboneData, roles, function(createErr, createdUser) {
      //         if(createErr) {
      //           console.log('error creating user : ' + createErr);
      //           return done(createErr);
      //         } else {
      //           req.user = createdUser;

      //           // add the user to the default group
      //           groups.addMemberToDefault(createdUser, function(err, result) {
      //             if(err) {
      //               console.log('error adding created user to default group: ' + err);
      //             } else {
      //               console.log('added created user to default group');
      //             }
      //             return done(null, createdUser);
      //           });
      //         }
      //       });
      //     });

      //   } else {
      //     // found user in db
      //     console.log('found this user: ' + JSON.stringify(userResult));
      //     userResult.jawboneData = jawboneData;

      //     user.update(jawboneData.jawboneId, userResult, function(updatedErr, updatedUser) {
      //       if(updatedErr) {
      //         return done(updatedErr);
      //       } else {
      //         console.log('updated user to: ' + JSON.stringify(updatedUser));
      //         req.user = updatedUser;
      //         return done(null, updatedUser);              
      //       }
      //     });
      //   }
      // });

      //console.log('got the user profile: ' + JSON.stringify(profileResult));
  
      // fill in the profile fields
      //req.user.jawboneData.jawboneId = profileResult.data.xid;
  
      // we may not want to store these for privacy reasons
      // req.user.profile = req.user.profile || {};
      // req.user.profile.weight = profileResult.data.weight;
      // req.user.profile.img = profileResult.data.image;
      // req.user.profile.first = profileResult.data.first;
      // req.user.profile.last = profileResult.data.last;
      // req.user.profile.height = profileResult.data.height;
      // req.user.profile.gender = profileResult.data.gender;

      // update the user
      // user.update(req.user.email, req.user, function(updateErr, result) {
      //   if(updateErr) {
      //     console.log('error updating user: ' + updateErr);
      //     return done(updateErr);
      //   } else {
      //     console.log('updated user: ' + JSON.stringify(result));
      //     return done(null, result);
      //   }
      // });
    });
  }));

  // console.log('client id: ' + configIds.jawboneAuth.clientID);
  // console.log('client secret: ' + configIds.jawboneAuth.clientSecret);
  // console.log('auth url: ' + configIds.jawboneAuth.authorizationURL);
  // console.log('token url: ' + configIds.jawboneAuth.tokenURL);
  // console.log('cb url: ' + configIds.jawboneAuth.callbackURL);

	// passport.use('jawbone', new JawboneStrategy({
	//   clientID: configIds.jawboneAuth.clientID,
	//   clientSecret: configIds.jawboneAuth.clientSecret,
	//   authorizationURL: configIds.jawboneAuth.authorizationURL,
	//   tokenURL: configIds.jawboneAuth.tokenURL,
	//   callbackURL: configIds.jawboneAuth.callbackURL,
 //    passReqToCallback: true
	// }, function(req, token, refreshToken, profile, done) {

	//   var options = {
	//     access_token: token,
	//     client_id: configIds.jawboneAuth.clientID,
	//     client_secret: configIds.jawboneAuth.clientSecret
	//   };

	//   //up = require('jawbone-up')(options);
 //    req.user.jawboneData = req.user.jawboneData || {};
 //    req.user.jawboneData.access_token = token;
 //    req.user.jawboneData.refresh_token = refreshToken;

 //    console.log('Here or what? AUTHENTICATE WITH JAWBONE');

 //    // get the user's jawbone profile - pain in the ass this was't returned in their profile above!
 //    jawboneMgr.profile(req.user, function(profileErr, profileResult) {
 //      if(profileErr) {
 //        console.log('error getting the user profile: ' + profileErr);
 //        return done(profileErr);
 //      }

 //      //console.log('got the user profile: ' + JSON.stringify(profileResult));
  
 //      // fill in the profile fields
 //      req.user.jawboneData.jawboneId = profileResult.data.xid;
  
 //      // we may not want to store these for privacy reasons
 //      req.user.profile = req.user.profile || {};
 //      req.user.profile.weight = profileResult.data.weight;
 //      req.user.profile.img = profileResult.data.image;
 //      req.user.profile.first = profileResult.data.first;
 //      req.user.profile.last = profileResult.data.last;
 //      req.user.profile.height = profileResult.data.height;
 //      req.user.profile.gender = profileResult.data.gender;

 //      // update the user
 //      user.update(req.user.email, req.user, function(updateErr, result) {
 //        if(updateErr) {
 //          console.log('error updating user: ' + updateErr);
 //          return done(updateErr);
 //        } else {
 //          console.log('updated user: ' + JSON.stringify(result));
 //          return done(null, result);
 //        }
 //      });
 //    });
	// }));
}
