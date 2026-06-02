# CLAUDE.md

Guidance for Claude Code when working in this repo.

## Project Context

Generates WordPress Gutenberg block markup (HTML) to be pasted into the **Code Editor** of the iConnections WordPress site. No PHP access — pure Gutenberg HTML comment syntax used at `https://iconnections.io/wp-admin/post-new.php?post_type=page`.

Output is serialized Gutenberg markup: HTML + `<!-- wp:block-name {...attrs} -->` comments. Use only native/core WP blocks unless a custom `wp:mesa-gutenberg/*` block is needed.

## Dev Workflow

```
src/       Gutenberg markup files (*.html) — one per page
styles/    Preview-only CSS (base.css). Not pasted into WP.
images/    Local assets served at /images/*
server.js  Local preview server with hot-reload + layout shim
```

`npm run dev` serves on `http://localhost:3000`. Watches `src/` and `styles/` via chokidar; reloads via SSE. Each page opens at `/pages/<filename-without-ext>`.

**Layout shim (`server.js`):** Walks `<!-- wp:... -->` comments and applies the same layout WP's PHP `save()` produces. Handles `layout.type` of `flex`, `grid`, `constrained`, self-closing `wp:spacer`, and the `wp:cover` constrained-layout case (targets `.wp-block-cover__inner-container`).

Markup in `src/` must remain pasteable into WP Code Editor as-is — never leak preview-only hacks.

## Output Format

Deliver final markup as a single fenced code block for direct copy-paste into the WP Code Editor.

## Critical Rules

- **Never output plain HTML files** (`<html>`, `<head>`, `<body>`, `<style>`). Only serialized Gutenberg block markup.
- **Never use plain CSS or `<style>` blocks.** Styles live in block JSON (`"style":{...}`) and mirrored as inline `style=""`.
- **Never reference external asset URLs** (e.g. Figma MCP). Reproduce gradients/glows with CSS values inside block attributes.
- **Never use `<!-- wp:html -->`.** Always native blocks.
- **Plugin CSS changes go in `style.scss`, never `styles/base.css`.** `base.css` is local-preview only. Custom block visuals belong in `src/blocks/*/style.scss` and ship via `/plugin-zip`.

## Fundamentals

### Gutenberg Syntax

- Blocks wrap in HTML comments: `<!-- wp:name -->` … `<!-- /wp:name -->`
- Attributes are JSON inside the opening comment: `<!-- wp:columns {"verticalAlignment":"top"} -->`
- Self-closing: `<!-- wp:spacer {"height":"40px"} /-->`
- Class names follow Gutenberg conventions: `wp-block-*`, `has-*-color`, `has-*-background-color`.

### Master Rule: JSON ⇄ Inline Style Sync

**Every visual property in a block's JSON must be mirrored as inline `style=""` on the wrapper — and vice versa.** WP validates by re-serializing JSON and comparing to saved HTML; any divergence triggers "Attempt Recovery". When you change one side, change the other.

### Inline Style Property Order

WP re-serializes inline styles in a specific order:

| Block type | Style order |
|---|---|
| Layout (`wp:group`, `wp:column`) | `border-*` → `background-color`/`background` → `min-height` → `padding-*` → `margin-*` → other |
| Text (`wp:paragraph`, `wp:heading`) | `color` → `margin-*` → `font-family` → `font-size` → `font-weight` → `line-height` |
| Buttons (`wp:button > a`) | `border-color` → `border-width` → `border-radius` → `color` → `background`/`background-color` → `padding-*` → `font-family` → `font-size` → `line-height` → `text-decoration` |

When unsure, manually create the block in the visual editor and copy WP's output.

## Block Identification

### `metadata.name` on Every Block

**Every `wp:*` block must have `metadata.name` as the first JSON key.** Includes paragraphs, headings, images, columns, buttons, separators, spacers, groups — no exceptions. Name appears in WP's List View. Derive from block type + purpose; never random hashes.

```html
<!-- wp:paragraph {"metadata":{"name":"paragraph-hero-desc"},"style":{...}} -->
<p class="has-text-color" style="...">Text</p>
<!-- /wp:paragraph -->
```

### Stable Identity with `anchor`

