const { gulp, task, src, dest, series, parallel, watch } = require('gulp')
const babel = require('gulp-babel')
const cleanCss = require('gulp-clean-css')
const concat = require('gulp-concat')
const notify = require('gulp-notify')
const plumber = require('gulp-plumber')
const rename = require('gulp-rename')
const size = require('gulp-size')
const sourcemaps = require('gulp-sourcemaps')
const stylelint = require('gulp-stylelint')
const stylus = require('gulp-stylus')
const terser = require('gulp-terser')
const zip = require('gulp-zip')

const pkg = require('./package.json')
const rimraf = require('rimraf')

task('clean:destDir', (cb) => {
  return rimraf('dist', cb)
})

task('clean:destJsDir', (cb) => {
  return rimraf('dist/js', cb)
})

task('clean:destCssDir', (cb) => {
  return rimraf('dist/css', cb)
})

task('clean:zips', (cb) => {
  return rimraf('chichi-*.zip', cb)
})

task('build:js:all', () => {
  return src(['js/*.js'])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('chichi.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(size())
    .pipe(size({gzip: true}))
    .pipe(plumber.stop())
    .pipe(dest('dist/js'))
})

task('build:js:minify', () => {
  return src(['dist/js/chichi.js'])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(terser())
    .pipe(rename('chichi.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(size())
    .pipe(size({gzip: true}))
    .pipe(plumber.stop())
    .pipe(dest('dist/js'))
})

task('build:styl:all', () => {
  return src(['stylus/*.styl'])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(stylus())
    .pipe(sourcemaps.write('.'))
    .pipe(size())
    .pipe(size({gzip: true}))
    .pipe(plumber.stop())
    .pipe(dest('dist/css'))
})

task('build:styl:minify', () => {
  return src(['dist/css/chichi.css'])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(cleanCss())
    .pipe(rename('chichi.min.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(size())
    .pipe(size({gzip: true}))
    .pipe(plumber.stop())
    .pipe(dest('dist/css'))
})

task('zip', () => {
  return src(['./dist/**/*'])
    .pipe(zip(`chichi-v${pkg.version}-dist.zip`))
    .pipe(size())
    .pipe(dest('.'))
})

task('watch', () => {
  watch('stylus/**/*.styl', series(['clean:destCssDir','build:styl:all', 'build:styl:minify']))
  watch('js/**/*.js', series(['clean:destJsDir','build:js:all', 'build:js:minify']))
})

task('default', series(['clean:destDir','build:styl:all', 'build:styl:minify','build:js:all', 'build:js:minify']))
