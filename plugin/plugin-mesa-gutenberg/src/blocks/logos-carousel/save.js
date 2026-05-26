import { useBlockProps } from '@wordpress/block-editor';

// Older drafts may have stored items as plain URL strings; normalize on read.
function toItem( v ) {
	return typeof v === 'string' ? { url: v, alt: '' } : v;
}

function Row( { logos, direction, logoHeight, gap, speed } ) {
	const normalized = logos.map( toItem );
	const items = [ ...normalized, ...normalized ];
	const animName = direction === 'right' ? 'logos-scroll-right' : 'logos-scroll-left';

	return (
		<div className={ `logos-carousel__row logos-carousel__row--${ direction }` }>
			<div
				className="logos-carousel__track"
				style={ {
					gap:               `${ gap }px`,
					animationName:     animName,
					animationDuration: `${ speed }s`,
				} }
			>
				{ items.map( ( item, i ) => (
					<img
						key={ i }
						src={ item.url }
						alt={ item.alt || '' }
						className="logos-carousel__logo"
						style={ { height: `${ logoHeight }px` } }
						aria-hidden={ i >= normalized.length ? 'true' : undefined }
					/>
				) ) }
			</div>
		</div>
	);
}

export default function Save( { attributes } ) {
	const {
		title,
		titleColor,
		logoHeight,
		gap,
		speed,
		rowOpacity,
		fadeColor,
		fadeWidth,
		backgroundColor,
		gradientColor,
		gradientFadeStop,
		verticalPadding,
		row1Logos,
		row2Logos,
	} = attributes;

	const stop = Math.max( 0, Math.min( 50, gradientFadeStop ) );
	const backgroundImage = `linear-gradient(180deg, transparent 0%, ${ gradientColor } ${ stop }%, ${ gradientColor } ${ 100 - stop }%, transparent 100%)`;

	const wrapperStyle = {
		'--logos-carousel-fade-color':    fadeColor,
		'--logos-carousel-fade-width':    `${ fadeWidth }px`,
		'--logos-carousel-row-opacity':   rowOpacity,
		'--logos-carousel-gradient-stop': `${ stop }%`,
		paddingTop:    `${ verticalPadding }px`,
		paddingBottom: `${ verticalPadding }px`,
		backgroundColor,
		backgroundImage,
	};

	return (
		<div { ...useBlockProps.save( { style: wrapperStyle } ) }>
			{ title && (
				<p className="logos-carousel__title" style={ { color: titleColor } }>
					{ title }
				</p>
			) }

			<div className="logos-carousel__rows">
				<Row logos={ row1Logos } direction="left"  logoHeight={ logoHeight } gap={ gap } speed={ speed } />
				<Row logos={ row2Logos } direction="right" logoHeight={ logoHeight } gap={ gap } speed={ speed } />

				<span className="logos-carousel__fade logos-carousel__fade--left"  aria-hidden="true" />
				<span className="logos-carousel__fade logos-carousel__fade--right" aria-hidden="true" />
			</div>
		</div>
	);
}
