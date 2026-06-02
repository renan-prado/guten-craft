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
		<BaseControl label={ label } id={ `uta-media-${ label }` } __nextHasNoMarginBottom>
			<div className="user-type-accordion-media-field">
				{ media.url && (
					<img src={ media.url } alt={ media.alt || '' } className="user-type-accordion-media-thumb" />
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
									: __( 'Select icon', 'mesa-gutenberg' ) }
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

function ChecksEditor( { checks, onChange } ) {
	const update = ( idx, patch ) => {
		const arr = checks.slice();
		arr[ idx ] = { ...arr[ idx ], ...patch };
		onChange( arr );
	};
	const remove = ( idx ) => {
		const arr = checks.slice();
		arr.splice( idx, 1 );
		onChange( arr );
	};
	const move = ( idx, delta ) => {
		const arr = checks.slice();
		const j = idx + delta;
		if ( j < 0 || j >= arr.length ) return;
		[ arr[ idx ], arr[ j ] ] = [ arr[ j ], arr[ idx ] ];
		onChange( arr );
	};
	const add = () => onChange( [ ...checks, { strong: '', text: '' } ] );

	return (
		<div className="user-type-accordion-checks-editor">
			{ checks.map( ( c, i ) => (
				<div key={ i } className="user-type-accordion-checks-editor__row">
					<div className="user-type-accordion-checks-editor__head">
						<strong>
							{ __( 'Check', 'mesa-gutenberg' ) } { i + 1 }
						</strong>
						<div>
							<Button size="small" variant="tertiary" disabled={ i === 0 } onClick={ () => move( i, -1 ) }>↑</Button>
							<Button size="small" variant="tertiary" disabled={ i === checks.length - 1 } onClick={ () => move( i, 1 ) }>↓</Button>
							<Button size="small" variant="tertiary" isDestructive onClick={ () => remove( i ) }>×</Button>
						</div>
					</div>
					<TextControl
						label={ __( 'Bold prefix', 'mesa-gutenberg' ) }
						value={ c.strong || '' }
						onChange={ ( v ) => update( i, { strong: v } ) }
						__nextHasNoMarginBottom
					/>
					<TextareaControl
						label={ __( 'Text', 'mesa-gutenberg' ) }
						value={ c.text || '' }
						onChange={ ( v ) => update( i, { text: v } ) }
						rows={ 2 }
						__nextHasNoMarginBottom
					/>
				</div>
			) ) }
			<Button variant="secondary" onClick={ add }>
				{ __( '+ Add check', 'mesa-gutenberg' ) }
			</Button>
		</div>
	);
}

function ItemEditor( { item, index, total, onChange, onRemove, onMove } ) {
	const update = ( patch ) => onChange( { ...item, ...patch } );

	return (
		<div className="user-type-accordion-item-editor">
			<div className="user-type-accordion-item-editor__head">
				<strong>
					{ __( 'Item', 'mesa-gutenberg' ) } { index + 1 }
					{ item.title ? ` — ${ item.title }` : '' }
				</strong>
				<div className="user-type-accordion-item-editor__actions">
					<Button size="small" variant="tertiary" disabled={ index === 0 } onClick={ () => onMove( -1 ) }>↑</Button>
					<Button size="small" variant="tertiary" disabled={ index === total - 1 } onClick={ () => onMove( 1 ) }>↓</Button>
					<Button size="small" variant="tertiary" isDestructive onClick={ onRemove }>×</Button>
				</div>
			</div>

			<TextControl
				label={ __( 'Title', 'mesa-gutenberg' ) }
				value={ item.title || '' }
				onChange={ ( v ) => update( { title: v } ) }
				__nextHasNoMarginBottom
			/>
			<TextareaControl
				label={ __( 'Summary (shown when open)', 'mesa-gutenberg' ) }
				value={ item.summary || '' }
				onChange={ ( v ) => update( { summary: v } ) }
				rows={ 2 }
				__nextHasNoMarginBottom
			/>
			<MediaField
				label={ __( 'Icon', 'mesa-gutenberg' ) }
				value={ item.icon }
				onChange={ ( v ) => update( { icon: v } ) }
			/>
			<BaseControl label={ __( 'Title color (open)', 'mesa-gutenberg' ) } id={ `uta-tc-${ index }` }>
				<ColorPicker
					color={ item.titleColor || '#169778' }
					onChange={ ( v ) => update( { titleColor: v } ) }
					enableAlpha
				/>
			</BaseControl>
			<BaseControl label={ __( 'Panel background', 'mesa-gutenberg' ) } id={ `uta-pb-${ index }` }>
				<ColorPicker
					color={ item.panelBgColor || 'rgba(17,117,93,0.05)' }
					onChange={ ( v ) => update( { panelBgColor: v } ) }
					enableAlpha
				/>
			</BaseControl>
			<BaseControl label={ __( 'Check icon color', 'mesa-gutenberg' ) } id={ `uta-cc-${ index }` }>
				<ColorPicker
					color={ item.checkColor || '#11755d' }
					onChange={ ( v ) => update( { checkColor: v } ) }
					enableAlpha
				/>
			</BaseControl>
			<TextareaControl
				label={ __( 'Panel intro', 'mesa-gutenberg' ) }
				value={ item.intro || '' }
				onChange={ ( v ) => update( { intro: v } ) }
				rows={ 3 }
				__nextHasNoMarginBottom
			/>
			<ChecksEditor
				checks={ item.checks || [] }
				onChange={ ( v ) => update( { checks: v } ) }
			/>
			<TextControl
				label={ __( 'Button label', 'mesa-gutenberg' ) }
				value={ item.buttonLabel || '' }
				onChange={ ( v ) => update( { buttonLabel: v } ) }
				__nextHasNoMarginBottom
			/>
			<TextControl
				label={ __( 'Button URL', 'mesa-gutenberg' ) }
				value={ item.buttonUrl || '' }
				onChange={ ( v ) => update( { buttonUrl: v } ) }
				__nextHasNoMarginBottom
			/>
			<TextControl
				label={ __( 'Anchor ID', 'mesa-gutenberg' ) }
				value={ item.id || '' }
				onChange={ ( v ) => update( { id: slugify( v ) } ) }
				help={ __( 'Stable identifier used for accordion state.', 'mesa-gutenberg' ) }
				__nextHasNoMarginBottom
			/>
		</div>
	);
}

const Chevron = () => (
	<span className="user-type-accordion__chevron" aria-hidden="true">
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
			<path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	</span>
);

const CheckIcon = ( { color } ) => (
	<span className="user-type-accordion__check" aria-hidden="true" style={ { color } }>
		<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
			<circle cx="10" cy="10" r="10" fill="currentColor" />
			<path d="M5.5 10.5l3 3 6-6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	</span>
);

function PanelPreview( { item, panelRadius, panelPadding } ) {
	const style = {
		background: item.panelBgColor,
		borderRadius: `${ panelRadius }px`,
		padding: `${ panelPadding }px`,
	};
	return (
		<div className="user-type-accordion__panel" style={ style }>
			{ item.intro && <p className="user-type-accordion__intro">{ item.intro }</p> }
			{ item.checks && item.checks.length > 0 && (
				<ul className="user-type-accordion__checks">
					{ item.checks.map( ( c, i ) => (
						<li key={ i } className="user-type-accordion__check-item">
							<CheckIcon color={ item.checkColor } />
							<span className="user-type-accordion__check-text">
								{ c.strong && <strong>{ c.strong }</strong> }
								{ c.text }
							</span>
						</li>
					) ) }
				</ul>
			) }
			{ item.buttonLabel && (
				<div className="user-type-accordion__button-wrap">
					<a className="user-type-accordion__button" href={ item.buttonUrl || '#' }>
						{ item.buttonLabel }
					</a>
				</div>
			) }
		</div>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const {
		items,
		defaultOpenIndex,
		columnGap,
		itemGap,
		closedTitleColor,
		summaryColor,
		dividerColor,
		chevronColor,
		panelRadius,
		panelPadding,
	} = attributes;

	const [ openIndex, setOpenIndex ] = useState( defaultOpenIndex || 0 );

	const updateItem = ( idx, next ) => {
		const arr = items.slice();
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
			title: __( 'New user type', 'mesa-gutenberg' ),
			titleColor: '#169778',
			panelBgColor: 'rgba(17,117,93,0.05)',
			checkColor: '#11755d',
			icon: EMPTY_MEDIA,
			summary: '',
			intro: '',
			checks: [],
			buttonLabel: '',
			buttonUrl: '',
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
		'--uta-column-gap': `${ columnGap }px`,
		'--uta-item-gap': `${ itemGap }px`,
		'--uta-closed-title-color': closedTitleColor,
		'--uta-summary-color': summaryColor,
		'--uta-divider-color': dividerColor,
		'--uta-chevron-color': chevronColor,
		'--uta-panel-radius': `${ panelRadius }px`,
		'--uta-panel-padding': `${ panelPadding }px`,
	};

	const blockProps = useBlockProps( {
		style: wrapperStyle,
		className: 'wp-block-mesa-gutenberg-user-type-accordion',
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
						label={ __( 'Panel padding (px)', 'mesa-gutenberg' ) }
						value={ panelPadding }
						onChange={ ( v ) => setAttributes( { panelPadding: v } ) }
						min={ 0 }
						max={ 48 }
					/>
					<RangeControl
						label={ __( 'Panel radius (px)', 'mesa-gutenberg' ) }
						value={ panelRadius }
						onChange={ ( v ) => setAttributes( { panelRadius: v } ) }
						min={ 0 }
						max={ 48 }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Colors', 'mesa-gutenberg' ) } initialOpen={ false }>
					<BaseControl label={ __( 'Closed title', 'mesa-gutenberg' ) } id="uta-closed-title">
						<ColorPicker color={ closedTitleColor } onChange={ ( v ) => setAttributes( { closedTitleColor: v } ) } enableAlpha />
					</BaseControl>
					<BaseControl label={ __( 'Summary text', 'mesa-gutenberg' ) } id="uta-summary">
						<ColorPicker color={ summaryColor } onChange={ ( v ) => setAttributes( { summaryColor: v } ) } enableAlpha />
					</BaseControl>
					<BaseControl label={ __( 'Divider', 'mesa-gutenberg' ) } id="uta-divider">
						<ColorPicker color={ dividerColor } onChange={ ( v ) => setAttributes( { dividerColor: v } ) } enableAlpha />
					</BaseControl>
					<BaseControl label={ __( 'Chevron', 'mesa-gutenberg' ) } id="uta-chevron">
						<ColorPicker color={ chevronColor } onChange={ ( v ) => setAttributes( { chevronColor: v } ) } enableAlpha />
					</BaseControl>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="user-type-accordion__grid">
					<ul className="user-type-accordion__list" role="presentation">
						{ items.map( ( item, i ) => {
							const isOpen = i === openIndex;
							const itemStyle = { '--uta-title-color': item.titleColor };
							return (
								<li
									key={ item.id || i }
									className={ `user-type-accordion__item${ isOpen ? ' is-open' : '' }` }
									style={ itemStyle }
								>
									<button
										type="button"
										className="user-type-accordion__header"
										onClick={ () => setOpenIndex( i ) }
									>
										<span className="user-type-accordion__title-wrap">
											{ item.icon && item.icon.url && (
												<img
													className="user-type-accordion__icon"
													src={ item.icon.url }
													alt={ item.icon.alt || '' }
												/>
											) }
											<span className="user-type-accordion__title">
												{ item.title }
											</span>
										</span>
										<Chevron />
									</button>
									{ item.summary && (
										<p className="user-type-accordion__summary">{ item.summary }</p>
									) }
									<div className="user-type-accordion__inline-panel">
										<PanelPreview
											item={ item }
											panelRadius={ panelRadius }
											panelPadding={ panelPadding }
										/>
									</div>
								</li>
							);
						} ) }
					</ul>

					<div className="user-type-accordion__stage" aria-hidden="true">
						{ activeItem && (
							<PanelPreview
								item={ activeItem }
								panelRadius={ panelRadius }
								panelPadding={ panelPadding }
							/>
						) }
					</div>
				</div>
			</div>
		</>
	);
}
