import { useBlockProps, InspectorControls, InnerBlocks } from '@wordpress/block-editor';
import { PanelBody, SelectControl, RangeControl, ToggleControl, BaseControl, ColorPicker } from '@wordpress/components';

const LAYOUTS = [
	{ label: 'Media + text (side by side)', value: 'media-side' },
	{ label: 'Media on top', value: 'media-top' },
	{ label: 'Text only', value: 'text-only' },
	{ label: 'Showcase (large media + text)', value: 'showcase' },
];

const MEDIA_POSITIONS = [
	{ label: 'Left', value: 'left' },
	{ label: 'Right', value: 'right' },
];

const ALIGNMENTS = [
	{ label: 'Left', value: 'left' },
	{ label: 'Center', value: 'center' },
	{ label: 'Right', value: 'right' },
];

const TEMPLATE = [
	[ 'core/image', {} ],
	[ 'core/heading', { level: 4, placeholder: 'Card title' } ],
	[ 'core/paragraph', { placeholder: 'Card description…' } ],
];

const ALLOWED = [
	'core/heading',
	'core/paragraph',
	'core/image',
	'core/video',
	'core/buttons',
	'core/button',
	'core/separator',
	'core/spacer',
	'core/group',
	'core/columns',
];

export default function Edit( { attributes, setAttributes } ) {
	const {
		layout,
		mediaPosition,
		alignment,
		fullWidth,
		backgroundColor,
		borderColor,
		radius,
		padding,
		mediaWidth,
		mediaHeight,
		gap,
	} = attributes;

	const blockProps = useBlockProps( {
		className: [
			`is-layout-${ layout }`,
			`is-media-${ mediaPosition }`,
			`is-align-${ alignment }`,
			fullWidth ? 'is-full-width' : '',
		].filter( Boolean ).join( ' ' ),
		style: {
			'--nc-bg': backgroundColor,
			'--nc-border': borderColor,
			'--nc-radius': `${ radius }px`,
			'--nc-padding': `${ padding }px`,
			'--nc-media-width': `${ mediaWidth }px`,
			'--nc-media-height': `${ mediaHeight }px`,
			'--nc-gap': `${ gap }px`,
		},
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title="Layout">
					<SelectControl
						label="Layout"
						value={ layout }
						options={ LAYOUTS }
						onChange={ ( v ) => setAttributes( { layout: v } ) }
					/>
					{ ( layout === 'media-side' || layout === 'showcase' ) && (
						<SelectControl
							label="Media position"
							value={ mediaPosition }
							options={ MEDIA_POSITIONS }
							onChange={ ( v ) => setAttributes( { mediaPosition: v } ) }
						/>
					) }
					<SelectControl
						label="Text alignment"
						value={ alignment }
						options={ ALIGNMENTS }
						onChange={ ( v ) => setAttributes( { alignment: v } ) }
					/>
					<ToggleControl
						label="Full width (span all columns)"
						checked={ !! fullWidth }
						onChange={ ( v ) => setAttributes( { fullWidth: v } ) }
					/>
				</PanelBody>
				<PanelBody title="Spacing & shape" initialOpen={ false }>
					<RangeControl
						label="Border radius (px)"
						value={ radius }
						onChange={ ( v ) => setAttributes( { radius: v } ) }
						min={ 0 }
						max={ 48 }
					/>
					<RangeControl
						label="Padding (px)"
						value={ padding }
						onChange={ ( v ) => setAttributes( { padding: v } ) }
						min={ 0 }
						max={ 64 }
					/>
					<RangeControl
						label="Gap media↔text (px)"
						value={ gap }
						onChange={ ( v ) => setAttributes( { gap: v } ) }
						min={ 0 }
						max={ 80 }
					/>
					<RangeControl
						label="Media width (px)"
						value={ mediaWidth }
						onChange={ ( v ) => setAttributes( { mediaWidth: v } ) }
						min={ 80 }
						max={ 800 }
						step={ 4 }
					/>
					<RangeControl
						label="Media height (px)"
						value={ mediaHeight }
						onChange={ ( v ) => setAttributes( { mediaHeight: v } ) }
						min={ 80 }
						max={ 600 }
						step={ 4 }
					/>
				</PanelBody>
				<PanelBody title="Colors" initialOpen={ false }>
					<BaseControl label="Background" id="nc-bg">
						<ColorPicker
							color={ backgroundColor }
							onChange={ ( v ) => setAttributes( { backgroundColor: v } ) }
							enableAlpha
						/>
					</BaseControl>
					<BaseControl label="Border" id="nc-border">
						<ColorPicker
							color={ borderColor }
							onChange={ ( v ) => setAttributes( { borderColor: v } ) }
							enableAlpha
						/>
					</BaseControl>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="network-card__inner">
					<InnerBlocks
						allowedBlocks={ ALLOWED }
						template={ TEMPLATE }
						templateLock={ false }
					/>
				</div>
			</div>
		</>
	);
}
