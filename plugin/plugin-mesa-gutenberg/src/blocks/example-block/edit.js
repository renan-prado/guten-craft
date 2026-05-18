import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ColorPicker } from '@wordpress/components';

export default function Edit( { attributes, setAttributes } ) {
	const { content, textColor, backgroundColor } = attributes;

	const blockProps = useBlockProps( {
		style: {
			color: textColor,
			backgroundColor,
		},
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Text Color', 'mesa-gutenberg' ) }>
					<ColorPicker
						color={ textColor }
						onChange={ ( value ) => setAttributes( { textColor: value } ) }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Background Color', 'mesa-gutenberg' ) }>
					<ColorPicker
						color={ backgroundColor }
						onChange={ ( value ) => setAttributes( { backgroundColor: value } ) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<RichText
					tagName="p"
					value={ content }
					onChange={ ( value ) => setAttributes( { content: value } ) }
					placeholder={ __( 'Write your content…', 'mesa-gutenberg' ) }
				/>
			</div>
		</>
	);
}
