var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    autoprefixer = require('gulp-autoprefixer'),
    rename = require('gulp-rename'),
    minfycss = require('gulp-minify-css');
gulp.task('js', function () {
   gulp.src(['public/js/*.js', '!public/js/*.min.js'])
      .pipe(uglify())
      .pipe(gulp.dest('public/js/asset'))
});

gulp.task('css', function () {
    gulp.src(['public/css/*.css'])
    .pipe(autoprefixer({ browsers: ['last 2 versions','last 2 Explorer versions', 'Firefox >= 20']}))
    .pipe(rename({suffix: '.min'}))
    .pipe(minfycss())
    .pipe(gulp.dest('public/css/asset'))
});

var watcher = gulp.watch('public/js/*.js',['js','css']);
watcher.on('change', function (e) {
    console.log('file change')
});
gulp.task('default',['js','css']);