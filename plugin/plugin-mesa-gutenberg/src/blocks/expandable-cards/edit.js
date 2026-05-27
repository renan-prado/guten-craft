import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
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

const ArrowRight = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
		<path d="M8 20h22M22 12l8 8-8 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

const ArrowDown = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
		<path d="M16 6v20M8 18l8 8 8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

function ItemEditor( { item, index, total, onChange, onRemove, onMove } ) {
	const update = ( patch ) => onChange( { ...item, ...patch } );
	const tagsText = ( item.tags || [] ).join( '\n' );

	return (
		<div className="expandable-cards-item-editor">
			<div className="expandable-cards-item-editor__head">
				<strong>
					{ __( 'Card', 'mesa-gutenberg' ) } { index + 1 }
					{ item.collapsedTitle ? ` — ${ item.collapsedTitle }` : '' }
				</strong>
				<div className="expandable-cards-item-editor__actions">
					<Button size="small" variant="tertiary" disabled={ index === 0 } onClick={ () => onMove( -1 ) } aria-label={ __( 'Move up', 'mesa-gutenberg' ) }>↑</Button>
					<Button size="small" variant="tertiary" disabled={ index === total - 1 } onClick={ () => onMove( 1 ) } aria-label={ __( 'Move down', 'mesa-gutenberg' ) }>↓</Button>
					<Button size="small" variant="tertiary" isDestructive onClick={ onRemove } aria-label={ __( 'Remove', 'mesa-gutenberg' ) }>×</Button>
				</div>
			</div>

			<TextControl
				label={ __( 'Collapsed title (visible when closed)', 'mesa-gutenberg' ) }
				value={ item.collapsedTitle || '' }
				onChange={ ( v ) => update( { collapsedTitle: v } ) }
				__nextHasNoMarginBottom
			/>
			<TextControl
				label={ __( 'Eyebrow (small label above title)', 'mesa-gutenberg' ) }
				value={ item.eyebrow || '' }
				onChange={ ( v ) => update( { eyebrow: v } ) }
				__nextHasNoMarginBottom
			/>
			<TextareaControl
				label={ __( 'Title (gradient heading)', 'mesa-gutenberg' ) }
				value={ item.title || '' }
				onChange={ ( v ) => update( { title: v } ) }
				rows={ 2 }
				__nextHasNoMarginBottom
			/>
			<TextareaControl
				label={ __( 'Description', 'mesa-gutenberg' ) }
				value={ item.description || '' }
				onChange={ ( v ) => update( { description: v } ) }
				rows={ 3 }
				__nextHasNoMarginBottom
			/>
			<TextareaControl
				label={ __( 'Tags (one per line)', 'mesa-gutenberg' ) }
				value={ tagsText }
				onChange={ ( v ) =>
					update( { tags: v.split( '\n' ).map( ( s ) => s.trim() ).filter( Boolean ) } )
				}
				rows={ 5 }
				__nextHasNoMarginBottom
			/>
			<TextControl
				label={ __( 'Anchor ID (advanced)', 'mesa-gutenberg' ) }
				value={ item.id || '' }
				onChange={ ( v ) => update( { id: slugify( v ) } ) }
				help={ __( 'Stable identifier used for the card state.', 'mesa-gutenberg' ) }
				__nextHasNoMarginBottom
			/>
		</div>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const {
		items,
		defaultOpenIndex,
		gap,
		cardRadius,
		cardBg,
		cardBorderColor,
		cardBorderWidth,
		cardShadow,
		activeWidthDesktop,
		collapsedWidthDesktop,
		activeMinHeight,
		eyebrowColor,
		descriptionColor,
		collapsedTitleColor,
		tagBorderColor,
		tagTextColor,
		arrowColor,
	} = attributes;

	const [ openIndex, setOpenIndex ] = useState( defaultOpenIndex || 0 );

	const updateItem = ( idx, next ) => {
		const arr = items.slice();
		if ( next.id !== items[ idx ].id ) {
			next = { ...next, id: uniqId( slugify( next.id || next.collapsedTitle ), arr, idx ) };
		}
		arr[ idx ] = next;
		setAttributes( { items: arr } );
	};

	const addItem = () => {
		const base = slugify( `card-${ items.length + 1 }` );
		const arr = items.slice();
		arr.push( {
			id: uniqId( base, arr ),
			collapsedTitle: __( 'New card', 'mesa-gutenberg' ),
			eyebrow: '',
			title: '',
			description: '',
			tags: [],
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
		'--ec-gap': `${ gap }px`,
		'--ec-radius': `${ cardRadius }px`,
		'--ec-card-bg': cardBg,
		'--ec-border-color': cardBorderColor,
		'--ec-border-width': `${ cardBorderWidth }px`,
		'--ec-shadow': cardShadow,
		'--ec-active-w': `${ activeWidthDesktop }px`,
		'--ec-collapsed-w': `${ collapsedWidthDesktop }px`,
		'--ec-active-min-h': `${ activeMinHeight }px`,
		'--ec-eyebrow-color': eyebrowColor,
		'--ec-desc-color': descriptionColor,
		'--ec-collapsed-title-color': collapsedTitleColor,
		'--ec-tag-border-color': tagBorderColor,
		'--ec-tag-text-color': tagTextColor,
		'--ec-arrow-color': arrowColor,
	};

	const blockProps = useBlockProps( {
		style: wrapperStyle,
		className: 'wp-block-mesa-gutenberg-expandable-cards',
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
						label={ __( 'Gap between cards (px)', 'mesa-gutenberg' ) }
						value={ gap } onChange={ ( v ) => setAttributes( { gap: v } ) } min={ 0 } max={ 80 }
					/>
					<RangeControl
						label={ __( 'Card border radius (px)', 'mesa-gutenberg' ) }
						value={ cardRadius } onChange={ ( v ) => setAttributes( { cardRadius: v } ) } min={ 0 } max={ 48 }
					/>
					<RangeControl
						label={ __( 'Card border width (px)', 'mesa-gutenberg' ) }
						value={ cardBorderWidth } onChange={ ( v ) => setAttributes( { cardBorderWidth: v } ) } min={ 0 } max={ 8 }
					/>
					<RangeControl
						label={ __( 'Active width — desktop (px)', 'mesa-gutenberg' ) }
						value={ activeWidthDesktop } onChange={ ( v ) => setAttributes( { activeWidthDesktop: v } ) } min={ 400 } max={ 1200 }
					/>
					<RangeControl
						label={ __( 'Collapsed width — desktop (px)', 'mesa-gutenberg' ) }
						value={ collapsedWidthDesktop } onChange={ ( v ) => setAttributes( { collapsedWidthDesktop: v } ) } min={ 100 } max={ 400 }
					/>
					<RangeControl
						label={ __( 'Active min-height (px)', 'mesa-gutenberg' ) }
						value={ activeMinHeight } onChange={ ( v ) => setAttributes( { activeMinHeight: v } ) } min={ 240 } max={ 800 }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Colors', 'mesa-gutenberg' ) } initialOpen={ false }>
					<BaseControl label={ __( 'Card background', 'mesa-gutenberg' ) } id="ec-card-bg">
						<ColorPicker color={ cardBg } onChange={ ( v ) => setAttributes( { cardBg: v } ) } enableAlpha />
					</BaseControl>
					<BaseControl label={ __( 'Card border', 'mesa-gutenberg' ) } id="ec-card-border">
						<ColorPicker color={ cardBorderColor } onChange={ ( v ) => setAttributes( { cardBorderColor: v } ) } enableAlpha />
					</BaseControl>
					<BaseControl label={ __( 'Eyebrow text', 'mesa-gutenberg' ) } id="ec-eyebrow">
						<ColorPicker color={ eyebrowColor } onChange={ ( v ) => setAttributes( { eyebrowColor: v } ) } enableAlpha />
					</BaseControl>
					<BaseControl label={ __( 'Description text', 'mesa-gutenberg' ) } id="ec-desc">
						<ColorPicker color={ descriptionColor } onChange={ ( v ) => setAttributes( { descriptionColor: v } ) } enableAlpha />
					</BaseControl>
					<BaseControl label={ __( 'Collapsed title text', 'mesa-gutenberg' ) } id="ec-collapsed-title">
						<ColorPicker color={ collapsedTitleColor } onChange={ ( v ) => setAttributes( { collapsedTitleColor: v } ) } enableAlpha />
					</BaseControl>
					<BaseControl label={ __( 'Tag border', 'mesa-gutenberg' ) } id="ec-tag-border">
						<ColorPicker color={ tagBorderColor } onChange={ ( v ) => setAttributes( { tagBorderColor: v } ) } enableAlpha />
					</BaseControl>
					<BaseControl label={ __( 'Tag text', 'mesa-gutenberg' ) } id="ec-tag-text">
						<ColorPicker color={ tagTextColor } onChange={ ( v ) => setAttributes( { tagTextColor: v } ) } enableAlpha />
					</BaseControl>
					<BaseControl label={ __( 'Arrow', 'mesa-gutenberg' ) } id="ec-arrow">
						<ColorPicker color={ arrowColor } onChange={ ( v ) => setAttributes( { arrowColor: v } ) } enableAlpha />
					</BaseControl>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="expandable-cards__grid">
					{ items.map( ( item, i ) => {
						const isOpen = i === openIndex;
						return (
							<div
								key={ item.id || i }
								className={ `expandable-cards__card${ isOpen ? ' is-open' : '' }` }
								onMouseEnter={ () => setOpenIndex( i ) }
							>
								<button
									type="button"
									className="expandable-cards__collapsed"
									onClick={ () => setOpenIndex( i ) }
								>
									<span className="expandable-cards__collapsed-title">
										{ item.collapsedTitle }
									</span>
									<span className="expandable-cards__arrow expandable-cards__arrow--right" aria-hidden="true">
										<ArrowRight />
									</span>
									<span className="expandable-cards__arrow expandable-cards__arrow--down" aria-hidden="true">
										<ArrowDown />
									</span>
								</button>

								<div className="expandable-cards__expanded">
									{ item.eyebrow && (
										<p className="expandable-cards__eyebrow">{ item.eyebrow }</p>
									) }
									{ item.title && (
										<h3 className="expandable-cards__title has-gradient-purple-text">
											{ item.title }
										</h3>
									) }
									{ item.description && (
										<p className="expandable-cards__description">{ item.description }</p>
									) }
									{ item.tags && item.tags.length > 0 && (
										<ul className="expandable-cards__tags">
											{ item.tags.map( ( tag, ti ) => (
												<li key={ ti } className="expandable-cards__tag">{ tag }</li>
											) ) }
										</ul>
									) }
								</div>
							</div>
						);
					} ) }
				</div>
			</div>
		</>
	);
}
