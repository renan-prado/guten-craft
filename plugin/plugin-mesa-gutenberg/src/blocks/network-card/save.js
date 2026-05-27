import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function Save( { attributes } ) {
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

	const wrapperProps = useBlockProps.save( {
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
		<div { ...wrapperProps }>
			<div className="network-card__inner">
				<InnerBlocks.Content />
			</div>
		</div>
	);
}
