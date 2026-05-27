import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
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
import { ICON_TYPES, ICON_OPTIONS, renderIconSvgString } from './icons';

function slugify( s ) {
	return ( s || '' )
		.toString()
		.toLowerCase()
		.trim()
		.replace( /[^a-z0-9]+/g, '-' )
		.replace( /^-+|-+$/g, '' )
		.slice( 0, 40 );
}

function uniqId( base, columns, ignoreIndex = -1 ) {
	const taken = new Set(
		columns
			.map( ( c, i ) => ( i === ignoreIndex ? null : c.id ) )
			.filter( Boolean )
	);
	let id = base || `column-${ Date.now().toString( 36 ) }`;
	let n = 2;
	while ( taken.has( id ) ) {
		id = `${ base }-${ n++ }`;
	}
	return id;
}

function Icon( { iconType, iconColor, size } ) {
	const preset = ICON_TYPES[ iconType ];
	if ( ! preset || ! preset.inner ) return null;
	return (
		<span
			className="comparison-table__icon"
			style={ { color: iconColor, width: size, height: size } }
			aria-hidden="true"
			dangerouslySetInnerHTML={ {
				__html: renderIconSvgString( iconType, size ),
			} }
		/>
	);
}

function ColumnEditor( { column, index, total, onChange, onRemove, onMove } ) {
	const update = ( patch ) => onChange( { ...column, ...patch } );

	const updateItemAt = ( i, value ) => {
		const arr = ( column.items || [] ).slice();
		arr[ i ] = value;
		update( { items: arr } );
	};
	const addItemAt = () => {
		const arr = ( column.items || [] ).slice();
		arr.push( '' );
		update( { items: arr } );
	};
	const removeItemAt = ( i ) => {
		const arr = ( column.items || [] ).slice();
		arr.splice( i, 1 );
		update( { items: arr } );
	};
	const moveItemAt = ( i, delta ) => {
		const arr = ( column.items || [] ).slice();
		const j = i + delta;
		if ( j < 0 || j >= arr.length ) return;
		[ arr[ i ], arr[ j ] ] = [ arr[ j ], arr[ i ] ];
		update( { items: arr } );
	};

	return (
		<div className="comparison-table-column-editor">
			<div className="comparison-table-column-editor__head">
				<strong>
					{ __( 'Column', 'mesa-gutenberg' ) } { index + 1 }
					{ column.title ? ` — ${ column.title }` : '' }
				</strong>
				<div className="comparison-table-column-editor__actions">
					<Button
						size="small"
						variant="tertiary"
						disabled={ index === 0 }
						onClick={ () => onMove( -1 ) }
						aria-label={ __( 'Move left', 'mesa-gutenberg' ) }
					>
						←
					</Button>
					<Button
						size="small"
						variant="tertiary"
						disabled={ index === total - 1 }
						onClick={ () => onMove( 1 ) }
						aria-label={ __( 'Move right', 'mesa-gutenberg' ) }
					>
						→
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
				label={ __( 'Header title', 'mesa-gutenberg' ) }
				value={ column.title || '' }
				onChange={ ( v ) => update( { title: v } ) }
				__nextHasNoMarginBottom
			/>

			<SelectControl
				label={ __( 'Item icon', 'mesa-gutenberg' ) }
				value={ column.iconType || 'check' }
				options={ ICON_OPTIONS }
				onChange={ ( v ) => update( { iconType: v } ) }
				__nextHasNoMarginBottom
			/>

			<BaseControl
				label={ __( 'Header text color', 'mesa-gutenberg' ) }
				id={ `ct-title-color-${ index }` }
			>
				<ColorPicker
					color={ column.titleColor || '#475569' }
					onChange={ ( v ) => update( { titleColor: v } ) }
					enableAlpha
				/>
			</BaseControl>

			<TextControl
				label={ __( 'Header background (CSS)', 'mesa-gutenberg' ) }
				value={ column.titleBackground || '' }
				onChange={ ( v ) => update( { titleBackground: v } ) }
				help={ __(
					'Accepts solid colors or gradients (e.g. linear-gradient(90deg, #3a1845 0%, #692b7e 100%)).',
					'mesa-gutenberg'
				) }
				__nextHasNoMarginBottom
			/>

			<BaseControl
				label={ __( 'Icon color', 'mesa-gutenberg' ) }
				id={ `ct-icon-color-${ index }` }
			>
				<ColorPicker
					color={ column.iconColor || '#692b7e' }
					onChange={ ( v ) => update( { iconColor: v } ) }
					enableAlpha
				/>
			</BaseControl>

			<TextControl
				label={ __( 'Anchor ID (advanced)', 'mesa-gutenberg' ) }
				value={ column.id || '' }
				onChange={ ( v ) => update( { id: slugify( v ) } ) }
				__nextHasNoMarginBottom
			/>

			<BaseControl
				label={ __( 'Items', 'mesa-gutenberg' ) }
				id={ `ct-items-${ index }` }
				__nextHasNoMarginBottom
			>
				<div className="comparison-table-column-editor__items-list">
					{ ( column.items || [] ).map( ( text, i ) => (
						<div
							key={ i }
							className="comparison-table-column-editor__item-row"
						>
							<TextareaControl
								value={ text }
								onChange={ ( v ) => updateItemAt( i, v ) }
								rows={ 2 }
								__nextHasNoMarginBottom
							/>
							<Button
								size="small"
								variant="tertiary"
								disabled={ i === 0 }
								onClick={ () => moveItemAt( i, -1 ) }
								aria-label={ __( 'Move up', 'mesa-gutenberg' ) }
							>
								↑
							</Button>
							<Button
								size="small"
								variant="tertiary"
								disabled={ i === ( column.items || [] ).length - 1 }
								onClick={ () => moveItemAt( i, 1 ) }
								aria-label={ __( 'Move down', 'mesa-gutenberg' ) }
							>
								↓
							</Button>
							<Button
								size="small"
								variant="tertiary"
								isDestructive
								onClick={ () => removeItemAt( i ) }
								aria-label={ __( 'Remove', 'mesa-gutenberg' ) }
							>
								×
							</Button>
						</div>
					) ) }
				</div>
				<Button
					variant="secondary"
					onClick={ addItemAt }
					style={ { marginTop: 8 } }
				>
					{ __( '+ Add item', 'mesa-gutenberg' ) }
				</Button>
			</BaseControl>
		</div>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const {
		columns,
		radius,
		borderColor,
		borderWidth,
		shadow,
		titlePaddingY,
		titlePaddingX,
		itemsPaddingY,
		itemsPaddingX,
		itemsGap,
		itemTextColor,
		dividerColor,
		titleAlignDesktop,
		mobileTitleAlign,
		mobileTitlePaddingX,
		mobileItemsPaddingX,
		mobileGap,
		iconSize,
		itemMinHeightDesktop,
	} = attributes;

	const updateColumn = ( idx, next ) => {
		const arr = columns.slice();
		if ( next.id !== columns[ idx ].id ) {
			next = {
				...next,
				id: uniqId( slugify( next.id || next.title ), arr, idx ),
			};
		}
		arr[ idx ] = next;
		setAttributes( { columns: arr } );
	};

	const addColumn = () => {
		const base = slugify( `column-${ columns.length + 1 }` );
		const arr = columns.slice();
		arr.push( {
			id: uniqId( base, arr ),
			title: __( 'New column', 'mesa-gutenberg' ),
			titleColor: '#475569',
			titleBackground: '#e2e8f0',
			iconType: 'check',
			iconColor: '#692b7e',
			items: [ '' ],
		} );
		setAttributes( { columns: arr } );
	};

	const removeColumn = ( idx ) => {
		const arr = columns.slice();
		arr.splice( idx, 1 );
		setAttributes( { columns: arr } );
	};

	const moveColumn = ( idx, delta ) => {
		const arr = columns.slice();
		const j = idx + delta;
		if ( j < 0 || j >= arr.length ) return;
		[ arr[ idx ], arr[ j ] ] = [ arr[ j ], arr[ idx ] ];
		setAttributes( { columns: arr } );
	};

	const wrapperStyle = {
		'--ct-radius': `${ radius }px`,
		'--ct-border-color': borderColor,
		'--ct-border-width': `${ borderWidth }px`,
		'--ct-shadow': shadow,
		'--ct-title-padding-y': `${ titlePaddingY }px`,
		'--ct-title-padding-x': `${ titlePaddingX }px`,
		'--ct-items-padding-y': `${ itemsPaddingY }px`,
		'--ct-items-padding-x': `${ itemsPaddingX }px`,
		'--ct-items-gap': `${ itemsGap }px`,
		'--ct-item-text-color': itemTextColor,
		'--ct-divider-color': dividerColor,
		'--ct-title-align': titleAlignDesktop,
		'--ct-mobile-title-align': mobileTitleAlign,
		'--ct-mobile-title-padding-x': `${ mobileTitlePaddingX }px`,
		'--ct-mobile-items-padding-x': `${ mobileItemsPaddingX }px`,
		'--ct-mobile-gap': `${ mobileGap }px`,
		'--ct-icon-size': `${ iconSize }px`,
		'--ct-item-min-height-desktop': `${ itemMinHeightDesktop }px`,
	};

	const blockProps = useBlockProps( {
		style: wrapperStyle,
		className: 'wp-block-mesa-gutenberg-comparison-table',
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Columns', 'mesa-gutenberg' ) }>
					{ columns.map( ( column, i ) => (
						<ColumnEditor
							key={ column.id || i }
							column={ column }
							index={ i }
							total={ columns.length }
							onChange={ ( next ) => updateColumn( i, next ) }
							onRemove={ () => removeColumn( i ) }
							onMove={ ( delta ) => moveColumn( i, delta ) }
						/>
					) ) }
					<Button variant="primary" onClick={ addColumn }>
						{ __( '+ Add column', 'mesa-gutenberg' ) }
					</Button>
				</PanelBody>

				<PanelBody
					title={ __( 'Container style', 'mesa-gutenberg' ) }
					initialOpen={ false }
				>
					<RangeControl
						label={ __( 'Border radius (px)', 'mesa-gutenberg' ) }
						value={ radius }
						onChange={ ( v ) => setAttributes( { radius: v } ) }
						min={ 0 }
						max={ 48 }
					/>
					<RangeControl
						label={ __( 'Border width (px)', 'mesa-gutenberg' ) }
						value={ borderWidth }
						onChange={ ( v ) => setAttributes( { borderWidth: v } ) }
						min={ 0 }
						max={ 8 }
					/>
					<TextControl
						label={ __( 'Box shadow (CSS)', 'mesa-gutenberg' ) }
						value={ shadow }
						onChange={ ( v ) => setAttributes( { shadow: v } ) }
					/>
					<BaseControl
						label={ __( 'Border color', 'mesa-gutenberg' ) }
						id="ct-border-color"
					>
						<ColorPicker
							color={ borderColor }
							onChange={ ( v ) => setAttributes( { borderColor: v } ) }
							enableAlpha
						/>
					</BaseControl>
					<BaseControl
						label={ __( 'Divider color', 'mesa-gutenberg' ) }
						id="ct-divider-color"
					>
						<ColorPicker
							color={ dividerColor }
							onChange={ ( v ) =>
								setAttributes( { dividerColor: v } )
							}
							enableAlpha
						/>
					</BaseControl>
				</PanelBody>

				<PanelBody
					title={ __( 'Spacing & icons', 'mesa-gutenberg' ) }
					initialOpen={ false }
				>
					<RangeControl
						label={ __( 'Title padding Y (px)', 'mesa-gutenberg' ) }
						value={ titlePaddingY }
						onChange={ ( v ) =>
							setAttributes( { titlePaddingY: v } )
						}
						min={ 0 }
						max={ 80 }
					/>
					<RangeControl
						label={ __( 'Title padding X — desktop (px)', 'mesa-gutenberg' ) }
						value={ titlePaddingX }
						onChange={ ( v ) =>
							setAttributes( { titlePaddingX: v } )
						}
						min={ 0 }
						max={ 160 }
					/>
					<RangeControl
						label={ __( 'Title padding X — mobile (px)', 'mesa-gutenberg' ) }
						value={ mobileTitlePaddingX }
						onChange={ ( v ) =>
							setAttributes( { mobileTitlePaddingX: v } )
						}
						min={ 0 }
						max={ 80 }
					/>
					<RangeControl
						label={ __( 'Items padding Y (px)', 'mesa-gutenberg' ) }
						value={ itemsPaddingY }
						onChange={ ( v ) =>
							setAttributes( { itemsPaddingY: v } )
						}
						min={ 0 }
						max={ 80 }
					/>
					<RangeControl
						label={ __( 'Items padding X — desktop (px)', 'mesa-gutenberg' ) }
						value={ itemsPaddingX }
						onChange={ ( v ) =>
							setAttributes( { itemsPaddingX: v } )
						}
						min={ 0 }
						max={ 160 }
					/>
					<RangeControl
						label={ __( 'Items padding X — mobile (px)', 'mesa-gutenberg' ) }
						value={ mobileItemsPaddingX }
						onChange={ ( v ) =>
							setAttributes( { mobileItemsPaddingX: v } )
						}
						min={ 0 }
						max={ 80 }
					/>
					<RangeControl
						label={ __( 'Items gap (px)', 'mesa-gutenberg' ) }
						value={ itemsGap }
						onChange={ ( v ) => setAttributes( { itemsGap: v } ) }
						min={ 0 }
						max={ 48 }
					/>
					<RangeControl
						label={ __( 'Mobile gap between cards (px)', 'mesa-gutenberg' ) }
						value={ mobileGap }
						onChange={ ( v ) => setAttributes( { mobileGap: v } ) }
						min={ 0 }
						max={ 80 }
					/>
					<RangeControl
						label={ __( 'Icon size (px)', 'mesa-gutenberg' ) }
						value={ iconSize }
						onChange={ ( v ) => setAttributes( { iconSize: v } ) }
						min={ 12 }
						max={ 48 }
					/>
					<RangeControl
						label={ __( 'Item min-height — desktop (px)', 'mesa-gutenberg' ) }
						value={ itemMinHeightDesktop }
						onChange={ ( v ) =>
							setAttributes( { itemMinHeightDesktop: v } )
						}
						min={ 0 }
						max={ 160 }
						help={ __(
							'Locks each row to the same height so columns stay aligned. 48px = 2 lines of body text.',
							'mesa-gutenberg'
						) }
					/>
					<SelectControl
						label={ __( 'Title alignment — desktop', 'mesa-gutenberg' ) }
						value={ titleAlignDesktop }
						options={ [
							{ value: 'left', label: __( 'Left', 'mesa-gutenberg' ) },
							{ value: 'center', label: __( 'Center', 'mesa-gutenberg' ) },
							{ value: 'right', label: __( 'Right', 'mesa-gutenberg' ) },
						] }
						onChange={ ( v ) =>
							setAttributes( { titleAlignDesktop: v } )
						}
					/>
					<SelectControl
						label={ __( 'Title alignment — mobile', 'mesa-gutenberg' ) }
						value={ mobileTitleAlign }
						options={ [
							{ value: 'left', label: __( 'Left', 'mesa-gutenberg' ) },
							{ value: 'center', label: __( 'Center', 'mesa-gutenberg' ) },
							{ value: 'right', label: __( 'Right', 'mesa-gutenberg' ) },
						] }
						onChange={ ( v ) =>
							setAttributes( { mobileTitleAlign: v } )
						}
					/>
					<BaseControl
						label={ __( 'Item text color', 'mesa-gutenberg' ) }
						id="ct-item-text-color"
					>
						<ColorPicker
							color={ itemTextColor }
							onChange={ ( v ) =>
								setAttributes( { itemTextColor: v } )
							}
							enableAlpha
						/>
					</BaseControl>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="comparison-table__grid">
					{ columns.map( ( column, ci ) => (
						<div
							key={ column.id || ci }
							className="comparison-table__column"
							data-ct-column={ column.id || `column-${ ci }` }
						>
							<div
								className="comparison-table__title"
								style={ {
									background: column.titleBackground,
									color: column.titleColor,
								} }
							>
								<p
									className="comparison-table__title-text"
									style={ { color: column.titleColor } }
								>
									{ column.title }
								</p>
							</div>
							<div className="comparison-table__items">
								{ ( column.items || [] ).flatMap( ( text, ii ) => {
									const item = (
										<div
											key={ `i-${ ci }-${ ii }` }
											className="comparison-table__item"
										>
											<Icon
												iconType={ column.iconType }
												iconColor={ column.iconColor }
												size={ iconSize }
											/>
											<p className="comparison-table__item-text">
												{ text }
											</p>
										</div>
									);
									if ( ii === 0 ) return [ item ];
									return [
										<span
											key={ `d-${ ci }-${ ii }` }
											className="comparison-table__divider"
											aria-hidden="true"
										/>,
										item,
									];
								} ) }
							</div>
						</div>
					) ) }
				</div>
			</div>
		</>
	);
}
