#!/usr/bin/env node
'use strict';

const { execSync } = require( 'child_process' );
const archiver = require( 'archiver' );
const fs = require( 'fs' );
const path = require( 'path' );

const pkg = require( '../package.json' );
const rootDir = path.resolve( __dirname, '..' );
const distDir = path.resolve( rootDir, 'dist' );
const zipName = `plugin-mesa-gutenberg-${ pkg.version }.zip`;
const zipPath = path.join( distDir, zipName );

// 1. Build
console.log( '→ Building…' );
execSync( 'npm run build', { cwd: rootDir, stdio: 'inherit' } );

// 2. Prepare dist folder
fs.mkdirSync( distDir, { recursive: true } );
if ( fs.existsSync( zipPath ) ) fs.unlinkSync( zipPath );

// 3. Create zip
console.log( `→ Creating ${ zipName }…` );

const output = fs.createWriteStream( zipPath );
const archive = archiver( 'zip', { zlib: { level: 9 } } );

archive.pipe( output );

// Files/folders to include (only what WordPress needs — no src/, node_modules/, etc.)
const includes = [
	{ src: 'plugin-mesa-gutenberg.php', dest: 'plugin-mesa-gutenberg/plugin-mesa-gutenberg.php' },
	{ src: 'includes',                  dest: 'plugin-mesa-gutenberg/includes' },
	{ src: 'assets',                    dest: 'plugin-mesa-gutenberg/assets' },
	{ src: 'build',                     dest: 'plugin-mesa-gutenberg/build' },
];

for ( const item of includes ) {
	const fullPath = path.join( rootDir, item.src );
	const stat = fs.statSync( fullPath );

	if ( stat.isDirectory() ) {
		archive.directory( fullPath, item.dest );
	} else {
		archive.file( fullPath, { name: item.dest } );
	}
}

output.on( 'close', () => {
	const kb = ( archive.pointer() / 1024 ).toFixed( 1 );
	console.log( `✓ dist/${ zipName } (${ kb } KB)` );
} );

archive.finalize();
