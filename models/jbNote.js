var db = require('../db');
var User = require('./user');
var moment = require('moment');
var Schema = db.Schema;

var jbNoteSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  text: { type: String, required: false, minlength: 0, maxlength: 200 },
  creationDate: { type: Date, required: true, default: moment().format() },
}, {
  timestamps: true
});

var Note = db.model('jbNote', jbNoteSchema);

//
// Create new comment in your database and return its id
//
var create = function(newObj, user, cb) {

  console.log('new obj: ' + JSON.stringify(newObj));

  User.getByEmail('craig.jones@gmail.com', function(err, u) {
    if(err) {
      return cb(err);
    }
    var neObj = new Note(newObj);
    console.log('got user with id: ' + JSON.stringify(u._id));
    neObj.owner = u._id;
    neObj.save(function (err, result) {
      if (err) {
       return cb(err);
      }
      console.log('created the note: ' + JSON.stringify(result));
      User.addNote(u, result, function(err, savedUser) {
        return cb(null, result);
      });
    });
  });

};

//
// Update an existing note obj
//
var update = function(UpdateObj, id, cb) {
	var upQuery = {_id : id };	
	Note.findOneAndUpdate(upQuery, UpdateObj, {new: true, upsert: true, setDefaultsOnInsert: true}, function(err, result) {
		if(err) {
			return cb(err);
		}
		return cb(null, result);		
	});
};

/**
* get a specified note
*/
var get = function(id, cb) {

    var q = Note.findOne({_id : id}).populate('owner', '-jbdata').lean();
    q.exec(function(err, result) {
      if(err) {
      	return cb(err);
      }
      console.log('send result: ' + result);
      cb(null, result);
    });
};

/**
* get a list of note objects
*/
var all = function(params, cb) {

    console.log('get all those notes');

    var q = Note.find({}).sort(params.sortBy).skip(parseInt(params.offset)).limit(parseInt(params.max)).populate('owner').lean();
    var tq = Note.count();

    q.exec(function(err, results) {
      if(err) {
      	console.log('error with query: ' + err.toJSON());
      	return cb(err);
      }

      console.log('results of notes is : ' + JSON.stringify(results));

      tq.exec(function(err, count) {
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
  console.log('getting list of notes..');

  var filter = { _owner : userId };
  var q = Note.find(filter).populate('owner').sort(params.sortBy).skip(parseInt(params.offset)).limit(parseInt(params.max)).lean();
  var tq = Note.count(filter);

  q.exec(function(err, notes) {
    if(err) {
      console.log('error with query: ' + err.toJSON());
      return cb(err);
    }

    console.log('results of notes is : ' + JSON.stringify(notes));

    tq.exec(function(err, count) {
        console.log('get count: ' + count);
        cb(null, {
          total: count,
          max: params.max,
          offset: params.offset,
          sortBy: params.sortBy,
          data: notes
        });
    });
  });
};

var remove = function(id, user, cb) {
    var q = Note.findOne({_id : id});
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

module.exports.Note = Note;
module.exports.create = create;
module.exports.get = get;
module.exports.all = all;
module.exports.allByUser = allByUser;
module.exports.remove = remove;
module.exports.update = update;
