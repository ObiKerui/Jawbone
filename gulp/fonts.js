'use strict';

var path = require('path');
var gulp = require('gulp');
var print = require('gulp-print');
var conf = require('./conf');
var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files']
});


//-----------------------------------------------
//  FONTS TASK - PROCESS fonts
//-----------------------------------------------
gulp.task('fonts', function () {

	// retrieve font files from bower imports and place in temp (bootstrap fonts etc)
	return gulp.src('./bower_components/**/*.{eot,svg,ttf,woff,woff2}')
		.pipe($.flatten())
		.pipe(gulp.dest(path.join(conf.paths.tmp, '/fonts/')));
});

//-----------------------------------------------
//  FONTS TASK - PROCESS FONTS FOR DISTRIBUTION
//-----------------------------------------------
gulp.task('dist-fonts', ['build'], function() {

	// get fonts in tmp/fonts
	var fonts = path.join(conf.paths.tmp, '/fonts/*');
	
	// place them in dist directory
	return gulp.src(fonts)
		.pipe(gulp.dest(path.join(conf.paths.dist, '/fonts/')));
})
