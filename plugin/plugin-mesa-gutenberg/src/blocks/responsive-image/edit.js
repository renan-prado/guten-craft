import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import {
	PanelBody,
	Button,
	TextControl,
} from '@wordpress/components';

function MediaSlot( { label, url, alt, onSelect, onRemove, onAltChange } ) {
	return (
		<div style={ { marginBottom: 24 } }>
			<p style={ { fontWeight: 600, margin: '0 0 8px' } }>{ label }</p>
			{ url && (
				<img
					src={ url }
					alt={ alt }
					style={ {
						maxWidth: '100%',
						height: 'auto',
						display: 'block',
						marginBottom: 8,
						border: '1px solid #ddd',
					} }
				/>
			) }
			<MediaUploadCheck>
				<MediaUpload
					onSelect={ onSelect }
					allowedTypes={ [ 'image' ] }
					value={ undefined }
					render={ ( { open } ) => (
						<div style={ { display: 'flex', gap: 8, marginBottom: 8 } }>
							<Button variant="secondary" onClick={ open }>
								{ url ? __( 'Replace', 'mesa-gutenberg' ) : __( 'Upload', 'mesa-gutenberg' ) }
							</Button>
							{ url && (
								<Button variant="tertiary" isDestructive onClick={ onRemove }>
									{ __( 'Remove', 'mesa-gutenberg' ) }
								</Button>
							) }
						</div>
					) }
				/>
			</MediaUploadCheck>
			<TextControl
				label={ __( 'Alt text', 'mesa-gutenberg' ) }
				value={ alt }
				onChange={ onAltChange }
			/>
		</div>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const {
		desktopUrl, desktopAlt,
		mobileUrl, mobileAlt,
	} = attributes;

	const blockProps = useBlockProps( {
		className: 'wp-block-mesa-gutenberg-responsive-image',
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Desktop image', 'mesa-gutenberg' ) } initialOpen={ true }>
					<MediaSlot
						label={ __( 'Desktop source', 'mesa-gutenberg' ) }
						url={ desktopUrl }
						alt={ desktopAlt }
						onSelect={ ( media ) => setAttributes( {
							desktopUrl: media.url,
							desktopId:  media.id,
							desktopAlt: media.alt || desktopAlt,
						} ) }
						onRemove={ () => setAttributes( { desktopUrl: '', desktopId: undefined } ) }
						onAltChange={ ( value ) => setAttributes( { desktopAlt: value } ) }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Mobile image', 'mesa-gutenberg' ) } initialOpen={ true }>
					<MediaSlot
						label={ __( 'Mobile source', 'mesa-gutenberg' ) }
						url={ mobileUrl }
						alt={ mobileAlt }
						onSelect={ ( media ) => setAttributes( {
							mobileUrl: media.url,
							mobileId:  media.id,
							mobileAlt: media.alt || mobileAlt,
						} ) }
						onRemove={ () => setAttributes( { mobileUrl: '', mobileId: undefined } ) }
						onAltChange={ ( value ) => setAttributes( { mobileAlt: value } ) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ desktopUrl ? (
					<img
						src={ desktopUrl }
						alt={ desktopAlt }
						style={ { maxWidth: '100%', height: 'auto', display: 'block' } }
					/>
				) : (
					<div style={ {
						padding: 32,
						border: '1px dashed #999',
						textAlign: 'center',
						color: '#666',
					} }>
						{ __( 'Upload desktop and mobile images in the sidebar.', 'mesa-gutenberg' ) }
					</div>
				) }
				{ mobileUrl && (
					<p style={ { fontSize: 12, color: '#666', marginTop: 8 } }>
						{ __( 'Mobile source set ✓ — swaps below 768px on the front-end.', 'mesa-gutenberg' ) }
					</p>
				) }
			</div>
		</>
	);
}
