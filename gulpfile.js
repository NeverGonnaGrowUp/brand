var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');
var minifyCss = require('gulp-minify-css');

var src = {
  less: path.resolve(__dirname, 'src', 'less', 'style.less'),
};

var dest = {
  css: path.resolve(__dirname, 'src', 'css'),
};

gulp.task('less', function () {
  gulp.src(src.less)
    .pipe(less())
    .pipe(minifyCss())
    .pipe(gulp.dest(dest.css));
});


gulp.task('watch', function () {
  gulp.watch(src.less, ['less']);
});