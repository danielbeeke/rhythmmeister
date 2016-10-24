const rhythmmeister = require('./index');
const gulp = require('gulp');
const postcss = require('gulp-postcss');
const browserSync = require('browser-sync').create();
const ava = require('gulp-ava');

gulp.task('serve', ['css', 'test'], () => {
    browserSync.init({
        server: ['./dest', './test-site']
    });

    gulp.watch('./test-site/*.html').on('change', browserSync.reload);
    gulp.watch('./test-site/*.js').on('change', browserSync.reload);

    gulp.watch(['./test-site/*.css'], ['css', 'test']);
    gulp.watch(['./test/*.js'], ['test']);
    gulp.watch(['./font-presets.json'], ['css', 'test']);
});

gulp.task('css', () => {
    var fontPresets = rhythmmeister.load('./font-presets');

    var processors = [
        rhythmmeister.processor(fontPresets)
    ];

    return gulp.src('./test-site/*.css')
    .pipe(postcss(processors))
    .pipe(gulp.dest('./dest'))
    .pipe(browserSync.stream());
});

gulp.task('test', () => {
    return gulp.src('test/**/*.js')
    .pipe(ava({verbose: true}));
});

gulp.task('default', ['serve']);
