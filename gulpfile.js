var gulp = require('gulp'),
   uglify = require('gulp-uglify'),
   autoprefix = require('gulp-autoprefixer');

gulp.task('minify', function () {
   gulp.src(['public/js/*.js', '!public/js/*.min.js'])
      .pipe(uglify())
      .pipe(gulp.dest('public/js/asset'))
});