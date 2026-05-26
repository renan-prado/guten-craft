import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	TextControl,
	ColorPicker,
	BaseControl,
	Button,
} from '@wordpress/components';

function toItem( v ) {
	return typeof v === 'string' ? { url: v, alt: '' } : v;
}

function Row( { logos, direction, logoHeight, gap, speed } ) {
	const normalized = logos.map( toItem );
	const items = [ ...normalized, ...normalized ];
	const animName = direction === 'right' ? 'logos-scroll-right' : 'logos-scroll-left';

	return (
		<div className={ `logos-carousel__row logos-carousel__row--${ direction }` }>
			<div
				className="logos-carousel__track"
				style={ {
					gap:               `${ gap }px`,
					animationName:     animName,
					animationDuration: `${ speed }s`,
				} }
			>
				{ items.map( ( item, i ) => (
					<img
						key={ i }
						src={ item.url }
						alt={ item.alt || '' }
						className="logos-carousel__logo"
						style={ { height: `${ logoHeight }px` } }
					/>
				) ) }
			</div>
		</div>
	);
}

function LogosPicker( { label, value, onChange } ) {
	const items = value.map( toItem );

	const handleSelect = ( media ) => {
		const arr = Array.isArray( media ) ? media : [ media ];
		onChange(
			arr.map( ( m ) => ( {
				id:  m.id,
				url: m.url,
				alt: m.alt || '',
			} ) )
		);
	};

	const removeAt = ( idx ) => {
		const next = items.slice();
		next.splice( idx, 1 );
		onChange( next );
	};

	const move = ( idx, delta ) => {
		const next = items.slice();
		const j = idx + delta;
		if ( j < 0 || j >= next.length ) return;
		[ next[ idx ], next[ j ] ] = [ next[ j ], next[ idx ] ];
		onChange( next );
	};

	const ids = items.map( ( it ) => it.id ).filter( Boolean );

	return (
		<BaseControl label={ label } id={ `lc-picker-${ label }` }>
			<MediaUploadCheck>
				<MediaUpload
					multiple
					gallery
					addToGallery
					allowedTypes={ [ 'image' ] }
					value={ ids }
					onSelect={ handleSelect }
					render={ ( { open } ) => (
						<Button variant="secondary" onClick={ open }>
							{ items.length
								? __( 'Edit images', 'mesa-gutenberg' ) + ` (${ items.length })`
								: __( 'Select images', 'mesa-gutenberg' ) }
						</Button>
					) }
				/>
			</MediaUploadCheck>

			{ items.length > 0 && (
				<ul className="logos-carousel-thumbs">
					{ items.map( ( it, i ) => (
						<li key={ i } className="logos-carousel-thumbs__item">
							<img src={ it.url } alt="" />
							<div className="logos-carousel-thumbs__controls">
								<Button
									size="small"
									variant="tertiary"
									disabled={ i === 0 }
									onClick={ () => move( i, -1 ) }
									aria-label={ __( 'Move left', 'mesa-gutenberg' ) }
								>
									←
								</Button>
								<Button
									size="small"
									variant="tertiary"
									disabled={ i === items.length - 1 }
									onClick={ () => move( i, 1 ) }
									aria-label={ __( 'Move right', 'mesa-gutenberg' ) }
								>
									→
								</Button>
								<Button
									size="small"
									variant="tertiary"
									isDestructive
									onClick={ () => removeAt( i ) }
									aria-label={ __( 'Remove', 'mesa-gutenberg' ) }
								>
									×
								</Button>
							</div>
						</li>
					) ) }
				</ul>
			) }
		</BaseControl>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const {
		title,
		titleColor,
		logoHeight,
		gap,
		speed,
		rowOpacity,
		fadeColor,
		fadeWidth,
		backgroundColor,
		gradientColor,
		gradientFadeStop,
		verticalPadding,
		row1Logos,
		row2Logos,
	} = attributes;

	const stop = Math.max( 0, Math.min( 50, gradientFadeStop ) );
	const backgroundImage = `linear-gradient(180deg, transparent 0%, ${ gradientColor } ${ stop }%, ${ gradientColor } ${ 100 - stop }%, transparent 100%)`;

	const wrapperStyle = {
		'--logos-carousel-fade-color':    fadeColor,
		'--logos-carousel-fade-width':    `${ fadeWidth }px`,
		'--logos-carousel-row-opacity':   rowOpacity,
		'--logos-carousel-gradient-stop': `${ stop }%`,
		paddingTop:    `${ verticalPadding }px`,
		paddingBottom: `${ verticalPadding }px`,
		backgroundColor,
		backgroundImage,
	};

	const blockProps = useBlockProps( { style: wrapperStyle } );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Logos', 'mesa-gutenberg' ) }>
					<LogosPicker
						label={ __( 'Row 1 (scrolls left)', 'mesa-gutenberg' ) }
						value={ row1Logos }
						onChange={ ( v ) => setAttributes( { row1Logos: v } ) }
					/>
					<LogosPicker
						label={ __( 'Row 2 (scrolls right)', 'mesa-gutenberg' ) }
						value={ row2Logos }
						onChange={ ( v ) => setAttributes( { row2Logos: v } ) }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Title', 'mesa-gutenberg' ) } initialOpen={ false }>
					<TextControl
						label={ __( 'Title text', 'mesa-gutenberg' ) }
						value={ title }
						onChange={ ( v ) => setAttributes( { title: v } ) }
					/>
					<BaseControl label={ __( 'Title color', 'mesa-gutenberg' ) } id="lc-title-color">
						<ColorPicker
							color={ titleColor }
							onChange={ ( v ) => setAttributes( { titleColor: v } ) }
							enableAlpha={ false }
						/>
					</BaseControl>
				</PanelBody>

				<PanelBody title={ __( 'Layout', 'mesa-gutenberg' ) } initialOpen={ false }>
					<RangeControl
						label={ __( 'Logo height (px)', 'mesa-gutenberg' ) }
						value={ logoHeight }
						onChange={ ( v ) => setAttributes( { logoHeight: v } ) }
						min={ 16 }
						max={ 120 }
					/>
					<RangeControl
						label={ __( 'Gap between logos (px)', 'mesa-gutenberg' ) }
						value={ gap }
						onChange={ ( v ) => setAttributes( { gap: v } ) }
						min={ 16 }
						max={ 240 }
					/>
					<RangeControl
						label={ __( 'Row opacity', 'mesa-gutenberg' ) }
						value={ rowOpacity }
						onChange={ ( v ) => setAttributes( { rowOpacity: v } ) }
						min={ 0.1 }
						max={ 1 }
						step={ 0.05 }
					/>
					<RangeControl
						label={ __( 'Vertical padding (px)', 'mesa-gutenberg' ) }
						value={ verticalPadding }
						onChange={ ( v ) => setAttributes( { verticalPadding: v } ) }
						min={ 0 }
						max={ 200 }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Animation', 'mesa-gutenberg' ) } initialOpen={ false }>
					<RangeControl
						label={ __( 'Loop duration (s)', 'mesa-gutenberg' ) }
						value={ speed }
						onChange={ ( v ) => setAttributes( { speed: v } ) }
						min={ 10 }
						max={ 180 }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Edge fades', 'mesa-gutenberg' ) } initialOpen={ false }>
					<RangeControl
						label={ __( 'Fade width (px)', 'mesa-gutenberg' ) }
						value={ fadeWidth }
						onChange={ ( v ) => setAttributes( { fadeWidth: v } ) }
						min={ 0 }
						max={ 600 }
					/>
					<BaseControl label={ __( 'Fade color', 'mesa-gutenberg' ) } id="lc-fade-color">
						<ColorPicker
							color={ fadeColor }
							onChange={ ( v ) => setAttributes( { fadeColor: v } ) }
							enableAlpha={ true }
						/>
					</BaseControl>
				</PanelBody>

				<PanelBody title={ __( 'Background', 'mesa-gutenberg' ) } initialOpen={ false }>
					<BaseControl label={ __( 'Gradient color (middle)', 'mesa-gutenberg' ) } id="lc-gradient-color">
						<ColorPicker
							color={ gradientColor }
							onChange={ ( v ) => setAttributes( { gradientColor: v } ) }
							enableAlpha={ true }
						/>
					</BaseControl>
					<RangeControl
						label={ __( 'Vertical fade stop (%)', 'mesa-gutenberg' ) }
						value={ gradientFadeStop }
						onChange={ ( v ) => setAttributes( { gradientFadeStop: v } ) }
						min={ 0 }
						max={ 50 }
						help={ __( 'Distance from each edge before the gradient reaches full color. 0 = abrupt, 50 = no flat middle.', 'mesa-gutenberg' ) }
					/>
					<BaseControl label={ __( 'Solid background (under gradient)', 'mesa-gutenberg' ) } id="lc-bg-color">
						<ColorPicker
							color={ backgroundColor }
							onChange={ ( v ) => setAttributes( { backgroundColor: v } ) }
							enableAlpha={ true }
						/>
					</BaseControl>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ title && (
					<p className="logos-carousel__title" style={ { color: titleColor } }>
						{ title }
					</p>
				) }
				<div className="logos-carousel__rows">
					{ row1Logos.length > 0 ? (
						<Row logos={ row1Logos } direction="left" logoHeight={ logoHeight } gap={ gap } speed={ speed } />
					) : (
						<div className="logos-carousel__placeholder">
							{ __( 'Row 1 — select logos in the sidebar.', 'mesa-gutenberg' ) }
						</div>
					) }
					{ row2Logos.length > 0 ? (
						<Row logos={ row2Logos } direction="right" logoHeight={ logoHeight } gap={ gap } speed={ speed } />
					) : (
						<div className="logos-carousel__placeholder">
							{ __( 'Row 2 — select logos in the sidebar.', 'mesa-gutenberg' ) }
						</div>
					) }
					<span className="logos-carousel__fade logos-carousel__fade--left"  aria-hidden="true" />
					<span className="logos-carousel__fade logos-carousel__fade--right" aria-hidden="true" />
				</div>
			</div>
		</>
	);
}
