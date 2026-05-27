function initExpandableCards( root ) {
	if ( ! root || root.dataset.ecInit === '1' ) return;
	root.dataset.ecInit = '1';

	const cards = Array.from( root.querySelectorAll( '.expandable-cards__card' ) );
	if ( ! cards.length ) return;

	const mqMobile = window.matchMedia( '(max-width: 900px)' );

	function setOpen( idx ) {
		cards.forEach( ( card, i ) => {
			const open = i === idx;
			card.classList.toggle( 'is-open', open );
			const btn = card.querySelector( '.expandable-cards__collapsed' );
			if ( btn ) btn.setAttribute( 'aria-expanded', open ? 'true' : 'false' );
		} );
	}

	cards.forEach( ( card, i ) => {
		const btn = card.querySelector( '.expandable-cards__collapsed' );

		// Desktop: hover opens; ignore hover on mobile (touch devices report hover unreliably).
		card.addEventListener( 'mouseenter', () => {
			if ( mqMobile.matches ) return;
			setOpen( i );
		} );

		// Click works for both. On mobile, toggle (collapse all if clicking the open one).
		if ( btn ) {
			btn.addEventListener( 'click', ( e ) => {
				e.preventDefault();
				if ( mqMobile.matches && card.classList.contains( 'is-open' ) ) {
					setOpen( -1 );
				} else {
					setOpen( i );
				}
			} );
		}
	} );

	const initial = parseInt( root.getAttribute( 'data-default-open' ), 10 ) || 0;
	setOpen( initial );
}

function boot() {
	document
		.querySelectorAll( '[data-expandable-cards="true"]' )
		.forEach( initExpandableCards );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', boot );
} else {
	boot();
}
