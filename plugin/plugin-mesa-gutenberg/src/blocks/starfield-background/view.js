document
	.querySelectorAll( '.wp-block-mesa-gutenberg-starfield-background' )
	.forEach( initStarfield );

function initStarfield( wrapper ) {
	const canvas = wrapper.querySelector( 'canvas[data-starfield]' );
	if ( ! canvas ) return;

	const starCount  = parseInt( wrapper.dataset.starCount  || '50', 10 );
	const bgColor    = wrapper.dataset.bgColor    || '#08000f';
	const starColor  = wrapper.dataset.starColor  || '#ffffff';

	const ctx = canvas.getContext( '2d' );
	let raf;
	let stars = [];

	// Parse star color to r,g,b components for rgba() usage.
	function hexToRgb( hex ) {
		const h = hex.replace( '#', '' );
		const full = h.length === 3
			? h.split( '' ).map( c => c + c ).join( '' )
			: h;
		const n = parseInt( full, 16 );
		return [ ( n >> 16 ) & 255, ( n >> 8 ) & 255, n & 255 ];
	}

	const [ sr, sg, sb ] = hexToRgb( starColor );

	function buildStars( w, h ) {
		stars = Array.from( { length: starCount }, () => ( {
			x:           Math.random() * w,
			y:           Math.random() * h,
			radius:      0.6 + Math.random() * 1.5,
			baseOpacity: 0.30 + Math.random() * 0.45,
			amplitude:   0.30 + Math.random() * 0.60,
			period:      1500 + Math.random() * 5000,
			phase:       Math.random() * Math.PI * 2,
		} ) );
	}

	function resize() {
		const dpr = window.devicePixelRatio || 1;
		const w   = wrapper.offsetWidth  || 800;
		const h   = wrapper.offsetHeight || 600;
		canvas.width  = w * dpr;
		canvas.height = h * dpr;
		canvas.style.width  = w + 'px';
		canvas.style.height = h + 'px';
		ctx.setTransform( dpr, 0, 0, dpr, 0, 0 );
		buildStars( w, h );
	}

	function draw( ts ) {
		const w = wrapper.offsetWidth  || 800;
		const h = wrapper.offsetHeight || 600;

		ctx.clearRect( 0, 0, w, h );

		// Background fill.
		ctx.fillStyle = bgColor;
		ctx.fillRect( 0, 0, w, h );

		stars.forEach( ( s ) => {
			const t       = ts / s.period;
			const opacity = s.baseOpacity + s.amplitude * Math.sin( t * Math.PI * 2 + s.phase );
			const alpha   = Math.max( 0, Math.min( 1, opacity ) );

			ctx.beginPath();
			ctx.arc( s.x, s.y, s.radius, 0, Math.PI * 2 );
			ctx.fillStyle = `rgba(${ sr },${ sg },${ sb },${ alpha.toFixed( 3 ) })`;
			ctx.fill();
		} );

		raf = requestAnimationFrame( draw );
	}

	resize();

	const ro = new ResizeObserver( () => {
		cancelAnimationFrame( raf );
		resize();
		raf = requestAnimationFrame( draw );
	} );
	ro.observe( wrapper );

	raf = requestAnimationFrame( draw );
}