`metadata.name` is a display label; it doesn't persist as a technical ID. `clientId` is runtime-only — never serialize it. The `anchor` attribute is the only serialized identifier — renders as HTML `id` on the wrapper. Use only when a stable HTML id is needed (in-page nav, CSS, JS hooks). Keep value short kebab-case matching `metadata.name`.

## Layout & Sizing

### Layout Classes in `className`

WP auto-adds layout classes; without them, re-serialization triggers Attempt Recovery.

| Block + layout | Required `className` (mirrored on wrapper `class`) |
|---|---|
| `wp:group` default/no layout | `is-layout-flow wp-block-group-is-layout-flow` |
| `wp:group` constrained | `is-layout-constrained wp-block-group-is-layout-constrained` |
| `wp:group` flex | `is-layout-flex wp-block-group-is-layout-flex` |
| `wp:columns` | `is-layout-flex wp-block-columns-is-layout-flex` |
| `wp:column` | `is-layout-flow wp-block-column-is-layout-flow` |

**Wrapper class order:** `wp-block-[type]` → `is-layout-*` → `wp-block-[type]-is-layout-*` → `has-border-color` → `has-background` → `has-text-color`. Layout classes always before functional classes.

### Max-Width: Never `dimensions.maxWidth`

`style.dimensions` only recognizes `height`, `minHeight`, `minWidth`, `width`, `aspectRatio`. There is **no `maxWidth`** — WP strips it silently. Always use `layout.type:"constrained"` with `contentSize`:

```html
<!-- wp:group {"layout":{"type":"constrained","contentSize":"1280px"}} -->
<div class="wp-block-group is-layout-constrained wp-block-group-is-layout-constrained">...</div>
<!-- /wp:group -->
```

- `contentSize` constrains **direct children**, not the block itself.
- Add `"justifyContent":"left"` to left-align instead of center.
- For "full-width bg + constrained inner" pattern: put background and padding on the outer constrained group — no inner wrapper needed.

### Handling Figma Paddings

Figma exports large frame paddings (e.g. 260px L/R, 80px T/B) that simulate centered frames — **frame-level constraints, not real spacing**. Never copy blindly.

- **L/R padding:** use `layout.type:"constrained"` — never large pixel values for manual centering.
- **T/B padding:** evaluate intent. Often just canvas margin in Figma, not design.
- Only add padding that serves a real visual purpose.

### Partial Styles — Be Explicit

When applying a style to one side only, explicitly cancel other sides. `has-border-color` activates a CSS rule on all 4 sides — never use it for partial borders.

```html
<!-- wp:paragraph {"style":{"border":{"top":{"width":"0px","style":"none"},"right":{"width":"0px","style":"none"},"bottom":{"width":"0px","style":"none"},"left":{"color":"#ffffff","width":"1px","style":"solid"}}}} -->
<p style="border-top:none;border-right:none;border-bottom:none;border-left-color:#ffffff;border-left-style:solid;border-left-width:1px">…</p>
```

Same principle for padding/margin/radius shorthands.

## Typography

### Text Color

Never use `-webkit-background-clip:text` tricks — Gutenberg doesn't recognize them. Always use the native color attribute:

```html
<!-- wp:heading {"level":1,"style":{"color":{"text":"#ffffff"}}} -->
<h1 class="wp-block-heading has-text-color" style="color:#ffffff">Title</h1>
<!-- /wp:heading -->
```

### Text Alignment

When Figma applies alignment (on the element OR a parent it inherits from):

1. `"align":"center"` top-level JSON attribute
2. `has-text-align-center` class on wrapper — **before** `has-text-color`
3. **Do NOT** add `text-align:...` to inline `style=""` — WP uses the class only

```html
<!-- wp:paragraph {"align":"center","style":{"typography":{...},"color":{"text":"#ffffff"}}} -->
<p class="has-text-align-center has-text-color" style="color:#ffffff;...">Text</p>
<!-- /wp:paragraph -->
```

**Figma inheritance trap:** Figma's `text-center` is often on a parent flex row. Gutenberg blocks do NOT inherit — set alignment explicitly on every text block.

### Capturing Typography from Figma MCP

