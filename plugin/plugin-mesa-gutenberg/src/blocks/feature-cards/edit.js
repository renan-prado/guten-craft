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
	TextareaControl,
	SelectControl,
	ColorPicker,
	BaseControl,
	Button,
} from '@wordpress/components';
import { ICON_PRESETS, ICON_OPTIONS, renderPresetSvgString } from './icons';

function slugify( s ) {
	return ( s || '' )
		.toString()
		.toLowerCase()
		.trim()
		.replace( /[^a-z0-9]+/g, '-' )
		.replace( /^-+|-+$/g, '' )
		.slice( 0, 40 );
}

function uniqId( base, items, ignoreIndex = -1 ) {
	const taken = new Set(
		items.map( ( it, i ) => ( i === ignoreIndex ? null : it.id ) ).filter( Boolean )
	);
	let id = base || `card-${ Date.now().toString( 36 ) }`;
	let n = 2;
	while ( taken.has( id ) ) {
		id = `${ base }-${ n++ }`;
	}
	return id;
}

function IconPreview( { item, size } ) {
	if ( item.iconKey && ICON_PRESETS[ item.iconKey ] ) {
		return (
			<span
				className="feature-cards-editor__icon-preview"
				style={ { width: size, height: size } }
				dangerouslySetInnerHTML={ {
					__html: renderPresetSvgString( item.iconKey, size ),
				} }
			/>
		);
	}
	if ( item.iconUrl ) {
		return (
			<img
				className="feature-cards-editor__icon-preview"
				src={ item.iconUrl }
				alt={ item.iconAlt || '' }
				style={ { width: size, height: size, objectFit: 'contain' } }
			/>
		);
	}
	return (
		<span
			className="feature-cards-editor__icon-preview is-empty"
			style={ { width: size, height: size } }
		/>
	);
}

