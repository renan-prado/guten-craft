function initAccordion( root ) {
	if ( ! root || root.dataset.faInit === '1' ) return;
	root.dataset.faInit = '1';

	const items = Array.from( root.querySelectorAll( '.feature-accordion__item' ) );
	const stageFigures = Array.from(
		root.querySelectorAll( '.feature-accordion__stage .feature-accordion__image' )
	);

	if ( ! items.length ) return;

	function setOpen( idx ) {
		items.forEach( ( li, i ) => {
			const open = i === idx;
			li.classList.toggle( 'is-open', open );
			const btn = li.querySelector( '.feature-accordion__header' );
			if ( btn ) btn.setAttribute( 'aria-expanded', open ? 'true' : 'false' );
		} );
		stageFigures.forEach( ( fig ) => {
			const i = parseInt( fig.getAttribute( 'data-fa-stage-index' ), 10 );
			fig.classList.toggle( 'is-active', i === idx );
		} );
	}

	items.forEach( ( li, i ) => {
		const btn = li.querySelector( '.feature-accordion__header' );
		if ( ! btn ) return;
		btn.addEventListener( 'click', ( e ) => {
			e.preventDefault();
			setOpen( i );
		} );
	} );

	const initial = parseInt( root.getAttribute( 'data-default-open' ), 10 ) || 0;
	setOpen( initial );
}

function boot() {
	document
		.querySelectorAll( '[data-feature-accordion="true"]' )
		.forEach( initAccordion );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', boot );
} else {
	boot();
}
