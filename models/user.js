var db = require('../db');
var bcrypt = require('bcryptjs');
var Schema = db.Schema;

var util = require('util');

var jawboneDataSchema = new Schema({
  jawboneId : { type: String, required: false, unique: false },
  access_token : { type: String, required: false },
  refresh_token : { type: String, required: false }
});

var statsSchema = new Schema({
  nbrGroups: { type: Number, required: false },
  nbrPatients: { type: Number, required: false }  
});

var profileSchema = new Schema({
  img: { data: Buffer, contentType: String, required: false },
  first: { type: String, required: false },
  last: { type: String, required: false },
  weight: { type: String, required: false },
  height: { type: String, required: false },   
  gender: { type: String, required: false }, 
  phone: { type: String, required: false }, 
  dateOfBirth: { type: Date, required: false },
  bio: { type: String, required: false },
  homepage: { type: String, required: false },
  timezone: { type: String, required: false },
  country: { type: String, required: false }    
});

/*
* User Schema
*/
var user = new Schema({
  email: { type: String, required: false, unique: false },
  password: { type: String, required: false, select: false },
  socialMediaUser : { type: String, required: false },  
  roles: [{ type: String, required: true }],
  groups: [{ type: Schema.Types.ObjectId, ref: 'JbGroup' }],
  notes: [{ type: Schema.Types.ObjectId, ref: 'JbNote' }], 
  jawboneData : jawboneDataSchema,
  stats : statsSchema,
  profile: profileSchema
}, {
  timestamps: true
});

/*
* User Schema
*/
// var user = new Schema({
//   email: { type: String, required: false, unique: false },
// 	password: { type: String, required: false, select: false },
//   socialMediaUser : { type: String, required: false },  
// 	roles: [{ type: String, required: true }],
//   groups: [{ type: Schema.Types.ObjectId, ref: 'JbGroup' }],
//   notes: [{ type: Schema.Types.ObjectId, ref: 'JbNote' }], 
//   jawboneData : {
//     jawboneId : { type: String, required: false, unique: false },
//     access_token : { type: String, required: false },
//     refresh_token : { type: String, required: false }
//   },
//   stats : {
//     nbrGroups: { type: Number, required: false },
//     nbrPatients: { type: Number, required: false }
//   },
// 	profile: {
// 		img: { data: Buffer, contentType: String, required: false },
// 		first: { type: String, required: false },
//     last: { type: String, required: false },
//     weight: { type: String, required: false },
//     height: { type: String, required: false },   
//     gender: { type: String, required: false }, 
// 		phone: { type: String, required: false },	
// 		dateOfBirth: { type: Date, required: false },
// 		bio: { type: String, required: false },
// 		homepage: { type: String, required: false },
// 		timezone: { type: String, required: false },
// 		country: { type: String, required: false }		
// 	}
// }, {
//   timestamps: true
// });

user.pre('remove', function(next) {
  // 'this' is the client being removed. Provide callbacks here if you want
  // to be notified of the calls' result.
  Group.remove({_owner: this._id}).exec();
  next();
});

user.post('findOneAndUpdate', function(doc) {
  var newStats = {
    nbrGroups: doc.groups.length,
    nbrPatients: 8
  };
  doc.stats = newStats;
  doc.save(function(err, result) {
    if(err) {
      console.log('error saving: ' + err);
    } else {
      console.log('saved');
    }
  });
});

// this doesn't work - sometimes $set is empty cos it wasn't the query
// user.post('findOneAndUpdate', function(doc) {

//   console.log('this doc: ' + JSON.stringify(doc));
//   console.log('this getupdate doc: ' + JSON.stringify(this.getUpdate()));

//   var newStats = {
//     nbrGroups: this.getUpdate().$set.groups.length,
//     nbrPatients: 0
//   };
//   this.findOneAndUpdate({},{ stats: newStats });
// });

/*
* User Model
*/
var User = db.model('User', user);

/*
* Create new user from Social Media (Facebook etc) in your database and return its id
*/
// var createSMUser = function(username, fullname, socialMedia, cb) {
  
//   var details = {
//     'username': username,
//     'socialMediaUser' : socialMedia,
//     'roles' : ['ROLE_USER'],
//     'profile' : {
//       'fullname': fullname
//     }
//   };

