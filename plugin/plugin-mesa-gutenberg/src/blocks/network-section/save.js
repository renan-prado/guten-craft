import { useBlockProps, InnerBlocks, RichText } from '@wordpress/block-editor';

export default function Save( { attributes } ) {
	const {
		tagText,
		tagVariant,
		title,
		subtitle,
		subtitleSecondary,
		defaultOpen,
		openOnScroll,
		dividerColor,
	} = attributes;

	const wrapperProps = useBlockProps.save( {
		className: `is-tag-${ tagVariant }${ defaultOpen ? ' is-open' : '' }`,
		style: { '--ns-divider-color': dividerColor },
		'data-network-section': 'true',
		'data-default-open': defaultOpen ? '1' : '0',
		'data-open-on-scroll': openOnScroll ? '1' : '0',
	} );

	return (
		<div { ...wrapperProps }>
			<button
				type="button"
				className="network-section__header"
				aria-expanded={ defaultOpen ? 'true' : 'false' }
			>
				<div className="network-section__top-row">
					<div className="network-section__title-group">
						<span className={ `network-section__chip network-section__chip--${ tagVariant }` }>
							<RichText.Content tagName="span" value={ tagText } />
						</span>
						<div className="network-section__title-row">
							<RichText.Content tagName="h3" className="network-section__title" value={ title } />
							<span className="network-section__chevron" aria-hidden="true">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
									<path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							</span>
						</div>
					</div>
				</div>
				<div className="network-section__bottom-row">
					{ !! subtitle && (
						<RichText.Content tagName="p" className="network-section__subtitle" value={ subtitle } />
					) }
					{ !! subtitleSecondary && (
						<RichText.Content tagName="p" className="network-section__subtitle network-section__subtitle--secondary" value={ subtitleSecondary } />
					) }
				</div>
			</button>
			<div className="network-section__panel" role="region">
				<div className="network-section__panel-inner">
					<InnerBlocks.Content />
				</div>
			</div>
		</div>
	);
}
