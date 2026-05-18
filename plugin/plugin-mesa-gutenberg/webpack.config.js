const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );
const { globSync } = require( 'glob' );

// Auto-discover all blocks: src/blocks/*/index.js → build/blocks/*/index.js
const blockEntries = globSync( './src/blocks/*/index.js', { cwd: __dirname } )
	.reduce( ( acc, file ) => {
		const blockName = path.basename( path.dirname( file ) );
		acc[ `blocks/${ blockName }/index` ] = path.resolve( __dirname, file );
		return acc;
	}, {} );

module.exports = {
	...defaultConfig,
	entry: blockEntries,
	output: {
		...defaultConfig.output,
		path: path.resolve( __dirname, 'build' ),
	},
};
