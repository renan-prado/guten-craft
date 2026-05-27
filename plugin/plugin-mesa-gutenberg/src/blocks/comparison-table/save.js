import { useBlockProps } from '@wordpress/block-editor';
import { ICON_TYPES, renderIconSvgString } from './icons';

function Icon( { iconType, iconColor, size } ) {
	const preset = ICON_TYPES[ iconType ];
	if ( ! preset || ! preset.inner ) return null;
	return (
		<span
			className="comparison-table__icon"
			style={ { color: iconColor, width: size, height: size } }
			aria-hidden="true"
			dangerouslySetInnerHTML={ {
				__html: renderIconSvgString( iconType, size ),
			} }
		/>
	);
}

export default function Save( { attributes } ) {
	const {
		columns,
		radius,
		borderColor,
		borderWidth,
		shadow,
		titlePaddingY,
		titlePaddingX,
		itemsPaddingY,
		itemsPaddingX,
		itemsGap,
		itemTextColor,
		dividerColor,
		titleAlignDesktop,
		mobileTitleAlign,
		mobileTitlePaddingX,
		mobileItemsPaddingX,
		mobileGap,
		iconSize,
		itemMinHeightDesktop,
	} = attributes;

	const wrapperStyle = {
		'--ct-radius': `${ radius }px`,
		'--ct-border-color': borderColor,
		'--ct-border-width': `${ borderWidth }px`,
		'--ct-shadow': shadow,
		'--ct-title-padding-y': `${ titlePaddingY }px`,
		'--ct-title-padding-x': `${ titlePaddingX }px`,
		'--ct-items-padding-y': `${ itemsPaddingY }px`,
		'--ct-items-padding-x': `${ itemsPaddingX }px`,
		'--ct-items-gap': `${ itemsGap }px`,
		'--ct-item-text-color': itemTextColor,
		'--ct-divider-color': dividerColor,
		'--ct-title-align': titleAlignDesktop,
		'--ct-mobile-title-align': mobileTitleAlign,
		'--ct-mobile-title-padding-x': `${ mobileTitlePaddingX }px`,
		'--ct-mobile-items-padding-x': `${ mobileItemsPaddingX }px`,
		'--ct-mobile-gap': `${ mobileGap }px`,
		'--ct-icon-size': `${ iconSize }px`,
		'--ct-item-min-height-desktop': `${ itemMinHeightDesktop }px`,
	};

	return (
		<div { ...useBlockProps.save( { style: wrapperStyle } ) }>
			<div className="comparison-table__grid">
				{ columns.map( ( column, ci ) => (
					<div
						key={ column.id || ci }
						className="comparison-table__column"
						data-ct-column={ column.id || `column-${ ci }` }
					>
						<div
							className="comparison-table__title"
							style={ {
								background: column.titleBackground,
								color: column.titleColor,
							} }
						>
							<p
								className="comparison-table__title-text"
								style={ { color: column.titleColor } }
							>
								{ column.title }
							</p>
						</div>
						<div className="comparison-table__items">
							{ ( column.items || [] ).flatMap( ( text, ii ) => {
								const item = (
									<div
										key={ `i-${ ci }-${ ii }` }
										className="comparison-table__item"
									>
										<Icon
											iconType={ column.iconType }
											iconColor={ column.iconColor }
											size={ iconSize }
										/>
										<p className="comparison-table__item-text">
											{ text }
										</p>
									</div>
								);
								if ( ii === 0 ) return [ item ];
								return [
									<span
										key={ `d-${ ci }-${ ii }` }
										className="comparison-table__divider"
										aria-hidden="true"
									/>,
									item,
								];
							} ) }
						</div>
					</div>
				) ) }
			</div>
		</div>
	);
}
