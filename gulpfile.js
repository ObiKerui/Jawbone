/**
 *  Welcome to your gulpfile!
 *  The gulp tasks are splitted in several files in the gulp directory
 *  because putting all here was really too long
 */

'use strict';

var gulp = require('gulp');
var conf = require('./gulp/conf');
var path = require('path');
var wrench = require('wrench');
var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'del']
});

//-----------------------------------------------
//	READ IN THE GULP TASKS IN THE GULP DIRECTORY
//
//  This will load all js or coffee files in the 
//	gulp directory in order to load all gulp tasks
//-----------------------------------------------
wrench.readdirSyncRecursive('./gulp').filter(function(file) {
  return (/\.(js|coffee)$/i).test(file);
}).map(function(file) {
  require('./gulp/' + file);
});

//-----------------------------------------------
//	CLEAN TASK - CLEAR THE DIST DIRECTORY
//-----------------------------------------------
gulp.task('clean', function () {
  return $.del([
  	path.join(conf.paths.dist, '/'), 
  	path.join(conf.paths.tmp, '/')
  ]);
});

//-----------------------------------------------
//	MAIN BUILD TASK - RUN HTML, FONTS AND OTHER
//-----------------------------------------------
gulp.task('build', [
	'scripts', 
	'styles', 
	'partials', 
	'fonts',
	'inject'
]);

//-----------------------------------------------
//  DIST TASK - CREATE DISTRIBUTION
//  USING GULP-USEREF TO PROCESS TMP/INDEX -
//  useref examines html blocks in index file 
//-----------------------------------------------
gulp.task('dist', [
  'dist-main', 
  'dist-js-copy'
]);

//-----------------------------------------------
//  PARTIALS FUNCTION - Create templateCacheHtml.js
//-----------------------------------------------
gulp.task('dist-main', ['build', 'assets', 'dist-fonts'], function() {
  var sourceIndex = path.join(conf.paths.tmp, '/*.html');
  var jsFilter = $.filter('**/*.js', { restore: true });
  var cssFilter = $.filter('**/*.css', { restore: true });  
  var assets;

  return gulp.src(sourceIndex) // src is tmp/index.html
    .pipe(assets = $.useref.assets()) // filter to only assets
    .pipe(jsFilter) // filter to only js files
    .pipe($.ngAnnotate()) // annotate js
    .pipe($.uglify({ preserveComments: $.uglifySaveLicense })).on('error', conf.errorHandler('Uglify')) // uglify js
    .pipe(jsFilter.restore) // restore to all assets
    .pipe(cssFilter) // filter to only css  files
    .pipe($.minifyCss({ processImport: false })) // minify css
    .pipe(cssFilter.restore) // restore to all assets
    .pipe(assets.restore()) // restore to all files
    .pipe($.useref()) // what does this do again?
    .pipe(gulp.dest(path.join(conf.paths.dist, '/'))); // place into dist
});

//-----------------------------------------------
//  COPY NON-MINIFIED JS FROM TMP TO DIST
//-----------------------------------------------
gulp.task('dist-js-copy', ['dist-main'], function() {
  var src = [
    path.join(conf.paths.tmp, '/js/*.js'),
    path.join(conf.paths.tmp, '/partials/*.js')
  ];

  return gulp.src(src)
    .pipe($.concat(conf.projectDetails.jsFile))
    .pipe(gulp.dest(path.join(conf.paths.dist, '/scripts/')));
});

//-----------------------------------------------
//  DEFAULT - CLEAN PROJECT THEN BUILD 
//-----------------------------------------------
gulp.task('default', ['clean'], function () {
  gulp.start('build');
});
