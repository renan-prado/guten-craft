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
		'1.8.3'
	);
}
add_action( 'wp_enqueue_scripts', 'mesa_gutenberg_enqueue_global_styles' );
