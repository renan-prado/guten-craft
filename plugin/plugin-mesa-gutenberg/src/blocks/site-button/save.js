import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function Save( { attributes } ) {
	const { variant } = attributes;

	const blockProps = useBlockProps.save( {
		className: `is-variant-${ variant }`,
	} );

	return (
		<div { ...blockProps }>
			<InnerBlocks.Content />
		</div>
	);
}
