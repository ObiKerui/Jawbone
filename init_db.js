var async = require('async');
var assert = require('assert');
var bcrypt = require('bcryptjs');
var Users = require('./models/user').User;
var UserCtrl = require('./models/user');
var Groups = require('./models/jbGroup');
var JBCtrl = require('./models/jawboneData');
var fs = require('fs');
var config = require('./config');

populateDB = function(dataFile, modelName, num, cb) {

	modelName.create(dataFile, function (err, result) {
	    if (err) {
	    	console.log('err: ' + err);
	    } else {
	    	cb(result);
	    }
	});
};


createPopulation = function(dataFile, modelName, num, onCompleteCB) {
	// first ensure there are no documents in the db
	modelName.remove(function(err, p){
	    if(err){ 
	        //throw err;
	        console.log('err removing model: ' + p);
	    } else{
	        console.log('No Of Documents deleted:' + p);
	        populateDB(dataFile, modelName, num, onCompleteCB);
	    }
	});	
}

hashPassword = function(plainPass) {
	return bcrypt.hashSync(plainPass, bcrypt.genSaltSync(10));
}

// createJBData = function() {
// 	return JSON.parse(fs.readFileSync('sampleJbData.json', 'utf8'));
// };

userData = [
	{ 'email' : 'craig.sharp@gmail.com', 'password' : hashPassword('pass'), 'roles' : ['ROLE_USER', 'ROLE_ADMIN'], 
		'stats' : { 'nbrPatients' : 0, 'nbrGroups' : 0}, 'groups' : [], 'jawboneData' : { 'jawboneId' : 'dummy1' }, 'profile' : { 'img' : null, 'first': 'Craig', 'last': 'Sharp', 'weight': '34', 'height': '1.88', 'gender': 'male' }}
	// { 'email' : 'craig.jones@gmail.com', 'password' : hashPassword('pass'), 'roles' : ['ROLE_USER', 'ROLE_ADMIN'], 
	// 	'stats' : { 'nbrPatients' : 0, 'nbrGroups' : 0}, 'groups' : [], 'jawboneData' : { 'jawboneId' : 'dummy1' }, 'profile' : { 'img' : null, 'first': 'Craig', 'last': 'Jones', 'weight': '34', 'height': '1.88', 'gender': 'male' }},
	// { 'email' : 'sarah.parker@gmail.com', 'password' : hashPassword('pass'), 'roles' : ['ROLE_USER'], 
	// 	'stats' : { 'nbrPatients' : 0, 'nbrGroups' : 0}, 'jawboneData' : { 'jawboneId' : 'dummy2' }, 'profile' : { 'img' : null, 'first': 'Sarah', 'last': 'Parker', 'weight': '84', 'height': '1.74', 'gender': 'female' }},
	// { 'email' : 'maria.johnson@gmail.com', 'password' : hashPassword('pass'), 'roles' : ['ROLE_USER'], 
	// 	'jawboneData' : { 'jawboneId' : 'dummy3' }, 'profile' : { 'img' : null, 'first': 'Maria', 'last': 'Johnson', 'weight': '77', 'height': '1.67', 'gender': 'female' }},
	// { 'email' : 'lisa.walker@gmail.com', 'password' : hashPassword('pass'), 'roles' : ['ROLE_USER'], 
	// 	'jawboneData' : { 'jawboneId' : 'dummy4' }, 'profile' : { 'img' : null, 'first': 'Lisa', 'last': 'Walker', 'weight': '90', 'height': '1.91', 'gender': 'female' }},
	// { 'email' : 'marko.raban@gmail.com', 'password' : hashPassword('pass'), 'roles' : ['ROLE_USER'], 
	// 	'jawboneData' : { 'jawboneId' : 'dummy5' }, 'profile' : { 'img' : null, 'first': 'Marko', 'last': 'Raban', 'weight': '92', 'height': '1.54', 'gender': 'male' }},
	// { 'email' : 'sarah.connor@gmail.com', 'password' : hashPassword('pass'), 'roles' : ['ROLE_USER'], 
	// 	'jawboneData' : { 'jawboneId' : 'dummy6' }, 'profile' : { 'img' : null, 'first': 'Sarah', 'last': 'Connor', 'weight': '83', 'height': '1.74', 'gender': 'female' }},
	// { 'email' : 'marisa.tomei@gmail.com', 'password' : hashPassword('pass'), 'roles' : ['ROLE_USER'], 
	// 	'jawboneData' : { 'jawboneId' : 'dummy7' }, 'profile' : { 'img' : null, 'first': 'Marisa', 'last': 'Tomei', 'weight': '77', 'height': '1.67', 'gender': 'female' }},
	// { 'email' : 'victoria.gee@gmail.com', 'password' : hashPassword('pass'), 'roles' : ['ROLE_USER'], 
	// 	'jawboneData' : { 'jawboneId' : 'dummy8' }, 'profile' : { 'img' : null, 'first': 'Victoria', 'last': 'Gee', 'weight': '90', 'height': '1.91', 'gender': 'female' }}
];

