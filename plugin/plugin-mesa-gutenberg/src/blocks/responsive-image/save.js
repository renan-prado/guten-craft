import { useBlockProps } from '@wordpress/block-editor';

export default function Save( { attributes } ) {
	const {
		desktopUrl, desktopAlt,
		mobileUrl, mobileAlt,
	} = attributes;

	const blockProps = useBlockProps.save();

	return (
		<div { ...blockProps }>
			{ !! desktopUrl && (
				<img
					className="responsive-image__desktop"
					src={ desktopUrl }
					alt={ desktopAlt }
					loading="lazy"
					decoding="async"
				/>
			) }
			{ !! mobileUrl && (
				<img
					className="responsive-image__mobile"
					src={ mobileUrl }
					alt={ mobileAlt || desktopAlt }
					loading="lazy"
					decoding="async"
				/>
			) }
		</div>
	);
}
