/**
 * Inline SVG icons for the Comparison Table block.
 *
 * Each icon is a filled circle whose fill is driven by `currentColor` so it
 * picks up the column's `iconColor`. The glyph (check / xmark) is rendered in
 * white on top.
 */

export const ICON_TYPES = {
	check: {
		label: 'Check (positive)',
		inner:
			'<circle cx="12" cy="12" r="12" fill="currentColor"/>' +
			'<path d="M6.5 12.5 L10.25 16.25 L17.5 8.5" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
	},
	xmark: {
		label: 'X mark (negative)',
		inner:
			'<circle cx="12" cy="12" r="12" fill="currentColor"/>' +
			'<path d="M8 8 L16 16 M16 8 L8 16" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>',
	},
	none: {
		label: 'No icon',
		inner: '',
	},
};

export const ICON_OPTIONS = Object.entries( ICON_TYPES ).map( ( [ key, def ] ) => ( {
	value: key,
	label: def.label,
} ) );

export function renderIconSvgString( iconType, size = 24 ) {
	const preset = ICON_TYPES[ iconType ];
	if ( ! preset || ! preset.inner ) return '';
	return (
		'<svg xmlns="http://www.w3.org/2000/svg" width="' +
		size +
		'" height="' +
		size +
		'" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
		preset.inner +
		'</svg>'
	);
}
