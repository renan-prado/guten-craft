const http = require('http');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const PORT = 3000;
const SRC_DIR = path.join(__dirname, 'src');
const STYLES_DIR = path.join(__dirname, 'styles');
const IMAGES_DIR = path.join(__dirname, 'images');
const PLUGIN_BUILD_DIR = path.join(__dirname, 'plugin', 'plugin-mesa-gutenberg', 'build');

// SSE clients waiting for reload signals
const sseClients = new Set();

function broadcast() {
  for (const res of sseClients) {
    res.write('data: reload\n\n');
  }
}

chokidar
  .watch([SRC_DIR, STYLES_DIR], { ignoreInitial: true })
  .on('all', (event, filePath) => {
    console.log(`[${event}] ${path.relative(__dirname, filePath)}`);
    broadcast();
  });

const STARFIELD_INIT_SCRIPT = `
<script>
(function () {
  function hexToRgb(hex) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(function(c){return c+c;}).join('');
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function buildStars(count, w, h) {
    return Array.from({length: count}, function() {
      return {
        x:           Math.random() * w,
        y:           Math.random() * h,
        radius:      0.6 + Math.random() * 1.5,
        baseOpacity: 0.30 + Math.random() * 0.45,
        amplitude:   0.30 + Math.random() * 0.60,
        period:      1500 + Math.random() * 5000,
        phase:       Math.random() * Math.PI * 2,
      };
    });
  }
  document.querySelectorAll('.wp-block-mesa-gutenberg-starfield-background').forEach(function(wrapper) {
    var canvas = wrapper.querySelector('canvas[data-starfield]');
    if (!canvas) return;
    var starCount = parseInt(wrapper.dataset.starCount || '160', 10);
    var bgColor   = wrapper.dataset.bgColor   || '#08000f';
    var starColor = wrapper.dataset.starColor || '#ffffff';
    var rgb = hexToRgb(starColor);
    var sr = rgb[0], sg = rgb[1], sb = rgb[2];
    var ctx = canvas.getContext('2d');
    var stars = [];
    var raf;
    function resize() {
      var dpr = window.devicePixelRatio || 1;
      var w = wrapper.offsetWidth  || 800;
      var h = wrapper.offsetHeight || 600;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width  = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = buildStars(starCount, w, h);
    }
    function draw(ts) {
      var w = wrapper.offsetWidth  || 800;
      var h = wrapper.offsetHeight || 600;
      ctx.clearRect(0, 0, w, h);
      if (bgColor && bgColor !== 'transparent') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, w, h);
      }
      stars.forEach(function(s) {
        var t     = ts / s.period;
        var alpha = Math.max(0, Math.min(1, s.baseOpacity + s.amplitude * Math.sin(t * Math.PI * 2 + s.phase)));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + sr + ',' + sg + ',' + sb + ',' + alpha.toFixed(3) + ')';
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }
    resize();
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(function() {
        cancelAnimationFrame(raf);
        resize();
        raf = requestAnimationFrame(draw);
      }).observe(wrapper);
    }
    raf = requestAnimationFrame(draw);
  });
})();
<\/script>`;

