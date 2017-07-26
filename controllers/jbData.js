var User = require('../models/user');
var JBDataModel = require('../models/user').JBData;
var Groups = require('../models/jbGroup');
var Jawbone = require('../models/jawboneData');
var ErrorHandler = require('./error-handler');

// var ErrorHandler = require('./error-handler');

function getUser(req, cb) {
	if(req.params.id) {
		User.getByJawboneId(req.params.id, function(err, user) {
			if(err) {
				return cb(null);
			} else {
				return cb(null, user);
			}
		});
	} else {
		cb(null, req.user);
	}
}

var JBData = {
 
	getSleeps: function(req, res) {

	    var params = {
	    	user : req.query.user,
	      	max : req.query.max,
	      	offset : req.query.offset,
	      	sortBy : req.query.sortBy
	    };

	    console.log('request for sleeps id : ' + req.params.id);
	    getUser(req, function(err, user) {
	    	if(err) {
	    		return res.status(400).send({  message: ErrorHandler.getErrorMessage(err) });
	    	} else {
			    Jawbone.sleeps(user, params, function(err, sleeps) {
			    	if(err) {				
						return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
			    	} 
			    	//console.log('got sleeps: ' + JSON.stringify(sleeps));

			    	res.json(sleeps);
			    })
	    	}
	    });
	    // console.log('sleeps max : ' + params.max + ' offset: ' + params.offset + ' sortBy: ' + params.sortBy);

	   //  Jawbone.sleeps(req.user, params, function(err, sleeps) {
	   //  	if(err) {				
				// return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
	   //  	} 
	   //  	//console.log('got sleeps: ' + JSON.stringify(sleeps));

	   //  	res.json(sleeps);
	   //  })

	    // JBDataModel.sleeps(req.user, params, function(err, sleeps) {
	    //   if(err) {
	    //     return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
	    //   }
	    //   res.json(sleeps);
	    // });
	},

	getSleepTicks: function(req, res) {
		var sleepId = req.params.id;

		Jawbone.sleepTicks(req.user, sleepId, function(err, sleep) {
			if(err) {
				return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});	
			}
			//console.log('got sleep: ' + JSON.stringify(sleep));

			res.json(sleep);
		})
	},

	getSleepDetails: function(req, res) {
		var sleepId = req.params.id;

		Jawbone.sleepDetails(req.user, sleepId, function(err, sleep) {
			if(err) {
				return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});	
			}
			//console.log('got sleep: ' + JSON.stringify(sleep));

			res.json(sleep);
		})
	},

	getTrends: function(req, res) {

	    var params = {
	    	user : req.query.user,
	      	max : req.query.max,
	      	offset : req.query.offset,
	      	sortBy : req.query.sortBy
	    };

	    // console.log('trends max : ' + params.max + ' offset: ' + params.offset + ' sortBy: ' + params.sortBy);

	    Jawbone.trends(req.user, params, function(err, trends) {
	      if(err) {
	        return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
	      }
	      res.json(trends);
	    });
	},

	getCardiac : function(req, res) {
	    var params = {
	    	user : req.query.user,
	      	max : req.query.max,
	      	offset : req.query.offset,
	      	sortBy : req.query.sortBy
	    };

	    Jawbone.cardiac(req.user, params, function(err, cardiac) {
	      if(err) {
	        return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
	      }
	      res.json(cardiac);
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
	    		console.log('error getting group: ' + err);
	        	return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
	    	}

	        JBDataModel.patients(group, params, function(patientsErr, patients) {
	      		if(patientsErr) {
	      			return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
	      		}
	      		res.status(200).json(patients);
	        });      
	    });
	},

	getMoves: function(req, res) {

	    var params = {
	    	user : req.query.user,
	      	max : req.query.max,
	      	offset : req.query.offset,
	      	sortBy : req.query.sortBy
	    };

	    console.log('request for moves id : ' + req.params.id);
	    getUser(req, function(err, user) {
	    	if(err) {
	    		return res.status(400).send({  message: ErrorHandler.getErrorMessage(err) });
	    	} else {
			    Jawbone.moves(user, params, function(err, moves) {
			    	if(err) {				
						return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
			    	} 
			    	console.log('got moves: ' + JSON.stringify(moves));

			    	res.json(moves);
			    })
	    	}
	    });
	},

};
 
module.exports = JBData;