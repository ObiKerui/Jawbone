var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var config = require('./config');

mongoose.connect(config.DB_URL, function() {
	console.log('mongodb connected');
});

module.exports = mongoose;