// groupMembers = [
// 	{ 'user' : null, 'joinDate' : Date.now(), 'addedBy' : null },
// 	{ 'user' : null, 'joinDate' : Date.now(), 'addedBy' : null },
// 	{ 'user' : null, 'joinDate' : Date.now(), 'addedBy' : null }		
// ]

adminsArr = [];
membersArr = [];

//--------------------------------------------------------------
// JAWBONE IDS OF ADMINISTRATORS
//--------------------------------------------------------------
// jboneAdminIds = [
// 	'-9VI7q6PJcoicKgQZ-kCGA',
// 	'-9VI7q6PJcrBConjPPsftA'
// ];

//--------------------------------------------------------------
// JAWBONE IDS OF PATIENTS
//--------------------------------------------------------------
jbonePatientIds = [
];

//--------------------------------------------------------------
// GROUPS TO CREATE UPON INIT
//--------------------------------------------------------------
groupData = [
	{ name : 'defaultGroup', 'description' : 'joined by default', 'creationDate' : Date.now(), type: 'default', 'admins' : [], 'members' : [], 'photo' : null }
//	{ name : 'Therapists', 'description' : 'therapy group', 'creationDate' : Date.now(), 'admins' : [], 'members' : [], 'photo' : null }
]

addGroupMembers = function(newGroups, users, cb) {

	async.each(newGroups, function(group, callback) {
		users.forEach(function(user) {
			group.members.push({
				user: user
			});
		});
		Groups.update(group, group._id, function(err, result) {
			if(err) {
				cb(err);
			}
		});
	}, function(err) {
		console.log('error adding users to group: ' + err);
	});

	// for(var i = 1; i < users.length; i++) {
	// 	newGroup.members.push({ user: users[i] });
	// }
	// Groups.update(newGroup, newGroup._id, function(err, result) {
	// 	if(err) {
	// 		console.log('error updating group member: ' + err);
	// 		cb(err);
	// 	} else {
	// 		cb(null, result);
	// 	}
	// });
}

makeGroups = function(users, cb) {

	console.log('create group with user: ' + JSON.stringify(users[0]));

	async.concat(groupData, function(elem, callback) {
		Groups.create(elem, users[0], function(err, newGroup) {
			if(err) {
				callback(err);
			} else {
				callback(null, newGroup);
			}
		});
	}, function(err, results) {
		cb(null, results);
	});
};

var createGroups = function(users, done) {

	async.waterfall([
		function(callback) {
			removeGroups(callback);
		},
		function(nbrRem, callback) {
			//console.log('nbr removed: ' + nbrRem);
			makeGroups(users, callback);
		},
		function(newGroups, callback) {
			//console.log('new group: ' + JSON.stringify(newGroup));
			addGroupMembers(newGroups, users, callback);			
		}
	], function(err, results) {
		done(err, results);
	});
};

// create 3 users and 3 comments
initialise = function() {
	createPopulation(userData, Users, userData.length, function(users) {
		createGroups(users, function(err, results) {
			//console.log('err: ' + err);
			//console.log('results: ' + JSON.stringify(results));
		});
	});
};

