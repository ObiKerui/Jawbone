var db = require('../db');
var User = require('./user');
var moment = require('moment');
var Schema = db.Schema;

var jbGroupMemberSchema = new Schema({
  user : { type: Schema.Types.ObjectId, ref: 'User' },
  joinDate : { type: Date, required: true, default: Date.now() },
  addedBy : { type: Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

var jbGroupSchema = new Schema({
  name: { type: String, required: true, minlength: 0, maxlength: 40 },
  description: { type: String, required: false, minlength: 0, maxlength: 200 },
  creationDate: { type: Date, required: true, default: moment().format() },
  admins: [ jbGroupMemberSchema ],
  members: [ jbGroupMemberSchema ],
  photo: { data: Buffer, contentType: String, required: false },
  permissions: {
    canDelete : { type: Boolean, default: false },
    canEdit : { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// jbGroupSchema.pre('remove', function(next) {
//   // 'this' is the client being removed. Provide callbacks here if you want
//   // to be notified of the calls' result.
//   jbGroupMember.remove({_owner: this._id}).exec();
//   next();
// });

var Group = db.model('jbGroup', jbGroupSchema);

//
// Create new comment in your database and return its id
//
var create = function(newObj, userCreatedBy, cb) {
  var neObj = new Group(newObj);
  var groupMember = {
    user : userCreatedBy,
    joinDate : Date.now()
  };

  neObj.admins.push(groupMember);

  neObj.save(function (err, result) {
    if (err) {
  	 return cb(err);
    }

    User.addGroup(userCreatedBy, result, function(err, savedUser) {
      return cb(null, result);
    });
  });
};

//
//
//
var addMember = function(groupId, memberId, addedBy, cb) {
  var newGroupMember = {
    user : user,
    addedBy : addedBy
  };

  Group.findByIdAndUpdate(
    group._id,
    { $push: { members: newGroupMember }},
    { safe: true, upsert: true, new : true},
    function(err, result) {
      if(err) {
        console.log('error adding member to group: ' + err);
        return cb(err);            
      }
      return cb(null, result);
    }
  );
}

var removeMember = function(groupId, memberId, cb) {

  Group.findByIdAndUpdate(
    groupId, 
    { $pull: { members: { user : memberId }}}, 
    { safe: true, upsert: true, new: true}, 
    function(err, result) {
      if(err) {
        console.log('error removing member from group: ' + err);
        return cb(err);
      }
      return cb(null, result);
    }
  );
};

var update = function(UpdateObj, id, cb) {
	var upQuery = {_id : id };	
	Group.findOneAndUpdate(upQuery, UpdateObj, {new: true, upsert: true, setDefaultsOnInsert: true}, function(err, result) {
		if(err) {
			return cb(err);
		}
		return cb(null, result);		
	});
};

var updatePermissions = function(UpdateObj, id, permissions, cb) {
  // find the group > is this user an admin in the group > if not can't update permissions
  var upQuery = {_id : id };  
  var updated = { permissions : UpdateObj };
  Group.findOneAndUpdate(upQuery, updated, {new: true, upsert: true, setDefaultsOnInsert: true}, function(err, result) {
    if(err) {
      return cb(err);
    }
    return cb(null, result);    
  });
};

/**
* get a specified event
*/
var get = function(id, cb) {

    var q = Group.findOne({_id : id}).populate('members.user', '-jbdata').lean();
    q.exec(function(err, result) {
      if(err) {
      	return cb(err);
      }
      console.log('send result: ' + result);
      cb(null, result);
    });
};

var getDefault = function(cb) {
  var q = Group.findOne({name : 'default'}).lean();
  q.exec(function(err, result) {
    if(err) {
      return cb(err);
    }
    cb(null, result);
  })
};

/**
* get a list of event objects
*/
var all = function(params, cb) {

    var q = Group.find({}).sort(params.sortBy).skip(parseInt(params.offset)).limit(parseInt(params.max)).lean();
    var tq = Group.count();

    q.exec(function(err, results) {
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
            data: results
          });
      });
    });
};

// Get all comments by a particular user
var allByUser = function(params, userId, cb) {
  console.log('getting list of groups..');

  var filter = { _owner : userId };
  var q = Group.find(filter).sort(params.sortBy).skip(parseInt(params.offset)).limit(parseInt(params.max)).lean();
  var tq = Group.count(filter);

  q.exec(function(err, groups) {
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
          data: groups
        });
    });
  });
};

var remove = function(id, user, cb) {
    var q = Group.findOne({_id : id});
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

var members = function(groupId, params, cb) {

  var offset = parseInt(params.offset);
  var max = parseInt(parseInt(params.offset) + parseInt(params.max));
  var getGroup = Group.findOne({_id : groupId });

  // console.log('offset: ' + params.offset);
  // console.log('max: ' + max);
  
  var q = Group.findOne({_id : groupId}, { members: { $slice:[offset, max]}}).populate('members.user', '-jawboneData').lean();

  getGroup.exec(function(err, group) {
    q.exec(function(err, result) {
      console.log('was an err when getting group members: ' + JSON.stringify(err));
      console.log('result of group find in members req: ' + JSON.stringify(result, true, 3));

      if(err) {
        return cb(err);
      }

      cb(null, {
        total: group.members.length,
        max: params.max,
        offset: params.offset,
        sortBy: params.sortBy,
        data: result.members
      });    
    });    
  });
};

var admins = function(groupId, params, cb) {
  var offset = parseInt(params.offset);
  var max = parseInt(parseInt(params.offset) + parseInt(params.max));
  var getGroup = Group.findOne({_id : groupId });

  // console.log('offset: ' + params.offset);
  // console.log('max: ' + max);
  
  var q = Group.findOne({_id : groupId}, { admins: { $slice:[offset, max]}}).populate('admins.user', '-jawboneData').lean();

  getGroup.exec(function(err, group) {
    q.exec(function(err, result) {

      if(err) {
        return cb(err);
      }

      // console.log('result of group find in members req: ' + JSON.stringify(result, true, 3));
      cb(null, {
        total: group.admins.length,
        max: params.max,
        offset: params.offset,
        sortBy: params.sortBy,
        data: result.admins
      });    
    });    
  });
};

module.exports.Group = Group;
module.exports.create = create;
module.exports.get = get;
module.exports.getDefault = getDefault;
module.exports.all = all;
module.exports.allByUser = allByUser;
module.exports.remove = remove;
module.exports.update = update;
module.exports.addMember = addMember;
module.exports.removeMember = removeMember;
module.exports.allByUser = allByUser;
module.exports.members = members;
module.exports.admins = admins;
module.exports.updatePermissions = updatePermissions;