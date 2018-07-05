const gulp = require('gulp');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const purify = require('gulp-purifycss');
const cssnano = require('gulp-cssnano');
const includer = require('gulp-htmlincluder');
const babelify = require('babelify');
const browserify = require('browserify');
const uglify = require('gulp-uglify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const rename = require('gulp-rename');
const awspublish = require('gulp-awspublish');
const parallelize = require("concurrent-transform");
const fs = require('fs');

const paths = {
  html: './src/html/**/*.html',
  builtHtml: [ './build/*.html' ],
  sass: './src/scss/**/*.scss',
  builtSass: './build/public/css/',
  js  : './src/js/**/*.js',
  jsEntry: './src/js/index.js',
  fonts: ['./src/public/fonts/*'],
  builtFonts: './build/public/fonts/',
  downloads: './src/public/downloads/*',
  builtDownloads: './build/public/downloads/',
  img : './src/public/images/**/*',
  builtImg : './build/public/images/',
  downloads: './src/public/downloads/**/*',
  deployAssets: './build/**/*',
}
const awsDeploySubDirectory = '/secure';

let env = 'dev';

gulp.task('set-prod', () => env = 'prod')

gulp.task('html', () => {
  let json = {
    jsSrc: (env === 'dev')
      ? 'public/bundle.js'
      : 'public/bundle.min.js',
  };

  gulp.src(paths.html)
    .pipe(includer({ jsonInput: json }))
    .pipe(gulp.dest('./build'));
})

gulp.task('sass', () => {
  return gulp.src(paths.sass)
    .pipe(sass({}))
    .pipe(gulp.dest(paths.builtSass))
})

gulp.task('purify-css', ['sass'], () => {
  return gulp.src('./build/public/atomic.css')
    .pipe(purify(paths.builtHtml))
    .pipe(cssnano())
    .pipe(gulp.dest(paths.builtSass))
})

gulp.task('js', () => {
  let pipeline = browserify({
      entries: ['./src/js/index.js']
    })
    .transform(babelify.configure({
      presets: ['env']
    }))
    .bundle()

  pipeline = (env === 'dev')
    ? pipeline.pipe(source("bundle.js"))
    : pipeline.pipe(source("bundle.min.js"))
        .pipe(buffer())
        .pipe(uglify())

  pipeline.pipe(gulp.dest('./build/public/'));

  return pipeline;
})

gulp.task('img', () => {
  gulp.src(paths.img)
    .pipe(gulp.dest(paths.builtImg))
})

gulp.task('fonts', () => {
  gulp.src(paths.fonts)
    .pipe(gulp.dest(paths.builtFonts))
})

gulp.task('downloads', () => {
  gulp.src(paths.downloads)
    .pipe(gulp.dest(paths.builtDownloads))
})


const aws = JSON.parse(fs.readFileSync('./aws.json'));
const publisher = awspublish.create(aws);

gulp.task('deploy', ['build'], () => {

  const headers = {
    'Cache-Control': 'max-age=315360000, no-transform, public'
  };

  return gulp.src(paths.deployAssets)
    .pipe(rename(path => {
      path.dirname = `${awsDeploySubDirectory}/${path.dirname === '.' ? '' : path.dirname }`;
    }))
    .pipe(parallelize(publisher.publish(headers), 10))
    .pipe(publisher.sync(awsDeploySubDirectory))
    .pipe(awspublish.reporter());
});

let prodBuild = ['set-prod', 'html', 'js', 'img', 'fonts', 'downloads', 'purify-css'];
gulp.task('build', prodBuild)

let defaultTasks = ['html', 'sass', 'js', 'img', 'fonts', 'downloads'];
gulp.task('default', defaultTasks);

gulp.task('watch', defaultTasks, () => {
  gulp.watch(paths.img, ['img']);
  gulp.watch(paths.html, ['html']);
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.js, ['js']);
  gulp.watch(paths.fonts, ['fonts']);
  gulp.watch(paths.downloads, ['downloads']);
})