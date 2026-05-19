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
	const { size, overlays } = attributes;

	return (
		<div
			{ ...useBlockProps.save( {
				'data-globe-size': size,
				style: { width: `${ size }px`, height: `${ size }px` },
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
