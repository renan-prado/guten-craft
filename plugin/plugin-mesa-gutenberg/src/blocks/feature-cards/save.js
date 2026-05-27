import { useBlockProps } from '@wordpress/block-editor';
import { ICON_PRESETS, renderPresetSvgString } from './icons';

function Icon( { item, size } ) {
	if ( item.iconKey && ICON_PRESETS[ item.iconKey ] ) {
		return (
			<span
				className="feature-cards__icon"
				aria-hidden="true"
				dangerouslySetInnerHTML={ {
					__html: renderPresetSvgString( item.iconKey, size ),
				} }
			/>
		);
	}
	if ( item.iconUrl ) {
		return (
			<img
				className="feature-cards__icon"
				src={ item.iconUrl }
				alt={ item.iconAlt || '' }
				width={ size }
				height={ size }
			/>
		);
	}
	return null;
}

export default function Save( { attributes } ) {
	const {
		items,
		columnsDesktop,
		columnsTablet,
		gap,
		cardRadius,
		cardPadding,
		cardBackground,
		cardBorderColor,
		cardBorderWidth,
		cardShadow,
		titleColor,
		descriptionColor,
		iconSize,
		textAlign,
	} = attributes;

	const wrapperStyle = {
		'--fc-columns-desktop': columnsDesktop,
		'--fc-columns-tablet': columnsTablet,
		'--fc-gap': `${ gap }px`,
		'--fc-card-radius': `${ cardRadius }px`,
		'--fc-card-padding': `${ cardPadding }px`,
		'--fc-card-bg': cardBackground,
		'--fc-card-border-color': cardBorderColor,
		'--fc-card-border-width': `${ cardBorderWidth }px`,
		'--fc-card-shadow': cardShadow,
		'--fc-title-color': titleColor,
		'--fc-desc-color': descriptionColor,
		'--fc-icon-size': `${ iconSize }px`,
		'--fc-text-align': textAlign,
	};

	return (
		<div { ...useBlockProps.save( { style: wrapperStyle } ) }>
			<div className="feature-cards__grid">
				{ items.map( ( item, i ) => (
					<div
						key={ item.id || i }
						className="feature-cards__card"
						data-fc-item={ item.id || `card-${ i }` }
					>
						<Icon item={ item } size={ iconSize } />
						<p className="feature-cards__title">{ item.title }</p>
						<p className="feature-cards__description">{ item.description }</p>
					</div>
				) ) }
			</div>
		</div>
	);
}
