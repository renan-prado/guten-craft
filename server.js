const http = require('http');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const PORT = 3000;
const SRC_DIR = path.join(__dirname, 'src');
const STYLES_DIR = path.join(__dirname, 'styles');
const IMAGES_DIR = path.join(__dirname, 'images');

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

function shell(title, bodyContent) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — iConnections Preview</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="/styles/base.css">
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
        el.style.display        = 'flex';
        el.style.flexWrap       = layout.flexWrap || 'wrap';
        el.style.alignItems     = ALIGN[layout.verticalAlignment] || 'center';
        el.style.justifyContent = JUSTIFY[layout.justifyContent] || 'flex-start';
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
</body>
</html>`;
}

function indexPage(pages) {
  const links = pages.map(p =>
    `  <li><a href="/pages/${p}">${p}</a></li>`
  ).join('\n');
  const body = `<div style="font-family:sans-serif;padding:40px">
  <h1 style="margin-bottom:16px">iConnections Preview</h1>
  <ul style="line-height:2">\n${links}\n  </ul>
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

  // Image assets
  if (pathname.startsWith('/images/')) {
    const file = path.join(IMAGES_DIR, pathname.replace('/images/', ''));
    if (!file.startsWith(IMAGES_DIR)) { res.writeHead(403); res.end(); return; }
    if (!fs.existsSync(file)) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(file);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
    return;
  }

  // Page preview
  if (pathname.startsWith('/pages/')) {
    const name = pathname.replace('/pages/', '').replace(/\.html$/, '');
    const file = path.join(SRC_DIR, `${name}.html`);
    if (!file.startsWith(SRC_DIR)) { res.writeHead(403); res.end(); return; }
    if (!fs.existsSync(file)) { res.writeHead(404); res.end(`Page "${name}" not found in src/`); return; }
    const content = fs.readFileSync(file, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(shell(name, content));
    return;
  }

  // Index
  if (pathname === '/' || pathname === '/index') {
    const pages = fs.existsSync(SRC_DIR)
      ? fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.html')).map(f => f.replace('.html', ''))
      : [];
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(indexPage(pages));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Preview server running at http://localhost:${PORT}`);
  console.log(`Watching: src/ and styles/ for changes`);
});
