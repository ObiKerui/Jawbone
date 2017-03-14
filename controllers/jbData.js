var JBDataModel = require('../models/user').JBData;
var Groups = require('../models/jbGroup');

// var ErrorHandler = require('./error-handler');

var JBData = {
 
	getSleeps: function(req, res) {

	    var params = {
	    	user : req.query.user,
	      	max : req.query.max,
	      	offset : req.query.offset,
	      	sortBy : req.query.sortBy
	    };

	    // console.log('sleeps max : ' + params.max + ' offset: ' + params.offset + ' sortBy: ' + params.sortBy);

	    JBDataModel.sleeps(req.user, params, function(err, sleeps) {
	      if(err) {
	        return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
	      }
	      res.json(sleeps);
	    });
	},

	getTrends: function(req, res) {

	    var params = {
	    	user : req.query.user,
	      	max : req.query.max,
	      	offset : req.query.offset,
	      	sortBy : req.query.sortBy
	    };

	    // console.log('trends max : ' + params.max + ' offset: ' + params.offset + ' sortBy: ' + params.sortBy);

	    JBDataModel.trends(req.user, params, function(err, trends) {
	      if(err) {
	        return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
	      }
	      res.json(trends);
	    });
	},

	getPatients : function(req, res) {

	    var params = {
	    	user : req.query.user,
	      	max : req.query.max,
	      	offset : req.query.offset,
	      	sortBy : req.query.sortBy
	    };

	    console.log('get patients called: ');
	    // console.log('patients max : ' + params.max + ' offset: ' + params.offset + ' sortBy: ' + params.sortBy);
	    // console.log('jb patients model: ' + JSON.stringify(JBDataModel));

	    var id = req.user.groups[0] || null;
    	Groups.get(id, function(err, group) {
	    	if(err) {
	        	return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
	    	}

	        JBDataModel.patients(group, params, function(patientsErr, patients) {
	      		if(patientsErr) {
	      			return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
	      		}
	      		res.status(200).json(patients);
	        });      
	    });
	}
};
 
module.exports = JBData;