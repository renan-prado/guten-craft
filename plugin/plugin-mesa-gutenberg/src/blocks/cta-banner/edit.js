import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	InnerBlocks,
	RichText,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import {
	PanelBody,
	Button,
	BaseControl,
	ColorPicker,
	TextControl,
	RangeControl,
	SelectControl,
} from '@wordpress/components';

const TEMPLATE = [
	[ 'mesa-gutenberg/site-button', { variant: 'gray-primary' }, [
		[ 'core/button', { text: 'Request Access', url: '#' } ],
	] ],
];

const ALLOWED_BLOCKS = [ 'mesa-gutenberg/site-button' ];

function MediaSlot( { label, url, alt, onSelect, onRemove, onAltChange } ) {
	return (
		<div style={ { marginBottom: 16 } }>
			<p style={ { fontWeight: 600, margin: '0 0 8px' } }>{ label }</p>
			{ url && (
				<img
					src={ url }
					alt={ alt }
					style={ { maxWidth: '100%', height: 'auto', display: 'block', marginBottom: 8, border: '1px solid #ddd' } }
				/>
			) }
			<MediaUploadCheck>
				<MediaUpload
					onSelect={ onSelect }
					allowedTypes={ [ 'image' ] }
					value={ undefined }
					render={ ( { open } ) => (
						<div style={ { display: 'flex', gap: 8, marginBottom: 8 } }>
							<Button variant="secondary" onClick={ open }>
								{ url ? __( 'Replace', 'mesa-gutenberg' ) : __( 'Upload', 'mesa-gutenberg' ) }
							</Button>
							{ url && (
								<Button variant="tertiary" isDestructive onClick={ onRemove }>
									{ __( 'Remove', 'mesa-gutenberg' ) }
								</Button>
							) }
						</div>
					) }
				/>
			</MediaUploadCheck>
			<TextControl label={ __( 'Alt text', 'mesa-gutenberg' ) } value={ alt } onChange={ onAltChange } />
		</div>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const {
		heading, description,
		desktopBgUrl, desktopBgAlt,
		mobileBgUrl, mobileBgAlt,
		radius, roundBottom,
		textMaxWidth, paddingX, paddingY, paddingXMobile, paddingYMobile,
		contentGap, buttonsAlign, minHeight, surroundingColor,
	} = attributes;

	const cssVars = {
		'--cta-radius': `${ radius }px`,
		'--cta-radius-bottom': roundBottom ? `${ radius }px` : '0px',
		'--cta-text-maxw': textMaxWidth,
		'--cta-pad-x': paddingX,
		'--cta-pad-y': paddingY,
		'--cta-pad-x-mobile': paddingXMobile,
		'--cta-pad-y-mobile': paddingYMobile,
		'--cta-gap': `${ contentGap }px`,
		'--cta-buttons-direction': buttonsAlign,
		'--cta-min-height': `${ minHeight }px`,
		'--cta-surrounding': surroundingColor,
		backgroundColor: surroundingColor,
	};

	const blockProps = useBlockProps( { style: cssVars } );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Background images', 'mesa-gutenberg' ) } initialOpen={ true }>
					<MediaSlot
						label={ __( 'Desktop background', 'mesa-gutenberg' ) }
						url={ desktopBgUrl }
						alt={ desktopBgAlt }
						onSelect={ ( m ) => setAttributes( { desktopBgUrl: m.url, desktopBgId: m.id, desktopBgAlt: m.alt || desktopBgAlt } ) }
						onRemove={ () => setAttributes( { desktopBgUrl: '', desktopBgId: undefined } ) }
						onAltChange={ ( v ) => setAttributes( { desktopBgAlt: v } ) }
					/>
					<MediaSlot
						label={ __( 'Mobile background (≤768px)', 'mesa-gutenberg' ) }
						url={ mobileBgUrl }
						alt={ mobileBgAlt }
						onSelect={ ( m ) => setAttributes( { mobileBgUrl: m.url, mobileBgId: m.id, mobileBgAlt: m.alt || mobileBgAlt } ) }
						onRemove={ () => setAttributes( { mobileBgUrl: '', mobileBgId: undefined } ) }
						onAltChange={ ( v ) => setAttributes( { mobileBgAlt: v } ) }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Shape & surrounding', 'mesa-gutenberg' ) } initialOpen={ false }>
					<RangeControl label={ __( 'Border radius (px)', 'mesa-gutenberg' ) } value={ radius } onChange={ ( v ) => setAttributes( { radius: v } ) } min={ 0 } max={ 80 } />
					<SelectControl
						label={ __( 'Round bottom corners too', 'mesa-gutenberg' ) }
						value={ roundBottom ? 'yes' : 'no' }
						options={ [
							{ label: 'No (top only)', value: 'no' },
							{ label: 'Yes (all four)', value: 'yes' },
						] }
						onChange={ ( v ) => setAttributes( { roundBottom: v === 'yes' } ) }
					/>
					<BaseControl label={ __( 'Surrounding color (visible in rounded-corner cutouts and behind the banner)', 'mesa-gutenberg' ) } id="cta-banner-surrounding">
						<ColorPicker
							color={ surroundingColor }
							onChange={ ( v ) => setAttributes( { surroundingColor: v } ) }
							enableAlpha
						/>
					</BaseControl>
				</PanelBody>
				<PanelBody title={ __( 'Layout', 'mesa-gutenberg' ) } initialOpen={ false }>
					<TextControl label={ __( 'Text max width (CSS)', 'mesa-gutenberg' ) } value={ textMaxWidth } onChange={ ( v ) => setAttributes( { textMaxWidth: v } ) } />
					<TextControl label={ __( 'Padding X (desktop)', 'mesa-gutenberg' ) } value={ paddingX } onChange={ ( v ) => setAttributes( { paddingX: v } ) } />
					<TextControl label={ __( 'Padding Y (desktop)', 'mesa-gutenberg' ) } value={ paddingY } onChange={ ( v ) => setAttributes( { paddingY: v } ) } />
					<TextControl label={ __( 'Padding X (mobile)', 'mesa-gutenberg' ) } value={ paddingXMobile } onChange={ ( v ) => setAttributes( { paddingXMobile: v } ) } />
					<TextControl label={ __( 'Padding Y (mobile)', 'mesa-gutenberg' ) } value={ paddingYMobile } onChange={ ( v ) => setAttributes( { paddingYMobile: v } ) } />
					<RangeControl label={ __( 'Gap between text and buttons (px)', 'mesa-gutenberg' ) } value={ contentGap } onChange={ ( v ) => setAttributes( { contentGap: v } ) } min={ 0 } max={ 160 } />
					<RangeControl label={ __( 'Min height (px)', 'mesa-gutenberg' ) } value={ minHeight } onChange={ ( v ) => setAttributes( { minHeight: v } ) } min={ 0 } max={ 1200 } step={ 8 } />
					<SelectControl
						label={ __( 'Buttons direction (desktop)', 'mesa-gutenberg' ) }
						value={ buttonsAlign }
						options={ [
							{ label: 'Row (horizontal)', value: 'row' },
							{ label: 'Column (stacked)', value: 'column' },
						] }
						onChange={ ( v ) => setAttributes( { buttonsAlign: v } ) }
						help={ __( 'Mobile always stacks vertically.', 'mesa-gutenberg' ) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="cta-banner__shell">
					{ desktopBgUrl && (
						<img className="cta-banner__bg cta-banner__bg--desktop" src={ desktopBgUrl } alt={ desktopBgAlt } />
					) }
					{ mobileBgUrl && (
						<img className="cta-banner__bg cta-banner__bg--mobile" src={ mobileBgUrl } alt={ mobileBgAlt } />
					) }
					{ ! desktopBgUrl && ! mobileBgUrl && (
						<div className="cta-banner__placeholder">{ __( 'Upload a background image in the sidebar.', 'mesa-gutenberg' ) }</div>
					) }
					<div className="cta-banner__content">
						<div className="cta-banner__text">
							<RichText
								tagName="h2"
								className="cta-banner__heading"
								value={ heading }
								onChange={ ( v ) => setAttributes( { heading: v } ) }
								placeholder={ __( 'Heading…', 'mesa-gutenberg' ) }
							/>
							<RichText
								tagName="p"
								className="cta-banner__description"
								value={ description }
								onChange={ ( v ) => setAttributes( { description: v } ) }
								placeholder={ __( 'Description…', 'mesa-gutenberg' ) }
							/>
						</div>
						<div className="cta-banner__buttons">
							<InnerBlocks
								template={ TEMPLATE }
								allowedBlocks={ ALLOWED_BLOCKS }
								templateLock={ false }
							/>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
