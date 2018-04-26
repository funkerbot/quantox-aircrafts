    var gulp = require('gulp');
    var sass = require('gulp-sass');
    var imagemin = require('gulp-imagemin');

    gulp.task('css', function () {
        return gulp.src('public/scss/style.scss')
            .pipe(sass())
            .pipe(minifyCSS())
            .pipe(gulp.dest('public/css/'))


    });

