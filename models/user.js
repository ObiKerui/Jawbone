var db = require('../db');
var bcrypt = require('bcryptjs');
var Schema = db.Schema;

/*
* User Schema
*/
var user = new Schema({
	jawboneId: { type: String, required: false, unique: true },
	password: { type: String, required: false, select: false },
  socialMediaUser : { type: String, required: false },  
	roles: [{ type: String, required: true }],
	jbdata: { type: Object, required: false },
	profile: {
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
	}
}, {
  timestamps: true
});

user.pre('remove', function(next) {
  // 'this' is the client being removed. Provide callbacks here if you want
  // to be notified of the calls' result.
  // Event.remove({_owner: this._id}).exec();
  // Group.remove({_owner: this._id}).exec();
  next();
});

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
var create = function(prof, data, cb) {

  var newProf = { img: prof.img, first: prof.first, last: prof.last, weight: prof.weight, height: prof.height, gender: prof.gender };
  var neObj = new User({jawboneId : prof.xid, profile : newProf, jbdata : data});

  //console.log('create a new user: ' + JSON.stringify(neObj));

  neObj.save(function (err, result) {
    if (err) {
      cb(err);
    } else {
      cb(null, result);
    }
  });
};

/**
* get a specified user
*/
var get = function(xid, cb) {

    var q = User.findOne({jawboneId : xid}).lean();
    q.exec(function(err, result) {
      if(err) {
        return cb(err);
      }
      //console.log('send result from get function: ' + result);
      return cb(null, result);
    });
};

/**
* get all users
*/
var all = function(params, cb) {

  var q = User.find({}).select('-jbdata').sort(params.sortBy).skip(parseInt(params.offset)).limit(parseInt(params.max)).lean();
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

/*
* Update existing user in your database and return its id
*/
var update = function(prof, newData, cb) {
	// todo must belong to me - event should have owner field 
	var upQuery = { jawboneId : prof.xid };	
  var updateProf = { img: prof.img, first: prof.first, last: prof.last, weight: prof.weight, height: prof.height, gender: prof.gender };
  var update = { $set:{ jbdata : newData, profile: updateProf } };
	User.findOneAndUpdate(upQuery, update, {new: true, upsert: true, setDefaultsOnInsert: true}, function(err, result) {
		if(err) {
      console.log('error updating user: ' + err);
			return cb(err);
		}
    console.log('udpated user: ' + result);
		return cb(null, result);		
	});
};

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

module.exports.User = User;
module.exports.create = create;
//module.exports.createSMUser = createSMUser;
module.exports.get = get;
module.exports.all = all;
module.exports.remove = remove;
module.exports.update = update;

