'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');
var concat = require('gulp-concat');
var browserSync = require('browser-sync');
var $ = require('gulp-load-plugins')();
var wiredep = require('wiredep').stream;
var _ = require('lodash');


gulp.task('styles-reload', ['styles'], function() {
  return buildStyles()
    .pipe(browserSync.stream());
});

gulp.task('styles', ['build-bootstrap'], function() {
  return buildStyles();
});

gulp.task('build-bootstrap', function() {
  return buildBootstrap();
});

function buildBootstrap() {
  var sassOptions = {
    style: 'expanded'
  };

  var sassSource = [
    path.join(conf.paths.src, '/bootstrap.scss')
  ];

  return gulp.src(sassSource)
    .pipe(wiredep(_.extend({}, conf.wiredep)))
    .pipe($.sass(sassOptions)).on('error', conf.errorHandler('Sass'))
    .pipe($.autoprefixer()).on('error', conf.errorHandler('Autoprefixer'))
    .pipe($.replace('../../bower_components/bootstrap-sass/assets/fonts/bootstrap/', '../fonts/'))   
    .pipe(gulp.dest(path.join(conf.paths.tmp, '/css/')));
}

function buildStyles() {
  var sassOptions = {
    style: 'expanded'
  };

  var scssSource = [
    path.join(conf.paths.src, '/index.scss'),
    path.join(conf.paths.src, '/app/**/*.scss')
  ];

  return gulp.src(scssSource)
    .pipe(concat(conf.projectDetails.scssFile))
    .pipe(gulp.dest(path.join(conf.paths.tmp,'/scss/')))
    .pipe($.sass(sassOptions)).on('error', conf.errorHandler('Sass'))
    .pipe($.autoprefixer()).on('error', conf.errorHandler('Autoprefixer'))
    .pipe(gulp.dest(path.join(conf.paths.tmp,'/css/')));
}

