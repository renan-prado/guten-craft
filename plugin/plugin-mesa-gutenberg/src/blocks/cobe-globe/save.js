import { useBlockProps } from '@wordpress/block-editor';

function GlobeCard( { card } ) {
	return (
		<div
			className="cobe-globe-card"
			data-lat={ card.location[ 0 ] }
			data-lng={ card.location[ 1 ] }
		>
			<div
				className="cobe-globe-card__avatar"
				style={ card.avatarUrl ? {} : { backgroundColor: card.avatarColor } }
			>
				{ card.avatarUrl
					? <img src={ card.avatarUrl } alt={ card.initials } />
					: card.initials
				}
			</div>
			<div className="cobe-globe-card__text">
				<span className="cobe-globe-card__message">{ card.message }</span>
				{ card.subtext
					? <span className="cobe-globe-card__subtext">{ card.subtext }</span>
					: null
				}
			</div>
		</div>
	);
}

export default function Save( { attributes } ) {
	const { size, mapSamples, overlays, topOffset, arcs, arcColor, arcWidth, arcHeight, rotationSpeed, baseColor, glowColor } = attributes;
	const wrapperStyle = { width: `${ size }px`, height: `${ size }px` };
	if ( topOffset ) wrapperStyle.top = topOffset;

	const hasArcs = Array.isArray( arcs ) && arcs.length > 0;

	return (
		<div
			{ ...useBlockProps.save( {
				'data-globe-size': size,
				'data-map-samples': mapSamples,
				...( hasArcs ? { 'data-arcs': JSON.stringify( arcs ) } : {} ),
				'data-arc-color': arcColor,
				'data-arc-width': arcWidth,
				'data-arc-height': arcHeight,
				'data-rotation-speed': rotationSpeed,
				'data-base-color': baseColor,
				'data-glow-color': glowColor,
				style: wrapperStyle,
			} ) }
		>
			<canvas
				data-cobe-globe
				style={ { width: '100%', height: '100%', display: 'block' } }
			/>
			{ overlays.map( ( card ) => (
				<GlobeCard key={ card.id } card={ card } />
			) ) }
		</div>
	);
}
