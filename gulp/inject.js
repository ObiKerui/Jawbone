'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');
var $ = require('gulp-load-plugins')();
var wiredep = require('wiredep').stream;
var _ = require('lodash');
var browserSync = require('browser-sync');


//-----------------------------------------------
//  INJECT RELOAD TASK - RELOAD AFTER BROWSER REFRESH
//-----------------------------------------------
gulp.task('inject-reload', ['inject'], function() {
  browserSync.reload();
});

//-----------------------------------------------
//  INJECT TASK - CREATE THE INDEX.HTML FILE from src/index.html
//  -pre-cond: the .tmp directory has been populated by other tasks
//-----------------------------------------------
gulp.task('inject', ['scripts', 'styles', 'partials'], function () {

  // retrieve css sheets from tmp/css but ignore vendor css sheets
  var injectStyles = gulp.src([
    path.join(conf.paths.tmp, '/css/*.css'),
    path.join('!' + conf.paths.tmp, '/css/vendor.css')
  ], { read: false });

  // retrieve js files from tmp/js
  var injectScripts = gulp.src([
    path.join(conf.paths.tmp, '/js/*.js'),
    // don't need this now
    path.join('!' + conf.paths.tmp, '/js/*.min.js')
  ]);

  // retrieve the template cache previously built 
  var partialsInjectFile = gulp.src(
    path.join(conf.paths.tmp, '/partials/templateCacheHtml.js'), 
    { read: false }
  );

  // define the markers used when reading src/index.html
  var partialsInjectOptions = {
    starttag: '<!-- inject:partials -->',
    ignorePath: path.join(conf.paths.tmp, '/'),
    addRootSlash: false
  };

  // set some options
  var injectOptions = {
    ignorePath: [conf.paths.src, path.join(conf.paths.tmp, '/')],
    addRootSlash: false
  };

  // this is our source index file
  var sourceIndex = path.join(conf.paths.src, '/index.html');

  return gulp.src(sourceIndex)
    .pipe($.inject(partialsInjectFile, partialsInjectOptions))
    .pipe($.inject(injectStyles, injectOptions))
    .pipe($.inject(injectScripts, injectOptions))
    .pipe(wiredep(_.extend({}, conf.wiredep)))
    .pipe(gulp.dest(path.join(conf.paths.tmp, '/')));
});

