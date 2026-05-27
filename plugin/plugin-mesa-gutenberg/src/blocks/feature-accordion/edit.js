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
	ColorPicker,
	BaseControl,
	Button,
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import { useState } from '@wordpress/element';

const EMPTY_MEDIA = { id: 0, url: '', alt: '' };

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
	let id = base || `item-${ Date.now().toString( 36 ) }`;
	let n = 2;
	while ( taken.has( id ) ) {
		id = `${ base }-${ n++ }`;
	}
	return id;
}

function MediaField( { label, value, onChange } ) {
	const media = value && value.url ? value : EMPTY_MEDIA;
	return (
		<BaseControl label={ label } id={ `fa-media-${ label }` } __nextHasNoMarginBottom>
			<div className="feature-accordion-media-field">
				{ media.url && (
					<img src={ media.url } alt={ media.alt || '' } className="feature-accordion-media-thumb" />
				) }
				<MediaUploadCheck>
					<MediaUpload
						allowedTypes={ [ 'image' ] }
						value={ media.id }
						onSelect={ ( m ) =>
							onChange( { id: m.id, url: m.url, alt: m.alt || '' } )
						}
						render={ ( { open } ) => (
							<Button variant="secondary" onClick={ open }>
								{ media.url
									? __( 'Replace', 'mesa-gutenberg' )
									: __( 'Select image', 'mesa-gutenberg' ) }
							</Button>
						) }
					/>
				</MediaUploadCheck>
				{ media.url && (
					<Button
						variant="tertiary"
						isDestructive
						onClick={ () => onChange( EMPTY_MEDIA ) }
					>
						{ __( 'Remove', 'mesa-gutenberg' ) }
					</Button>
				) }
			</div>
		</BaseControl>
	);
}

