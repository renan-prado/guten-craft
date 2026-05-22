import createGlobe from 'cobe';

function hexToRgb( hex ) {
	if ( ! hex ) return [ 1, 1, 1 ];
	const h = hex.replace( '#', '' );
	if ( h.length !== 6 ) return [ 1, 1, 1 ];
	return [
		parseInt( h.slice( 0, 2 ), 16 ) / 255,
		parseInt( h.slice( 2, 4 ), 16 ) / 255,
		parseInt( h.slice( 4, 6 ), 16 ) / 255,
	];
}

// Project lat/lng to 2D pixel using cobe's coordinate system (sphere r=0.8).
// Returns null when the point is on the back of the globe.
function project( lat, lng, phi, theta, w, h ) {
	const latR = ( lat * Math.PI ) / 180;
	const lngR = ( lng * Math.PI ) / 180;
	const a = phi + lngR;
	const fx = Math.cos( latR ) * Math.cos( a );
	const fy = Math.sin( latR ) * Math.cos( theta ) + Math.cos( latR ) * Math.sin( a ) * Math.sin( theta );
	const fz = Math.sin( latR ) * Math.sin( theta ) - Math.cos( latR ) * Math.sin( a ) * Math.cos( theta );
	if ( fz <= 0 ) return null;
	const r = Math.min( w, h ) * 0.4;
	return { x: w / 2 + fx * r, y: h / 2 - fy * r };
}

document
	.querySelectorAll( '.wp-block-mesa-gutenberg-cobe-globe' )
	.forEach( initGlobe );

function initGlobe( wrapper ) {
	const canvas = wrapper.querySelector( 'canvas[data-cobe-globe]' );
	if ( ! canvas ) return;

	const size = parseInt( wrapper.dataset.globeSize || '600', 10 );
	const rotationSpeed = parseFloat( wrapper.dataset.rotationSpeed ?? '3' ) * 0.0002;
	// Expose the rendered size as a CSS variable so style.scss can compute
	// anchor offsets (e.g. `is-anchor-right` → `right: calc(var(--cobe-globe-size) * -0.5)`).
	// Set at runtime so it never has to live in the serialized inline style.
	wrapper.style.setProperty( '--cobe-globe-size', size + 'px' );
	const mapSamples = parseInt( wrapper.dataset.mapSamples || '6000', 10 );
	let arcsData = [];
	try {
		arcsData = wrapper.dataset.arcs ? JSON.parse( wrapper.dataset.arcs ) : [];
	} catch ( e ) {
		arcsData = [];
	}
	const arcColor = hexToRgb( wrapper.dataset.arcColor || '#ffffff' );
	const baseColor = hexToRgb( wrapper.dataset.baseColor || '#a640e6' );
	const glowColor = hexToRgb( wrapper.dataset.glowColor || '#e659e6' );
	const arcWidth = parseFloat( wrapper.dataset.arcWidth || '0.5' );
	const arcHeight = parseFloat( wrapper.dataset.arcHeight || '0.3' );
	const arcs = arcsData.map( ( a ) => {
		const o = { from: a.from, to: a.to };
		if ( a.color ) o.color = hexToRgb( a.color );
		return o;
	} );

	const dpr = window.devicePixelRatio || 1;
	const theta = 0.35;
	// Initial phi centers Tokyo at the visible meridian.
	let phi = -Math.PI / 2 - ( 139.7 * Math.PI ) / 180;
	let isDragging = false;
	let prevX = 0;

	canvas.style.cursor = 'grab';
	canvas.addEventListener( 'pointerdown', ( e ) => {
		isDragging = true;
		prevX = e.clientX;
		canvas.style.cursor = 'grabbing';
		canvas.setPointerCapture( e.pointerId );
	} );
	canvas.addEventListener( 'pointermove', ( e ) => {
		if ( ! isDragging ) return;
		const dx = e.clientX - prevX;
		prevX = e.clientX;
		phi += dx / 200;
	} );
	canvas.addEventListener( 'pointerup', () => {
		isDragging = false;
		canvas.style.cursor = 'grab';
	} );
	canvas.addEventListener( 'pointercancel', () => {
		isDragging = false;
		canvas.style.cursor = 'grab';
	} );

	const cards = Array.from( wrapper.querySelectorAll( '.cobe-globe-card' ) );
	const markers = cards.map( ( card ) => ( {
		location: [
			parseFloat( card.dataset.lat ),
			parseFloat( card.dataset.lng ),
		],
		size: 0.032,
	} ) );

	// cobe v2 removed the onRender callback. We drive the render loop ourselves
	// via requestAnimationFrame and call globe.update({phi}) every frame.
	const globe = createGlobe( canvas, {
		devicePixelRatio: dpr,
		width: size,
		height: size,
		phi,
		theta,
		dark: 1,
		diffuse: 1.2,
		mapSamples,
		mapBrightness: 6,
		mapBaseBrightness: 0,
		baseColor,
		markerColor: [ 1, 1, 1 ],
		glowColor,
		markers,
		arcs,
		arcColor,
		arcWidth,
		arcHeight,
		markerElevation: 0.02,
	} );

	function frame() {
		if ( ! isDragging ) {
			phi += rotationSpeed;
		}
		globe.update( { phi } );
		cards.forEach( ( card ) => {
			const lat = parseFloat( card.dataset.lat );
			const lng = parseFloat( card.dataset.lng );
			const p = project( lat, lng, phi, theta, size, size );
			if ( p ) {
				card.style.left = p.x + 'px';
				card.style.top = p.y + 'px';
				card.classList.add( 'is-visible' );
			} else {
				card.classList.remove( 'is-visible' );
			}
		} );
		requestAnimationFrame( frame );
	}
	requestAnimationFrame( frame );
}
