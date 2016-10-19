var gulp = require('gulp');
var postcss = require('gulp-postcss');
var rhythmmeister = require('./rhythmmeister');
var fontPresets = require('./font-presets');

gulp.task('css', function () {
    var processors = [
        rhythmmeister(fontPresets)
    ];
    return gulp.src('./src/*.css')
    .pipe(postcss(processors))
    .pipe(gulp.dest('./dest'));
});

gulp.task('serve', ['css'], function () {
    gulp.watch(['./src/*.css'], ['css']);
});