import { useBlockProps } from '@wordpress/block-editor';

const Chevron = () => (
	<span className="feature-accordion__chevron" aria-hidden="true">
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
			<path
				d="M6 9l6 6 6-6"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	</span>
);

export default function Save( { attributes } ) {
	const {
		items,
		defaultOpenIndex,
		columnGap,
		itemGap,
		titleColor,
		descriptionColor,
		dividerColor,
		chevronColor,
		imageRadius,
		imageMinHeight,
	} = attributes;

	const wrapperStyle = {
		'--fa-column-gap': `${ columnGap }px`,
		'--fa-item-gap': `${ itemGap }px`,
		'--fa-title-color': titleColor,
		'--fa-desc-color': descriptionColor,
		'--fa-divider-color': dividerColor,
		'--fa-chevron-color': chevronColor,
		'--fa-image-radius': `${ imageRadius }px`,
		'--fa-image-min-height': `${ imageMinHeight }px`,
	};

	const openIndex = Math.max( 0, Math.min( defaultOpenIndex || 0, items.length - 1 ) );

	return (
		<div
			{ ...useBlockProps.save( {
				style: wrapperStyle,
				'data-feature-accordion': 'true',
				'data-default-open': openIndex,
			} ) }
		>
			<div className="feature-accordion__grid">
				<ul className="feature-accordion__list">
					{ items.map( ( item, i ) => {
						const isOpen = i === openIndex;
						return [
							i > 0 && (
								<li
									key={ `divider-${ item.id || i }` }
									className="feature-accordion__divider"
									role="presentation"
									aria-hidden="true"
								/>
							),
							<li
								key={ item.id || i }
								className={ `feature-accordion__item${ isOpen ? ' is-open' : '' }` }
								data-fa-item={ item.id || `item-${ i }` }
								data-fa-index={ i }
							>
								<button
									type="button"
									className="feature-accordion__header"
									aria-expanded={ isOpen ? 'true' : 'false' }
									aria-controls={ `fa-panel-${ item.id || i }` }
								>
									<span className="feature-accordion__title-wrap">
										{ item.icon && item.icon.url && (
											<img
												className="feature-accordion__icon"
												src={ item.icon.url }
												alt={ item.icon.alt || '' }
											/>
										) }
										<span className="feature-accordion__title">
											{ item.title }
										</span>
									</span>
									<Chevron />
								</button>
								<div
									className="feature-accordion__content"
									id={ `fa-panel-${ item.id || i }` }
									role="region"
								>
									{ item.description && (
										<p className="feature-accordion__description">
											{ item.description }
										</p>
									) }
									{ item.image && item.image.url && (
										<figure className="feature-accordion__image feature-accordion__image--inline">
											<img src={ item.image.url } alt={ item.image.alt || '' } />
										</figure>
									) }
								</div>
							</li>,
						];
					} ) }
				</ul>

				<div className="feature-accordion__stage" aria-hidden="true">
					{ items.map( ( item, i ) => {
						if ( ! item.image || ! item.image.url ) return null;
						const isOpen = i === openIndex;
						return (
							<figure
								key={ item.id || i }
								className={ `feature-accordion__image${ isOpen ? ' is-active' : '' }` }
								data-fa-stage-index={ i }
							>
								<img src={ item.image.url } alt={ item.image.alt || '' } />
							</figure>
						);
					} ) }
				</div>
			</div>
		</div>
	);
}
