const gulp = require('gulp');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const cleanCss = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const del = require('del');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const gulpWatch = require('gulp-watch');
const svgmin = require('gulp-svgmin');
const svgSprite = require('gulp-svg-sprite');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');


const cssFiles = [
    './src/css/main.css',
    './src/css/media.css',
    './src/css/**/*.css'
];
const jfFiles = [
    './src/js/lib.js',
    './src/js/main.js',
    './src/js/**.*js'
];

function styles() {
    return gulp.src(cssFiles)

    .pipe(concat('style.css'))
    .pipe(autoprefixer({
        overrideBrowserslist: ['last 2 versions'],
        cascade: false
    }))
    .pipe(cleanCss({
        level: 2
    }))

    .pipe(gulp.dest('./build/css'))
    .pipe(browserSync.stream());
}

function scripts() {
    return gulp.src(jfFiles)

    .pipe(concat('script.js'))
    .pipe(uglify({
        toplevel: true
    }))

    .pipe(gulp.dest('./build/js'))
    .pipe(browserSync.stream());
}

function clean(){
    return del(['bulid/*'])
}

function scss() {
    return gulp.src('./src/scss/**/*.scss')

    .pipe(sourcemaps.init())
    .pipe(sass().on('erroe', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./src/css'))
}

function watch() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
    gulp.watch('./src/scss/**/*.scss', scss);
    gulp.watch('./src/css/**/*.css', styles);
    gulp.watch('./src/js/**/*.js', scripts);
    gulp.watch("./**/*.html").on('change', browserSync.reload);
}

gulp.task('svg', () => {
    return gulp.src('./src/icons/**/*.svg')
    
    .pipe(cheerio({
        run: function($) {
            $('[fill]').removeAttr('fill');
            $('[stroke]').removeAttr('stroke');
            $('[style]').removeAttr('style');
            $('[width]').removeAttr('width');
            $('[height]').removeAttr('height');
        },
        parserOptions: {xmlMode: true}
    }))
    .pipe(replace('&gt;', '>'))
    .pipe(svgSprite({
        mode: {
            symbol: {
                sprite: "sprite.svg"
            }
        }
    }))
    .pipe(gulp.dest('./build/svg'));
        
});

gulp.task('styles', styles);
gulp.task('scripts', scripts);
gulp.task('watch', watch);
gulp.task('build', gulp.series(clean, gulp.parallel(styles, scripts)));
gulp.task('dev', gulp.series('build', 'watch'));