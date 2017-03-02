var async = require('async');
var assert = require('assert');

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

userData = [
	{ 'jawboneId' : 'dummy1',  'roles' : ['ROLE_USER', 'ROLE_ADMIN'], 
		'profile' : { 'img' : null, 'first': 'Craig', 'last': 'Jones', 'weight': '34', 'height': '1.54', 'gender': 'male' }},
	{ 'jawboneId' : 'dummy2',  'roles' : ['ROLE_USER'], 
		'profile' : { 'img' : null, 'first': 'Sarah', 'last': 'Parker', 'weight': '84', 'height': '1.74', 'gender': 'female' }},
	{ 'jawboneId' : 'dummy3', 'roles' : ['ROLE_USER'], 
		'profile' : { 'img' : null, 'first': 'Maria', 'last': 'Johnson', 'weight': '77', 'height': '1.67', 'gender': 'female' }},
	{ 'jawboneId' : 'dummy4', 'roles' : ['ROLE_USER'], 
		'profile' : { 'img' : null, 'first': 'Lisa', 'last': 'Walker', 'weight': '90', 'height': '1.91', 'gender': 'female' }},
	{ 'jawboneId' : 'dummy5',  'roles' : ['ROLE_USER'], 
		'profile' : { 'img' : null, 'first': 'Marko', 'last': 'Raban', 'weight': '92', 'height': '1.54', 'gender': 'male' }},
	{ 'jawboneId' : 'dummy6',  'roles' : ['ROLE_USER'], 
		'profile' : { 'img' : null, 'first': 'Sarah', 'last': 'Connor', 'weight': '83', 'height': '1.74', 'gender': 'female' }},
	{ 'jawboneId' : 'dummy7', 'roles' : ['ROLE_USER'], 
		'profile' : { 'img' : null, 'first': 'Marisa', 'last': 'Tomei', 'weight': '77', 'height': '1.67', 'gender': 'female' }},
	{ 'jawboneId' : 'dummy8', 'roles' : ['ROLE_USER'], 
		'profile' : { 'img' : null, 'first': 'Victoria', 'last': 'Gee', 'weight': '90', 'height': '1.91', 'gender': 'female' }},
	{ 'jawboneId' : 'dummy9',  'roles' : ['ROLE_USER'], 
		'profile' : { 'img' : null, 'first': 'Jimmy', 'last': 'Jones', 'weight': '34', 'height': '1.54', 'gender': 'male' }},
	{ 'jawboneId' : 'dummy10',  'roles' : ['ROLE_USER'], 
		'profile' : { 'img' : null, 'first': 'Mustafa', 'last': 'Park', 'weight': '84', 'height': '1.74', 'gender': 'female' }},
	{ 'jawboneId' : 'dummy11', 'roles' : ['ROLE_USER'], 
		'profile' : { 'img' : null, 'first': 'Melissa', 'last': 'Carmichael', 'weight': '77', 'height': '1.67', 'gender': 'female' }},
	{ 'jawboneId' : 'dummy12', 'roles' : ['ROLE_USER'], 
		'profile' : { 'img' : null, 'first': 'Kim', 'last': 'Dee', 'weight': '90', 'height': '1.91', 'gender': 'female' }},
	{ 'jawboneId' : 'dummy13',  'roles' : ['ROLE_USER'], 
		'profile' : { 'img' : null, 'first': 'Blaise', 'last': 'Pascal', 'weight': '92', 'height': '1.54', 'gender': 'male' }},
	{ 'jawboneId' : 'dummy14',  'roles' : ['ROLE_USER'], 
		'profile' : { 'img' : null, 'first': 'Isaac', 'last': 'Connor', 'weight': '83', 'height': '1.74', 'gender': 'female' }},
	{ 'jawboneId' : 'dummy15', 'roles' : ['ROLE_USER'], 
		'profile' : { 'img' : null, 'first': 'George', 'last': 'Takei', 'weight': '77', 'height': '1.67', 'gender': 'female' }},
	{ 'jawboneId' : 'dummy16', 'roles' : ['ROLE_USER'], 
		'profile' : { 'img' : null, 'first': 'Geena', 'last': 'Gorman', 'weight': '90', 'height': '1.91', 'gender': 'female' }}

];

// create 3 users and 3 comments
initialise = function() {
	createPopulation(userData, Users, userData.length);
};

// call initialise
initialise();
