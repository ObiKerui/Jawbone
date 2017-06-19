var db = require('../db');
var User = require('./user');
var moment = require('moment');
var Schema = db.Schema;

//------------------------------------------------------
// NOTE SCHEMA FOR RECORDING A NOTE ABOUT A USER
//------------------------------------------------------
var jbNoteSchema = new Schema({
  owner: { type: String },
  creator: { type: String }, // UNIQUE jawbone ID who created this note
  text: { type: String, required: false, minlength: 0, maxlength: 200 },
  creationDate: { type: Date, required: true, default: moment().format() },
}, {
  timestamps: true
});

var Note = db.model('jbNote', jbNoteSchema);

//------------------------------------------------------
// NOTE CONTAINER SCHEMA FOR HOLDING A USER'S NOTES
//------------------------------------------------------
var jbNotesContainerSchema = new Schema({
  key: { type: String, unique: true }, // UNIQUE jawbone ID of user
  notes: [ { type: Schema.Types.ObjectId, ref: 'Note' }]
}, {
  timestamps: true
});

var NotesContainer = db.model('jbNotesContainer', jbNotesContainerSchema);

//------------------------------------------------------
// Create new comment in your database and return its id
//------------------------------------------------------
// var create = function(newObj, user, cb) {

//   console.log('new obj: ' + JSON.stringify(newObj));

//   User.getByEmail('craig.jones@gmail.com', function(err, u) {
//     if(err) {
//       return cb(err);
//     }
//     var neObj = new Note(newObj);
//     console.log('got user with id: ' + JSON.stringify(u._id));
//     neObj.owner = u._id;
//     neObj.save(function (err, result) {
//       if (err) {
//        return cb(err);
//       }
//       console.log('created the note: ' + JSON.stringify(result));
//       User.addNote(u, result, function(err, savedUser) {
//         return cb(null, result);
//       });
//     });
//   });

// };

//
// Update an existing note obj
//
// var update = function(UpdateObj, id, cb) {
// 	var upQuery = {_id : id };	
// 	Note.findOneAndUpdate(upQuery, UpdateObj, {new: true, upsert: true, setDefaultsOnInsert: true}, function(err, result) {
// 		if(err) {
// 			return cb(err);
// 		}
// 		return cb(null, result);		
// 	});
// };

// var get = function(id, cb) {

//     var q = Note.findOne({_id : id}).populate('owner', '-jbdata').lean();
//     q.exec(function(err, result) {
//       if(err) {
//       	return cb(err);
//       }
//       console.log('send result: ' + result);
//       cb(null, result);
//     });
// };

/**
* get a list of note objects
*/
// var all = function(params, cb) {

//     console.log('get all those notes');

//     var q = Note.find({}).sort(params.sortBy).skip(parseInt(params.offset)).limit(parseInt(params.max)).populate('owner').lean();
//     var tq = Note.count();

//     q.exec(function(err, results) {
//       if(err) {
//       	console.log('error with query: ' + err.toJSON());
//       	return cb(err);
//       }

//       console.log('results of notes is : ' + JSON.stringify(results));

//       tq.exec(function(err, count) {
//           cb(null, {
//             total: count,
//             max: params.max,
//             offset: params.offset,
//             sortBy: params.sortBy,
//             data: results
//           });
//       });
//     });
// };

// Get all comments by a particular user
// var allByUser = function(params, userId, cb) {
//   console.log('getting list of notes..');

//   var filter = { _owner : userId };
//   var q = Note.find(filter).populate('owner').sort(params.sortBy).skip(parseInt(params.offset)).limit(parseInt(params.max)).lean();
//   var tq = Note.count(filter);

//   q.exec(function(err, notes) {
//     if(err) {
//       console.log('error with query: ' + err.toJSON());
//       return cb(err);
//     }

//     console.log('results of notes is : ' + JSON.stringify(notes));

//     tq.exec(function(err, count) {
//         console.log('get count: ' + count);
//         cb(null, {
//           total: count,
//           max: params.max,
//           offset: params.offset,
//           sortBy: params.sortBy,
//           data: notes
//         });
//     });
//   });
// };

// var remove = function(id, user, cb) {
//     var q = Note.findOne({_id : id});
//     q.exec(function(err, result) {
//       if(err) {
//       	return cb(err);
//       }
//       if(!result) {
//       }
//       result.remove(function(removeErr, removed) {
//       	if(removeErr) {
//       		return cb(removeErr);
//       	}
//       	return cb(null, removed);
//       })
//     });
// };

