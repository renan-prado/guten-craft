import { useBlockProps, InspectorControls, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { PanelBody, RangeControl, TextControl, Button } from '@wordpress/components';
import { useEffect, useRef } from '@wordpress/element';
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

const MARKERS = [
	{ location: [ 40.7128, -74.006 ], size: 0.03 },
	{ location: [ 51.5074, -0.1278 ], size: 0.025 },
	{ location: [ 35.6762, 139.6503 ], size: 0.025 },
	{ location: [ -33.8688, 151.2093 ], size: 0.02 },
	{ location: [ 1.3521, 103.8198 ], size: 0.02 },
	{ location: [ 48.8566, 2.3522 ], size: 0.02 },
	{ location: [ 55.7558, 37.6176 ], size: 0.02 },
];

export default function Edit( { attributes, setAttributes } ) {
	const { size, mapSamples, overlays, topOffset, arcs, arcColor, arcWidth, arcHeight, rotationSpeed, baseColor, glowColor } = attributes;
	const canvasRef = useRef( null );
	const wrapperRef = useRef( null );
	const rotationSpeedRef = useRef( rotationSpeed );
	useEffect( () => { rotationSpeedRef.current = rotationSpeed; }, [ rotationSpeed ] );

	const blockProps = useBlockProps( {
		ref: wrapperRef,
		'data-globe-size': size,
		style: {
			width: `${ size }px`,
			height: `${ size }px`,
			maxWidth: '100%',
			// Mirror the runtime CSS variable set by view.js, so editor preview
			// reflects `is-anchor-right` and any other size-derived CSS.
			'--cobe-globe-size': `${ size }px`,
		},
	} );

	useEffect( () => {
		if ( ! canvasRef.current ) return;
		const dpr = window.devicePixelRatio || 1;
		const theta = 0.15;
		let phi = 0.3;
		let rafId = 0;

		const cobeArcs = ( arcs || [] ).map( ( a ) => {
			const o = { from: a.from, to: a.to };
			if ( a.color ) o.color = hexToRgb( a.color );
			return o;
		} );

		// cobe v2: width/height un-multiplied; the lib applies dpr internally.
		const globe = createGlobe( canvasRef.current, {
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
			baseColor: hexToRgb( baseColor ),
			markerColor: [ 1, 1, 1 ],
			glowColor: hexToRgb( glowColor ),
			markers: MARKERS,
			arcs: cobeArcs,
			arcColor: hexToRgb( arcColor ),
			arcWidth,
			arcHeight,
			markerElevation: 0.02,
		} );

		// cobe v2 has no onRender callback — animate via RAF.
		const tick = () => {
			phi += rotationSpeedRef.current * 0.0002;
			globe.update( { phi } );
			if ( wrapperRef.current && canvasRef.current ) {
				const w = canvasRef.current.offsetWidth;
				const h = canvasRef.current.offsetHeight;
				wrapperRef.current
					.querySelectorAll( '.cobe-globe-card' )
					.forEach( ( card ) => {
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
			}
			rafId = requestAnimationFrame( tick );
		};
		rafId = requestAnimationFrame( tick );

		return () => {
			cancelAnimationFrame( rafId );
			globe.destroy();
		};
	}, [ size, mapSamples, arcs, arcColor, arcWidth, arcHeight, baseColor, glowColor ] );

	const updateCard = ( index, field, value ) =>
		setAttributes( {
			overlays: overlays.map( ( c, i ) =>
				i === index ? { ...c, [ field ]: value } : c
			),
		} );

	const updateLocation = ( index, axis, value ) =>
		setAttributes( {
			overlays: overlays.map( ( c, i ) => {
				if ( i !== index ) return c;
				const loc = [ ...c.location ];
				loc[ axis ] = parseFloat( value ) || 0;
				return { ...c, location: loc };
			} ),
		} );

	const removeCard = ( index ) =>
		setAttributes( { overlays: overlays.filter( ( _, i ) => i !== index ) } );

	const addCard = () =>
		setAttributes( {
			overlays: [
				...overlays,
				{ id: Date.now(), message: 'New notification', subtext: '', initials: 'XX', avatarColor: '#7c3aed', avatarUrl: '', location: [ 48.8566, 2.3522 ] },
			],
		} );

	const updateArc = ( index, field, value ) =>
		setAttributes( {
			arcs: ( arcs || [] ).map( ( a, i ) => ( i === index ? { ...a, [ field ]: value } : a ) ),
		} );

	const updateArcEndpoint = ( index, end, axis, value ) =>
		setAttributes( {
			arcs: ( arcs || [] ).map( ( a, i ) => {
				if ( i !== index ) return a;
				const coords = [ ...( a[ end ] || [ 0, 0 ] ) ];
				coords[ axis ] = parseFloat( value ) || 0;
				return { ...a, [ end ]: coords };
			} ),
		} );

	const removeArc = ( index ) =>
		setAttributes( { arcs: ( arcs || [] ).filter( ( _, i ) => i !== index ) } );

	const addArc = () =>
		setAttributes( {
			arcs: [
				...( arcs || [] ),
				{ id: Date.now(), from: [ 40.7128, -74.006 ], to: [ 51.5074, -0.1278 ], color: '' },
			],
		} );

	return (
		<>
			<InspectorControls>
				<PanelBody title="Globe Settings">
					<RangeControl
						label="Size (px)"
						value={ size }
						onChange={ ( val ) => setAttributes( { size: val } ) }
						min={ 200 }
						max={ 1200 }
						step={ 50 }
					/>
					<RangeControl
						label="Map density (samples)"
						value={ mapSamples }
						onChange={ ( val ) => setAttributes( { mapSamples: val } ) }
						min={ 1000 }
						max={ 32000 }
						step={ 500 }
						help="Densidade do mapa de pontos. Valores maiores = mais pontos (mais detalhado, mais pesado)."
					/>
					<RangeControl
						label="Rotation speed"
						value={ rotationSpeed }
						onChange={ ( val ) => setAttributes( { rotationSpeed: val } ) }
						min={ 0 }
						max={ 10 }
						step={ 0.5 }
						help="0 = parado, 3 = lento (padrão), 6 = velocidade original, 10 = rápido"
					/>
					<TextControl
						label="Top offset (is-overlay)"
						value={ topOffset || '' }
						onChange={ ( val ) => setAttributes( { topOffset: val } ) }
						help="CSS value, ex: 0, -80px. Só funciona com a classe is-overlay."
					/>
					<TextControl
						label="Base color (hex)"
						value={ baseColor }
						onChange={ ( val ) => setAttributes( { baseColor: val } ) }
						help="Cor dos pontos das massas terrestres. Ex: #a640e6"
					/>
					<TextControl
						label="Glow color (hex)"
						value={ glowColor }
						onChange={ ( val ) => setAttributes( { glowColor: val } ) }
						help="Cor do halo atmosférico ao redor do globo. Ex: #e659e6"
					/>
				</PanelBody>

				<PanelBody title="Notification Cards" initialOpen={ true }>
					{ overlays.map( ( card, index ) => (
						<div key={ card.id } style={ { marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #ddd' } }>
							<p style={ { margin: '0 0 8px', fontWeight: 600, fontSize: 12 } }>Card { index + 1 }</p>
							<TextControl label="Message" value={ card.message } onChange={ ( v ) => updateCard( index, 'message', v ) } />
							<TextControl label="Sub-text (optional)" value={ card.subtext } onChange={ ( v ) => updateCard( index, 'subtext', v ) } />
							<MediaUploadCheck>
								<p style={ { margin: '0 0 4px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#1e1e1e' } }>Avatar Image</p>
								<MediaUpload
									onSelect={ ( media ) => updateCard( index, 'avatarUrl', media.url ) }
									allowedTypes={ [ 'image' ] }
									value={ card.avatarUrl }
									render={ ( { open } ) => (
										<div style={ { marginBottom: 8 } }>
											{ card.avatarUrl ? (
												<div style={ { display: 'flex', alignItems: 'center', gap: 8 } }>
													<img src={ card.avatarUrl } alt="" style={ { width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' } } />
													<Button isSmall variant="secondary" onClick={ open }>Replace</Button>
													<Button isSmall isDestructive onClick={ () => updateCard( index, 'avatarUrl', '' ) }>Remove</Button>
												</div>
											) : (
												<Button isSmall variant="secondary" onClick={ open }>Upload Image</Button>
											) }
										</div>
									) }
								/>
							</MediaUploadCheck>
							<div style={ { display: 'flex', gap: 8 } }>
								<TextControl label="Initials" value={ card.initials } onChange={ ( v ) => updateCard( index, 'initials', v ) } />
								<TextControl label="Avatar color" value={ card.avatarColor } onChange={ ( v ) => updateCard( index, 'avatarColor', v ) } />
							</div>
							<div style={ { display: 'flex', gap: 8 } }>
								<TextControl label="Latitude" value={ String( card.location[ 0 ] ) } onChange={ ( v ) => updateLocation( index, 0, v ) } />
								<TextControl label="Longitude" value={ String( card.location[ 1 ] ) } onChange={ ( v ) => updateLocation( index, 1, v ) } />
							</div>
							<Button isDestructive isSmall variant="secondary" onClick={ () => removeCard( index ) }>Remove</Button>
						</div>
					) ) }
					<Button variant="primary" onClick={ addCard } style={ { width: '100%' } }>+ Add Card</Button>
				</PanelBody>

				<PanelBody title="Arcs" initialOpen={ false }>
					<TextControl
						label="Default arc color (hex)"
						value={ arcColor }
						onChange={ ( v ) => setAttributes( { arcColor: v } ) }
						help="Cor padrão dos arcos sem cor própria."
					/>
					<RangeControl
						label="Arc width"
						value={ arcWidth }
						onChange={ ( v ) => setAttributes( { arcWidth: v } ) }
						min={ 0.1 }
						max={ 2 }
						step={ 0.05 }
					/>
					<RangeControl
						label="Arc height"
						value={ arcHeight }
						onChange={ ( v ) => setAttributes( { arcHeight: v } ) }
						min={ 0 }
						max={ 1 }
						step={ 0.05 }
						help="Curvatura do arco acima da superfície (0 = reto, 1 = bem alto)."
					/>
					{ ( arcs || [] ).map( ( arc, index ) => (
						<div key={ arc.id } style={ { marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #ddd' } }>
							<p style={ { margin: '0 0 8px', fontWeight: 600, fontSize: 12 } }>Arc { index + 1 }</p>
							<p style={ { margin: '0 0 4px', fontSize: 11, fontWeight: 600 } }>From</p>
							<div style={ { display: 'flex', gap: 8 } }>
								<TextControl label="Latitude" value={ String( ( arc.from || [ 0, 0 ] )[ 0 ] ) } onChange={ ( v ) => updateArcEndpoint( index, 'from', 0, v ) } />
								<TextControl label="Longitude" value={ String( ( arc.from || [ 0, 0 ] )[ 1 ] ) } onChange={ ( v ) => updateArcEndpoint( index, 'from', 1, v ) } />
							</div>
							<p style={ { margin: '0 0 4px', fontSize: 11, fontWeight: 600 } }>To</p>
							<div style={ { display: 'flex', gap: 8 } }>
								<TextControl label="Latitude" value={ String( ( arc.to || [ 0, 0 ] )[ 0 ] ) } onChange={ ( v ) => updateArcEndpoint( index, 'to', 0, v ) } />
								<TextControl label="Longitude" value={ String( ( arc.to || [ 0, 0 ] )[ 1 ] ) } onChange={ ( v ) => updateArcEndpoint( index, 'to', 1, v ) } />
							</div>
							<TextControl label="Color (hex, optional)" value={ arc.color || '' } onChange={ ( v ) => updateArc( index, 'color', v ) } />
							<Button isDestructive isSmall variant="secondary" onClick={ () => removeArc( index ) }>Remove</Button>
						</div>
					) ) }
					<Button variant="primary" onClick={ addArc } style={ { width: '100%' } }>+ Add Arc</Button>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<canvas ref={ canvasRef } data-cobe-globe style={ { width: '100%', height: '100%', display: 'block' } } />
				{ overlays.map( ( card ) => (
					<div key={ card.id } className="cobe-globe-card" data-lat={ card.location[ 0 ] } data-lng={ card.location[ 1 ] }>
						<div className="cobe-globe-card__avatar" style={ card.avatarUrl ? {} : { backgroundColor: card.avatarColor } }>
							{ card.avatarUrl
								? <img src={ card.avatarUrl } alt={ card.initials } />
								: card.initials
							}
						</div>
						<div className="cobe-globe-card__text">
							<span className="cobe-globe-card__message">{ card.message }</span>
							{ card.subtext ? <span className="cobe-globe-card__subtext">{ card.subtext }</span> : null }
						</div>
					</div>
				) ) }
			</div>
		</>
	);
}