//--------------------------------------------------------------
// SET UP JAWBONE IDS
//--------------------------------------------------------------
removeJawboneIds = function(cb) {
	JBCtrl.removeIds(function(err, nbrRem) {
		if(err) {
			console.log('error removing jawbone ids: ' + err);
			cb(err);
		} else {
			console.log('removed jawbone ids: ' + JSON.stringify(nbrRem));
			cb(null, nbrRem);
		}
	});
};

//--------------------------------------------------------------
// SET UP JAWBONE IDS
//--------------------------------------------------------------
setUpJawboneIds = function(cb) {
	JBCtrl.getIds(function(err, authUsers, authAdmins) {
		if(err) {
			console.log('error getting jawboneIds: ' + err);
			return cb(err);
		} else if(authUsers === null) {
			JBCtrl.createIds(config.jboneAdminIds, config.jbonePatientIds, function(createErr, createdUsers, createdAdmins) {
				if(createErr) {
					console.log('error creating jawbone ids: ' + err);
					return cb(err);
				} else {
					console.log('created jawbone ids: %s %s', JSON.stringify(createdUsers), JSON.stringify(createdAdmins));
					return cb(null, createdUsers, createdAdmins);
				}
			});

		} else {
			console.log('ids exist : patients: %s admins: %s', JSON.stringify(authUsers), JSON.stringify(authAdmins));
			return cb(null, authUsers, authAdmins);
		}
	});
};

//--------------------------------------------------------------
// REMOVE GROUPS
//--------------------------------------------------------------
removeGroups = function(cb) {
	Groups.Group.remove(function(err, nbrRem) {
		if(err) {
			console.log('err: ' + err);
			cb(err);
		} else {
			cb(null, nbrRem);
		}
	});
};

removeDefaultGroup = function(cb) {
	Groups.remove({ type: 'default' }, function(err, defaultGroup) {
		if(err) {
			return cb(err);
		} else {
			return cb(null);
		}
	});
};

//--------------------------------------------------------------
// CREATE GROUPS
//--------------------------------------------------------------
createDefaultGroup = function(cb) {
	Groups.createDefaultGroup(function(err, newDefaultGroup) {
		if(err) {
			return cb(err);
		} else {
			return cb(null, newDefaultGroup);
		}
	});
};

//--------------------------------------------------------------
// GET ALL THE USERS IN THE SYSTEM
//--------------------------------------------------------------
getAllUsers = function(cb) {
	UserCtrl.getTotalUsers(function(errNbrUsers, nbr) {
		if(errNbrUsers) {
			return cb(errNbrUsers);
		} else {
			var params = {
				sortBy : 'jawboneData.jawboneId',
				offset : 0,
				max : nbr
			};

			UserCtrl.all(params, function(errGetAllUsers, users) {
				if(errGetAllUsers) {
					return cb(errGetAllUsers);
				} else {
					cb(null, users);
				}
			});			
		}
	});
};

//--------------------------------------------------------------
// ADD ALL USERS TO NEWLY CREATED DEFAULT GROUP
//--------------------------------------------------------------
populateDefaultGroup = function(defaultGroup, allUsers, cb) {
	async.each(allUsers.data, function(user, callback) {
		Groups.addMemberToDefault(user, function(err, result) {
			if(err) {
				return callback(err);
			} else {
				return callback(null);
			}
		});
	}, cb);
	// console.log('default group: ' + JSON.stringify(defaultGroup));
	// console.log('all users: ' + JSON.stringify(allUsers.data, true, 3));
	// cb(null);
};

//--------------------------------------------------------------
// INITIALISE THE DB
//--------------------------------------------------------------
newInitialiseDatabase = function() {
	async.waterfall([		
		function(callback) {
			setUpJawboneIds(callback);
		},
		function(users, admins, callback) {
			removeDefaultGroup(callback);
		},
		function(callback) {
			createDefaultGroup(callback);
		},
		function(defaultGroup, callback) {
			getAllUsers(function(err, users) {
				if(err) {
					callback(err);
				} else {
					populateDefaultGroup(defaultGroup, users, callback);					
				}
			});
		}
	], function(err, results) {
		if(err) {
			console.log('new initialise encountered error: ' + err);
		} else {
			console.log('new intialise completed: ' + results);			
		}	
	});
};

// call initialise
//initialise();
newInitialiseDatabase();

// run some tests
//require('./tests/testNotes');