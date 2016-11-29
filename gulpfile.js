const gulp = require('gulp');
const ava = require('gulp-ava');

gulp.task('test', () => {
    return gulp.src('test/**/*.js')
    .pipe(ava({verbose: true}));
});

gulp.task('default', ['test']);
