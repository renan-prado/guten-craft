import { useBlockProps, InspectorControls, InnerBlocks, RichText } from '@wordpress/block-editor';
import { PanelBody, SelectControl, ToggleControl, TextControl } from '@wordpress/components';

const TAG_VARIANTS = [
	{ label: 'In-person', value: 'in-person' },
	{ label: 'Digital', value: 'digital' },
	{ label: 'Mixed', value: 'mixed' },
];

const ALLOWED_INNER = [
	'mesa-gutenberg/network-card',
	'core/group',
	'core/columns',
	'core/paragraph',
	'core/heading',
	'core/image',
	'core/buttons',
];

const TEMPLATE = [
	[ 'core/group', { layout: { type: 'grid', columnCount: 2 }, style: { spacing: { blockGap: '40px' } } }, [
		[ 'mesa-gutenberg/network-card' ],
		[ 'mesa-gutenberg/network-card' ],
	] ],
];

export default function Edit( { attributes, setAttributes } ) {
	const {
		tagText,
		tagVariant,
		title,
		subtitle,
		subtitleSecondary,
		defaultOpen,
		openOnScroll,
		dividerColor,
	} = attributes;

	const blockProps = useBlockProps( {
		className: `is-tag-${ tagVariant }${ defaultOpen ? ' is-open' : '' }`,
		style: { '--ns-divider-color': dividerColor },
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title="Section">
					<TextControl
						label="Chip text"
						value={ tagText }
						onChange={ ( v ) => setAttributes( { tagText: v } ) }
					/>
					<SelectControl
						label="Chip variant"
						value={ tagVariant }
						options={ TAG_VARIANTS }
						onChange={ ( v ) => setAttributes( { tagVariant: v } ) }
					/>
					<ToggleControl
						label="Open by default"
						checked={ !! defaultOpen }
						onChange={ ( v ) => setAttributes( { defaultOpen: v } ) }
					/>
					<ToggleControl
						label="Open automatically on scroll"
						checked={ !! openOnScroll }
						onChange={ ( v ) => setAttributes( { openOnScroll: v } ) }
					/>
					<TextControl
						label="Divider color"
						value={ dividerColor }
						onChange={ ( v ) => setAttributes( { dividerColor: v } ) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="network-section__header">
					<div className="network-section__top-row">
						<div className="network-section__title-group">
							<span className={ `network-section__chip network-section__chip--${ tagVariant }` }>
								<RichText
									tagName="span"
									value={ tagText }
									onChange={ ( v ) => setAttributes( { tagText: v } ) }
									allowedFormats={ [] }
									placeholder="CHIP"
								/>
							</span>
							<div className="network-section__title-row">
								<RichText
									tagName="h3"
									className="network-section__title"
									value={ title }
									onChange={ ( v ) => setAttributes( { title: v } ) }
									allowedFormats={ [ 'core/bold', 'core/italic' ] }
									placeholder="Section title"
								/>
								<span className="network-section__chevron" aria-hidden="true">
									<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
										<path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
								</span>
							</div>
						</div>
					</div>
					<div className="network-section__bottom-row">
						<RichText
							tagName="p"
							className="network-section__subtitle"
							value={ subtitle }
							onChange={ ( v ) => setAttributes( { subtitle: v } ) }
							allowedFormats={ [ 'core/bold', 'core/italic' ] }
							placeholder="Subtitle (optional)"
						/>
						{ ( subtitleSecondary || true ) && (
							<RichText
								tagName="p"
								className="network-section__subtitle network-section__subtitle--secondary"
								value={ subtitleSecondary }
								onChange={ ( v ) => setAttributes( { subtitleSecondary: v } ) }
								allowedFormats={ [ 'core/bold', 'core/italic' ] }
								placeholder="Secondary subtitle (optional)"
							/>
						) }
					</div>
				</div>
				<div className="network-section__panel">
					<InnerBlocks
						allowedBlocks={ ALLOWED_INNER }
						template={ TEMPLATE }
						templateLock={ false }
					/>
				</div>
			</div>
		</>
	);
}
