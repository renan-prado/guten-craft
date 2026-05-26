import { __ } from '@wordpress/i18n';
import { useBlockProps, InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';

const VARIANTS = [
	{ label: 'Purple Primary', value: 'purple-primary' },
	{ label: 'Purple Secondary', value: 'purple-secondary' },
	{ label: 'Gray Primary', value: 'gray-primary' },
	{ label: 'Gray Secondary', value: 'gray-secondary' },
];

const TEMPLATE = [
	[ 'core/button', { text: 'Request Access' } ],
];

const ALLOWED_BLOCKS = [ 'core/button' ];

export default function Edit( { attributes, setAttributes } ) {
	const { variant } = attributes;

	const blockProps = useBlockProps( {
		className: `is-variant-${ variant }`,
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Button Variant', 'mesa-gutenberg' ) }>
					<SelectControl
						label={ __( 'Style', 'mesa-gutenberg' ) }
						value={ variant }
						options={ VARIANTS }
						onChange={ ( value ) => setAttributes( { variant: value } ) }
						help={ __( 'Border gradient, fill, and hover/active states come from the variant.', 'mesa-gutenberg' ) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<InnerBlocks
					template={ TEMPLATE }
					allowedBlocks={ ALLOWED_BLOCKS }
					templateLock="all"
				/>
			</div>
		</>
	);
}
