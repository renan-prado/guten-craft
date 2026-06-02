import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function Save( { attributes } ) {
	const {
		cardsPerSlide,
		cardsPerSlideTablet,
		cardsPerSlideMobile,
		gap,
		slideGap,
		dotColorActive,
		dotColorInactive,
		dotSize,
		dotGap,
	} = attributes;

	const wrapperProps = useBlockProps.save( {
		'data-feature-carousel': 'true',
		'data-cards-desktop': cardsPerSlide,
		'data-cards-tablet': cardsPerSlideTablet,
		'data-cards-mobile': cardsPerSlideMobile,
		style: {
			'--fc-gap': `${ gap }px`,
			'--fc-slide-gap': `${ slideGap }px`,
			'--fc-cards-desktop': cardsPerSlide,
			'--fc-cards-tablet': cardsPerSlideTablet,
			'--fc-cards-mobile': cardsPerSlideMobile,
			'--fc-dot-active': dotColorActive,
			'--fc-dot-inactive': dotColorInactive,
			'--fc-dot-size': `${ dotSize }px`,
			'--fc-dot-gap': `${ dotGap }px`,
		},
	} );

	return (
		<div { ...wrapperProps }>
			<div className="feature-carousel__viewport">
				<div className="feature-carousel__track">
					<InnerBlocks.Content />
				</div>
			</div>
			<div className="feature-carousel__dots" role="tablist" aria-label="Carousel pagination"></div>
		</div>
	);
}
