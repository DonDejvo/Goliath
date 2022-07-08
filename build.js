const esbuild = require( 'esbuild' );

console.log( '[Goliath]', 'Building...' );

const t0 = performance.now();

esbuild.build( {
    entryPoints: [ 'src/gol.js' ],
    bundle: true,
    sourcemap: true,
    format: 'iife',
    outfile: 'dist/goliath.js'
} );

esbuild.build( {
    entryPoints: [ 'src/gol.js' ],
    bundle: true,
    sourcemap: true,
    minify: true,
    format: 'iife',
    outfile: 'dist/goliath.min.js'
} );

esbuild.build( {
    entryPoints: [ 'src/gol.js' ],
    bundle: true,
    sourcemap: true,
    minify: true,
    format: 'esm',
    outfile: 'dist/goliath.esm.min.js'
} );

const t1 = performance.now();

console.log( '[Goliath]', 'Build finished in ' + Math.round( ( t1 - t0 ) * 100 ) / 100 + 'ms.' );
