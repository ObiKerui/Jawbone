'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');
var browserSync = require('browser-sync');
var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'uglify-save-license']
});

gulp.task('scripts-reload', function() {
  	return buildScripts()
    	.pipe(browserSync.stream());
});

gulp.task('scripts', function() {
	return buildScripts();
});

//-----------------------------------------------
//  SCRIPTS FUNCTION
//-----------------------------------------------
function buildScripts() {
	// get all js files
	var srcFiles = [
		path.join(conf.paths.src, '/app/**/*.js')
	];

	return gulp.src(srcFiles)
		.pipe($.plumber())
		.pipe($.eslint())
		.pipe($.eslint.format())
		.pipe($.naturalSort())
		.pipe($.angularFilesort()).on('error', conf.errorHandler('AngularFilesort'))
		.pipe($.concat(conf.projectDetails.jsFile)) // place concatenated js in one file
		.pipe(gulp.dest(path.join(conf.paths.tmp,'/js/'))); // place in tmp/js
}
