var Notes = require('../models/jbNote');
var ErrorHandler = require('./error-handler');

var notes = {
 
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

    Notes.all(params, function(err, result) {
      if(err) {
        return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
      }
      console.log('return notes result: ' + JSON.stringify(result));
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

    Notes.allByUser(params, user, function(err, results) {
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

    Notes.allByUser(params, user, function(err, results) {
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
    Notes.get(id, function(err, result) {
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
    console.log('let us insert the owner: ');
    var usr = res.locals.user;

    console.log('create::body: ' + JSON.stringify(req.body, true, 2));

    Notes.create(req.body, usr, function(err, newObj) {
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
    //var usr = res.locals.user;
    var usr = {}; // temp for now
    var id = req.params.id; 

    console.log('body: ' + JSON.stringify(req.body, true, 2));
    console.log('id: ' + JSON.stringify(id, true, 2));    
    console.log('usr: ' + JSON.stringify(usr, true, 2));        

    Notes.update(req.body, id, function(err, updated) {
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

    Notes.remove(id, usr, function(err, removed) {
      if(err) {
        return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
      } 
      res.status(200).json(removed); 
    });
  }
};
  
module.exports = notes;