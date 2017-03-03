var async = require('async');
var assert = require('assert');
var bcrypt = require('bcryptjs');
var Users = require('./models/user').User;

populateDB = function(dataFile, modelName, num) {

	modelName.create(dataFile, function (err) {
	    if (err) {
	    	console.log('err: ' + err);
	    }
	});
};


createPopulation = function(dataFile, modelName, num) {
	// first ensure there are no documents in the db
	modelName.remove(function(err, p){
	    if(err){ 
	        //throw err;
	        console.log('err removing model: ' + p);
	    } else{
	        console.log('No Of Documents deleted:' + p);
	        populateDB(dataFile, modelName, num);
	    }
	});	
}

hashPassword = function(plainPass) {
	return bcrypt.hashSync(plainPass, bcrypt.genSaltSync(10));
}

userData = [
	{ 'jawboneId' : 'dummy1',  'email' : 'craig.jones@gmail.com', 'password' : hashPassword('pass'), 'roles' : ['ROLE_USER', 'ROLE_ADMIN'], 
		'profile' : { 'img' : null, 'first': 'Craig', 'last': 'Jones', 'weight': '34', 'height': '1.54', 'gender': 'male' }},
	{ 'jawboneId' : 'dummy2',  'email' : 'sarah.parker@gmail.com', 'password' : hashPassword('pass'), 'roles' : ['ROLE_USER'], 
		'profile' : { 'img' : null, 'first': 'Sarah', 'last': 'Parker', 'weight': '84', 'height': '1.74', 'gender': 'female' }},
	{ 'jawboneId' : 'dummy3',  'email' : 'maria.johnson@gmail.com', 'password' : hashPassword('pass'), 'roles' : ['ROLE_USER'], 
		'profile' : { 'img' : null, 'first': 'Maria', 'last': 'Johnson', 'weight': '77', 'height': '1.67', 'gender': 'female' }},
	{ 'jawboneId' : 'dummy4',  'email' : 'lisa.walker@gmail.com', 'password' : hashPassword('pass'), 'roles' : ['ROLE_USER'], 
		'profile' : { 'img' : null, 'first': 'Lisa', 'last': 'Walker', 'weight': '90', 'height': '1.91', 'gender': 'female' }},
	{ 'jawboneId' : 'dummy5',  'email' : 'marko.raban@gmail.com', 'password' : hashPassword('pass'), 'roles' : ['ROLE_USER'], 
		'profile' : { 'img' : null, 'first': 'Marko', 'last': 'Raban', 'weight': '92', 'height': '1.54', 'gender': 'male' }},
	{ 'jawboneId' : 'dummy6',  'email' : 'sarah.connor@gmail.com', 'password' : hashPassword('pass'), 'roles' : ['ROLE_USER'], 
		'profile' : { 'img' : null, 'first': 'Sarah', 'last': 'Connor', 'weight': '83', 'height': '1.74', 'gender': 'female' }},
	{ 'jawboneId' : 'dummy7',  'email' : 'marisa.tomei@gmail.com', 'password' : hashPassword('pass'), 'roles' : ['ROLE_USER'], 
		'profile' : { 'img' : null, 'first': 'Marisa', 'last': 'Tomei', 'weight': '77', 'height': '1.67', 'gender': 'female' }},
	{ 'jawboneId' : 'dummy8',  'email' : 'victoria.gee@gmail.com', 'password' : hashPassword('pass'), 'roles' : ['ROLE_USER'], 
		'profile' : { 'img' : null, 'first': 'Victoria', 'last': 'Gee', 'weight': '90', 'height': '1.91', 'gender': 'female' }},
	{ 'jawboneId' : 'dummy9',  'email' : 'jimmy.jones@gmail.com', 'password' : hashPassword('pass'), 'roles' : ['ROLE_USER'], 
		'profile' : { 'img' : null, 'first': 'Jimmy', 'last': 'Jones', 'weight': '34', 'height': '1.54', 'gender': 'male' }},
	{ 'jawboneId' : 'dummy10',  'email' : 'mustafa.park@gmail.com', 'password' : hashPassword('pass'), 'roles' : ['ROLE_USER'], 
		'profile' : { 'img' : null, 'first': 'Mustafa', 'last': 'Park', 'weight': '84', 'height': '1.74', 'gender': 'female' }},
	{ 'jawboneId' : 'dummy11',  'email' : 'melissa.carmichael@gmail.com', 'password' : hashPassword('pass'), 'roles' : ['ROLE_USER'], 
		'profile' : { 'img' : null, 'first': 'Melissa', 'last': 'Carmichael', 'weight': '77', 'height': '1.67', 'gender': 'female' }},
	{ 'jawboneId' : 'dummy12',  'email' : 'kim.dee@gmail.com', 'password' : hashPassword('pass'), 'roles' : ['ROLE_USER'], 
		'profile' : { 'img' : null, 'first': 'Kim', 'last': 'Dee', 'weight': '90', 'height': '1.91', 'gender': 'female' }},
	{ 'jawboneId' : 'dummy13',  'email' : 'blaise.pascal@gmail.com', 'password' : hashPassword('pass'), 'roles' : ['ROLE_USER'], 
		'profile' : { 'img' : null, 'first': 'Blaise', 'last': 'Pascal', 'weight': '92', 'height': '1.54', 'gender': 'male' }},
	{ 'jawboneId' : 'dummy14',  'email' : 'isaac.connor@gmail.com', 'password' : hashPassword('pass'), 'roles' : ['ROLE_USER'], 
		'profile' : { 'img' : null, 'first': 'Isaac', 'last': 'Connor', 'weight': '83', 'height': '1.74', 'gender': 'female' }},
	{ 'jawboneId' : 'dummy15',  'email' : 'george.takei@gmail.com', 'password' : hashPassword('pass'), 'roles' : ['ROLE_USER'], 
		'profile' : { 'img' : null, 'first': 'George', 'last': 'Takei', 'weight': '77', 'height': '1.67', 'gender': 'female' }},
	{ 'jawboneId' : 'dummy16',  'email' : 'geena.gorman@gmail.com', 'password' : hashPassword('pass'), 'roles' : ['ROLE_USER'], 
		'profile' : { 'img' : null, 'first': 'Geena', 'last': 'Gorman', 'weight': '90', 'height': '1.91', 'gender': 'female' }}

];

// create 3 users and 3 comments
initialise = function() {
	createPopulation(userData, Users, userData.length);
};

// call initialise
initialise();