//   var newSMUser = new User(details);

//   newSMUser.save(function (err, result) {
//     if(err) {
//       cb(err);
//     } else {
//       cb(null, result);
//     }
//   });
// };

/*
* Create new user in the database and return its id
*/
// var create = function(prof, data, cb) {

//   var newProf = { img: prof.img, first: prof.first, last: prof.last, weight: prof.weight, height: prof.height, gender: prof.gender };
//   var neObj = new User({jawboneId : prof.xid, email: prof.email, password: prof.password, profile : newProf, jbdata : data});

//   bcrypt.hash(neObj.password, 10, function(err, hash) {
//     neObj.password = hash;
//     neObj.save(function (err, result) {
//       if (err) {
//         cb(err);
//       } else {
//           cb(null, result);
//       }
//     });
//   });
//   //console.log('create a new user: ' + JSON.stringify(neObj));
// };

var create = function(prof, jawboneData, roles, cb) {

  var newProf = { img: prof.img, first: prof.first, last: prof.last, weight: prof.weight, height: prof.height, gender: prof.gender };
  var newUser = new User({ profile : newProf, roles: roles, jawboneData : jawboneData });

  newUser.save(function(err, newSavedUser) {
    if(err) {
      cb(err);
    } else {
      cb(null, newSavedUser);
    }
  });

  // bcrypt.hash(neObj.password, 10, function(err, hash) {
  //   neObj.password = hash;
  //   neObj.save(function (err, result) {
  //     if (err) {
  //       cb(err);
  //     } else {
  //         cb(null, result);
  //     }
  //   });
  // });
  //console.log('create a new user: ' + JSON.stringify(neObj));
};

var update = function(id, updatedUser, cb) {
  var upQuery = { 'jawboneData.jawboneId' : id }; 
  User.findOneAndUpdate(upQuery, updatedUser, {new: true, upsert: true, setDefaultsOnInsert: true}, function(err, result) {
    if(err) {
      console.log('error updating user: ' + err);
      return cb(err);
    }
    console.log('udpated user: ' + result);
    return cb(null, result);    
  });  
};

var createRaw = function(email, pwd, cb) {
  var newUser = new User({email: email, password: pwd});
  bcrypt.hash(newUser.password, 10, function(err, hash) {
    newUser.password = hash;
    newUser.save(function(err, result) {
      if(err) {
        cb(err);
      } else {
        cb(null, result);
      }

    });
  });
};

/**
* get a specified user
*/
var get = function(id, cb) {

    var q = User.findOne({_id : id}).lean();
    q.exec(function(err, result) {
      if(err) {
        console.log('err is  : ' + err);
        return cb(err);
      }
      //console.log('send result from get function: ' + result);
      return cb(null, result);
    });
};

var getByJawboneId = function(jbId, cb) {
  var q = User.findOne({ 'jawboneData.jawboneId' : jbId }).lean();
  q.exec(function(err, result) {
    if(err) {
      return cb(err);
    }
    return cb(null, result);
  });
}

/**
* get a specified user by their email
*/
var getByEmail = function(email, cb) {
  var q = User.findOne({email: email}).select('+password').lean();
  q.exec(function(err, result) {
    if(err) {
      return cb(err);
    }
    console.log('return user: ' + JSON.stringify(result));
    return cb(null, result);
  });
};

/**
* get all users
*/
var all = function(params, cb) {

  var q = User.find({}).select('-jawboneData').sort(params.sortBy).skip(parseInt(params.offset)).limit(parseInt(params.max)).lean();
  var tq = User.count();

  q.exec(function(err, users) {
    if(err) {
      console.log('error with query: ' + err.toJSON());
      return cb(err);
    }

    tq.exec(function(err, count) {
      console.log('get count: ' + count);
      cb(null, {
        total: count,
        max: params.max,
        offset: params.offset,
        sortBy: params.sortBy,
        data: users
      });
    });
  });
};

// var update = function(email, newData, cb) {
//   // todo must belong to me - event should have owner field 
//   var upQuery = { email : email }; 
//   var update = newData;
//   User.findOneAndUpdate(upQuery, update, {new: true, upsert: true, setDefaultsOnInsert: true}, function(err, result) {
//     if(err) {
//       console.log('error updating user: ' + err);
//       return cb(err);
//     }
//     console.log('udpated user: ' + result);
//     return cb(null, result);    
//   });
// };

