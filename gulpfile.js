const Gulp = require('gulp');
const { series, parallel } = require('gulp');
const Del = require('del');
const Ts = require('gulp-typescript');
const Sass = require('gulp-sass');
const Srcmap = require('gulp-sourcemaps');
const Header = require('gulp-header');
const Inject = require('gulp-inject-string')
const Min = require('gulp-uglify-es').default;
const Fs = require('fs');
const pkg = require('./package.json');

const globs = {
    app: 'src/**/*.ts',
    meta: 'metadata.txt',
    style: 'sass/**/*.scss'
}

const path = {
    scripts: {
        dest: 'release/',
        name: `${pkg.name}.user.js`
    },
    dev_scripts: {
        dest: 'build/',
        name: `${pkg.name}_dev.user.js`
    }
}

const tsSettings = {
    strict: true,
    target: "es2015",
    rootDir: "src",
    forceConsistentCasingInFileNames: true,
    noImplicitReturns: false,
    noUnusedLocals: false,
    lib: [ 'dom', 'es6', 'es2016.array.include']
}

let env = 'dev';

/** Returns a path object relative to the env */
const basePathEnv = () => {
    let pathObj = path.dev_scripts;
    pkg.env = '_dev';
    if ( env == 'release' ) {
        pathObj = path.scripts;
        pkg.env = '';
    }
    return pathObj;
}

/** Returns the current timestamp */
const buildTime = () => {
    const mString = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
    let now = new Date();
    let month = mString[ now.getUTCMonth() ];
    let day = now.getUTCDate();
    return `${month} ${day}`;
}

/** Task to clean the output directories */
const clean = () => Del( [ path.dev_scripts.dest ] );

/** Task to set the working Env to release */
const releaseEnv = () => {
    return new Promise( resolve => {
        env = 'release';
        resolve();
    } );
}

/** Task to minify the userscript */
const minify = () => {
    let loc = basePathEnv();
    return Gulp.src( `${loc.dest}/${loc.name}` )
        .pipe( Min() )
        .pipe( Gulp.dest( loc.dest ) );
}

/** Task to insert a userscript header from a file, with package.json info */
const insertHead = () => {
    let loc = basePathEnv();
    return Gulp.src( `${loc.dest}/${loc.name}` )
        // Insert userscript header
        .pipe( Header( Fs.readFileSync( 'metadata.txt', 'utf8' ), { pkg: pkg } ) )
        // Output the file
        .pipe( Gulp.dest( loc.dest ) );
}

/** Task to convert the .ts files into a _dev.user.js file */
const procTS_dev = () => {
    let loc = basePathEnv();
    tsSettings.outFile = loc.name;
    let timestamp = buildTime();
    return Gulp.src( globs.app, { base: 'src' } )
        .pipe( Srcmap.init() )
        // Inject information
        .pipe( Inject.replace( '##meta_timestamp##', timestamp ) )
        // Compile typescript
        .pipe( Ts( tsSettings ) )
        // Write sourcemap
        .pipe( Srcmap.write() )
        // Output the file
        .pipe( Gulp.dest( loc.dest ) );
}

/** Task to convert the .ts files into a .user.js file */
const procTS_build = () => {
    let loc = basePathEnv();
    tsSettings.outFile = loc.name;
    let timestamp = buildTime();
    return Gulp.src( globs.app )
        // Inject information
        .pipe( Inject.replace( '##meta_timestamp##', timestamp ) )
        // Compile typescript
        .pipe( Ts( tsSettings ) )
        // Output the file
        .pipe( Gulp.dest( loc.dest ) );
}

/** Task to convert .scss files into .css files */
const sass_dev = () => {
    let loc = basePathEnv();
    return new Promise( ( resolve ) => {
        Gulp.src( globs.style )
            .pipe( Srcmap.init() )
            .pipe( Sass().on( 'error', Sass.logError ) )
            .pipe( Srcmap.write() )
            .pipe( Gulp.dest( loc.dest ) );
        resolve();
    } );
}

/** Task to convert .scss files into .min.css files */
const sass_build = () => {
    let loc = basePathEnv();
    return new Promise( ( resolve ) => {
        Gulp.src( globs.style )
            .pipe( Sass( {
                outputStyle: 'compressed'
            } ).on( 'error', Sass.logError ) )
            .pipe( Gulp.dest( loc.dest ) );
        resolve();
    } );
}

/** NPM build task. Use for one-off development */
exports.build = series(
    clean,
    parallel(
        sass_dev,
        procTS_dev,
    ),
    insertHead,
);

/** NPM watch task. Use for continual development */
exports.watch = () => {
    Gulp.watch(
        [globs.app, globs.meta],
        series( procTS_dev, insertHead )
    );
    Gulp.watch(
        globs.style,
        series( sass_dev )
    );
};

/** NPM release task. Use for publishing the compiled script */
exports.release = series(
    parallel(
        clean,
        releaseEnv,
    ),
    parallel(
        sass_build,
        series(
            procTS_build,
            minify,
        ),
    ),
    insertHead,
);

exports.clean = clean;
