import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function Save( { attributes } ) {
	const { radius, cardColor, haloColor, haloWidth, haloHeight, marginTop, marginBottom } = attributes;

	const haloTop = {
		width:  haloWidth,
		height: `${ haloHeight }px`,
		background: `radial-gradient(ellipse 95% 100% at 50% 100%, #ffffff 0%, rgba(255,240,255,0.95) 12%, ${ haloColor } 35%, rgba(180,80,210,0.35) 65%, transparent 90%)`,
	};

	const haloBottom = {
		width:  haloWidth,
		height: `${ haloHeight }px`,
		background: `radial-gradient(ellipse 95% 100% at 50% 0%, #ffffff 0%, rgba(255,240,255,0.95) 12%, ${ haloColor } 35%, rgba(180,80,210,0.35) 65%, transparent 90%)`,
	};

	const wrapperStyle = {};
	if ( typeof marginTop === 'number' && marginTop !== 0 ) {
		wrapperStyle.marginTop = `${ marginTop }px`;
	}
	if ( typeof marginBottom === 'number' && marginBottom !== 0 ) {
		wrapperStyle.marginBottom = `${ marginBottom }px`;
	}

	return (
		<div { ...useBlockProps.save( { style: wrapperStyle } ) }>
			<span
				className="halo-card__halo halo-card__halo--top"
				style={ haloTop }
				aria-hidden="true"
			/>
			<div
				className="halo-card__inner"
				style={ { background: cardColor, borderRadius: `${ radius }px` } }
			>
				<InnerBlocks.Content />
			</div>
			<span
				className="halo-card__halo halo-card__halo--bottom"
				style={ haloBottom }
				aria-hidden="true"
			/>
		</div>
	);
}
