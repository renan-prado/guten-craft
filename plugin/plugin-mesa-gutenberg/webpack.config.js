const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );
const { globSync } = require( 'glob' );

// Auto-discover editor scripts: src/blocks/*/index.js → build/blocks/*/index.js
const editorEntries = globSync( './src/blocks/*/index.js', { cwd: __dirname } )
	.reduce( ( acc, file ) => {
		const blockName = path.basename( path.dirname( file ) );
		acc[ `blocks/${ blockName }/index` ] = path.resolve( __dirname, file );
		return acc;
	}, {} );

// Auto-discover view scripts: src/blocks/*/view.js → build/blocks/*/view.js
const viewEntries = globSync( './src/blocks/*/view.js', { cwd: __dirname } )
	.reduce( ( acc, file ) => {
		const blockName = path.basename( path.dirname( file ) );
		acc[ `blocks/${ blockName }/view` ] = path.resolve( __dirname, file );
		return acc;
	}, {} );

module.exports = {
	...defaultConfig,
	entry: { ...editorEntries, ...viewEntries },
	output: {
		...defaultConfig.output,
		path: path.resolve( __dirname, 'build' ),
	},
};
