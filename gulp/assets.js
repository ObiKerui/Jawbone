'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');
var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*']
});

//-----------------------------------------------
//  ASSETS TASK - PROCESS ASSETS
//-----------------------------------------------
gulp.task('assets', function () {
  var fileFilter = $.filter(function (file) {
    return file.stat.isFile();
  });

  // take all non html/css/js/scss files and place in dist (images etc)
  return gulp.src([
    path.join(conf.paths.src, '/**/*'),
    path.join('!' + conf.paths.src, '/**/*.{html,css,js,scss}')
  ])
    .pipe(fileFilter)
    .pipe(gulp.dest(path.join(conf.paths.dist, '/')));
});
