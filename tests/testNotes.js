var async = require('async');
var assert = require('assert');
var Notes = require('../models/jbNote');
var fs = require('fs');

function handleCallback(msg, action, err, result, cb) {
	if(err) {
		console.log(msg, err);
		cb(err);
	} else {
		console.log('success for action: %s > Result: %s', action, JSON.stringify(result));
		cb(null, result);
	}
}

function createNotesContainer(cb) {
	Notes.createNotesContainer('hello', function(err, result) {
		handleCallback('createNoteContainer %s', 'creation', err, result, cb);
	})
}

function getNotesContainer(prevResult, cb) {
	Notes.getNotesContainer('hello', function(err, retrieved) {
		handleCallback('getNotesContainer %s', 'retrieval', err, retrieved, cb);
	});	
}

function createNote(container, cb) {
	var note = {
	    creator: 'jonah',
	    text: 'some text for the note'		
	};

	Notes.createNote(container.key, note, function(err, retrieved) {
		//handleCallback('getNotesContainer %s', 'retrieval', err, retrieved, cb);
		cb(null, container);
	});	
}

function getNotes(container, cb) {
	Notes.allNotes(container.key, function(err, retrieved) {
		handleCallback('getNotes %s', 'retrieval', err, retrieved, cb);
	});	
}

function removeNotesContainer(prevResult, cb) {
	Notes.removeNotesContainer('hello', function(err, result) {
		handleCallback('removeNotesContainer %s', 'removal', err, result, cb);
	});
}

function runTest() {
	async.waterfall([		
		createNotesContainer,
		getNotesContainer,
		createNote,
		getNotes
		//removeNotesContainer
	], function(err, results) {
		if(err) {
			console.log('error in notes test: ' + err);
		} else {
			console.log('success in notes test: ' + JSON.stringify(results));
		}
	});	
}

runTest();