function ItemEditor( { item, index, total, onChange, onRemove, onMove } ) {
	const update = ( patch ) => onChange( { ...item, ...patch } );

	return (
		<div className="feature-cards-item-editor">
			<div className="feature-cards-item-editor__head">
				<strong>
					{ __( 'Card', 'mesa-gutenberg' ) } { index + 1 }
					{ item.title ? ` — ${ item.title }` : '' }
				</strong>
				<div className="feature-cards-item-editor__actions">
					<Button
						size="small"
						variant="tertiary"
						disabled={ index === 0 }
						onClick={ () => onMove( -1 ) }
						aria-label={ __( 'Move up', 'mesa-gutenberg' ) }
					>
						↑
					</Button>
					<Button
						size="small"
						variant="tertiary"
						disabled={ index === total - 1 }
						onClick={ () => onMove( 1 ) }
						aria-label={ __( 'Move down', 'mesa-gutenberg' ) }
					>
						↓
					</Button>
					<Button
						size="small"
						variant="tertiary"
						isDestructive
						onClick={ onRemove }
						aria-label={ __( 'Remove', 'mesa-gutenberg' ) }
					>
						×
					</Button>
				</div>
			</div>

			<TextControl
				label={ __( 'Title', 'mesa-gutenberg' ) }
				value={ item.title || '' }
				onChange={ ( v ) => update( { title: v } ) }
				__nextHasNoMarginBottom
			/>
			<TextareaControl
				label={ __( 'Description', 'mesa-gutenberg' ) }
				value={ item.description || '' }
				onChange={ ( v ) => update( { description: v } ) }
				rows={ 3 }
				__nextHasNoMarginBottom
			/>

			<SelectControl
				label={ __( 'Icon preset', 'mesa-gutenberg' ) }
				value={ item.iconKey || '' }
				options={ ICON_OPTIONS }
				onChange={ ( v ) => update( { iconKey: v } ) }
				help={
					item.iconKey
						? __( 'Built-in purple-gradient icon.', 'mesa-gutenberg' )
						: __( 'Pick a preset, or upload a custom icon below.', 'mesa-gutenberg' )
				}
				__nextHasNoMarginBottom
			/>

			{ ! item.iconKey && (
				<BaseControl
					label={ __( 'Custom icon image', 'mesa-gutenberg' ) }
					id={ `fc-icon-${ index }` }
					__nextHasNoMarginBottom
				>
					<div className="feature-cards-item-editor__media-row">
						{ item.iconUrl && (
							<img
								src={ item.iconUrl }
								alt={ item.iconAlt || '' }
								className="feature-cards-item-editor__media-thumb"
							/>
						) }
						<MediaUploadCheck>
							<MediaUpload
								allowedTypes={ [ 'image' ] }
								value={ 0 }
								onSelect={ ( m ) =>
									update( {
										iconUrl: m.url,
										iconAlt: m.alt || '',
									} )
								}
								render={ ( { open } ) => (
									<Button variant="secondary" onClick={ open }>
										{ item.iconUrl
											? __( 'Replace', 'mesa-gutenberg' )
											: __( 'Select image', 'mesa-gutenberg' ) }
									</Button>
								) }
							/>
						</MediaUploadCheck>
						{ item.iconUrl && (
							<Button
								variant="tertiary"
								isDestructive
								onClick={ () => update( { iconUrl: '', iconAlt: '' } ) }
							>
								{ __( 'Remove', 'mesa-gutenberg' ) }
							</Button>
						) }
					</div>
				</BaseControl>
			) }

			<TextControl
				label={ __( 'Anchor ID (advanced)', 'mesa-gutenberg' ) }
				value={ item.id || '' }
				onChange={ ( v ) => update( { id: slugify( v ) } ) }
				help={ __( 'Stable identifier for this card.', 'mesa-gutenberg' ) }
				__nextHasNoMarginBottom
			/>
		</div>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const {
		items,
		columnsDesktop,
		columnsTablet,
		gap,
		cardRadius,
		cardPadding,
		cardBackground,
		cardBorderColor,
		cardBorderWidth,
		cardShadow,
		titleColor,
		descriptionColor,
		iconSize,
		textAlign,
	} = attributes;

	const updateItem = ( idx, next ) => {
		const arr = items.slice();
		if ( next.id !== items[ idx ].id ) {
			next = { ...next, id: uniqId( slugify( next.id || next.title ), arr, idx ) };
		}
		arr[ idx ] = next;
		setAttributes( { items: arr } );
	};

	const addItem = () => {
		const base = slugify( `card-${ items.length + 1 }` );
		const arr = items.slice();
		arr.push( {
			id: uniqId( base, arr ),
			iconKey: 'magnifying-glass-bar-chart',
			iconUrl: '',
			iconAlt: '',
			title: __( 'New feature', 'mesa-gutenberg' ),
			description: '',
		} );
		setAttributes( { items: arr } );
	};

	const removeItem = ( idx ) => {
		const arr = items.slice();
		arr.splice( idx, 1 );
		setAttributes( { items: arr } );
	};

	const moveItem = ( idx, delta ) => {
		const arr = items.slice();
		const j = idx + delta;
		if ( j < 0 || j >= arr.length ) return;
		[ arr[ idx ], arr[ j ] ] = [ arr[ j ], arr[ idx ] ];
		setAttributes( { items: arr } );
	};

	const wrapperStyle = {
		'--fc-columns-desktop': columnsDesktop,
		'--fc-columns-tablet': columnsTablet,
		'--fc-gap': `${ gap }px`,
		'--fc-card-radius': `${ cardRadius }px`,
		'--fc-card-padding': `${ cardPadding }px`,
		'--fc-card-bg': cardBackground,
		'--fc-card-border-color': cardBorderColor,
		'--fc-card-border-width': `${ cardBorderWidth }px`,
		'--fc-card-shadow': cardShadow,
		'--fc-title-color': titleColor,
		'--fc-desc-color': descriptionColor,
		'--fc-icon-size': `${ iconSize }px`,
		'--fc-text-align': textAlign,
	};

	const blockProps = useBlockProps( {
		style: wrapperStyle,
		className: 'wp-block-mesa-gutenberg-feature-cards',
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Cards', 'mesa-gutenberg' ) }>
					{ items.map( ( item, i ) => (
						<ItemEditor
							key={ item.id || i }
							item={ item }
							index={ i }
							total={ items.length }
							onChange={ ( next ) => updateItem( i, next ) }
							onRemove={ () => removeItem( i ) }
							onMove={ ( delta ) => moveItem( i, delta ) }
						/>
					) ) }
					<Button variant="primary" onClick={ addItem }>
						{ __( '+ Add card', 'mesa-gutenberg' ) }
					</Button>
				</PanelBody>

				<PanelBody title={ __( 'Layout', 'mesa-gutenberg' ) } initialOpen={ false }>
					<RangeControl
						label={ __( 'Columns (desktop)', 'mesa-gutenberg' ) }
						value={ columnsDesktop }
						onChange={ ( v ) => setAttributes( { columnsDesktop: v } ) }
						min={ 1 }
						max={ 6 }
					/>
					<RangeControl
						label={ __( 'Columns (tablet)', 'mesa-gutenberg' ) }
						value={ columnsTablet }
						onChange={ ( v ) => setAttributes( { columnsTablet: v } ) }
						min={ 1 }
						max={ 4 }
					/>
					<RangeControl
						label={ __( 'Gap (px)', 'mesa-gutenberg' ) }
						value={ gap }
						onChange={ ( v ) => setAttributes( { gap: v } ) }
						min={ 0 }
						max={ 64 }
					/>
					<SelectControl
						label={ __( 'Text alignment', 'mesa-gutenberg' ) }
						value={ textAlign }
						options={ [
							{ value: 'left', label: __( 'Left', 'mesa-gutenberg' ) },
							{ value: 'center', label: __( 'Center', 'mesa-gutenberg' ) },
							{ value: 'right', label: __( 'Right', 'mesa-gutenberg' ) },
						] }
						onChange={ ( v ) => setAttributes( { textAlign: v } ) }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Card style', 'mesa-gutenberg' ) } initialOpen={ false }>
					<RangeControl
						label={ __( 'Border radius (px)', 'mesa-gutenberg' ) }
						value={ cardRadius }
						onChange={ ( v ) => setAttributes( { cardRadius: v } ) }
						min={ 0 }
						max={ 48 }
					/>
					<RangeControl
						label={ __( 'Padding (px)', 'mesa-gutenberg' ) }
						value={ cardPadding }
						onChange={ ( v ) => setAttributes( { cardPadding: v } ) }
						min={ 8 }
						max={ 64 }
					/>
					<RangeControl
						label={ __( 'Border width (px)', 'mesa-gutenberg' ) }
						value={ cardBorderWidth }
						onChange={ ( v ) => setAttributes( { cardBorderWidth: v } ) }
						min={ 0 }
						max={ 8 }
					/>
					<RangeControl
						label={ __( 'Icon size (px)', 'mesa-gutenberg' ) }
						value={ iconSize }
						onChange={ ( v ) => setAttributes( { iconSize: v } ) }
						min={ 16 }
						max={ 96 }
					/>
					<TextControl
						label={ __( 'Box shadow (CSS)', 'mesa-gutenberg' ) }
						value={ cardShadow }
						onChange={ ( v ) => setAttributes( { cardShadow: v } ) }
						help={ __( 'Leave empty to disable.', 'mesa-gutenberg' ) }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Colors', 'mesa-gutenberg' ) } initialOpen={ false }>
					<BaseControl label={ __( 'Card background', 'mesa-gutenberg' ) } id="fc-bg">
						<ColorPicker
							color={ cardBackground }
							onChange={ ( v ) => setAttributes( { cardBackground: v } ) }
							enableAlpha
						/>
					</BaseControl>
					<BaseControl label={ __( 'Card border', 'mesa-gutenberg' ) } id="fc-border">
						<ColorPicker
							color={ cardBorderColor }
							onChange={ ( v ) => setAttributes( { cardBorderColor: v } ) }
							enableAlpha
						/>
					</BaseControl>
					<BaseControl label={ __( 'Title', 'mesa-gutenberg' ) } id="fc-title">
						<ColorPicker
							color={ titleColor }
							onChange={ ( v ) => setAttributes( { titleColor: v } ) }
							enableAlpha
						/>
					</BaseControl>
					<BaseControl label={ __( 'Description', 'mesa-gutenberg' ) } id="fc-desc">
						<ColorPicker
							color={ descriptionColor }
							onChange={ ( v ) => setAttributes( { descriptionColor: v } ) }
							enableAlpha
						/>
					</BaseControl>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="feature-cards__grid">
					{ items.map( ( item, i ) => (
						<div
							key={ item.id || i }
							className="feature-cards__card"
							data-fc-item={ item.id || `card-${ i }` }
						>
							<IconPreview item={ item } size={ iconSize } />
							<p className="feature-cards__title">{ item.title }</p>
							<p className="feature-cards__description">
								{ item.description }
							</p>
						</div>
					) ) }
				</div>
			</div>
		</>
	);
}
