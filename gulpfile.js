const rhythmmeister = require('./index');
const functions = require('./functions');
const gulp = require('gulp');
const postcss = require('gulp-postcss');
const browserSync = require('browser-sync').create();
const ava = require('gulp-ava');

gulp.task('serve', ['css', 'test'], () => {
    browserSync.init({
        server: ['./dest', './src']
    });

    gulp.watch('./src/*.html').on('change', browserSync.reload);
    gulp.watch('./src/*.js').on('change', browserSync.reload);

    gulp.watch(['./src/*.css'], ['css', 'test']);
    gulp.watch(['./test/*.js'], ['test']);
    gulp.watch(['./font-presets.json'], ['css', 'test']);
});

gulp.task('css', () => {
    functions.purgeCache('./font-presets');
    var fontPresets = require('./font-presets');

    var processors = [
        rhythmmeister(fontPresets)
    ];

    return gulp.src('./src/*.css')
    .pipe(postcss(processors))
    .pipe(gulp.dest('./dest'))
    .pipe(browserSync.stream());
});

gulp.task('test', () => {
    return gulp.src('test/**/*.js')
    .pipe(ava({verbose: true}));
});

gulp.task('default', ['serve']);