function ItemEditor( { item, index, total, onChange, onRemove, onMove } ) {
	const update = ( patch ) => onChange( { ...item, ...patch } );

	return (
		<div className="feature-accordion-item-editor">
			<div className="feature-accordion-item-editor__head">
				<strong>
					{ __( 'Item', 'mesa-gutenberg' ) } { index + 1 }
					{ item.title ? ` — ${ item.title }` : '' }
				</strong>
				<div className="feature-accordion-item-editor__actions">
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
			<MediaField
				label={ __( 'Icon', 'mesa-gutenberg' ) }
				value={ item.icon }
				onChange={ ( v ) => update( { icon: v } ) }
			/>
			<MediaField
				label={ __( 'Illustration', 'mesa-gutenberg' ) }
				value={ item.image }
				onChange={ ( v ) => update( { image: v } ) }
			/>
			<TextControl
				label={ __( 'Anchor ID (advanced)', 'mesa-gutenberg' ) }
				value={ item.id || '' }
				onChange={ ( v ) => update( { id: slugify( v ) } ) }
				help={ __( 'Stable identifier used for accordion state.', 'mesa-gutenberg' ) }
				__nextHasNoMarginBottom
			/>
		</div>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const {
		items,
		defaultOpenIndex,
		columnGap,
		itemGap,
		titleColor,
		descriptionColor,
		dividerColor,
		chevronColor,
		imageRadius,
		imageMinHeight,
	} = attributes;

	const [ openIndex, setOpenIndex ] = useState( defaultOpenIndex || 0 );

	const updateItem = ( idx, next ) => {
		const arr = items.slice();
		// keep id unique
		if ( next.id !== items[ idx ].id ) {
			next = { ...next, id: uniqId( slugify( next.id || next.title ), arr, idx ) };
		}
		arr[ idx ] = next;
		setAttributes( { items: arr } );
	};

	const addItem = () => {
		const base = slugify( `item-${ items.length + 1 }` );
		const arr = items.slice();
		arr.push( {
			id: uniqId( base, arr ),
			title: __( 'New feature', 'mesa-gutenberg' ),
			description: '',
			icon: EMPTY_MEDIA,
			image: EMPTY_MEDIA,
		} );
		setAttributes( { items: arr } );
	};

	const removeItem = ( idx ) => {
		const arr = items.slice();
		arr.splice( idx, 1 );
		setAttributes( { items: arr } );
		if ( openIndex >= arr.length ) setOpenIndex( Math.max( 0, arr.length - 1 ) );
	};

	const moveItem = ( idx, delta ) => {
		const arr = items.slice();
		const j = idx + delta;
		if ( j < 0 || j >= arr.length ) return;
		[ arr[ idx ], arr[ j ] ] = [ arr[ j ], arr[ idx ] ];
		setAttributes( { items: arr } );
	};

	const wrapperStyle = {
		'--fa-column-gap': `${ columnGap }px`,
		'--fa-item-gap': `${ itemGap }px`,
		'--fa-title-color': titleColor,
		'--fa-desc-color': descriptionColor,
		'--fa-divider-color': dividerColor,
		'--fa-chevron-color': chevronColor,
		'--fa-image-radius': `${ imageRadius }px`,
		'--fa-image-min-height': `${ imageMinHeight }px`,
	};

	const blockProps = useBlockProps( {
		style: wrapperStyle,
		className: 'wp-block-mesa-gutenberg-feature-accordion',
	} );

	const activeItem = items[ openIndex ] || items[ 0 ];

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Items', 'mesa-gutenberg' ) }>
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
						{ __( '+ Add item', 'mesa-gutenberg' ) }
					</Button>
				</PanelBody>

				<PanelBody title={ __( 'Behavior', 'mesa-gutenberg' ) } initialOpen={ false }>
					<NumberControl
						label={ __( 'Default open index', 'mesa-gutenberg' ) }
						min={ 0 }
						max={ Math.max( 0, items.length - 1 ) }
						value={ defaultOpenIndex }
						onChange={ ( v ) =>
							setAttributes( { defaultOpenIndex: parseInt( v, 10 ) || 0 } )
						}
					/>
				</PanelBody>

				<PanelBody title={ __( 'Layout', 'mesa-gutenberg' ) } initialOpen={ false }>
					<RangeControl
						label={ __( 'Column gap (px)', 'mesa-gutenberg' ) }
						value={ columnGap }
						onChange={ ( v ) => setAttributes( { columnGap: v } ) }
						min={ 0 }
						max={ 200 }
					/>
					<RangeControl
						label={ __( 'Gap between items (px)', 'mesa-gutenberg' ) }
						value={ itemGap }
						onChange={ ( v ) => setAttributes( { itemGap: v } ) }
						min={ 0 }
						max={ 80 }
					/>
					<RangeControl
						label={ __( 'Image min-height (px)', 'mesa-gutenberg' ) }
						value={ imageMinHeight }
						onChange={ ( v ) => setAttributes( { imageMinHeight: v } ) }
						min={ 200 }
						max={ 900 }
					/>
					<RangeControl
						label={ __( 'Image border radius (px)', 'mesa-gutenberg' ) }
						value={ imageRadius }
						onChange={ ( v ) => setAttributes( { imageRadius: v } ) }
						min={ 0 }
						max={ 48 }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Colors', 'mesa-gutenberg' ) } initialOpen={ false }>
					<BaseControl label={ __( 'Title', 'mesa-gutenberg' ) } id="fa-title-color">
						<ColorPicker
							color={ titleColor }
							onChange={ ( v ) => setAttributes( { titleColor: v } ) }
							enableAlpha
						/>
					</BaseControl>
					<BaseControl label={ __( 'Description', 'mesa-gutenberg' ) } id="fa-desc-color">
						<ColorPicker
							color={ descriptionColor }
							onChange={ ( v ) => setAttributes( { descriptionColor: v } ) }
							enableAlpha
						/>
					</BaseControl>
					<BaseControl label={ __( 'Divider', 'mesa-gutenberg' ) } id="fa-div-color">
						<ColorPicker
							color={ dividerColor }
							onChange={ ( v ) => setAttributes( { dividerColor: v } ) }
							enableAlpha
						/>
					</BaseControl>
					<BaseControl label={ __( 'Chevron', 'mesa-gutenberg' ) } id="fa-chev-color">
						<ColorPicker
							color={ chevronColor }
							onChange={ ( v ) => setAttributes( { chevronColor: v } ) }
							enableAlpha
						/>
					</BaseControl>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="feature-accordion__grid">
					<ul className="feature-accordion__list" role="presentation">
						{ items.map( ( item, i ) => {
							const isOpen = i === openIndex;
							return (
								<li
									key={ item.id || i }
									className={ `feature-accordion__item${ isOpen ? ' is-open' : '' }` }
								>
									<button
										type="button"
										className="feature-accordion__header"
										onClick={ () => setOpenIndex( i ) }
									>
										<span className="feature-accordion__title-wrap">
											{ item.icon && item.icon.url && (
												<img
													className="feature-accordion__icon"
													src={ item.icon.url }
													alt={ item.icon.alt || '' }
												/>
											) }
											<span className="feature-accordion__title">
												{ item.title }
											</span>
										</span>
										<span
											className="feature-accordion__chevron"
											aria-hidden="true"
										>
											<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
												<path
													d="M6 9l6 6 6-6"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
												/>
											</svg>
										</span>
									</button>
									<div className="feature-accordion__content">
										{ item.description && (
											<p className="feature-accordion__description">
												{ item.description }
											</p>
										) }
										{ item.image && item.image.url && (
											<figure className="feature-accordion__image feature-accordion__image--inline">
												<img src={ item.image.url } alt={ item.image.alt || '' } />
											</figure>
										) }
									</div>
								</li>
							);
						} ) }
					</ul>

					<div className="feature-accordion__stage" aria-hidden="true">
						{ activeItem && activeItem.image && activeItem.image.url ? (
							<figure className="feature-accordion__image">
								<img
									src={ activeItem.image.url }
									alt={ activeItem.image.alt || '' }
								/>
							</figure>
						) : (
							<div className="feature-accordion__stage-placeholder">
								{ __(
									'Selecione uma imagem ilustrativa para este item.',
									'mesa-gutenberg'
								) }
							</div>
						) }
					</div>
				</div>
			</div>
		</>
	);
}
