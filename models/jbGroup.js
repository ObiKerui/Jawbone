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
  type: { type: String, default: 'regular' },
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

//------------------------------------------------------
//  GET THE DEFAULT GROUP IF IT EXISTS
//------------------------------------------------------
var getDefaultGroup = function(cb) {
  Group.findOne({ type: 'default'}, function(err, defGroup) {
    if(err) {
      return cb(err);
    } else {
      //console.log('The default group: ' + JSON.stringify(defGroup));
      return cb(null, defGroup);
    }
  });
};

//------------------------------------------------------
//  CREATE THE DEFAULT GROUP FOR ALL MEMBERS
//------------------------------------------------------
var createDefaultGroup = function(cb) {
  var defaultGroup = new Group({
    name: 'All Users',
    description: 'Created and joined by default',
    type: 'default'
  });

  defaultGroup.save(function(err, createdDefaultGroup) {
    if(err) {
      cb(err);
    } else {
      cb(null, createdDefaultGroup);
    }
  });
};

//------------------------------------------------------
//  ADD MEMBER TO DEFAULT GROUP
//------------------------------------------------------
var addMemberToDefault = function(member, cb) {
  getDefaultGroup(function(getDefGroupErr, defGroup) {
    if(getDefGroupErr) {
      console.log('error getting default group: ' + getDefGroupErr);
    } else {
      //console.log('got the default group: ' + JSON.stringify(defGroup));
      var groupMember = {
        user : member,
        joinDate : Date.now()
      };

      // see if member is already in group

      defGroup.members.push(groupMember);
      defGroup.save(function(saveErr, result) {
        if(saveErr) {
          console.log('error saving default group: ' + saveErr);
          return cb(saveErr);
        } else {
          //console.log('saved member to default group: ' + JSON.stringify(result));
          return cb(null, result);
        }
      })
    }
  });
}

//------------------------------------------------------
//  CREATE A NEW GROUP 
//------------------------------------------------------
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
  var q = Group.findOne({ type : 'default'}).lean();
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

var remove = function(filter, cb) {
    Group.remove(filter, function(err, result) {
      if(err) {
        return cb(err);
      } else {
        return cb(null, result);
      }
    });
    // var q = Group.findOne(filter);
    // q.exec(function(err, result) {
    //   if(err) {
    //   	return cb(err);
    //   }
    //   if(!result) {
    //   }
    //   result.remove(function(removeErr, removed) {
    //   	if(removeErr) {
    //   		return cb(removeErr);
    //   	}
    //   	return cb(null, removed);
    //   })
    // });
};

var members = function(groupId, params, cb) {

  var offset = parseInt(params.offset);
  var max = parseInt(parseInt(params.offset) + parseInt(params.max));

  var getGroup = Group.findOne({_id : groupId });
  //var getMembers = Group.findOne({_id : groupId}, { members: { $slice:[offset, max]}}).populate('members.user', '-jawboneData').lean();
  var getMembers = Group.findOne({_id : groupId}, { members: { $slice:[offset, max]}}).populate('members.user').lean();
  
  getGroup.exec(function(getGroupErr, group) { // to discover the size of members
    if(getGroupErr) {
      return cb(getGroupErr);
    } else if(group.members.length === 0) {
      return cb(null, {
        total: 0,
        max: params.max,
        offset: params.offset,
        sortBy: params.sortBy,
        data: []
      });
    } else {
      getMembers.exec(function(getMembersErr, result) {
        if(getMembersErr) {
          return cb(getMembersErr);
        } else {
          return cb(null, {
            total: group.members.length,
            max: params.max,
            offset: params.offset,
            sortBy: params.sortBy,
            data: result.members
          });
        }
      });
    }
  });
};

var admins = function(groupId, params, cb) {

  var offset = parseInt(params.offset);
  var max = parseInt(parseInt(params.offset) + parseInt(params.max));

  var getGroup = Group.findOne({_id : groupId });
  //var getMembers = Group.findOne({_id : groupId}, { admins: { $slice:[offset, max]}}).populate('admins.user', '-jawboneData').lean();
  var getMembers = Group.findOne({_id : groupId}, { admins: { $slice:[offset, max]}}).populate('admins.user').lean();
  
  getGroup.exec(function(getGroupErr, group) { // to discover the size of members
    if(getGroupErr) {
      return cb(getGroupErr);
    } else if(group.admins.length === 0) {
      return cb(null, {
        total: 0,
        max: params.max,
        offset: params.offset,
        sortBy: params.sortBy,
        data: []
      });
    } else {
      getMembers.exec(function(getMembersErr, result) {
        if(getMembersErr) {
          return cb(getMembersErr);
        } else {
          return cb(null, {
            total: group.admins.length,
            max: params.max,
            offset: params.offset,
            sortBy: params.sortBy,
            data: result.admins
          });
        }
      });
    }
  });
};

module.exports.Group = Group;
module.exports.getDefaultGroup = getDefaultGroup;
module.exports.createDefaultGroup = createDefaultGroup;
module.exports.addMemberToDefault = addMemberToDefault;
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