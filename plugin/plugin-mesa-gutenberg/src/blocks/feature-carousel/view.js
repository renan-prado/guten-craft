function getCardsPerPage( root ) {
	const w = window.innerWidth;
	if ( w <= 640 ) {
		return parseInt( root.dataset.cardsMobile, 10 ) || 1;
	}
	if ( w <= 1024 ) {
		return parseInt( root.dataset.cardsTablet, 10 ) || 2;
	}
	return parseInt( root.dataset.cardsDesktop, 10 ) || 3;
}

function initFeatureCarousel( root ) {
	if ( ! root || root.dataset.fcInit === '1' ) return;
	root.dataset.fcInit = '1';

	const track = root.querySelector( '.feature-carousel__track' );
	const dotsHost = root.querySelector( '.feature-carousel__dots' );
	if ( ! track || ! dotsHost ) return;

	const cards = Array.from( track.children );
	if ( ! cards.length ) return;

	let perPage = getCardsPerPage( root );
	let pages = Math.max( 1, Math.ceil( cards.length / perPage ) );

	function renderDots() {
		root.setAttribute( 'data-pages', String( pages ) );
		dotsHost.innerHTML = '';
		if ( pages < 1 ) return;
		for ( let i = 0; i < pages; i++ ) {
			const dot = document.createElement( 'button' );
			dot.type = 'button';
			dot.className = 'feature-carousel__dot' + ( i === 0 ? ' is-active' : '' );
			dot.setAttribute( 'role', 'tab' );
			dot.setAttribute( 'aria-label', `Go to slide ${ i + 1 }` );
			dot.setAttribute( 'data-page', String( i ) );
			dot.addEventListener( 'click', () => goToPage( i ) );
			dotsHost.appendChild( dot );
		}
	}

	function pageWidth() {
		// width of N cards + (N-1) gaps. Easiest: scrollWidth / pages.
		return track.scrollWidth / pages;
	}

	function goToPage( idx ) {
		const x = pageWidth() * idx;
		track.scrollTo( { left: x, behavior: 'smooth' } );
	}

	function updateActiveDot() {
		if ( pages <= 1 ) return;
		const idx = Math.round( track.scrollLeft / pageWidth() );
		const clamped = Math.max( 0, Math.min( pages - 1, idx ) );
		dotsHost.querySelectorAll( '.feature-carousel__dot' ).forEach( ( d, i ) => {
			d.classList.toggle( 'is-active', i === clamped );
		} );
	}

	function recompute() {
		const newPer = getCardsPerPage( root );
		if ( newPer !== perPage ) {
			perPage = newPer;
			pages = Math.max( 1, Math.ceil( cards.length / perPage ) );
			renderDots();
		}
		updateActiveDot();
	}

	renderDots();

	let scrollTick = null;
	track.addEventListener( 'scroll', () => {
		if ( scrollTick ) cancelAnimationFrame( scrollTick );
		scrollTick = requestAnimationFrame( updateActiveDot );
	} );

	let resizeTick = null;
	window.addEventListener( 'resize', () => {
		if ( resizeTick ) cancelAnimationFrame( resizeTick );
		resizeTick = requestAnimationFrame( recompute );
	} );

	/* Mouse drag-to-scroll (touch already works via overflow-x) */
	let isDown = false;
	let startX = 0;
	let startScroll = 0;
	let dragMoved = false;
	const DRAG_THRESHOLD = 6;

	let pendingScroll = null;

	function onPointerDown( e ) {
		if ( e.pointerType === 'touch' ) return;
		if ( e.button !== 0 ) return;
		isDown = true;
		dragMoved = false;
		startX = e.clientX;
		startScroll = track.scrollLeft;
		// Disable snap AND smooth scroll during drag so manual scrollLeft updates are instant.
		track.style.scrollSnapType = 'none';
		track.style.scrollBehavior = 'auto';
		track.classList.add( 'is-dragging' );
		track.setPointerCapture && track.setPointerCapture( e.pointerId );
		e.preventDefault();
	}

	function onPointerMove( e ) {
		if ( ! isDown ) return;
		const dx = e.clientX - startX;
		if ( Math.abs( dx ) > DRAG_THRESHOLD ) dragMoved = true;
		const target = startScroll - dx;
		if ( pendingScroll ) cancelAnimationFrame( pendingScroll );
		pendingScroll = requestAnimationFrame( () => {
			track.scrollLeft = target;
		} );
	}

	function endDrag( e ) {
		if ( ! isDown ) return;
		isDown = false;
		track.classList.remove( 'is-dragging' );
		track.style.scrollSnapType = '';
		track.style.scrollBehavior = '';
		if ( dragMoved ) {
			const idx = Math.round( track.scrollLeft / pageWidth() );
			const clamped = Math.max( 0, Math.min( pages - 1, idx ) );
			goToPage( clamped );
		}
	}

	function suppressClickIfDragged( e ) {
		if ( dragMoved ) {
			e.preventDefault();
			e.stopPropagation();
			dragMoved = false;
		}
	}

	track.addEventListener( 'pointerdown', onPointerDown );
	track.addEventListener( 'pointermove', onPointerMove );
	track.addEventListener( 'pointerup', endDrag );
	track.addEventListener( 'pointercancel', endDrag );
	track.addEventListener( 'pointerleave', endDrag );
	track.addEventListener( 'click', suppressClickIfDragged, true );
	track.addEventListener( 'dragstart', ( e ) => e.preventDefault() );
}

function boot() {
	document.querySelectorAll( '[data-feature-carousel="true"]' ).forEach( initFeatureCarousel );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', boot );
} else {
	boot();
}
