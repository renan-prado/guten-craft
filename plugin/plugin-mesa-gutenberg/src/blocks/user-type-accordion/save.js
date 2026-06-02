import { useBlockProps } from '@wordpress/block-editor';

const Chevron = () => (
	<span className="user-type-accordion__chevron" aria-hidden="true">
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

const CheckIcon = ( { color } ) => (
	<span className="user-type-accordion__check" aria-hidden="true" style={ { color } }>
		<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
			<circle cx="10" cy="10" r="10" fill="currentColor" />
			<path
				d="M5.5 10.5l3 3 6-6"
				stroke="#ffffff"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	</span>
);

function Panel( { item, panelRadius, panelPadding } ) {
	const panelStyle = {
		background: item.panelBgColor,
		borderRadius: `${ panelRadius }px`,
		padding: `${ panelPadding }px`,
	};
	return (
		<div className="user-type-accordion__panel" style={ panelStyle }>
			{ item.intro && (
				<p className="user-type-accordion__intro">{ item.intro }</p>
			) }
			{ item.checks && item.checks.length > 0 && (
				<ul className="user-type-accordion__checks">
					{ item.checks.map( ( c, idx ) => (
						<li key={ idx } className="user-type-accordion__check-item">
							<CheckIcon color={ item.checkColor } />
							<span className="user-type-accordion__check-text">
								{ c.strong && (
									<strong>{ c.strong }</strong>
								) }
								{ c.text }
							</span>
						</li>
					) ) }
				</ul>
			) }
			{ item.buttonLabel && (
				<div className="user-type-accordion__button-wrap">
					<a
						className="user-type-accordion__button"
						href={ item.buttonUrl || '#' }
					>
						{ item.buttonLabel }
					</a>
				</div>
			) }
		</div>
	);
}

export default function Save( { attributes } ) {
	const {
		items,
		defaultOpenIndex,
		columnGap,
		itemGap,
		closedTitleColor,
		summaryColor,
		dividerColor,
		chevronColor,
		panelRadius,
		panelPadding,
	} = attributes;

	const wrapperStyle = {
		'--uta-column-gap': `${ columnGap }px`,
		'--uta-item-gap': `${ itemGap }px`,
		'--uta-closed-title-color': closedTitleColor,
		'--uta-summary-color': summaryColor,
		'--uta-divider-color': dividerColor,
		'--uta-chevron-color': chevronColor,
		'--uta-panel-radius': `${ panelRadius }px`,
		'--uta-panel-padding': `${ panelPadding }px`,
	};

	const openIndex = Math.max( 0, Math.min( defaultOpenIndex || 0, items.length - 1 ) );

	return (
		<div
			{ ...useBlockProps.save( {
				style: wrapperStyle,
				'data-user-type-accordion': 'true',
				'data-default-open': openIndex,
			} ) }
		>
			<div className="user-type-accordion__grid">
				<ul className="user-type-accordion__list">
					{ items.map( ( item, i ) => {
						const isOpen = i === openIndex;
						const itemStyle = {
							'--uta-title-color': item.titleColor,
						};
						return (
							<li
								key={ item.id || i }
								className={ `user-type-accordion__item${ isOpen ? ' is-open' : '' }` }
								data-uta-item={ item.id || `item-${ i }` }
								data-uta-index={ i }
								style={ itemStyle }
							>
								<button
									type="button"
									className="user-type-accordion__header"
									aria-expanded={ isOpen ? 'true' : 'false' }
									aria-controls={ `uta-panel-${ item.id || i }` }
								>
									<span className="user-type-accordion__title-wrap">
										{ item.icon && item.icon.url && (
											<img
												className="user-type-accordion__icon"
												src={ item.icon.url }
												alt={ item.icon.alt || '' }
											/>
										) }
										<span className="user-type-accordion__title">
											{ item.title }
										</span>
									</span>
									<Chevron />
								</button>
								{ item.summary && (
									<p className="user-type-accordion__summary">
										{ item.summary }
									</p>
								) }
								<div
									className="user-type-accordion__inline-panel"
									id={ `uta-panel-${ item.id || i }` }
									role="region"
								>
									<Panel
										item={ item }
										panelRadius={ panelRadius }
										panelPadding={ panelPadding }
									/>
								</div>
							</li>
						);
					} ) }
				</ul>

				<div className="user-type-accordion__stage" aria-hidden="true">
					{ items.map( ( item, i ) => {
						const isOpen = i === openIndex;
						return (
							<div
								key={ item.id || i }
								className={ `user-type-accordion__stage-panel${ isOpen ? ' is-active' : '' }` }
								data-uta-stage-index={ i }
							>
								<Panel
									item={ item }
									panelRadius={ panelRadius }
									panelPadding={ panelPadding }
								/>
							</div>
						);
					} ) }
				</div>
			</div>
		</div>
	);
}
