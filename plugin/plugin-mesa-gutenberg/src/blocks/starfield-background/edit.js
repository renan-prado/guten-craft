import { useBlockProps, InspectorControls, InnerBlocks } from '@wordpress/block-editor';
import { PanelBody, RangeControl, ColorPicker, BaseControl } from '@wordpress/components';
import { useEffect, useRef } from '@wordpress/element';

function hexToRgb( hex ) {
	const h    = hex.replace( '#', '' );
	const full = h.length === 3
		? h.split( '' ).map( ( c ) => c + c ).join( '' )
		: h;
	const n = parseInt( full, 16 );
	return [ ( n >> 16 ) & 255, ( n >> 8 ) & 255, n & 255 ];
}

function buildStars( count, w, h ) {
	return Array.from( { length: count }, () => ( {
		x:           Math.random() * w,
		y:           Math.random() * h,
		radius:      0.5 + Math.random() * 1.3,
		baseOpacity: 0.12 + Math.random() * 0.28,
		amplitude:   0.15 + Math.random() * 0.50,
		period:      3000 + Math.random() * 8000,
		phase:       Math.random() * Math.PI * 2,
	} ) );
}

export default function Edit( { attributes, setAttributes } ) {
	const { starCount, backgroundColor, starColor, minHeight, glowColor } = attributes;

	const canvasRef  = useRef( null );
	const starsRef   = useRef( [] );
	const rafRef     = useRef( null );
	const mountedRef = useRef( false );

	const blockProps = useBlockProps( {
		style: {
			position:  'relative',
			minHeight: `${ minHeight }px`,
			backgroundColor,
		},
		'data-star-count': starCount,
		'data-bg-color':   backgroundColor,
		'data-star-color': starColor,
	} );

	useEffect( () => {
		const canvas = canvasRef.current;
		if ( ! canvas ) return;

		const ctx = canvas.getContext( '2d' );
		const dpr = window.devicePixelRatio || 1;
		const w   = canvas.parentElement?.offsetWidth  || 800;
		const h   = canvas.parentElement?.offsetHeight || minHeight;

		canvas.width  = w * dpr;
		canvas.height = h * dpr;
		canvas.style.width  = w + 'px';
		canvas.style.height = h + 'px';
		ctx.scale( dpr, dpr );

		starsRef.current = buildStars( starCount, w, h );

		const [ sr, sg, sb ] = hexToRgb( starColor );

		function draw( ts ) {
			if ( ! mountedRef.current ) return;
			ctx.clearRect( 0, 0, w, h );
			ctx.fillStyle = backgroundColor;
			ctx.fillRect( 0, 0, w, h );

			starsRef.current.forEach( ( s ) => {
				const t     = ts / s.period;
				const alpha = Math.max( 0, Math.min( 1, s.baseOpacity + s.amplitude * Math.sin( t * Math.PI * 2 + s.phase ) ) );
				ctx.beginPath();
				ctx.arc( s.x, s.y, s.radius, 0, Math.PI * 2 );
				ctx.fillStyle = `rgba(${ sr },${ sg },${ sb },${ alpha.toFixed( 3 ) })`;
				ctx.fill();
			} );

			rafRef.current = requestAnimationFrame( draw );
		}

		mountedRef.current = true;
		rafRef.current = requestAnimationFrame( draw );

		return () => {
			mountedRef.current = false;
			cancelAnimationFrame( rafRef.current );
		};
	}, [ starCount, backgroundColor, starColor, minHeight ] );

	return (
		<>
			<InspectorControls>
				<PanelBody title="Starfield Settings">
					<RangeControl
						label="Star count"
						value={ starCount }
						onChange={ ( v ) => setAttributes( { starCount: v } ) }
						min={ 20 }
						max={ 400 }
						step={ 10 }
					/>
					<RangeControl
						label="Min height (px)"
						value={ minHeight }
						onChange={ ( v ) => setAttributes( { minHeight: v } ) }
						min={ 200 }
						max={ 1200 }
						step={ 20 }
					/>
					<BaseControl label="Background color" id="starfield-bg-color">
						<ColorPicker
							color={ backgroundColor }
							onChange={ ( v ) => setAttributes( { backgroundColor: v } ) }
							enableAlpha={ false }
						/>
					</BaseControl>
					<BaseControl label="Star color" id="starfield-star-color">
						<ColorPicker
							color={ starColor }
							onChange={ ( v ) => setAttributes( { starColor: v } ) }
							enableAlpha={ false }
						/>
					</BaseControl>
					<BaseControl label="Glow color (empty = off)" id="starfield-glow-color">
						<ColorPicker
							color={ glowColor || '#7b33cc' }
							onChange={ ( v ) => setAttributes( { glowColor: v } ) }
							enableAlpha={ true }
						/>
					</BaseControl>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<canvas
					ref={ canvasRef }
					data-starfield
					className="starfield-background__canvas"
				/>
				{ glowColor && (
					<span
						className="starfield-background__glow"
						style={ { background: `radial-gradient(ellipse 100% 80% at 75% 50%, ${ glowColor } 0%, transparent 70%)` } }
						aria-hidden="true"
					/>
				) }
				<div className="starfield-background__content">
					<InnerBlocks />
				</div>
			</div>
		</>
	);
}
