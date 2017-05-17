var Groups = require('../models/jbGroup');
var ErrorHandler = require('./error-handler');


var groups = {
 
  /**
   * get a list of event objects
   */
  getAll: function(req, res) {
    //console.log('request for groups from user: ' + res.locals.user.username);

    var params = {
      max : req.query.max,
      offset : req.query.offset,
      sortBy : req.query.sortBy
    };

    //console.log('max : ' + params.max + ' offset: ' + params.offset + ' sortBy: ' + params.sortBy);

    Groups.all(params, function(err, result) {
      if(err) {
        return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
      }
      res.json(result);
    });
  },

   /**
   * get a list of event objects
   */
  getAllByCurrentUser: function(req, res) {
    var user = res.locals.user;

    var params = {
      max : req.query.max,
      offset : req.query.offset,
      sortBy : req.query.sortBy
    };

    //console.log('get all events by user: ' + user);

    Groups.allByUser(params, user, function(err, results) {
      if(err) {
        return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
      }
      res.json(results);
    });    
  },

  /**
   * get a list of event objects
   */
  getAllByUser: function(req, res) {
    var user = res.locals.user.username;

    var params = {
      max : req.query.max,
      offset : req.query.offset,
      sortBy : req.query.sortBy
    };

    Groups.allByUser(params, user, function(err, results) {
      if(err) {
        return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
      }
      res.json(results);
    });
  },
 
  /**
   * Get a single event object
   */
  getOne: function(req, res) {
    var id = req.params.id;
    Groups.get(id, function(err, result) {
      if(err) {
        return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});        
      }
      res.status(200).json(result);
    });
  },
 
  /**
   * create a new event object
   */
  create: function(req, res) {
    var usr = res.locals.user;
    Groups.create(req.body, usr, function(err, newObj) {
      if(err) {
        return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
      }
      res.status(201).json(newObj);
    });
  },
 
  /**
   * update an event object
   */
  update: function(req, res) {
    var usr = res.locals.user;
    var id = req.params.id; 

    Groups.update(req.body, id, usr, function(err, updated) {
      if(err) {
        return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
      }
      res.status(200).json(updated);
    });
  },
 
  /**
   * delete an event object
   */
  remove: function(req, res) {    
    var id = req.params.id;
    var usr = res.locals.user;

    Groups.remove(id, usr, function(err, removed) {
      if(err) {
        return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
      } 
      res.status(200).json(removed); 
    });
  },

  getMembers: function(req, res) {
    var id = req.params.id;
    var usr = res.locals.user;

    var params = {
      max : req.query.max,
      offset : req.query.offset,
      sortBy : req.query.sortBy
    };

    Groups.members(id, params, function(err, members) {
      if(err) {
        return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
      }
      res.status(200).json(members);
    });
  },

  addMemberToGroup : function(req, res) {
    var groupId = req.params.groupId;
    var memberId = req.params.memberId;
    var usr = res.locals.user;

    console.log('add member to group...');
    console.log('group id: ' + groupId);
    console.log('member id: ' + memberId);

    Groups.addMember(groupId, memberId, function(err, result) {
      if(err) {
        return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
      }
      res.status(201).json(result);
    });
  },

  removeMemberFromGroup : function(req, res) {
    var groupId = req.params.groupId;
    var memberId = req.params.memberId;
    var usr = res.locals.user;

    console.log('remove member from group...');
    console.log('group id: ' + groupId);
    console.log('member id: ' + memberId);

    Groups.removeMember(groupId, memberId, function(err, result) {
      if(err) {
        return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
      }
      res.status(201).json(result);
    });
  },

  getAdmins: function(req, res) {
    var id = req.params.id;
    var usr = res.locals.user;

    var params = {
      max : req.query.max,
      offset : req.query.offset,
      sortBy : req.query.sortBy
    };

    Groups.admins(id, params, function(err, admins) {
      if(err) {
        return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
      }
      res.status(200).json(admins);
    });
  }

};
  
module.exports = groups;