'use strict';

var gulp = require('gulp');
var changed = require('gulp-changed');
var webserver = require('gulp-webserver');
var del = require('del');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var gulpif = require('gulp-if');
var ngAnnotate = require('gulp-ng-annotate');
var imagemin = require('gulp-imagemin');
var autoprefixer = require('gulp-autoprefixer');

var app = {
  dist: 'dist',
  src: 'src'
};
var dist = {
  css: app.dist + '/css',
  html: app.dist + '/html',
  js: app.dist + '/js',
  assets: app.dist + '/assets'
};
var src =  {
  index: app.src + '/index.html',
  html: app.src + '/html/**/*.html',
  styles: app.src + '/css/sass/**/*.scss',
  sass: app.src + '/css/sass/main.scss',
  css: app.src + '/css',
  js: app.src + '/js/**/*.js',
  assets: app.src + '/assets/**/*.*'
};

// copies changed html, css and asset files to the 'dist' folder
gulp.task('copy', ['copy:html', 'copy:assets'], function () {
  return gulp.src([app.src + '/*.*', '!' + src.index])
    .pipe(changed(app.dist))
    .pipe(gulp.dest(app.dist));
});

// copies changed html files to the 'dist/html' folder
gulp.task('copy:html', ['clean'], function () {
  return gulp.src(src.html)
    .pipe(changed(dist.html))
    .pipe(gulp.dest(dist.html));
});

// copies changed html files to the 'dist/html' folder
gulp.task('copy:assets', ['clean'], function () {
  return gulp.src(src.assets)
    .pipe(changed(dist.assets))
    .pipe(gulp.dest(dist.assets));
});

// deletes all files in the dist path
gulp.task('clean', function(cb) {
  del(app.dist, cb);
});

// compile sass files into main.css file
gulp.task('sass', ['clean'], function () {
  gulp.src(src.sass)
    .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(src.css));
});

// watch sass files and compile changed files
gulp.task('sass:watch', function () {
  gulp.watch(src.styles, ['sass']);
});

// handle javascript and css files in index.html
gulp.task('useref', ['clean', 'sass'], function () {
  var assets = useref.assets();

  return gulp.src(src.index)
    .pipe(assets)                        //concanate with gulp-useref
    .pipe(gulpif('*.js', uglify()))      //minify javascript
    .pipe(gulpif('*.js', ngAnnotate()))  //add angular dependency injections
    .pipe(gulpif('*.css', minifyCss()))  //minify css
    .pipe(rev())                         //add file revision hash to file names
    .pipe(assets.restore())
    .pipe(useref())
    .pipe(revReplace())                  //replace references to old file names
    .pipe(gulp.dest(app.dist));
});

// serve the 'src' dir
gulp.task('serve', ['sass', 'sass:watch'], function () {
  gulp.src(app.src)
    .pipe(webserver({
      port: 9000,
      livereload: true,
      open: true
    }));
});

// serve the 'dist' dir
gulp.task('serve:dist', function () {
  gulp.src(app.dist)
    .pipe(webserver({
      port: 9000,
      livereload: false,
      open: true
    }));
});

// build application to 'dist' folder
gulp.task('build', [
  'copy',
  'sass',
  'useref'
  ], function () {});
