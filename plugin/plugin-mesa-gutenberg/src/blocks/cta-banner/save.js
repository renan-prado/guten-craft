import { useBlockProps, InnerBlocks, RichText } from '@wordpress/block-editor';

export default function Save( { attributes } ) {
	const {
		heading, description,
		desktopBgUrl, desktopBgAlt,
		mobileBgUrl, mobileBgAlt,
		radius, roundBottom,
		textMaxWidth, paddingX, paddingY, paddingXMobile, paddingYMobile,
		contentGap, buttonsAlign, minHeight, surroundingColor,
	} = attributes;

	const cssVars = {
		'--cta-radius': `${ radius }px`,
		'--cta-radius-bottom': roundBottom ? `${ radius }px` : '0px',
		'--cta-text-maxw': textMaxWidth,
		'--cta-pad-x': paddingX,
		'--cta-pad-y': paddingY,
		'--cta-pad-x-mobile': paddingXMobile,
		'--cta-pad-y-mobile': paddingYMobile,
		'--cta-gap': `${ contentGap }px`,
		'--cta-buttons-direction': buttonsAlign,
		'--cta-min-height': `${ minHeight }px`,
		'--cta-surrounding': surroundingColor,
		backgroundColor: surroundingColor,
	};

	const blockProps = useBlockProps.save( { style: cssVars } );

	return (
		<div { ...blockProps }>
			<div className="cta-banner__shell">
				{ !! desktopBgUrl && (
					<img
						className="cta-banner__bg cta-banner__bg--desktop"
						src={ desktopBgUrl }
						alt={ desktopBgAlt }
						loading="lazy"
						decoding="async"
					/>
				) }
				{ !! mobileBgUrl && (
					<img
						className="cta-banner__bg cta-banner__bg--mobile"
						src={ mobileBgUrl }
						alt={ mobileBgAlt || desktopBgAlt }
						loading="lazy"
						decoding="async"
					/>
				) }
				<div className="cta-banner__content">
					<div className="cta-banner__text">
						<RichText.Content tagName="h2" className="cta-banner__heading" value={ heading } />
						<RichText.Content tagName="p" className="cta-banner__description" value={ description } />
					</div>
					<div className="cta-banner__buttons">
						<InnerBlocks.Content />
					</div>
				</div>
			</div>
		</div>
	);
}
