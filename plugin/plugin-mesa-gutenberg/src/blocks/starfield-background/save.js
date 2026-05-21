import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function Save( { attributes } ) {
	const { starCount, backgroundColor, starColor, minHeight, glowColor } = attributes;

	const glowStyle = glowColor
		? { background: `radial-gradient(ellipse 100% 80% at 75% 50%, ${ glowColor } 0%, transparent 70%)` }
		: null;

	return (
		<div
			{ ...useBlockProps.save( {
				style:             { position: 'relative', minHeight: `${ minHeight }px`, backgroundColor },
				'data-star-count': starCount,
				'data-bg-color':   backgroundColor,
				'data-star-color': starColor,
			} ) }
		>
			<canvas
				data-starfield
				className="starfield-background__canvas"
			/>
			{ glowStyle && (
				<span
					className="starfield-background__glow"
					style={ glowStyle }
					aria-hidden="true"
				/>
			) }
			<div className="starfield-background__content">
				<InnerBlocks.Content />
			</div>
		</div>
	);
}
