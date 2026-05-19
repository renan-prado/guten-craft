import createGlobe from 'cobe';

// Project lat/lng to canvas 2D pixel, returns null when on back of globe.
// Matches cobe's internal rotation: phi rotates Y axis, theta tilts X axis.
function project( lat, lng, phi, theta, w, h ) {
	const latR = ( lat * Math.PI ) / 180;
	const lngR = ( lng * Math.PI ) / 180;
	const x = Math.cos( latR ) * Math.sin( lngR );
	const y = Math.sin( latR );
	const z = Math.cos( latR ) * Math.cos( lngR );
	const x1 = x * Math.cos( phi ) + z * Math.sin( phi );
	const z1 = -x * Math.sin( phi ) + z * Math.cos( phi );
	const y2 = y * Math.cos( theta ) - z1 * Math.sin( theta );
	const z2 = y * Math.sin( theta ) + z1 * Math.cos( theta );
	if ( z2 < 0 ) return null;
	const r = Math.min( w, h ) * 0.5 * 0.96;
	return { x: w / 2 + x1 * r, y: h / 2 - y2 * r };
}

document
	.querySelectorAll( '.wp-block-mesa-gutenberg-cobe-globe' )
	.forEach( initGlobe );

function initGlobe( wrapper ) {
	const canvas = wrapper.querySelector( 'canvas[data-cobe-globe]' );
	if ( ! canvas ) return;

	const size = parseInt( wrapper.dataset.globeSize || '600', 10 );
	const dpr = window.devicePixelRatio || 1;
	const theta = 0.15;
	let phi = 0.3;

	const cards = Array.from( wrapper.querySelectorAll( '.cobe-globe-card' ) );

	createGlobe( canvas, {
		devicePixelRatio: dpr,
		width: size * dpr,
		height: size * dpr,
		phi,
		theta,
		dark: 1,
		diffuse: 1.0,
		mapSamples: 16000,
		mapBrightness: 6,
		baseColor: [ 0.18, 0.04, 0.28 ],
		markerColor: [ 0.71, 0.40, 0.95 ],
		glowColor: [ 0.35, 0.08, 0.52 ],
		markers: [
			{ location: [ 40.7128, -74.006 ], size: 0.08 },
			{ location: [ 51.5074, -0.1278 ], size: 0.06 },
			{ location: [ 35.6762, 139.6503 ], size: 0.06 },
			{ location: [ -33.8688, 151.2093 ], size: 0.05 },
			{ location: [ 1.3521, 103.8198 ], size: 0.05 },
			{ location: [ 48.8566, 2.3522 ], size: 0.05 },
			{ location: [ 55.7558, 37.6176 ], size: 0.05 },
		],
		onRender( state ) {
			state.phi = phi;
			phi += 0.003;
			// Use configured size instead of offsetWidth to avoid WordPress
			// theme CSS (e.g. max-width:100%; height:auto) skewing coordinates.
			const w = size;
			const h = size;
			cards.forEach( ( card ) => {
				const lat = parseFloat( card.dataset.lat );
				const lng = parseFloat( card.dataset.lng );
				const p = project( lat, lng, phi, theta, w, h );
				if ( p ) {
					card.style.left = p.x + 'px';
					card.style.top = p.y + 'px';
					card.classList.add( 'is-visible' );
				} else {
					card.classList.remove( 'is-visible' );
				}
			} );
		},
	} );
}
