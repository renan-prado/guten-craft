function initSection( root ) {
	if ( ! root || root.dataset.nsInit === '1' ) return;
	root.dataset.nsInit = '1';

	const header = root.querySelector( '.network-section__header' );
	if ( ! header ) return;

	function setOpen( open ) {
		root.classList.toggle( 'is-open', open );
		header.setAttribute( 'aria-expanded', open ? 'true' : 'false' );
	}

	header.addEventListener( 'click', ( e ) => {
		e.preventDefault();
		setOpen( ! root.classList.contains( 'is-open' ) );
	} );

	if ( root.dataset.defaultOpen === '1' ) {
		setOpen( true );
	}

	if ( root.dataset.openOnScroll !== '1' ) return;

	const io = new IntersectionObserver(
		( entries ) => {
			entries.forEach( ( entry ) => {
				if ( entry.isIntersecting && ! root.dataset.nsAutoOpened ) {
					setOpen( true );
					root.dataset.nsAutoOpened = '1';
				}
			} );
		},
		{ rootMargin: '0px 0px -25% 0px', threshold: 0.15 }
	);
	io.observe( root );
}

function boot() {
	document.querySelectorAll( '[data-network-section="true"]' ).forEach( initSection );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', boot );
} else {
	boot();
}
