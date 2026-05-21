<?php
/**
 * Plugin Name:       Mesa Gutenberg Blocks
 * Plugin URI:        https://iconnections.io
 * Description:       Custom Gutenberg blocks for iConnections.
 * Version:           1.3.3
 * Requires at least: 6.1
 * Requires PHP:      8.0
 * Author:            iConnections
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       mesa-gutenberg
 */

defined( 'ABSPATH' ) || exit;

define( 'MESA_GUTENBERG_VERSION', '1.0.0' );
define( 'MESA_GUTENBERG_DIR', plugin_dir_path( __FILE__ ) );
define( 'MESA_GUTENBERG_URL', plugin_dir_url( __FILE__ ) );

require_once MESA_GUTENBERG_DIR . 'includes/register-blocks.php';