const COBE_INIT_SCRIPT = `
<script type="module">
  import createGlobe from 'https://esm.sh/cobe@2.0.1';
  // Mirrors cobe's fragment shader (sphere radius 0.8 in normalized space,
  // so r_px = min(w,h)*0.4). Same formula used by the plugin's view.js.
  function project(lat, lng, phi, theta, w, h) {
    var latR = lat * Math.PI / 180, lngR = lng * Math.PI / 180;
    var a = phi + lngR;
    var fx = Math.cos(latR) * Math.cos(a);
    var fy = Math.sin(latR) * Math.cos(theta) + Math.cos(latR) * Math.sin(a) * Math.sin(theta);
    var fz = Math.sin(latR) * Math.sin(theta) - Math.cos(latR) * Math.sin(a) * Math.cos(theta);
    if (fz <= 0) return null;
    var r = Math.min(w, h) * 0.4;
    return { x: w / 2 + fx * r, y: h / 2 - fy * r };
  }
  function hexToRgb(hex) {
    if (!hex) return [1, 1, 1];
    var h = hex.replace('#', '');
    if (h.length !== 6) return [1, 1, 1];
    return [
      parseInt(h.slice(0, 2), 16) / 255,
      parseInt(h.slice(2, 4), 16) / 255,
      parseInt(h.slice(4, 6), 16) / 255,
    ];
  }
  document.querySelectorAll('.wp-block-mesa-gutenberg-cobe-globe').forEach(function(wrapper) {
    var canvas = wrapper.querySelector('canvas[data-cobe-globe]');
    if (!canvas) return;
    // Drop any pre-existing SVG arc overlay (legacy v0.6 markup).
    var legacySvg = wrapper.querySelector('.cobe-globe-arcs');
    if (legacySvg) legacySvg.remove();

    var size = parseInt(wrapper.dataset.globeSize || '600', 10);
    // Expose globe size as a CSS variable so style.scss can compute anchor offsets
    // (matches the plugin's view.js so localhost == WP).
    wrapper.style.setProperty('--cobe-globe-size', size + 'px');
    var mapSamples = parseInt(wrapper.dataset.mapSamples || '6000', 10);
    var arcsData = [];
    try { arcsData = wrapper.dataset.arcs ? JSON.parse(wrapper.dataset.arcs) : []; } catch (e) { arcsData = []; }
    var arcColor = hexToRgb(wrapper.dataset.arcColor || '#ffffff');
    var baseColor = hexToRgb(wrapper.dataset.baseColor || '#a640e6');
    var glowColor = hexToRgb(wrapper.dataset.glowColor || '#e659e6');
    var arcWidth = parseFloat(wrapper.dataset.arcWidth || '0.5');
    var arcHeight = parseFloat(wrapper.dataset.arcHeight || '0.3');
    var arcs = arcsData.map(function(a) {
      var o = { from: a.from, to: a.to };
      if (a.color) o.color = hexToRgb(a.color);
      return o;
    });

    var dpr = window.devicePixelRatio || 1;
    // Initial phi centers Tokyo (lng 139.7°) so the westward auto-rotation
    // passes through Asia → Europe → Americas instead of the empty Pacific.
    var theta = 0.15, phi = -Math.PI / 2 - (139.7 * Math.PI) / 180;
    var isDragging = false, prevX = 0;
    var cards = Array.from(wrapper.querySelectorAll('.cobe-globe-card'));
    var markers = cards.map(function(card) {
      return {
        location: [parseFloat(card.dataset.lat), parseFloat(card.dataset.lng)],
        size: 0.032,
      };
    });

    canvas.style.cursor = 'grab';
    canvas.addEventListener('pointerdown', function(e) {
      isDragging = true;
      prevX = e.clientX;
      canvas.style.cursor = 'grabbing';
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', function(e) {
      if (!isDragging) return;
      var dx = e.clientX - prevX;
      prevX = e.clientX;
      phi += dx / 200;
    });
    canvas.addEventListener('pointerup', function() {
      isDragging = false;
      canvas.style.cursor = 'grab';
    });
    canvas.addEventListener('pointercancel', function() {
      isDragging = false;
      canvas.style.cursor = 'grab';
    });

    // cobe v2: width/height are passed un-multiplied; the lib applies dpr.
    var globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: size,
      height: size,
      phi: phi,
      theta: theta,
      dark: 1,
      diffuse: 1.2,
      mapSamples: mapSamples,
      mapBrightness: 6,
      mapBaseBrightness: 0,
      baseColor: baseColor,
      markerColor: [1, 1, 1],
      glowColor: glowColor,
      markers: markers,
      arcs: arcs,
      arcColor: arcColor,
      arcWidth: arcWidth,
      arcHeight: arcHeight,
      markerElevation: 0.02,
    });

    // cobe v2 has no onRender callback; we drive animation + card projection.
    function frame() {
      if (!isDragging) phi += 0.0012;
      globe.update({ phi: phi });
      var w = size, h = size;
      cards.forEach(function(card) {
        var p = project(parseFloat(card.dataset.lat), parseFloat(card.dataset.lng), phi, theta, w, h);
        if (p) { card.style.left = p.x + 'px'; card.style.top = p.y + 'px'; card.classList.add('is-visible'); }
        else { card.classList.remove('is-visible'); }
      });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
<\/script>`;

