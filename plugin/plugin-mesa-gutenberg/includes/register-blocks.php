<?php
defined( 'ABSPATH' ) || exit;

/**
 * Registers all blocks found in build/blocks/{block-name}/block.json.
 */
function mesa_gutenberg_register_blocks(): void {
	$blocks_dir = MESA_GUTENBERG_DIR . 'build/blocks/';

	if ( ! is_dir( $blocks_dir ) ) {
		return;
	}

	$block_files = glob( $blocks_dir . '*/block.json' );

	if ( empty( $block_files ) ) {
		return;
	}

	foreach ( $block_files as $block_json ) {
		register_block_type( dirname( $block_json ) );
	}
}
add_action( 'init', 'mesa_gutenberg_register_blocks' );
