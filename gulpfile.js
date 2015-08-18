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
var minifyHtml = require('gulp-minify-html');
var gulpif = require('gulp-if');
var ngAnnotate = require('gulp-ng-annotate');
var imagemin = require('gulp-imagemin');
var autoprefixer = require('gulp-autoprefixer');
var gutil = require('gulp-util');
var debug = require('gulp-debug');
var filter = require('gulp-filter');
var eventStream = require('event-stream');

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

// copy changed html, css and asset files to the 'dist' folder
gulp.task('copy', ['copy:html', 'copy:assets', 'copy:custom'], function () {
  return gulp.src([app.src + '/*.*', '!' + src.index])
    .pipe(changed(app.dist))
    .pipe(gulp.dest(app.dist));
});

// copy changed html files to the 'dist/html' folder
gulp.task('copy:html', ['clean'], function () {
  return gulp.src(src.html)
    .pipe(changed(dist.html))
    .pipe(minifyHtml())
    .pipe(gulp.dest(dist.html));
});

// copy changed html files to the 'dist/html' folder
gulp.task('copy:assets', ['clean'], function () {
  return gulp.src(src.assets)
    .pipe(changed(dist.assets))
    .pipe(gulp.dest(dist.assets));
});

// copy miscellaneous files to the 'dist/html' folder
gulp.task('copy:custom', ['clean'], function () {
  var jstree = gulp.src(
    app.src + '/libs/bower/jstree/dist/themes/default/*.{png,gif}')
    .pipe(gulp.dest(dist.css));

  var bootstrap = gulp.src(
    app.src + '/libs/bower/bootstrap/dist/fonts/*')
    .pipe(gulp.dest(dist.css));

  var uiGrid = gulp.src([
    app.src + '/libs/bower/angular-ui-grid/ui-grid.ttf',
    app.src + '/libs/bower/angular-ui-grid/ui-grid.woff'
    ])
    .pipe(gulp.dest(dist.css));

  return eventStream.concat(jstree, bootstrap, uiGrid);
});

// delete all files in the dist path
gulp.task('clean', function(cb) {
  del(app.dist, cb);
});

// compile sass files into main.css file
gulp.task('sass', ['clean'], function () {
  gulp.src(src.sass)
    .pipe(sourcemaps.init())
    .pipe(autoprefixer())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(src.css));
});

// watch sass files and compile changed files
gulp.task('sass:watch', function () {
  gulp.watch(src.styles, ['sass']);
});

// handle javascript and css files in the index.html
gulp.task('useref', ['clean', 'sass'], function () {
  var assets = useref.assets();
  var jsFilter = filter('**/*.js', {restore: true});
  var cssFilter = filter('**/*.css', {restore: true});
  var htmlFilter = filter('*.html', {restore: true});

  return gulp.src(src.index)
    .pipe(assets)             //concatenate with gulp-useref

    .pipe(rev())
    .on('readable', function() {
      gutil.log('Updating file names with file revision hash...');
      })
    .on('end', function() {
      gutil.log('File revision renaming completed');
      })

    .pipe(jsFilter)

    .pipe(ngAnnotate())
    .on('readable', function() {
      gutil.log('Adding angular dependency annotations...');
      })
    .on('end', function() {
      gutil.log('Dependency annotation complete');
      })

    .pipe(uglify())
    .on('readable', function() {
      gutil.log('Uglifying javascript...');
      })
    .on('end', function() {
      gutil.log('Uglifying completed');
      })

    .pipe(jsFilter.restore)
    .pipe(cssFilter)

    .pipe(minifyCss())
    .on('readable', function() {
      gutil.log('Minifying css files...');
      })
    .on('end', function() {
      gutil.log('Css files minified');
      })

    .pipe(cssFilter.restore)

    .pipe(assets.restore())
    .pipe(useref())

    .pipe(revReplace())
    .on('readable', function() {
      gutil.log('Replacing references to old file names...');
      })
    .on('end', function() {
      gutil.log('References replaced');
      })

    .pipe(htmlFilter)
    .pipe(minifyHtml({
      empty: true,
      spare: true,
      conditionals: true,
      quotes: true
    }))
    .pipe(htmlFilter.restore)

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
