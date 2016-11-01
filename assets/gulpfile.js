// Gulp setup for Start Here front end boilerplate

// Load required plugins
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    runSequence  = require('run-sequence'),
    imagemin = require('gulp-imagemin'),
    concat = require('gulp-concat'),
    browserSync = require('browser-sync').create(),
    svgstore = require('gulp-svgstore'),
    svgmin = require('gulp-svgmin');

// File path vars
var paths = {
    scssSrc: 'sass/**/*.scss',
    imgSrc: 'images/**/*',
    svgSrc: 'svgs/*.svg'
}

// Setup browsersync
gulp.task('browser-sync', function() {
    browserSync.init({
        proxy: "mapscorps-frontend.dev"
    });
});

// Do the stuff!

// Sass compilation and output
gulp.task('styles', function() {
  return gulp.src(['sass/main.scss'])
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest('css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('css'))
    .pipe(browserSync.stream());
});

// Javascript concatenation
gulp.task('scripts', function() {
  return gulp.src(['js/libs/*.js', 'js/main.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(concat('site.js'))
    .pipe(gulp.dest('js/build'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('js/build'))
    .pipe(browserSync.stream());
});

// Compress images (must run glulp images manually)
gulp.task('images', function() {
  return gulp.src(paths.imgSrc)
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest('images'))
    .pipe(browserSync.stream());
});

// SVG time!
gulp.task('svgs', function() {
  return gulp.src(paths.svgSrc)
    .pipe(svgmin({
        plugins: [{
            removeViewBox: false
        }, {
            removeEmptyAttrs: false
        },{
            mergePaths: false
        },{
            cleanupIDs: false
        }]
    }))
    .pipe(gulp.dest('svgs/min'))
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(rename('svgs-defs.svg'))
    .pipe(gulp.dest('svgs/build'))
});

// Do the build
gulp.task('build', function(callback) {
  runSequence('styles',
              'scripts',
              ['images', 'svgs'],
              callback);
});

// Gulp watch
gulp.task('watch', function() {
  // Init BrowserSync
  browserSync.init({
    files: ['*.html', '*.php'],
    proxy: 'mapscorps-frontend.dev',
    notify: false,
    open: false
  });
  // Kick it off with a build
  gulp.start('build');
  // Watch sass files
  gulp.watch(paths.scssSrc, ['styles']);
  // Watch js files
  gulp.watch(['js/libs/*.js', 'js/main.js'], ['scripts']);
  // Watch SVGs
  gulp.watch(paths.svgSrc, ['svgs']);
});

// Make watch the default task
gulp.task('default', function() {
    gulp.start('build');
});