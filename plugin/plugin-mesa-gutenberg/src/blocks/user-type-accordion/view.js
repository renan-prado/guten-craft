function initAccordion( root ) {
	if ( ! root || root.dataset.utaInit === '1' ) return;
	root.dataset.utaInit = '1';

	const items = Array.from( root.querySelectorAll( '.user-type-accordion__item' ) );
	const stagePanels = Array.from(
		root.querySelectorAll( '.user-type-accordion__stage .user-type-accordion__stage-panel' )
	);

	if ( ! items.length ) return;

	function setOpen( idx ) {
		items.forEach( ( li, i ) => {
			const open = i === idx;
			li.classList.toggle( 'is-open', open );
			const btn = li.querySelector( '.user-type-accordion__header' );
			if ( btn ) btn.setAttribute( 'aria-expanded', open ? 'true' : 'false' );
		} );
		stagePanels.forEach( ( panel ) => {
			const i = parseInt( panel.getAttribute( 'data-uta-stage-index' ), 10 );
			panel.classList.toggle( 'is-active', i === idx );
		} );
	}

	items.forEach( ( li, i ) => {
		const btn = li.querySelector( '.user-type-accordion__header' );
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
		.querySelectorAll( '[data-user-type-accordion="true"]' )
		.forEach( initAccordion );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', boot );
} else {
	boot();
}