// module.exports.Note = Note;
// module.exports.create = create;
// module.exports.get = get;
// module.exports.all = all;
// module.exports.allByUser = allByUser;
// module.exports.remove = remove;
// module.exports.update = update;

function paginate(model, params, cb) {
  model.find(params.filter)
    .select(params.select)
    .sort(params.sort)      
    .limit(params.perPage)
    .skip(params.perPage * params.page)
    .exec(function(err, result) {
      if(err) {
        cb(err);
      } else {
        model.count(params.filter).exec(function(errCount, count) {
          if(errCount) {
            cb(errCount);
          } else {
            cb(null, {
              data: result,
              page: params.page,
              pages: count / params.perPage
            });
          }
        })
      }
    });  
}

function paginateEmbedded(model, params, cb) {
  console.log('implement paginateEmbedded');
  cb();
}

function handleCallback(err, result, cb) {
  if(err) {
    cb(err);
  } else {
    cb(null, result);
  }
}

//-----------------------------------------------
//  CREATE A NEW NOTE GIVEN CONTAINER
//-----------------------------------------------  
function createNoteInContainer(container, note, cb) {
  var newNote = new Note({
    creator: note.creator,
    text: note.text,
    creationDate: note.date || moment().format()
  });

  container.notes.push(newNote);

  console.log('container to save: ' + JSON.stringify(container, true, 3));

  container.save(function(err, result) {
    handleCallback(err, result, cb);
  });
}

//-----------------------------------------------
//  CREATE A NEW NOTE GIVEN CONTAINER
//-----------------------------------------------  
function getNoteInContainer(container, noteId, cb) {
  container.populate('notes').exec(function(err, result) {
    console.log('results of get note in container: ' + JSON.stringify(result));
    handleCallback(err, result, cb);
  });
}

module.exports = {

  Note : Note,
  NotesContainer : NotesContainer,
  
  //-----------------------------------------------
  //  CREATE A NEW NOTES CONTAINER
  //-----------------------------------------------  
  createNotesContainer : function(key, cb) {
    console.log('called create note container...');
    var newNotesContainer = NotesContainer({
      key : key      
    });

    newNotesContainer.save(function(err, created) {
      handleCallback(err, created, cb);
    });
  },

  //-----------------------------------------------
  //  GET AN EXISTING NOTES CONTAINER
  //-----------------------------------------------  
  getNotesContainer : function(key, cb) {
    //var q = NotesContainer.findOne({ key : key }).lean();
    var q = NotesContainer.findOne({ key : key });
    q.exec(function(err, retrieved) {
      handleCallback(err, retrieved, cb);
    });
  },

  //-----------------------------------------------
  //  REMOVE AN EXISTING NOTES CONTAINER
  //-----------------------------------------------  
  removeNotesContainer : function(key, cb) {
    NotesContainer.remove({ key : key }, function(err, result) {
      handleCallback(err, result, cb);
    });
  },

  //-----------------------------------------------
  //  CREATE A NEW NOTE
  //-----------------------------------------------  
  createNote : function(containerId, params, cb) {
    this.getNotesContainer(containerId, function(retrieveErr, retrieved) {
      if(retrieveErr) {
        cb(retrieveErr);
      } else {
        createNoteInContainer(retrieved, params, cb);
      }
    });
  },

  //-----------------------------------------------
  //  GET NOTES
  //-----------------------------------------------  


  //-----------------------------------------------
  //  GET NOTES
  //-----------------------------------------------  
  allNotes : function(containerId, params, cb) {

    var params = {
      filter: params.filter,
      select: params.select,
      sort: params.sort,
      perPage: params.perPage,
      page: params.page
    };

    paginateModel(Notes, params, function(err, result) {
      handleCallback(err, result, cb);
    })
  },

  allByUser : function(containerId, creatorId, params, cb) {

  },

  getNote : function(containerId, noteId, cb) {
    this.getNotesContainer(containerId, function(retrieveErr, retrieved) {
      if(retrieveErr) {
        cb(retrieveErr);
      } else {
        getNoteInContainer(retrieved, noteId, cb);
      }
    });
  },

  updateNote : function(containerId, params, cb) {

  },

  removeNote : function(containerId, params, cb) {

  }
};


