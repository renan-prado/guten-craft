import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function Save( { attributes } ) {
	const { content, textColor, backgroundColor } = attributes;

	const blockProps = useBlockProps.save( {
		style: {
			color: textColor,
			backgroundColor,
		},
	} );

	return (
		<div { ...blockProps }>
			<RichText.Content tagName="p" value={ content } />
		</div>
	);
}
