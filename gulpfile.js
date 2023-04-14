const Gulp = require('gulp');
const pump = require('pump');
const { series, parallel } = require('gulp');
const Ts = require('gulp-typescript');
const Sass = require('gulp-sass')(require('sass'));
const Srcmap = require('gulp-sourcemaps');
const Header = require('gulp-header');
const Inject = require('gulp-inject-string');
const Min = require('gulp-uglify-es').default;
const Fs = require('fs');
const pkg = require('./package.json');

const globs = {
    app: 'src/**/*.ts',
    meta: 'metadata.txt',
    style: 'sass/**/*.scss',
};

const path = {
    scripts: {
        dest: 'release/',
        name: `${pkg.name}.user.js`,
    },
    dev_scripts: {
        dest: 'build/',
        name: `${pkg.name}_dev.user.js`,
    },
};

const tsSettings = {
    strict: false,
    target: 'es2015',
    rootDir: 'src',
    forceConsistentCasingInFileNames: true,
    noImplicitReturns: false,
    noUnusedLocals: false,
    lib: ['dom', 'es6', 'es2016.array.include'],
};

let env = 'dev';

/** Returns a path object relative to the env */
const basePathEnv = () => {
    let pathObj = path.dev_scripts;
    pkg.env = '_dev';
    if (env === 'release') {
        pathObj = path.scripts;
        pkg.env = '';
    }
    return pathObj;
};

/** Returns the current timestamp */
const buildTime = () => {
    const mString = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];
    const now = new Date();
    const month = mString[now.getUTCMonth()];
    const day = now.getUTCDate();
    return `${month} ${day}`;
};

const errorCB = (err) => {
    if (err) console.error('Pipe Finished >>>', err);
};

/** Task to set the working Env to release */
const releaseEnv = () => {
    return new Promise((resolve) => {
        env = 'release';
        resolve();
    });
};

/** Task to minify the userscript */
const minify = () => {
    const loc = basePathEnv();
    return pump(Gulp.src(`${loc.dest}/${loc.name}`), Min(), Gulp.dest(loc.dest), (err) =>
        errorCB(err)
    );
};

/** Task to insert a userscript header from a file, with package.json info */
const insertHead = () => {
    const loc = basePathEnv();
    return pump(
        Gulp.src(`${loc.dest}/${loc.name}`),
        Header(Fs.readFileSync('metadata.txt', 'utf8'), { pkg: pkg }),
        Gulp.dest(loc.dest),
        (err) => errorCB(err)
    );
};

/** Task to convert the .ts files into a _dev.user.js file */
const procTS_dev = () => {
    const loc = basePathEnv();
    tsSettings.outFile = loc.name;
    const timestamp = buildTime();
    return pump(
        Gulp.src(globs.app, { base: 'src' }),
        // Start sourcemaps
        Srcmap.init(),
        // Inject information
        Inject.replace('##meta_timestamp##', timestamp),
        // Compile typescript
        Ts(tsSettings),
        // Write sourcemap
        Srcmap.write(),
        Gulp.dest(loc.dest),
        (err) => errorCB(err)
    );
};

/** Task to convert the .ts files into a .user.js file */
const procTS_release = () => {
    const loc = basePathEnv();
    tsSettings.outFile = loc.name;
    const timestamp = buildTime();
    return pump(
        Gulp.src(globs.app),
        Inject.replace('##meta_timestamp##', timestamp),
        Ts(tsSettings),
        Gulp.dest(loc.dest),
        (err) => errorCB(err)
    );
};

/** Task to convert .scss files into .css files */
const sass_dev = () => {
    const loc = basePathEnv();
    //* This returned a `new Promise` prior to switching to `pump()`
    return pump(
        Gulp.src(globs.style),
        Srcmap.init(),
        Sass.sync().on('error', Sass.logError),
        Srcmap.write(),
        Gulp.dest(loc.dest),
        (err) => errorCB(err)
    );
};

/** Task to convert .scss files into .min.css files */
const sass_release = () => {
    const loc = basePathEnv();
    //* This returned a `new Promise` prior to switching to `pump()`
    return pump(
        Gulp.src(globs.style),
        Sass.sync({
            outputStyle: 'compressed',
        }).on('error', Sass.logError),
        Gulp.dest(loc.dest),
        (err) => errorCB(err)
    );
};

/** NPM build task. Use for one-off development */
exports.build = series(parallel(sass_dev, procTS_dev), insertHead);

/** NPM watch task. Use for continual development */
exports.watch = () => {
    Gulp.watch([globs.app, globs.meta], series(procTS_dev, insertHead));
    Gulp.watch(globs.style, series(sass_dev));
};

/** NPM release task. Use for publishing the compiled script */
exports.release = series(
    releaseEnv,
    parallel(sass_release, series(procTS_release, minify)),
    insertHead
);