/*
* Remove user from database
*/
var remove = function(id, user, cb) {
    var q = User.findOne({_id : id});
    q.exec(function(err, result) {
      if(err) {
      	return cb(err);
      }
      if(!result) {
      }
      result.remove(function(removeErr, removed) {
      	if(removeErr) {
      		return cb(removeErr);
      	}
      	return cb(null, removed);
      })
    });
};

var hashPassword = function(password, cb) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

var comparePassword = function(user, password) {
  return bcrypt.compareSync(password, user.password);
};

//----------------------------------------------------
// ADD GROUP
//----------------------------------------------------
var addGroup = function(user, group, cb) {

  user.groups.push(group);
  User.findOneAndUpdate({ _id: user._id }, { $set: { groups: user.groups }}, { new: true }, function(err, savedResult) {
    if(err) {
      return cb(err);
    }
    console.log('updated user: ' + JSON.stringify(savedResult));
    return cb(null, savedResult);
  });
};

//----------------------------------------------------
// ADD NOTE
//----------------------------------------------------
var addNote = function(user, note, cb) {

  user.notes.push(note);
  User.findOneAndUpdate({ _id: user._id }, { $set: { notes: user.notes }}, { new: true }, function(err, savedResult) {
    if(err) {
      return cb(err);
    }
    console.log('updated user: ' + JSON.stringify(savedResult));
    return cb(null, savedResult);
  });
};

//----------------------------------------------------
// DISTRIBUTE JAWBONE CREDENTIALS
//----------------------------------------------------
var distributeJawboneCredentials = function(user, callback) {
  var jawboneCreds = user.jawboneData;
  console.log('jawbone data: ' + JSON.stringify(jawboneCreds));

  User.update({}, { $set:{jawboneData: jawboneCreds}}, { multi: true}, function(err, result) {
    if(err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
};

function extractSleeps(params, user) {
  var jbdata = user.jbdata || {};
  var activities = jbdata.activities || {};
  var sleepspart = activities[2] || [];

  return {
      total: sleepspart.items.length,
      max: params.max,
      offset: params.offset,
      sortBy: params.sortBy,
      data: sleepspart.items
    }
}

function extractTrends(params, user) {
  var jbdata = user.jbdata || {};
  var prof = jbdata.profile || {};      
  var trends = prof[3] || {};

  return {
      total: trends.length,
      max: params.max,
      offset: params.offset,
      sortBy: params.sortBy,
      data: trends.data
    }
}

var JBData = {

  sleeps : function(user, params, cb) {

    if(params.user) {
      get(params.user, function(err, user) {
        if(err) {
          return cb(err);
        } 
        cb(null, extractSleeps(params, user));
      });
    } else {
      cb(null, extractSleeps(params, user));
    }
  },

  trends : function(user, params, cb) {
    if(params.user) {
      get(params.user, function(err, user) {
        if(err) {
          return cb(err);
        } 
        cb(null, extractTrends(params, user));
      });
    } else {
      cb(null, extractTrends(params, user));
    }
  },

  patients : function(group, params, cb) {
    var q = Group.find({_id : group._id}, {members: { $slice:[0, 3]}});
    q.exec(function(err, result) {

      console.log('result of group find: ' + JSON.stringify(result, true, 3));
      cb(null, {
        total: group.members.length,
        max: params.max,
        offset: params.offset,
        sortBy: params.sortBy,
        data: group.members
      });    
    });    
  }
};

module.exports.User = User;
module.exports.create = create;
module.exports.createRaw = createRaw;
module.exports.JBData = JBData;
//module.exports.createSMUser = createSMUser;
module.exports.get = get;
module.exports.getByJawboneId = getByJawboneId;
module.exports.getByEmail = getByEmail;
module.exports.all = all;
module.exports.remove = remove;
module.exports.update = update;
module.exports.hashPassword = hashPassword;
module.exports.comparePassword = comparePassword;
module.exports.addGroup = addGroup;
module.exports.addNote = addNote;
module.exports.distributeJawboneCredentials = distributeJawboneCredentials;
