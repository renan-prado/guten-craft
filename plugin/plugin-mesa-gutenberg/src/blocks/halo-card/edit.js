import { useBlockProps, InspectorControls, InnerBlocks } from '@wordpress/block-editor';
import { PanelBody, RangeControl, ColorPicker, BaseControl, TextControl, ToggleControl, __experimentalNumberControl as NumberControl } from '@wordpress/components';

export default function Edit( { attributes, setAttributes } ) {
	const {
		radius, cardColor, haloColor, haloWidth, haloHeight, marginTop, marginBottom,
		roundTopLeft, roundTopRight, roundBottomRight, roundBottomLeft,
		showHaloTop, showHaloBottom,
	} = attributes;

	const allCornersRounded = roundTopLeft && roundTopRight && roundBottomRight && roundBottomLeft;
	const innerRadius = allCornersRounded
		? `${ radius }px`
		: `${ roundTopLeft ? radius : 0 }px ${ roundTopRight ? radius : 0 }px ${ roundBottomRight ? radius : 0 }px ${ roundBottomLeft ? radius : 0 }px`;

	const wrapperStyle = {};
	if ( typeof marginTop === 'number' && marginTop !== 0 ) {
		wrapperStyle.marginTop = `${ marginTop }px`;
	}
	if ( typeof marginBottom === 'number' && marginBottom !== 0 ) {
		wrapperStyle.marginBottom = `${ marginBottom }px`;
	}

	const blockProps = useBlockProps( { style: wrapperStyle } );

	const haloTop = {
		width:  haloWidth,
		height: `${ haloHeight }px`,
		background: `radial-gradient(ellipse 95% 100% at 50% 100%, #ffffff 0%, rgba(255,240,255,0.95) 12%, ${ haloColor } 35%, rgba(180,80,210,0.35) 65%, transparent 90%)`,
	};

	const haloBottom = {
		width:  haloWidth,
		height: `${ haloHeight }px`,
		background: `radial-gradient(ellipse 95% 100% at 50% 0%, #ffffff 0%, rgba(255,240,255,0.95) 12%, ${ haloColor } 35%, rgba(180,80,210,0.35) 65%, transparent 90%)`,
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title="Halo Card">
					<RangeControl
						label="Border radius (px)"
						value={ radius }
						onChange={ ( v ) => setAttributes( { radius: v } ) }
						min={ 0 }
						max={ 80 }
					/>
					<RangeControl
						label="Halo height (px)"
						value={ haloHeight }
						onChange={ ( v ) => setAttributes( { haloHeight: v } ) }
						min={ 60 }
						max={ 600 }
						step={ 10 }
					/>
					<TextControl
						label="Halo width (CSS, e.g. 70% or 900px)"
						value={ haloWidth }
						onChange={ ( v ) => setAttributes( { haloWidth: v } ) }
					/>
					<BaseControl label="Card color" id="halo-card-color">
						<ColorPicker
							color={ cardColor }
							onChange={ ( v ) => setAttributes( { cardColor: v } ) }
							enableAlpha={ true }
						/>
					</BaseControl>
					<BaseControl label="Halo color" id="halo-card-halo-color">
						<ColorPicker
							color={ haloColor }
							onChange={ ( v ) => setAttributes( { haloColor: v } ) }
							enableAlpha={ true }
						/>
					</BaseControl>
				</PanelBody>
				<PanelBody title="Rounded corners" initialOpen={ false }>
					<ToggleControl
						label="Top left"
						checked={ roundTopLeft }
						onChange={ ( v ) => setAttributes( { roundTopLeft: v } ) }
					/>
					<ToggleControl
						label="Top right"
						checked={ roundTopRight }
						onChange={ ( v ) => setAttributes( { roundTopRight: v } ) }
					/>
					<ToggleControl
						label="Bottom right"
						checked={ roundBottomRight }
						onChange={ ( v ) => setAttributes( { roundBottomRight: v } ) }
					/>
					<ToggleControl
						label="Bottom left"
						checked={ roundBottomLeft }
						onChange={ ( v ) => setAttributes( { roundBottomLeft: v } ) }
					/>
				</PanelBody>
				<PanelBody title="Halo visibility" initialOpen={ false }>
					<ToggleControl
						label="Show top halo"
						checked={ showHaloTop }
						onChange={ ( v ) => setAttributes( { showHaloTop: v } ) }
					/>
					<ToggleControl
						label="Show bottom halo"
						checked={ showHaloBottom }
						onChange={ ( v ) => setAttributes( { showHaloBottom: v } ) }
					/>
				</PanelBody>
				<PanelBody title="Spacing">
					<NumberControl
						label="Margin top (px, accepts negatives)"
						value={ marginTop }
						onChange={ ( v ) => setAttributes( { marginTop: v === '' || v === undefined ? 0 : parseInt( v, 10 ) } ) }
						step={ 1 }
						isShiftStepEnabled={ true }
						shiftStep={ 10 }
					/>
					<NumberControl
						label="Margin bottom (px, accepts negatives)"
						value={ marginBottom }
						onChange={ ( v ) => setAttributes( { marginBottom: v === '' || v === undefined ? 0 : parseInt( v, 10 ) } ) }
						step={ 1 }
						isShiftStepEnabled={ true }
						shiftStep={ 10 }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ showHaloTop && (
					<span
						className="halo-card__halo halo-card__halo--top"
						style={ haloTop }
						aria-hidden="true"
					/>
				) }
				<div
					className="halo-card__inner"
					style={ { background: cardColor, borderRadius: innerRadius } }
				>
					<InnerBlocks />
				</div>
				{ showHaloBottom && (
					<span
						className="halo-card__halo halo-card__halo--bottom"
						style={ haloBottom }
						aria-hidden="true"
					/>
				) }
			</div>
		</>
	);
}
