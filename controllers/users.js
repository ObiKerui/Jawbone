var User = require('../models/user');
// var ErrorHandler = require('./error-handler');

var users = {

	register : function(req, res) {
		console.log('register user ctrl ftn');
		//console.log('username: ' + req.locals.)
	},

	allRestricted: function(req, res) {
	    console.log('request for events from user: ' + res.locals.user.username);

	    var params = {
	      max : req.query.max,
	      offset : req.query.offset,
	      sortBy : req.query.sortBy
	    };

	    console.log('max : ' + params.max + ' offset: ' + params.offset + ' sortBy: ' + params.sortBy);

	    User.allRestricted(params, function(err, users) {
	      if(err) {
	        return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
	      }
	      res.json(users);
	    });
	},

	getCurrent: function(req, res) {
	    var usr = res.locals.user;
	    res.status(200).json(usr);
	},

	updateCurrent: function(req, res) {
	    var usr = res.locals.user;
	    console.log('current is: ' + usr.username);
	    User.updateCurrent(req.body, usr, function(err, updated) {
	      if(err) {
	        return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
	      }
	      res.status(200).json(updated);
	    });
	},

	deleteCurrent: function(req, res) {
	    var usr = res.locals.user;
	    User.removeCurrent(usr, function(err, removed) {
	      if(err) {
	        return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
	      } 
	      res.status(200).json(removed); 
	    });		
	},
 
	getAll: function(req, res) {
	    //console.log('request for events from user: ' + res.locals.user.username);

	    var params = {
	      max : req.query.max,
	      offset : req.query.offset,
	      sortBy : req.query.sortBy
	    };

	    console.log('max : ' + params.max + ' offset: ' + params.offset + ' sortBy: ' + params.sortBy);

	    User.all(params, function(err, users) {
	      if(err) {
	        return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
	      }
	      res.json(users);
	    });
	},

	getOne: function(req, res) {
	    var id = req.params.id;

	    console.log('user ctrl get one: id: ' + id);

	    User.get(id, function(err, result) {
	      if(err) {
	        return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});        
	      }
	      res.status(200).json(result);
	    });
	},

	create: function(req, res) {
	    var usr = res.locals.user;
	    User.create(req.body, usr, function(err, newObj) {
	      if(err) {
	        return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
	      }
	      res.status(201).json(newObj);
	    });
	},

	update: function(req, res) {
	    var usr = res.locals.user;
	    var id = req.params.id; 

	    User.update(req.body, id, usr, function(err, updated) {
	      if(err) {
	        return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
	      }
	      res.status(200).json(updated);
	    });
	},

	delete: function(req, res) {
	    var id = req.params.id;
	    var usr = res.locals.user;

	    User.remove(id, usr, function(err, removed) {
	      if(err) {
	        return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
	      } 
	      res.status(200).json(removed); 
	    });
	},
};
 
module.exports = users;