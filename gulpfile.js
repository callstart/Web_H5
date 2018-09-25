var gulp = require('gulp');
var browserify = require('gulp-browserify');
var clean = require('gulp-clean');
var del = require('del');
var minify = require('gulp-minify-css');
var rename = require('gulp-rename');
var rsync = require('gulp-rsync');
var uglify = require('gulp-uglify');
var rev = require('gulp-rev');
var revCollector = require('gulp-rev-collector');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
var minimist = require('minimist');
var gulpif = require('gulp-if');

// 默认环境
var deployedEnv = "dev";
// 默认环境编号
var deployedDock = "1";

// 清除打包目录
gulp.task('clean-code', function (cb) {
    return gulp.src(['./build'], {
            "read": false
        })
        .pipe(clean({
            "force": true
        }));
});

gulp.task('del-code', function (cb) {
    del(['./build'], cb);
});

// push image
gulp.task('image-copy', ['clean-code'], function () {
    deployedEnv = minimist(process.argv.slice(2)).env || "dev";
    deployedDock = minimist(process.argv.slice(2)).dock || "1";

    return gulp.src(['./{general,wechat}/**/*.{jpg,png,gif,webp}', './favicon.ico'])
        .pipe(
            rev()
        )
        .pipe(
            gulp.dest('./build/')
        )
        .pipe(
            rev.manifest()
        )
        .pipe(
            gulp.dest('./build/rev/imgages')
        );
});


// JS
// 打包 require
// 混淆代码
gulp.task('js-browserify-ugly', ['image-copy'], function () {
    return gulp.src('./{general,wechat}/**/*.js', {
            read: false
        })
        .pipe(
            browserify({
                insertGlobals: false
            })
        )
        .pipe(
            // 仅在测试环境时候进行压缩
            // gulpif(deployedEnv === 'beta', uglify())
            uglify()
        )
        .pipe(
            rev()
        )
        .pipe(
            gulp.dest('./build/')
        )
        .pipe(
            rev.manifest()
        )
        .pipe(
            gulp.dest('./build/rev/js')
        );
});

// CSS
// 压缩代码
// 合并import
gulp.task('css-minify', ['js-browserify-ugly'], function () {
    return gulp.src('./{general,wechat}/**/*.css')
        .pipe(
            minify({
                "advanced": false // set as 'clean-css' configuration API
            })
        )
        .pipe(
            rev()
        )
        .pipe(
            gulp.dest('./build/')
        )
        .pipe(
            rev.manifest()
        )
        .pipe(
            gulp.dest('./build/rev/css')
        );
});

// html 引用变更
// 压缩html
gulp.task('rev-html', ['css-minify'], function () {
    return gulp.src(['./build/rev/**/*.json', './{general,wechat}/**/*.html'])
        .pipe(
            revCollector({
                replaceReved: true
            })
        )
        .pipe(
            gulp.dest('./build/')
        );
});

/**
 * 同步代码
 * @param  --env [dev/beta] --dock [1/2/3]
 * @return STREAM
 */
gulp.task('sync', ['rev-html'], function () {
    // gulp.start('del-code');
});

// Static server
gulp.task('browser-sync', function () {
    var files = [
        "./**/*.html",
        "./**/*.css",
        "./**/*.js"
    ];

    browserSync.init(files, {
        server: {
            baseDir: "./"
        }
    });
});

gulp.task('default', ['browser-sync'], function () {});