// REQUIRED
var gulp    = require( 'gulp' );
var gutil   = require( 'gulp-util' );
var coffee  = require( 'gulp-coffee' );
var concat  = require( 'gulp-concat' );
var gif     = require( 'gulp-if' );
var uglify  = require( 'gulp-uglify' );
var userDir = require( './user-settings.json' ).userDir;

// VARIABLES
var env, csIn, csOut, jsIn;
// DEFAULTS
if( userDir===undefined ){ userDir='.'; }
env = 'dev';

// SOURCES
csIn = ['src/*.coffee'];
jsIn = [
    'src/infoblock.js',
    'build/staging/*.js'
];
// DESTINATIONS
csOut = 'build/staging';

/*=== COFFEESCRIPT ===*/
gulp.task( 'coffee', function(){
    gulp.src( csIn )
        .pipe( coffee({ bare: true }) )
            .on( 'error', gutil.log )
        .pipe( gulp.dest( csOut ) );
} );
/*=== JAVASCRIPT ===*/
gulp.task( 'js', function(){
    gulp.src( jsIn )
        .pipe( concat('MAM_Plus_Dev.user.js') )
            .on( 'error', gutil.log )
        .pipe( gif( env==='release',uglify({ preserveComments: 'license' }) ) )
        .pipe( gulp.dest( 'build/'+env ) )
        .pipe( gulp.dest( userDir+'/MAM_Plus_Dev' ) );
} );
/*=== SET RELEASE===*/
gulp.task( 'setRelease', function(){
    env='release';
} );
/*=== WATCH ===*/
gulp.task( 'watch', function(){
    gulp.watch( csIn,['coffee'] );
    gulp.watch( jsIn,['js'] );
} );

/*=== DEFAULT ===*/
gulp.task( 'default', ['coffee','js','watch'] );
/*=== RELEASE ===*/
gulp.task( 'release', ['setRelease','default'] );
