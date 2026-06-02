<?php
defined( 'ABSPATH' ) || exit;

/**
 * Loads the plugin-wide utility stylesheet on the front-end.
 * File lives at assets/global.css (shipped in the ZIP).
 */
function mesa_gutenberg_enqueue_global_styles(): void {
	wp_enqueue_style(
		'mesa-gutenberg-global',
		MESA_GUTENBERG_URL . 'assets/global.css',
		[],
		'1.9.4'
	);

	wp_enqueue_script(
		'mesa-gutenberg-card-title-tooltip',
		MESA_GUTENBERG_URL . 'assets/card-title-tooltip.js',
		[],
		'1.9.4',
		true
	);
}
add_action( 'wp_enqueue_scripts', 'mesa_gutenberg_enqueue_global_styles' );

/**
 * Loads editor-only overrides INSIDE the block editor canvas iframe.
 * `enqueue_block_assets` fires both on the frontend and inside the
 * editor iframe — `is_admin()` limits this to the admin editor.
 * (`enqueue_block_editor_assets` only targets the editor chrome, not the
 * iframe content, so it would never reach the canvas.)
 */
function mesa_gutenberg_enqueue_editor_styles(): void {
	if ( ! is_admin() ) {
		return;
	}
	wp_enqueue_style(
		'mesa-gutenberg-editor',
		MESA_GUTENBERG_URL . 'assets/editor.css',
		[],
		'1.9.4'
	);
}
add_action( 'enqueue_block_assets', 'mesa_gutenberg_enqueue_editor_styles' );
