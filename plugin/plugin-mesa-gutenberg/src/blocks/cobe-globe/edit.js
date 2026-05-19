import { useBlockProps, InspectorControls, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { PanelBody, RangeControl, TextControl, Button } from '@wordpress/components';
import { useEffect, useRef } from '@wordpress/element';
import createGlobe from 'cobe';

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
	{ location: [ 40.7128, -74.006 ], size: 0.08 },
	{ location: [ 51.5074, -0.1278 ], size: 0.06 },
	{ location: [ 35.6762, 139.6503 ], size: 0.06 },
	{ location: [ -33.8688, 151.2093 ], size: 0.05 },
	{ location: [ 1.3521, 103.8198 ], size: 0.05 },
	{ location: [ 48.8566, 2.3522 ], size: 0.05 },
	{ location: [ 55.7558, 37.6176 ], size: 0.05 },
];

export default function Edit( { attributes, setAttributes } ) {
	const { size, overlays } = attributes;
	const canvasRef = useRef( null );
	const wrapperRef = useRef( null );

	const blockProps = useBlockProps( {
		ref: wrapperRef,
		'data-globe-size': size,
		style: { width: `${ size }px`, height: `${ size }px`, maxWidth: '100%' },
	} );

	useEffect( () => {
		if ( ! canvasRef.current ) return;
		const dpr = window.devicePixelRatio || 1;
		const theta = 0.15;
		let phi = 0.3;

		const globe = createGlobe( canvasRef.current, {
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
			markers: MARKERS,
			onRender( state ) {
				state.phi = phi;
				phi += 0.003;
				if ( ! wrapperRef.current ) return;
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
			},
		} );

		return () => globe.destroy();
	}, [ size ] );

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
