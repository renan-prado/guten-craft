import { useBlockProps } from '@wordpress/block-editor';

const ArrowRight = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
		<path d="M8 20h22M22 12l8 8-8 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

const ArrowDown = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
		<path d="M16 6v20M8 18l8 8 8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

export default function Save( { attributes } ) {
	const {
		items,
		defaultOpenIndex,
		gap,
		cardRadius,
		cardBg,
		cardBorderColor,
		cardBorderWidth,
		cardShadow,
		activeWidthDesktop,
		collapsedWidthDesktop,
		activeMinHeight,
		eyebrowColor,
		descriptionColor,
		collapsedTitleColor,
		tagBorderColor,
		tagTextColor,
		arrowColor,
	} = attributes;

	const wrapperStyle = {
		'--ec-gap': `${ gap }px`,
		'--ec-radius': `${ cardRadius }px`,
		'--ec-card-bg': cardBg,
		'--ec-border-color': cardBorderColor,
		'--ec-border-width': `${ cardBorderWidth }px`,
		'--ec-shadow': cardShadow,
		'--ec-active-w': `${ activeWidthDesktop }px`,
		'--ec-collapsed-w': `${ collapsedWidthDesktop }px`,
		'--ec-active-min-h': `${ activeMinHeight }px`,
		'--ec-eyebrow-color': eyebrowColor,
		'--ec-desc-color': descriptionColor,
		'--ec-collapsed-title-color': collapsedTitleColor,
		'--ec-tag-border-color': tagBorderColor,
		'--ec-tag-text-color': tagTextColor,
		'--ec-arrow-color': arrowColor,
	};

	const openIndex = Math.max( 0, Math.min( defaultOpenIndex || 0, items.length - 1 ) );

	return (
		<div
			{ ...useBlockProps.save( {
				style: wrapperStyle,
				'data-expandable-cards': 'true',
				'data-default-open': openIndex,
			} ) }
		>
			<div className="expandable-cards__grid">
				{ items.map( ( item, i ) => {
					const isOpen = i === openIndex;
					return (
						<div
							key={ item.id || i }
							className={ `expandable-cards__card${ isOpen ? ' is-open' : '' }` }
							data-ec-item={ item.id || `item-${ i }` }
							data-ec-index={ i }
						>
							<button
								type="button"
								className="expandable-cards__collapsed"
								aria-expanded={ isOpen ? 'true' : 'false' }
								aria-controls={ `ec-panel-${ item.id || i }` }
							>
								<span className="expandable-cards__collapsed-title">
									{ item.collapsedTitle }
								</span>
								<span className="expandable-cards__arrow expandable-cards__arrow--right" aria-hidden="true">
									<ArrowRight />
								</span>
								<span className="expandable-cards__arrow expandable-cards__arrow--down" aria-hidden="true">
									<ArrowDown />
								</span>
							</button>

							<div
								className="expandable-cards__expanded"
								id={ `ec-panel-${ item.id || i }` }
								role="region"
							>
								{ item.eyebrow && (
									<p className="expandable-cards__eyebrow">{ item.eyebrow }</p>
								) }
								{ item.title && (
									<h3 className="expandable-cards__title has-gradient-purple-text">
										{ item.title }
									</h3>
								) }
								{ item.description && (
									<p className="expandable-cards__description">{ item.description }</p>
								) }
								{ item.tags && item.tags.length > 0 && (
									<ul className="expandable-cards__tags">
										{ item.tags.map( ( tag, ti ) => (
											<li key={ ti } className="expandable-cards__tag">{ tag }</li>
										) ) }
									</ul>
								) }
							</div>
						</div>
					);
				} ) }
			</div>
		</div>
	);
}