function shell(title, bodyContent) {
  const hasGlobe         = bodyContent.includes('data-cobe-globe');
  const hasStarfield     = bodyContent.includes('data-starfield');
  const hasSiteButton    = bodyContent.includes('wp-block-mesa-gutenberg-site-button');
  const hasLogosCarousel = bodyContent.includes('wp-block-mesa-gutenberg-logos-carousel');
  const hasFeatureAccordion = bodyContent.includes('wp-block-mesa-gutenberg-feature-accordion');
  const hasHaloCard      = bodyContent.includes('wp-block-mesa-gutenberg-halo-card');
  const hasFeatureCards  = bodyContent.includes('wp-block-mesa-gutenberg-feature-cards');
  const hasComparisonTable = bodyContent.includes('wp-block-mesa-gutenberg-comparison-table');
  const hasExpandableCards = bodyContent.includes('wp-block-mesa-gutenberg-expandable-cards');
  const hasNetworkSection = bodyContent.includes('wp-block-mesa-gutenberg-network-section');
  const hasNetworkCard    = bodyContent.includes('wp-block-mesa-gutenberg-network-card');
  const hasResponsiveImage = bodyContent.includes('wp-block-mesa-gutenberg-responsive-image');
  const hasFeatureCarousel = bodyContent.includes('wp-block-mesa-gutenberg-feature-carousel');
  const hasUserTypeAccordion = bodyContent.includes('wp-block-mesa-gutenberg-user-type-accordion');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — iConnections Preview</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="/styles/base.css">
  ${ hasGlobe      ? '<link rel="stylesheet" href="/plugin-build/blocks/cobe-globe/style-index.css">' : '' }
  ${ hasStarfield  ? '<link rel="stylesheet" href="/plugin-build/blocks/starfield-background/style-index.css">' : '' }
  ${ hasSiteButton ? '<link rel="stylesheet" href="/plugin-build/blocks/site-button/style-index.css">' : '' }
  ${ hasLogosCarousel ? '<link rel="stylesheet" href="/plugin-build/blocks/logos-carousel/style-index.css">' : '' }
  ${ hasFeatureAccordion ? '<link rel="stylesheet" href="/plugin-build/blocks/feature-accordion/style-index.css">' : '' }
  ${ hasHaloCard      ? '<link rel="stylesheet" href="/plugin-build/blocks/halo-card/style-index.css">' : '' }
  ${ hasFeatureCards  ? '<link rel="stylesheet" href="/plugin-build/blocks/feature-cards/style-index.css">' : '' }
  ${ hasComparisonTable ? '<link rel="stylesheet" href="/plugin-build/blocks/comparison-table/style-index.css">' : '' }
  ${ hasExpandableCards ? '<link rel="stylesheet" href="/plugin-build/blocks/expandable-cards/style-index.css">' : '' }
  ${ hasNetworkSection ? '<link rel="stylesheet" href="/plugin-build/blocks/network-section/style-index.css">' : '' }
  ${ hasNetworkCard    ? '<link rel="stylesheet" href="/plugin-build/blocks/network-card/style-index.css">' : '' }
  ${ hasResponsiveImage ? '<link rel="stylesheet" href="/plugin-build/blocks/responsive-image/style-index.css">' : '' }
  ${ hasFeatureCarousel ? '<link rel="stylesheet" href="/plugin-build/blocks/feature-carousel/style-index.css">' : '' }
  ${ hasUserTypeAccordion ? '<link rel="stylesheet" href="/plugin-build/blocks/user-type-accordion/style-index.css">' : '' }
</head>
<body>
${bodyContent}
<script>
  // Gutenberg layout shim — mimics WordPress server-side block layout processing.
  // WordPress PHP reads block JSON attrs and injects is-layout-flex classes + generated CSS.
  // Here we replicate that by walking comment nodes and applying equivalent inline styles.
  (function () {
    const JUSTIFY = { left: 'flex-start', right: 'flex-end', center: 'center', 'space-between': 'space-between' };
    const ALIGN   = { top: 'flex-start', center: 'center', bottom: 'flex-end' };

    const iter = document.createNodeIterator(document.body, NodeFilter.SHOW_COMMENT);
    let node;
    while ((node = iter.nextNode())) {
      const rawText = node.textContent.trim();
      const isSelfClosing = rawText.endsWith('/');
      const text = isSelfClosing ? rawText.slice(0, -1).trimEnd() : rawText;
      const m = text.match(/^wp:(\\S+)(?:\\s+([\\s\\S]*))?$/);
      if (!m) continue;

      const [, blockName, attrsStr] = m;
      let attrs = {};
      if (attrsStr) { try { attrs = JSON.parse(attrsStr); } catch (e) { continue; } }

      // Self-closing spacer: WordPress injects a div at render time; we do the same here.
      if (isSelfClosing && blockName === 'spacer') {
        const div = document.createElement('div');
        div.className = 'wp-block-spacer';
        div.setAttribute('aria-hidden', 'true');
        div.style.height = attrs.height || '100px';
        node.parentNode.insertBefore(div, node.nextSibling);
        continue;
      }

      let el = node.nextSibling;
      while (el && el.nodeType !== Node.ELEMENT_NODE) el = el.nextSibling;
      if (!el) continue;

      const layout = attrs.layout || {};
      const gap = attrs.style?.spacing?.blockGap;

      if (layout.type === 'flex') {
        const isVertical = layout.orientation === 'vertical';
        el.style.display        = 'flex';
        el.style.flexDirection  = isVertical ? 'column' : 'row';
        el.style.flexWrap       = layout.flexWrap || (isVertical ? 'nowrap' : 'wrap');
        if (isVertical) {
          el.style.justifyContent = JUSTIFY[layout.justifyContent] || 'flex-start';
          el.style.alignItems     = ALIGN[layout.verticalAlignment] || 'stretch';
        } else {
          el.style.alignItems     = ALIGN[layout.verticalAlignment] || 'center';
          el.style.justifyContent = JUSTIFY[layout.justifyContent] || 'flex-start';
        }
        if (gap) el.style.gap  = gap;
      }

      if (layout.type === 'grid') {
        el.style.display = 'grid';
        if (layout.columnCount) el.style.gridTemplateColumns = 'repeat(' + layout.columnCount + ', 1fr)';
        if (gap) el.style.gap = gap;
      }

      // Constrained layout: WordPress PHP applies max-width + auto margins to direct children
      // via a generated <style> tag scoped by a unique container class. We replicate this
      // by setting equivalent inline styles directly on each non-aligned child element.
      // wp:cover is special — its constrained layout targets the inner-container's children,
      // not the cover root (which holds absolutely-positioned background elements).
      if (layout.type === 'constrained' && layout.contentSize) {
        const justify = layout.justifyContent || 'center';
        const ml = justify === 'left'  ? '0' : 'auto';
        const mr = justify === 'right' ? '0' : 'auto';
        const container = blockName === 'cover'
          ? el.querySelector('.wp-block-cover__inner-container')
          : el;
        if (container) {
          for (const child of container.children) {
            const cl = child.classList;
            if (cl.contains('alignfull') || cl.contains('alignwide') ||
                cl.contains('alignleft') || cl.contains('alignright')) continue;
            child.style.maxWidth = layout.contentSize;
            child.style.marginLeft = ml;
            child.style.marginRight = mr;
          }
        }
      }

      // wp:buttons gap comes from blockGap on the block itself
      if (blockName === 'buttons' && gap) el.style.gap = gap;
    }
  })();
</script>
<script>
  const es = new EventSource('/hot-reload');
  es.onmessage = () => location.reload();
  es.onerror = () => { es.close(); setTimeout(() => location.reload(), 2000); };
</script>
${hasGlobe     ? COBE_INIT_SCRIPT     : ''}
${hasStarfield ? STARFIELD_INIT_SCRIPT : ''}
${hasFeatureAccordion ? '<script src="/plugin-build/blocks/feature-accordion/view.js"></script>' : ''}
${hasExpandableCards ? '<script src="/plugin-build/blocks/expandable-cards/view.js"></script>' : ''}
${hasNetworkSection ? '<script src="/plugin-build/blocks/network-section/view.js"></script>' : ''}
${hasFeatureCarousel ? '<script src="/plugin-build/blocks/feature-carousel/view.js"></script>' : ''}
${hasUserTypeAccordion ? '<script src="/plugin-build/blocks/user-type-accordion/view.js"></script>' : ''}
</body>
</html>`;
}

function readPageGroups() {
  if (!fs.existsSync(SRC_DIR)) return [];
  return fs.readdirSync(SRC_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => {
      const dir = path.join(SRC_DIR, d.name);
      const files = fs.readdirSync(dir)
        .filter(f => f.endsWith('.html'))
        .map(f => f.replace(/\.html$/, ''))
        .sort();
      return { page: d.name, files };
    })
    .sort((a, b) => a.page.localeCompare(b.page));
}

function indexPage(groups) {
  const totalFiles = groups.reduce((n, g) => n + g.files.length, 0);
  const sections = groups.map(g => {
    const cards = g.files.map(f =>
      `<a class="card" href="/pages/${g.page}/${f}"><span class="card__name">${f}</span><span class="card__arrow" aria-hidden="true">→</span></a>`
    ).join('');
    return `
    <section class="group">
      <header class="group__header">
        <h2 class="group__title">${g.page}</h2>
        <span class="group__count">${g.files.length} ${g.files.length === 1 ? 'file' : 'files'}</span>
      </header>
      <div class="group__grid">${cards || '<p class="group__empty">No HTML files yet.</p>'}</div>
    </section>`;
  }).join('\n');

  const body = `<style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; font-family: 'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: radial-gradient(ellipse at top, #1a0a2a 0%, #08000f 60%); color: #f5f3ff; min-height: 100vh; }
    .wrap { max-width: 1100px; margin: 0 auto; padding: 64px 32px 96px; }
    .hero { margin-bottom: 48px; }
    .hero__eyebrow { font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: #a78bfa; margin: 0 0 12px; font-weight: 600; }
    .hero__title { font-size: 40px; line-height: 1.1; margin: 0 0 12px; font-weight: 700; letter-spacing: -0.02em; background: linear-gradient(135deg, #ffffff 0%, #c4b5fd 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .hero__subtitle { font-size: 15px; color: rgba(245, 243, 255, 0.6); margin: 0; }
    .group { margin-bottom: 48px; }
    .group__header { display: flex; align-items: baseline; gap: 14px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid rgba(167, 139, 250, 0.15); }
    .group__title { font-size: 22px; margin: 0; font-weight: 600; text-transform: capitalize; color: #ffffff; }
    .group__count { font-size: 12px; color: rgba(245, 243, 255, 0.45); font-variant-numeric: tabular-nums; }
    .group__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
    .group__empty { color: rgba(245, 243, 255, 0.4); font-size: 14px; margin: 0; padding: 16px 0; }
    .card { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 18px; border: 1px solid rgba(167, 139, 250, 0.18); border-radius: 10px; background: rgba(255, 255, 255, 0.02); color: #f5f3ff; text-decoration: none; transition: transform 120ms ease, border-color 120ms ease, background 120ms ease; }
    .card:hover { transform: translateY(-1px); border-color: rgba(167, 139, 250, 0.55); background: rgba(167, 139, 250, 0.08); }
    .card__name { font-size: 14px; font-weight: 500; font-family: ui-monospace, 'SF Mono', Menlo, monospace; }
    .card__arrow { color: #a78bfa; font-size: 16px; opacity: 0.7; transition: transform 120ms ease, opacity 120ms ease; }
    .card:hover .card__arrow { transform: translateX(3px); opacity: 1; }
  </style>
  <div class="wrap">
    <div class="hero">
      <p class="hero__eyebrow">Local Preview</p>
      <h1 class="hero__title">iConnections</h1>
      <p class="hero__subtitle">${groups.length} ${groups.length === 1 ? 'page' : 'pages'} · ${totalFiles} ${totalFiles === 1 ? 'block file' : 'block files'}</p>
    </div>
    ${sections || '<p class="group__empty">No pages yet. Create <code>src/&lt;page-name&gt;/</code> to get started.</p>'}
  </div>`;
  return shell('Index', body);
}

const MIME = {
  '.css': 'text/css',
  '.js':  'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // SSE hot-reload endpoint
  if (pathname === '/hot-reload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write(':ok\n\n');
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }

  // Static assets (styles/, etc.)
  if (pathname.startsWith('/styles/')) {
    const file = path.join(STYLES_DIR, pathname.replace('/styles/', ''));
    if (!file.startsWith(STYLES_DIR)) { res.writeHead(403); res.end(); return; }
    if (!fs.existsSync(file)) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(file);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    fs.createReadStream(file).pipe(res);
    return;
  }

  // Plugin build assets (custom blocks CSS/JS for local preview)
  if (pathname.startsWith('/plugin-build/')) {
    const file = path.join(PLUGIN_BUILD_DIR, pathname.replace('/plugin-build/', ''));
    if (!file.startsWith(PLUGIN_BUILD_DIR)) { res.writeHead(403); res.end(); return; }
    if (!fs.existsSync(file)) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(file);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    fs.createReadStream(file).pipe(res);
    return;
  }

  // Image assets
  if (pathname.startsWith('/images/')) {
    const file = path.join(IMAGES_DIR, decodeURIComponent(pathname.replace('/images/', '')));
    if (!file.startsWith(IMAGES_DIR)) { res.writeHead(403); res.end(); return; }
    if (!fs.existsSync(file)) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(file);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
    return;
  }

  // Page preview — supports /pages/<page>/<file> (nested) and legacy /pages/<file>
  if (pathname.startsWith('/pages/')) {
    const rel = pathname.replace('/pages/', '').replace(/\.html$/, '');
    const parts = rel.split('/').filter(Boolean);
    let file;
    if (parts.length === 2) {
      file = path.join(SRC_DIR, parts[0], `${parts[1]}.html`);
    } else if (parts.length === 1) {
      // Legacy flat path — try to resolve by scanning subfolders
      const flat = path.join(SRC_DIR, `${parts[0]}.html`);
      if (fs.existsSync(flat)) {
        file = flat;
      } else {
        const groups = readPageGroups();
        const hit = groups.find(g => g.files.includes(parts[0]));
        file = hit ? path.join(SRC_DIR, hit.page, `${parts[0]}.html`) : flat;
      }
    } else {
      res.writeHead(404); res.end('Not found'); return;
    }
    if (!file.startsWith(SRC_DIR)) { res.writeHead(403); res.end(); return; }
    if (!fs.existsSync(file)) { res.writeHead(404); res.end(`Page "${rel}" not found in src/`); return; }
    const content = fs.readFileSync(file, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(shell(rel, content));
    return;
  }

  // Index
  if (pathname === '/' || pathname === '/index') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(indexPage(readPageGroups()));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Preview server running at http://localhost:${PORT}`);
  console.log(`Watching: src/ and styles/ for changes`);
});
