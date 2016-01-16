var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cssnano = require('gulp-cssnano'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    del = require('del'),
    sourcemaps = require("gulp-sourcemaps");

gulp.task('styles', function () {
    return sass('src/scss/main.scss', {style: 'expanded'})
        .pipe(sourcemaps.init())
        .pipe(autoprefixer('last 2 version'))
        .pipe(rename({suffix: '.min'}))
        .pipe(cssnano())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('public/css'))
        .pipe(notify({message: 'Styles task complete'}));
});

gulp.task('scripts', function () {
    return gulp.src([
        "src/js/vendor/scopedQuerySelectorShim.js",
        "src/js/vendor/domParser.js",
        "src/js/so-form-validator/bootstrap.js",
        "src/js/so-form-validator/validators/validators.js",
        "src/js/so-form-validator/validators/messages.js",
        "src/js/so-form-validator/helper/dom-helper.js",
        "src/js/so-form-validator/helper/form-configurator.js",
        "src/js/so-form-validator/validator.js",
        "src/js/so-form-validator/display/error-renderer.js",
        "src/js/so-form-validator/so-form-validator.js",
    ])
        .pipe(sourcemaps.init())
        .pipe(concat('so-form-validator.js'))
        .pipe(gulp.dest('dist/js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/js'))
        .pipe(gulp.dest('public/js'))
        .pipe(notify({message: 'Scripts task complete'}));
});

gulp.task('clean', function () {
    return del(['dist/css', 'dist/js', 'dist/img']);
});

gulp.task('default', ['clean'], function () {
    gulp.start('styles', 'scripts');
});

gulp.task('watch', function () {
    gulp.start('default');
    // Watch .scss files
    gulp.watch('src/scss/**/*.scss', ['styles']);

    // Watch .js files
    gulp.watch('src/js/**/*.js', ['scripts']);
});