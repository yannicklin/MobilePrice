/// <binding BeforeBuild='beforeBuild' />
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'gulp.*', 'lazypipe', 'del'],
    replaceString: /\bgulp[\-.]/
});

var jshintProcess  = plugins.lazypipe()
    .pipe(plugins.jshint)
    .pipe(plugins.jshint.reporter)
    .pipe(plugins.jshint.reporter, 'fail');

gulp.task("default", function () {
    return gulp.src('index-gulp.html')
        .pipe(plugins.rename("index.html"))
        .pipe(plugins.useref({}))
        .pipe(plugins.if('*.js', plugins.ngAnnotate()))
        .pipe(plugins.if('*.js', plugins.uglify()))
        .pipe(plugins.if('*.css', plugins.sourcemaps.init()))
        .pipe(plugins.if('*.css', plugins.cleanCss({ keepSpecialComments: 0 })))
        .pipe(plugins.if('*.css', plugins.sourcemaps.write()))
        .pipe(gulp.dest(''));
});