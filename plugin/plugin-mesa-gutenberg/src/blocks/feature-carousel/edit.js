import { useBlockProps, InspectorControls, InnerBlocks } from '@wordpress/block-editor';
import { PanelBody, RangeControl, BaseControl, ColorPicker } from '@wordpress/components';

const TEMPLATE = [
	[ 'mesa-gutenberg/network-card', { layout: 'media-top', backgroundColor: 'rgba(75,31,89,0.2)', borderColor: '#4b1f59' } ],
	[ 'mesa-gutenberg/network-card', { layout: 'media-top', backgroundColor: 'rgba(75,31,89,0.2)', borderColor: '#4b1f59' } ],
	[ 'mesa-gutenberg/network-card', { layout: 'media-top', backgroundColor: 'rgba(75,31,89,0.2)', borderColor: '#4b1f59' } ],
];

const ALLOWED = [ 'mesa-gutenberg/network-card', 'core/group' ];

export default function Edit( { attributes, setAttributes } ) {
	const {
		cardsPerSlide,
		cardsPerSlideTablet,
		cardsPerSlideMobile,
		gap,
		dotColorActive,
		dotColorInactive,
		dotSize,
		dotGap,
		slideGap,
	} = attributes;

	const wrapperStyle = {
		'--fc-gap': `${ gap }px`,
		'--fc-slide-gap': `${ slideGap }px`,
		'--fc-cards-desktop': cardsPerSlide,
		'--fc-cards-tablet': cardsPerSlideTablet,
		'--fc-cards-mobile': cardsPerSlideMobile,
		'--fc-dot-active': dotColorActive,
		'--fc-dot-inactive': dotColorInactive,
		'--fc-dot-size': `${ dotSize }px`,
		'--fc-dot-gap': `${ dotGap }px`,
	};

	const blockProps = useBlockProps( { className: 'is-editor', style: wrapperStyle } );

	return (
		<>
			<InspectorControls>
				<PanelBody title="Layout">
					<RangeControl label="Cards per slide (desktop)" value={ cardsPerSlide } onChange={ ( v ) => setAttributes( { cardsPerSlide: v } ) } min={ 1 } max={ 6 } />
					<RangeControl label="Cards per slide (tablet)" value={ cardsPerSlideTablet } onChange={ ( v ) => setAttributes( { cardsPerSlideTablet: v } ) } min={ 1 } max={ 4 } />
					<RangeControl label="Cards per slide (mobile)" value={ cardsPerSlideMobile } onChange={ ( v ) => setAttributes( { cardsPerSlideMobile: v } ) } min={ 1 } max={ 3 } />
					<RangeControl label="Gap between cards (px)" value={ gap } onChange={ ( v ) => setAttributes( { gap: v } ) } min={ 0 } max={ 80 } />
					<RangeControl label="Gap between cards and dots (px)" value={ slideGap } onChange={ ( v ) => setAttributes( { slideGap: v } ) } min={ 0 } max={ 80 } />
				</PanelBody>
				<PanelBody title="Dots" initialOpen={ false }>
					<RangeControl label="Dot size (px)" value={ dotSize } onChange={ ( v ) => setAttributes( { dotSize: v } ) } min={ 4 } max={ 24 } />
					<RangeControl label="Dot gap (px)" value={ dotGap } onChange={ ( v ) => setAttributes( { dotGap: v } ) } min={ 2 } max={ 24 } />
					<BaseControl label="Dot active color" id="fc-da">
						<ColorPicker color={ dotColorActive } onChange={ ( v ) => setAttributes( { dotColorActive: v } ) } enableAlpha />
					</BaseControl>
					<BaseControl label="Dot inactive color" id="fc-di">
						<ColorPicker color={ dotColorInactive } onChange={ ( v ) => setAttributes( { dotColorInactive: v } ) } enableAlpha />
					</BaseControl>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="feature-carousel__track">
					<InnerBlocks
						allowedBlocks={ ALLOWED }
						template={ TEMPLATE }
						templateLock={ false }
					/>
				</div>
				<div className="feature-carousel__dots" aria-hidden="true">
					<span className="feature-carousel__dot is-active"></span>
					<span className="feature-carousel__dot"></span>
				</div>
			</div>
		</>
	);
}
