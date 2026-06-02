/*
 * Mesa Gutenberg — card title tooltip.
 *
 * For every `.card-title-clamp` element on the page, set the native `title`
 * attribute to the full text whenever the rendered text is truncated by the
 * 2-line clamp. Re-runs on resize so titles that wrap differently at narrow
 * widths still get a tooltip.
 */
(function () {
	function syncTitleAttrs() {
		var nodes = document.querySelectorAll('.card-title-clamp');
		for (var i = 0; i < nodes.length; i++) {
			var el = nodes[i];
			var fullText = (el.textContent || '').trim();
			if (el.scrollHeight > el.clientHeight + 1) {
				if (el.getAttribute('title') !== fullText) {
					el.setAttribute('title', fullText);
				}
			} else if (el.hasAttribute('title')) {
				el.removeAttribute('title');
			}
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', syncTitleAttrs);
	} else {
		syncTitleAttrs();
	}

	var resizeTimer = null;
	window.addEventListener('resize', function () {
		if (resizeTimer) clearTimeout(resizeTimer);
		resizeTimer = setTimeout(syncTitleAttrs, 150);
	});
})();