Figma MCP returns React/Tailwind. Before writing any text block, scan the element AND ancestors for every typography class. Map each via the [Tailwind → Gutenberg reference](#tailwind--gutenberg-map). Gutenberg blocks don't inherit — materialize every property.

### Capturing Spacing from Figma — THE RULE I KEEP BREAKING

**Whenever Figma shows `gap-[Npx]` on a flex/flow container, that gap MUST be materialized as explicit `margin-bottom:Npx` on every non-last child — JSON `spacing.margin.bottom` + mirrored inline `style="margin-bottom:Npx"`.**

`blockGap` alone is NOT enough in local preview. The base.css rule that turns blockGap into spacing is `> * + * { margin-top: var(--wp--style--block-gap) }`. As soon as a child has `margin-top:0px` inline (which every text block does, because we set `margin:{top:"0px",bottom:"0px"}` to match WP's output), inline specificity beats the class selector and the gap collapses to zero. The user sees texts glued together — and this has happened repeatedly.

**Process for every Figma frame with a `gap-[N]` container:**

1. Read `gap-[N]` value from the Figma container.
2. List the children top-to-bottom.
3. For each child except the last: set `style.spacing.margin.bottom` = N in JSON AND mirror as `margin-bottom:Npx` in inline `style=""`. Keep `margin-top:0px`.
4. Last child stays `margin-bottom:0px`.
5. This applies to EVERY text block, image/cover, tag-wrap group, list, button group — anything that's a child of a `gap`-spaced container. No exceptions.

**Do not skip this for tag-wrap, cover blocks, or button groups just because they don't normally carry margin.** If they're a non-last sibling under a `gap` container, they get explicit `margin-bottom`.

When the user shows a screenshot of "tudo colado" with no spacing — the fix is always this rule, applied retroactively to every non-last child. Do it the first time.

## Block-Specific Rules

### Images: CSS Inline Styles, Not HTML Attributes

WP re-serializes `wp:image` with `is-resized` using CSS `style=""`, not HTML `width`/`height`.

**Correct:**
```html
<!-- wp:image {"metadata":{"name":"icon-example"},"width":"40px","height":"40px","sizeSlug":"full","linkDestination":"none"} -->
<figure class="wp-block-image size-full is-resized"><img src="/images/icon.png" alt="" style="width:40px;height:40px"/></figure>
<!-- /wp:image -->
```

JSON uses **string** values with units (`"40px"`, not `40`). Both must sync.

### Buttons: No `border-style` in Inline Style

WP does NOT include `border-style:solid` in the button link's inline style — applied via `has-border-color` theme rule. Including it causes mismatch.

```html
<!-- wp:button {"style":{"border":{"color":"#e2e8f0","width":"2px","radius":"4px"}}} -->
<div class="wp-block-button"><a class="... has-border-color ..." href="#"
  style="border-color:#e2e8f0;border-width:2px;border-radius:4px;...">Label</a></div>
<!-- /wp:button -->
```

### Separators: `has-text-color` When Colored

WP adds `has-text-color` to colored separators and mirrors background as both `background-color` and `color`:

```html
<!-- wp:separator {"metadata":{"name":"separator-stats"},"className":"is-style-wide","style":{"color":{"background":"rgba(255,255,255,0.15)"}}} -->
<hr class="wp-block-separator has-text-color has-alpha-channel-opacity has-background is-style-wide" style="background-color:rgba(255,255,255,0.15);color:rgba(255,255,255,0.15)"/>
<!-- /wp:separator -->
```

### Bordered Groups: `has-border-color` Class

Any `wp:group` with `border.color` gets `has-border-color` on the wrapper:

```html
<!-- wp:group {"style":{"border":{"color":"rgba(75,31,89,0.4)","width":"2px","style":"solid"}}} -->
<div class="wp-block-group has-border-color has-background" style="border-color:rgba(75,31,89,0.4);border-style:solid;border-width:2px;...">
</div>
<!-- /wp:group -->
```

### Cover Blocks

**Local dev (`src/*.html`):** `id` and `sizeSlug` can be omitted.

**Before pasting into WP:** include `id` (placeholder int OK), `sizeSlug` (`"large"`/`"full"`), `isUserOverlayColor`, and `customOverlayColor` if used.

**Canonical structure:** padding on outer `<div class="wp-block-cover">`. Overlay `<span>` carries `has-background-dim-0 has-background-dim has-background-gradient`. Inner container has no layout classes — just `class="wp-block-cover__inner-container"`.

```html
<!-- wp:cover {"url":"...","id":1,"dimRatio":0,"isUserOverlayColor":false,"customGradient":"linear-gradient(...)","sizeSlug":"large","metadata":{"name":"hero"},"style":{"spacing":{"padding":{"top":"80px","bottom":"80px"}}},"layout":{"type":"constrained","contentSize":"1280px"}} -->
<div class="wp-block-cover" style="padding-top:80px;padding-bottom:80px;min-height:720px">
  <img class="wp-block-cover__image-background wp-image-1 size-large" alt="" src="/images/hero.png" data-object-fit="cover"/>
  <span aria-hidden="true" class="wp-block-cover__background has-background-dim-0 has-background-dim has-background-gradient" style="background:linear-gradient(...)"></span>
  <div class="wp-block-cover__inner-container"><!-- inner blocks --></div>
</div>
<!-- /wp:cover -->
```

### Custom Blocks (`wp:mesa-gutenberg/*`)

Custom blocks define their own `save()`. WP core rules don't apply unless stated. After "Attempt Recovery", copy WP's corrected output as the ground truth — never guess.

Key differences:
- `metadata` may serialize **last**, not first.
- Unrecognized attributes are silently stripped.
- Boolean `data-*` serialize as `attr="true"`, not bare.
- HTML attribute order is per the block's JSX.

**`wp:mesa-gutenberg/starfield-background`** — recognized attrs in WP's order: `backgroundColor`, `minHeight` (integer px), `glowColor`, `metadata`.

```html
<!-- wp:mesa-gutenberg/starfield-background {"backgroundColor":"#130419","minHeight":720,"glowColor":"rgba(147,51,234,0.45)","metadata":{"name":"starfield-hero"}} -->
<div style="position:relative;min-height:720px;background-color:#130419" data-star-count="160" data-bg-color="#130419" data-star-color="#ffffff" class="wp-block-mesa-gutenberg-starfield-background">
  <canvas data-starfield="true" class="starfield-background__canvas"></canvas>
  <span class="starfield-background__glow" style="background:radial-gradient(...)" aria-hidden="true"></span>
  <div class="starfield-background__content"><!-- inner blocks --></div>
</div>
<!-- /wp:mesa-gutenberg/starfield-background -->
```

- `starCount`/`starColor` are NOT registered JSON attrs — don't include.
- `minHeight` int maps to `min-height:${minHeight}px` (never `100vh`).
- Wrapper attribute order: `style` → `data-*` → `class`.

**`wp:mesa-gutenberg/cobe-globe`** — JSON attr order: `size` → `topOffset` → `overlays` → `className` → `metadata`. Writing any other order causes Attempt Recovery.

```html
<!-- wp:mesa-gutenberg/cobe-globe {"size":500,"overlays":[...]} -->
<div data-globe-size="500" style="width:500px;height:500px" class="wp-block-mesa-gutenberg-cobe-globe">
  <canvas data-cobe-globe="true" style="width:100%;height:100%;display:block"></canvas>
</div>
<!-- /wp:mesa-gutenberg/cobe-globe -->
```

- Wrapper attribute order: `data-globe-size` → `style` → `class`.
- `data-cobe-globe="true"` (not bare).
- WP normalizes numbers: `-74.0` → `-74`, `1.50` → `1.5`. Use `[40.7, -74]` not `[40.7, -74.0]`.
- `topOffset` set → wrapper style is `width:${size}px;height:${size}px;top:${topOffset}`. Omitted → only width+height. Never include `top:...` without matching `topOffset`, and vice versa.

**Changing globe size — sync 3 places:** JSON `"size"`, `data-globe-size`, inline `style="width:Xpx;height:Xpx"`.

**Overlay mode:** `"className":"is-overlay"` makes the globe `position:absolute`. Parent becomes positioning context via `:has()`.

| Modifier | Behavior |
|---|---|
| (none) | Top-left of parent; use `topOffset` to shift vertically |
| `is-anchor-right` | Globe center at parent's **right edge**, vertically centered. **Ignore `topOffset`.** |

`is-anchor-right` uses `--cobe-globe-size` CSS var set at runtime from `data-globe-size`. **Never** set `--cobe-globe-size` in serialized inline style.

```html
<!-- wp:mesa-gutenberg/cobe-globe {"size":1300,"className":"is-overlay is-anchor-right","overlays":[...]} -->
<div data-globe-size="1300" style="width:1300px;height:1300px"
  class="wp-block-mesa-gutenberg-cobe-globe is-overlay is-anchor-right">
```

`topOffset` (legacy, default anchor only): `"0"` = globe top at parent top; negative shifts up. Without `is-overlay`, `topOffset` has no visible effect.

### The iConnections Hero — Canonical Structure

**Only correct structure for the hero. Re-establish whenever it looks broken.** Past iterations placed the globe in `wp:columns` and kept breaking — never use that pattern.

```
wp:group (page-dark-bg — purple gradient bg)
└── wp:mesa-gutenberg/starfield-background (full-width, no padding — globe's positioning context)
    ├── wp:group (hero-shell — flex, vertical-center, padding:80/64, min-height:100vh)
    │   └── wp:group (hero-content — constrained, contentSize:590px, justifyContent:left)
    │       ├── support-text paragraph
    │       ├── h1 title
    │       ├── description paragraph
    │       ├── spacer
    │       └── wp:buttons
    └── wp:mesa-gutenberg/cobe-globe (className:"is-overlay is-anchor-right")
```

Why stable:
- **No `wp:columns`.** Column percentages caused every "globo desalinhado" regression.
- **Globe is sibling of `hero-shell`, NOT child.** Its positioning parent is `starfield-background__content` — full viewport width, no padding. `is-anchor-right` anchors at true viewport right edge.
- **Globe positioning lives in `style.scss`** via `is-anchor-right` — not derivable from inline style or sibling width.
- **Content group constrained, not column-width.** `contentSize:590px` preserved as JSON; never squeezed.
- **Spacing auto-adjusts to viewport.** Content at 590px left; globe at viewport right.

Globe JSON in this hero: `{"size":1300,"className":"is-overlay is-anchor-right","overlays":[...]}`. Do NOT add `topOffset` with `is-anchor-right`.

**When hero breaks after WP edit:** re-paste `src/hero.html` (canonical source). Do NOT tweak column widths or `topOffset` — they revert.

## Figma Integration

Figma MCP server is configured (see `.claude/settings.json`). Use it to translate designs into Gutenberg markup — **not** React/Tailwind.

Flow:
1. Fetch design with `get_design_context` or `get_screenshot`.
2. Map visual sections to closest native blocks (group, columns, cover, image, heading, paragraph, buttons, separator, spacer).
3. Output valid serialized Gutenberg markup.

When translating:
- Walk **every ancestor** of text nodes to gather inherited typography/alignment — Gutenberg doesn't inherit.
- Strip frame-level paddings used only for canvas centering.
- Replace external Figma asset URLs with local `/images/*` references.

## Avoiding "Attempt Recovery"

WP validates by re-serializing JSON and comparing to saved HTML. Any mismatch triggers Attempt Recovery. Fix: make JSON, wrapper classes, and inline style produce identical output to WP's `save()`.

### Anti-Recovery Checklist

- [ ] `metadata.name` present on every block, first JSON key.
- [ ] JSON and inline `style=""` in sync — every property mirrored.
- [ ] Inline style property order matches WP's order.
- [ ] Layout `className` set in both JSON and wrapper `class`.
- [ ] Wrapper class order: layout classes before functional classes.
- [ ] `wp:image` custom dimensions use `style="width:Xpx;height:Xpx"`, not HTML attrs. JSON uses string units.
- [ ] `wp:button` with border has NO `border-style:solid` inline.
- [ ] `wp:separator` with bg has `has-text-color` and mirrors bg to color.
- [ ] `wp:group` with `border.color` has `has-border-color`.
- [ ] `wp:cover` for WP includes `id`, `sizeSlug`, `isUserOverlayColor`.
- [ ] No `dimensions.maxWidth` — use `layout.type:"constrained"`.
- [ ] Partial borders/paddings explicitly cancel unwanted sides; no `has-border-color` for partials.
- [ ] Text alignment uses `align` + `has-text-align-*` class (before `has-text-color`). NO `text-align:...` inline.
- [ ] Text color uses `"color":{"text":...}` + `has-text-color` + `color:...` inline.
- [ ] No `"style":{"css":"..."}` — silently stripped.
- [ ] Flex groups have NO `display:flex`/`flex-wrap`/`align-items`/`justify-content`/`gap` inline.
- [ ] `wp:column` inline contains only `flex-basis` (when `width` set).
- [ ] `wp:columns` has NO `style="gap:..."`.
- [ ] No `--wp--style--*` CSS vars in inline `style=""`.
- [ ] `wp:buttons` has NO `flex-wrap`/`gap` inline.
- [ ] Heading `id` only when matching `"anchor":"..."` exists in JSON.
- [ ] No `font-feature-settings` or `white-space:nowrap` inline (no JSON counterpart).
- [ ] `aligncenter` figures have NO `style="margin:0 auto"`.

### Styles WordPress Does Not Serialize

These look like valid CSS but WP's `save()` won't output them — including them causes mismatch:

- **`style.css` JSON key** — no such key exists; silently stripped.
- **Flex layout styles on `wp:group`/`wp:buttons`** — generated via `is-layout-flex` class + site stylesheet, not inline.
- **`gap:` on `wp:columns`** — `spacing.blockGap` renders as class/custom prop, not inline.
- **`--wp--style--*` CSS vars** — injected by PHP, never serialized.
- **Auto-generated heading `id`** — editor UI only; not in saved content. Only include `id` when JSON has matching `anchor`.
- **`font-feature-settings`, `white-space:nowrap`** — no Gutenberg JSON counterpart.
- **`margin:0 auto` on `aligncenter` figures** — class handles centering.
- **Arbitrary CSS on `wp:column`** — only `flex-basis` (from `width`) is serialized. For inner centering use a nested `wp:group` with `layout.type:"flex"`.
- **`border-style:solid` on `wp:button` link** — applied via `has-border-color` theme rule.
- **`text-align:*` in paragraph/heading inline** — uses `has-text-align-*` class only.

### Never Use `wp:html`

`<!-- wp:html -->` doesn't work well here. Always use native blocks with JSON ⇄ inline style sync.

### Local Preview vs WP Rendering

Local dev (`server.js`) replicates WP's PHP at render time for `layout.type` of `flex`, `grid`, `constrained`. If a block attribute relies on WP PHP beyond inline `style=""`, **extend the shim in `server.js`** — never work around it in the markup (markup must stay pasteable into WP unchanged).

## Reference

### Tailwind → Gutenberg Map

| Tailwind / Figma class | JSON attribute | Inline style |
|---|---|---|
| `text-[64px]` | `"fontSize":"64px"` | `font-size:64px` |
| `leading-[72px]` | `"lineHeight":"72px"` (or ratio) | `line-height:72px` |
| `font-bold` / `font-weight:700` | `"fontWeight":"700"` | `font-weight:700` |
| `font-['Inter_Tight',…]` | `"fontFamily":"'Inter Tight', sans-serif"` | `font-family:'Inter Tight', sans-serif` |
| `text-center`/`-left`/`-right` (self or parent) | `"align":"center"`/`"left"`/`"right"` | *(omit — WP uses `has-text-align-*` class)* |
| `text-white` / `text-[#fff]` | `"color":{"text":"#ffffff"}` | `color:#ffffff` |
| `whitespace-nowrap` | *(omit — no Gutenberg attr)* | *(omit)* |
| `fontFeatureSettings:'case' 1` | *(omit)* | *(omit)* |

Add matching wrapper class for alignment: `has-text-align-center`/`-left`/`-right`.

### `metadata.name` Naming

Format: `[short-role]-[descriptive-slug]`.

| Block / role | Prefix examples |
|---|---|
| `wp:heading` | `heading-hero`, `heading-section-title` |
| `wp:paragraph` | `paragraph-hero-desc`, `paragraph-stats-footer` |
| `wp:image` (icon) | `icon-ai-matching`, `chevron-personalized` |
| `wp:image` (content) | `image-anne-johnson` |
| `wp:column` / `wp:columns` | `column-feature-list`, `stats-columns` |
| `wp:buttons` / `wp:button` | `hero-buttons`, `filled-button`, `outline-button` |
| `wp:group` (section/wrapper/divider) | `hero-text`, `quote-wrapper`, `divider-after-ai-matching` |
| `wp:separator` / `wp:spacer` | `separator-stats`, `spacer-allocators-stats` |
