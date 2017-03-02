var path = require('path');
var gulp = require('gulp');
var browserSync = require('browser-sync');
var conf = require('./conf');
var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*']
});

//-----------------------------------------------
//  PARTIALS RELOAD TASK - RELOAD AFTER BROWSER REFRESH
//-----------------------------------------------
gulp.task('partials-reload', function() {
    return buildPartials()
      .pipe(browserSync.stream());
});

//-----------------------------------------------
//  PARTIALS TASK - BUILD PARTIALS
//-----------------------------------------------
gulp.task('partials', function () {
  return buildPartials();
});

//-----------------------------------------------
//  PARTIALS FUNCTION - Create templateCacheHtml.js
//-----------------------------------------------
function buildPartials() {
  // where to look for partials
  var partials = [
    path.join(conf.paths.src, '/app/**/*.html')
  ];

  // set some options
  var minOptions = {
    empty: true,
    spare: true,
    quotes: true
  };

  // template cache parameters
  var cacheParams = {
    module: conf.projectDetails.name,
    root: 'app'
  };

  // build the template cache from the partials
  return gulp.src(partials)
    .pipe($.minifyHtml(minOptions))
    .pipe($.angularTemplatecache('templateCacheHtml.js', cacheParams))
    .pipe(gulp.dest(path.join(conf.paths.tmp, '/partials/')));
}
