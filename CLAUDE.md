# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Table of Contents

1. [Project Context](#project-context)
2. [Dev Workflow](#dev-workflow)
3. [Output Format](#output-format)
4. [Critical Rules](#critical-rules)
5. [Fundamentals](#fundamentals)
   - [Gutenberg Markup Syntax](#gutenberg-markup-syntax)
   - [The Master Rule: JSON ⇄ Inline Style Must Stay in Sync](#the-master-rule-json--inline-style-must-stay-in-sync)
   - [Common Block Patterns](#common-block-patterns)
   - [Inline Style Property Order](#inline-style-property-order)
6. [Block Identification](#block-identification)
   - [`metadata.name` on Every Block](#metadataname-on-every-block)
   - [Stable Block Identity with `anchor`](#stable-block-identity-with-anchor)
7. [Layout & Sizing](#layout--sizing)
   - [Layout Classes in `className`](#layout-classes-in-classname)
   - [Max-Width on Containers (Never Use `dimensions.maxWidth`)](#max-width-on-containers-never-use-dimensionsmaxwidth)
   - [Handling Figma Paddings](#handling-figma-paddings)
   - [Always Be Explicit About Partial Styles](#always-be-explicit-about-partial-styles)
8. [Typography](#typography)
   - [Text Color on Headings and Paragraphs](#text-color-on-headings-and-paragraphs)
   - [Text Alignment on Headings and Paragraphs](#text-alignment-on-headings-and-paragraphs)
   - [Capturing All Typography Attributes from Figma MCP](#capturing-all-typography-attributes-from-figma-mcp)
9. [Block-Specific Rules](#block-specific-rules)
   - [Images: Use CSS Inline Styles, Never HTML Attributes](#images-use-css-inline-styles-never-html-attributes)
   - [Buttons: No `border-style` in Inline Style](#buttons-no-border-style-in-inline-style)
   - [Separators: Include `has-text-color` When Colored](#separators-include-has-text-color-when-colored)
   - [Bordered Groups: `has-border-color` Class](#bordered-groups-has-border-color-class)
   - [Cover Blocks: Required Attributes](#cover-blocks-required-attributes)
10. [Figma Integration](#figma-integration)
11. [Avoiding "Attempt Recovery"](#avoiding-attempt-recovery)
    - [Why Validation Fails](#why-validation-fails)
    - [Anti-Recovery Checklist](#anti-recovery-checklist)
    - [Styles WordPress Does Not Serialize](#styles-wordpress-does-not-serialize)
    - [Never Use `wp:html`](#never-use-wphtml)
    - [Local Preview vs. WordPress Rendering](#local-preview-vs-wordpress-rendering)
12. [Reference](#reference)
    - [Tailwind → Gutenberg Map](#tailwind--gutenberg-map)
    - [`metadata.name` Naming Conventions](#metadataname-naming-conventions)

---

## Project Context

This project generates WordPress Gutenberg block markup (HTML) to be pasted into the **Code Editor** of the iConnections WordPress site. There is no PHP access — all output is pure Gutenberg HTML comment syntax used directly at:

```
https://iconnections.io/wp-admin/post-new.php?post_type=page
```

**What we build:** Static Gutenberg block structures using only native/core WordPress blocks. The output is serialized Gutenberg markup — a mix of HTML and structured `<!-- wp:block-name {...attrs} -->` comments that WordPress parses.

---

## Dev Workflow

```
C:\www\iconnections\
├── src/             # Gutenberg markup files (*.html) — one per page
├── styles/          # Preview-only CSS (base.css). Not pasted into WP.
├── images/          # Local image assets served at /images/*
├── server.js        # Local preview server with hot-reload + layout shim
├── package.json
└── CLAUDE.md
```

**Run the preview:**

```bash
npm run dev
```

- Serves on `http://localhost:3000`.
- Index page lists every file in `src/` as a clickable link.
- Each page is opened at `/pages/<filename-without-ext>`.
- Watches `src/` and `styles/` via `chokidar`; reloads the browser through Server-Sent Events.
- Image references use `/images/filename.png` (paths the live WP site will need to match after upload).

**Layout shim (`server.js`):** Wraps each page's body and runs a small client-side script that walks `<!-- wp:... -->` comments and applies the same layout that WordPress's PHP `save()` produces at render time. Currently handles `layout.type` of `flex`, `grid`, and `constrained`, plus self-closing `wp:spacer` and the `wp:cover` constrained-layout special case (which targets `.wp-block-cover__inner-container`).

**Editing markup:** The markup in `src/` is the same markup you paste into the WP Code Editor. It must remain pasteable as-is — never let preview-only hacks leak into the file.

---

## Output Format

Always deliver the final block markup as a single fenced code block so it can be copy-pasted directly into the WordPress Code Editor without modification.

---

## Critical Rules

- **Never output plain HTML files** with `<html>`, `<head>`, `<body>`, `<style>` tags. All output must be serialized Gutenberg block markup.
- **Never use plain CSS files or inline `<style>` blocks.** Styles are declared inside the block's JSON attributes (`"style":{...}`) and rendered as inline `style=""` on the wrapper element.
- **Never reference external asset URLs** (e.g. Figma MCP asset URLs). Visual effects like gradients, glows, and overlays must be reproduced with CSS values inside block attributes — `linear-gradient`, `radial-gradient`, `rgba()`, etc.
- **Never use `<!-- wp:html -->`** — it does not work well in this project. Always use native blocks.
- **Every file created in this project is Gutenberg markup** ready to paste into the WordPress Code Editor, regardless of file extension.

---

## Fundamentals

### Gutenberg Markup Syntax

- Blocks are wrapped in HTML comments: `<!-- wp:block-name -->` … `<!-- /wp:block-name -->`
- Block attributes are JSON inside the opening comment: `<!-- wp:columns {"verticalAlignment":"top"} -->`
- Self-closing blocks (no inner content): `<!-- wp:spacer {"height":"40px"} /-->`
- All class names follow Gutenberg conventions: `wp-block-*`, `has-*-color`, `has-*-background-color`, etc.
- Inner blocks are nested inside the outer block's wrapper `<div>`.

### The Master Rule: JSON ⇄ Inline Style Must Stay in Sync

**Every visual property declared in a block's JSON attribute object must be mirrored as an inline `style=""` value on the wrapper element — and vice versa.** WordPress validates blocks by re-serializing the JSON and comparing it to the saved HTML; any divergence triggers "Attempt Recovery".

This is the single rule behind most of this document. Specific sections below clarify how it applies to colors, alignment, borders, image dimensions, and buttons. When you change one side, change the other.

### Common Block Patterns

```html
<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
  <!-- wp:heading {"level":2} -->
  <h2 class="wp-block-heading">Title</h2>
  <!-- /wp:heading -->
</div>
<!-- /wp:group -->
```

```html
<!-- wp:columns -->
<div class="wp-block-columns">
  <!-- wp:column -->
  <div class="wp-block-column"><!-- inner blocks --></div>
  <!-- /wp:column -->
</div>
<!-- /wp:columns -->
```

### Inline Style Property Order

WordPress re-serializes inline styles in a specific order during block validation. Follow this order to avoid mismatches:

| Block type | Style order |
|---|---|
| **Layout containers** (`wp:group`, `wp:column`) | `border-*` → `background-color` / `background` → `padding-*` → `margin-*` → `min-height` → other |
| **Text blocks** (`wp:paragraph`, `wp:heading`) | `color` → `margin-*` → `font-family` → `font-size` → `font-weight` → `line-height` |
| **Buttons** (`wp:button > a`) | `border-color` → `border-width` → `border-radius` → `color` → `background` / `background-color` → `padding-*` → `font-family` → `font-size` → `line-height` → `text-decoration` |

When in doubt, follow the order WordPress outputs when you manually create the same block in the visual editor.

---

## Block Identification

### `metadata.name` on Every Block

**Every `wp:*` block — without exception — must have `metadata.name`.**

This includes `wp:paragraph`, `wp:heading`, `wp:image`, `wp:column`, `wp:columns`, `wp:buttons`, `wp:button`, `wp:separator`, `wp:spacer`, and all `wp:group` blocks. The name appears in the WordPress editor's List View, making it possible to locate and update any block by name — essential when updating markup via the Code Editor.

`metadata` is always the **first key** in the block's JSON attribute object:

```html
<!-- wp:paragraph {"metadata":{"name":"paragraph-hero-desc"},"style":{...}} -->
<p class="has-text-color" style="...">Text</p>
<!-- /wp:paragraph -->

<!-- wp:spacer {"metadata":{"name":"spacer-section-gap"},"height":"80px"} /-->
```

Never use random hashes. Always derive the name from the block's type and content/purpose so a reader can identify the block in the List View without opening it. See the [naming conventions reference](#metadataname-naming-conventions) for prefix examples.

### Stable Block Identity with `anchor`

`metadata.name` is a display label — it helps humans navigate in the editor but does not persist as a technical ID across Code Editor pastes (WordPress assigns a new internal `clientId` on every paste).

**`clientId` is runtime-only and is never serialized to post content.** Do not try to embed it in markup.

The `anchor` attribute is the only serialized identifier. It renders as an HTML `id` on the wrapper element and survives round-trips through the Code Editor:

```html
<!-- wp:group {"metadata":{"name":"stats-card"},"anchor":"stats-card",...} -->
<div id="stats-card" class="wp-block-group ...">...</div>
<!-- /wp:group -->
```

Use `anchor` only when a block needs a stable HTML id — for in-page navigation (`#stats-card`), CSS targeting, or JavaScript hooks. It is not required on every block. When used, keep the value a short kebab-case slug that matches the `metadata.name`.

---

## Layout & Sizing

### Layout Classes in `className`

WordPress automatically adds layout-related classes to the `className` attribute in the block's JSON comment. Without them, re-serialization produces a mismatch and triggers Attempt Recovery.

| Block + layout | Required `className` (and matching wrapper `class`) |
|---|---|
| `wp:group` with `layout.type:"default"` or no layout | `is-layout-flow wp-block-group-is-layout-flow` |
| `wp:group` with `layout.type:"constrained"` | `is-layout-constrained wp-block-group-is-layout-constrained` |
| `wp:group` with `layout.type:"flex"` | `is-layout-flex wp-block-group-is-layout-flex` |
| `wp:columns` | `is-layout-flex wp-block-columns-is-layout-flex` |
| `wp:column` | `is-layout-flow wp-block-column-is-layout-flow` |

**Examples:**

```html
<!-- wp:group {"metadata":{"name":"stats-card"},"className":"is-layout-flow wp-block-group-is-layout-flow","style":{...},"layout":{"type":"default"}} -->
<div class="wp-block-group is-layout-flow wp-block-group-is-layout-flow has-background" style="...">
</div>
<!-- /wp:group -->
```

```html
<!-- wp:columns {"metadata":{"name":"stats-columns"},"className":"is-layout-flex wp-block-columns-is-layout-flex","style":{...}} -->
<div class="wp-block-columns is-layout-flex wp-block-columns-is-layout-flex">
  <!-- wp:column {"metadata":{"name":"col-1"},"className":"is-layout-flow wp-block-column-is-layout-flow"} -->
  <div class="wp-block-column is-layout-flow wp-block-column-is-layout-flow">
  </div>
  <!-- /wp:column -->
</div>
<!-- /wp:columns -->
```

**Wrapper class order:** Layout classes always come before functional classes. WordPress serializes in this order: `wp-block-[type]` → `is-layout-*` → `wp-block-[type]-is-layout-*` → `has-border-color` → `has-background` → `has-text-color`.

```html
<!-- correct -->
<div class="wp-block-group is-layout-flex wp-block-group-is-layout-flex has-border-color has-background" style="...">

<!-- wrong — functional classes before layout classes -->
<div class="wp-block-group has-background is-layout-flex wp-block-group-is-layout-flex" style="...">
```

### Max-Width on Containers (Never Use `dimensions.maxWidth`)

Gutenberg's `style.dimensions` block support **only recognizes** `height`, `minHeight`, `minWidth`, `width`, and `aspectRatio`. There is **no `maxWidth`**. If you write `"style":{"dimensions":{"maxWidth":"1280px"}}`, WordPress strips it on save — the inline `max-width` in the wrapper `<div>` is regenerated from recognized attributes only, so the constraint silently disappears after the first save (or triggers "Attempt Recovery").

**Always use `layout.type: "constrained"` with `contentSize` instead.** This is the native Gutenberg mechanism for limiting content width:

```html
<!-- wp:group {"layout":{"type":"constrained","contentSize":"1280px"}} -->
<div class="wp-block-group is-layout-constrained wp-block-group-is-layout-constrained">
  <!-- children get max-width:1280px; margin:auto applied by WP PHP -->
</div>
<!-- /wp:group -->
```

- `contentSize` constrains **direct children**, not the block itself.
- The wrapper `<div>` must include `is-layout-constrained wp-block-group-is-layout-constrained` classes (for `wp:group`) — these are what WP's `save()` would generate.
- By default, constrained children are centered (`margin: auto`). To left-align them at the max width, add `"justifyContent":"left"`: `{"layout":{"type":"constrained","contentSize":"590px","justifyContent":"left"}}`.
- For the common "full-width background + constrained inner content" pattern, put the background and padding on the outer group with constrained layout — no inner wrapper group is needed.

### Handling Figma Paddings

Figma designs export large fixed padding values (e.g. 260px left/right, 80px top/bottom) that simulate a centered frame — these are **frame-level constraints, not real spacing**. Never copy them blindly.

- **Left/right padding:** Do not use large pixel values to manually center content. Use `"layout":{"type":"constrained"}` instead — Gutenberg centers content to the theme's content width automatically. No left/right padding needed.
- **Top/bottom padding:** Evaluate whether the breathing room is genuinely intentional. Large values from Figma (e.g. 80px) often exist only to give the frame visual margin in the design tool, not as design intent. Use only what the layout actually requires.
- **When padding is needed:** Only add padding that serves a real visual purpose — inner spacing between a background edge and its content, not to replicate what Gutenberg's layout engine already handles.

### Always Be Explicit About Partial Styles

When applying a style to only one side (or one axis), always explicitly cancel the other sides. Gutenberg can inherit theme defaults or the `has-border-color` class can activate CSS rules that affect all sides.

**Borders — only left side wanted:**

```html
<!-- wp:paragraph {"style":{"border":{"top":{"width":"0px","style":"none"},"right":{"width":"0px","style":"none"},"bottom":{"width":"0px","style":"none"},"left":{"color":"#ffffff","width":"1px","style":"solid"}}}} -->
<p style="border-top:none;border-right:none;border-bottom:none;border-left-color:#ffffff;border-left-style:solid;border-left-width:1px">…</p>
```

- Never use the `has-border-color` class for partial borders — it triggers a CSS rule that applies borders on all four sides.
- Explicitly declare `"width":"0px","style":"none"` on every side you do NOT want.
- Mirror every JSON `border.*` entry as a corresponding `border-*` inline style property.

The same principle applies to other shorthand properties (padding, margin, radius): if you only want top padding, also set `padding-right:0`, `padding-bottom:0`, `padding-left:0` — do not rely on defaults.

---

## Typography

### Text Color on Headings and Paragraphs

Never use CSS gradient-clip tricks (`-webkit-background-clip: text; -webkit-text-fill-color: transparent`) to color text. Gutenberg does not recognize this as a text color — the block's color panel shows "no color selected" and the text renders black in the editor.

Always declare text color through the block's native color attribute:

```html
<!-- wp:heading {"level":1,"style":{"color":{"text":"#ffffff"}}} -->
<h1 class="wp-block-heading has-text-color" style="color:#ffffff">Title</h1>
<!-- /wp:heading -->
```

The `"color":{"text":"..."}` JSON attribute and the `style="color:..."` inline style must both be present and in sync.

### Text Alignment on Headings and Paragraphs

When Figma applies `text-center` (or any alignment) to a text element — or to a **parent container** that the element inherits from — the following must be present on every affected block:

1. `"align":"center"` as a top-level attribute in the JSON comment
2. `has-text-align-center` class on the wrapper element — placed **before** `has-text-color` in the class list
3. **Do NOT** add `text-align:center` to the inline `style=""` — WordPress generates alignment via the class only, not as an inline style property

```html
<!-- wp:paragraph {"align":"center","style":{"typography":{...},"color":{"text":"#ffffff"}}} -->
<p class="has-text-align-center has-text-color" style="color:#ffffff;...">Text</p>
<!-- /wp:paragraph -->
```

**Class order matters:** WordPress serializes alignment classes before color/background classes. Always `has-text-align-*` then `has-text-color`.

**Figma inheritance trap:** The Figma MCP output often places `text-center` on a parent flex row, not on individual text nodes. When translating to Gutenberg — where each block is independent — you must explicitly set alignment on every text block, not assume it will be inherited.

Alignment mapping is in the [Tailwind → Gutenberg reference](#tailwind--gutenberg-map).

### Capturing All Typography Attributes from Figma MCP

The Figma MCP returns React/Tailwind code. Before writing any text block, scan the element AND its ancestors for every typography-related class. Map each to its Gutenberg equivalent in both the JSON attribute and the inline style — see the [reference table](#tailwind--gutenberg-map).

Never omit an attribute just because it is inherited in Figma — **Gutenberg blocks do not inherit styles from siblings or parents.**

---

## Block-Specific Rules

### Images: Use CSS Inline Styles, Never HTML Attributes

WordPress re-serializes `wp:image` blocks with `is-resized` using CSS `style=""` for dimensions, not HTML `width`/`height` attributes. Using HTML attributes causes block validation failure.

**Wrong (causes Attempt Recovery):**

```html
<!-- wp:image {"metadata":{"name":"icon-example"},"width":40,"height":40,"sizeSlug":"full","linkDestination":"none"} -->
<figure class="wp-block-image size-full is-resized"><img src="/images/icon.png" alt="" width="40" height="40" /></figure>
<!-- /wp:image -->
```

**Correct:**

```html
<!-- wp:image {"metadata":{"name":"icon-example"},"width":"40px","height":"40px","sizeSlug":"full","linkDestination":"none"} -->
<figure class="wp-block-image size-full is-resized"><img src="/images/icon.png" alt="" style="width:40px;height:40px"/></figure>
<!-- /wp:image -->
```

Key differences:

- JSON attributes use **string** values with units: `"width":"40px"` not `"width":40`.
- The `<img>` tag uses `style="width:40px;height:40px"` instead of `width="40" height="40"` HTML attributes.
- Both must be present and in sync.

### Buttons: No `border-style` in Inline Style

WordPress does **not** include `border-style:solid` in the button link's inline `style=""`. Do not add it — it will cause a mismatch on re-save.

```html
<!-- wp:button {"style":{"border":{"color":"#e2e8f0","width":"2px","radius":"4px"},...}} -->
<div class="wp-block-button"><a class="... has-border-color ..." href="#"
  style="border-color:#e2e8f0;border-width:2px;border-radius:4px;...">Label</a></div>
<!-- /wp:button -->
```

The `border-style` is applied via the theme stylesheet triggered by `has-border-color` — not serialized into the inline style.

### Separators: Include `has-text-color` When Colored

WordPress adds `has-text-color` to `wp:separator` blocks that have a background color, and mirrors the background as both `background-color` and `color` in the inline style:

```html
<!-- wp:separator {"metadata":{"name":"separator-stats"},"className":"is-style-wide","style":{"color":{"background":"rgba(255,255,255,0.15)"}}} -->
<hr class="wp-block-separator has-text-color has-alpha-channel-opacity has-background is-style-wide" style="background-color:rgba(255,255,255,0.15);color:rgba(255,255,255,0.15)"/>
<!-- /wp:separator -->
```

### Bordered Groups: `has-border-color` Class

When a `wp:group` has a `border.color` in its JSON attributes, WordPress automatically adds the `has-border-color` class to the wrapper element. Always include it:

```html
<!-- wp:group {"style":{"border":{"color":"rgba(75,31,89,0.4)","width":"2px","style":"solid"}}} -->
<div class="wp-block-group has-border-color has-background" style="border-color:rgba(75,31,89,0.4);border-style:solid;border-width:2px;...">
</div>
<!-- /wp:group -->
```

### Cover Blocks: Required Attributes and HTML Structure

A `wp:cover` block has different attribute requirements depending on whether you're previewing locally or pasting into WordPress.

**For local dev (`src/*.html`):** `id` and `sizeSlug` can be omitted — there is no media library and the layout shim doesn't need them.

**Before pasting into WordPress:** Always include the full attribute set so WP's validator can re-serialize the block cleanly:

- `"id"` — the attachment ID (use a placeholder integer if unknown; WordPress assigns the real one on image upload).
- `"sizeSlug"` — typically `"large"` or `"full"`.
- `"isUserOverlayColor"` — `true` or `false`.
- `"customOverlayColor"` — if a custom overlay is used.

**Canonical cover HTML structure:** Padding goes on the outer `<div class="wp-block-cover">`. The overlay/gradient `<span>` carries `has-background-dim-0 has-background-dim has-background-gradient` classes (for gradient overlays) and `style="background:..."`. The inner container has NO layout classes added — just `class="wp-block-cover__inner-container"`.

```html
<!-- wp:cover {"url":"...","id":1,"dimRatio":0,"isUserOverlayColor":false,"customGradient":"linear-gradient(...)","sizeSlug":"large","metadata":{"name":"hero"},"style":{"spacing":{"padding":{"top":"80px","bottom":"80px"}}},"layout":{"type":"constrained","contentSize":"1280px"}} -->
<div class="wp-block-cover" style="padding-top:80px;padding-bottom:80px;min-height:720px">
  <img class="wp-block-cover__image-background wp-image-1 size-large" alt="" src="/images/hero.png" data-object-fit="cover"/>
  <span aria-hidden="true" class="wp-block-cover__background has-background-dim-0 has-background-dim has-background-gradient" style="background:linear-gradient(...)"></span>
  <div class="wp-block-cover__inner-container"><!-- inner blocks --></div>
</div>
<!-- /wp:cover -->
```

---

## Figma Integration

The project has a Figma MCP server configured (see `.claude/settings.json`). Use it to read designs from Figma URLs and translate them into Gutenberg block markup — **not** React/Tailwind output.

When given a Figma URL:

1. Fetch the design with `get_design_context` or `get_screenshot`.
2. Map visual sections to the closest native Gutenberg block (group, columns, cover, image, heading, paragraph, buttons, separator, spacer, etc.).
3. Output valid serialized Gutenberg markup ready to paste into the Code Editor.

The Figma MCP output is React/Tailwind by default. When translating:

- Walk **every ancestor** of a text node to gather inherited typography and alignment — Gutenberg blocks don't inherit, so you must materialize every property on each block.
- Strip frame-level paddings used only for canvas centering (see [Handling Figma Paddings](#handling-figma-paddings)).
- Replace any external Figma asset URLs with local `/images/*` references — see [Critical Rules](#critical-rules).

---

## Avoiding "Attempt Recovery"

### Why Validation Fails

WordPress validates native blocks by re-serializing their JSON attributes and comparing to the saved HTML. **Any mismatch** triggers the "Attempt Recovery" prompt. The fix is always the same: make the JSON, the wrapper classes, and the inline style produce identical output to what WordPress's own `save()` would generate.

### Anti-Recovery Checklist

Before pasting markup into WordPress, check every block against this list:

- [ ] **`metadata.name`** is present on every block, as the first JSON key.
- [ ] **JSON attributes and inline `style=""` are in sync** — every property in one is mirrored in the other.
- [ ] **Inline style property order** matches WP's expected order for the block type ([see table](#inline-style-property-order)).
- [ ] **Layout `className`** is set in both the JSON and the wrapper `class` attribute for any `wp:group`, `wp:columns`, or `wp:column` ([see table](#layout-classes-in-classname)).
- [ ] **Wrapper class order** is correct: layout classes (`is-layout-*`, `wp-block-*-is-layout-*`) come before functional classes (`has-border-color`, `has-background`, `has-text-color`).
- [ ] **`wp:image`** with custom dimensions uses `style="width:Xpx;height:Xpx"` on `<img>`, not HTML `width`/`height` attributes. JSON uses string units (`"40px"`, not `40`).
- [ ] **`wp:button`** with a visible border does NOT have `border-style:solid` in the inline style — WP omits it, including it causes mismatch.
- [ ] **`wp:separator`** with a background color has `has-text-color` class and mirrors `background-color` to `color`.
- [ ] **`wp:group`** with `border.color` has the `has-border-color` class on the wrapper.
- [ ] **`wp:cover`** pasted into WP includes `id`, `sizeSlug`, `isUserOverlayColor` (and `customOverlayColor` if used).
- [ ] **`dimensions.maxWidth`** is NOT used anywhere — use `layout.type:"constrained"` with `contentSize` instead.
- [ ] **Partial borders/paddings** explicitly cancel the unwanted sides; `has-border-color` is not used for partial borders.
- [ ] **Text alignment** uses `"align":"..."` in JSON and `has-text-align-...` class (before `has-text-color`). Do NOT add `text-align:...` to inline style — WP does not serialize it.
- [ ] **Text color** uses `"color":{"text":"..."}` + `has-text-color` class + `color:...` inline. No `-webkit-background-clip` tricks.
- [ ] **`style.css`** is NOT used — `"style":{"css":"..."}` is not a recognized Gutenberg attribute; WP strips it on save.
- [ ] **Flex groups** have NO flex inline styles — `wp:group` with `layout.type:"flex"` must NOT have `display:flex`, `flex-wrap`, `align-items`, `justify-content`, or `gap` in the wrapper `style=""`. WP renders flex via CSS classes.
- [ ] **`wp:columns`** has NO `style="gap:..."` on its wrapper div — `blockGap` is rendered via a generated stylesheet, not inline.
- [ ] **`--wp--style--*` CSS vars** are NOT in inline `style=""` — generated by WP's PHP engine, never serialized.
- [ ] **`wp:buttons`** has NO `flex-wrap` or `gap` inline styles — same rule as flex groups.
- [ ] **Heading `id` attributes** are NOT present unless backed by `"anchor":"..."` in the JSON — orphaned auto-generated `id="h-..."` attributes cause mismatch.
- [ ] **`font-feature-settings` and `white-space:nowrap`** are NOT in inline styles — no JSON counterpart means WP won't regenerate them.
- [ ] **`aligncenter` image figures** have NO `style="margin:0 auto"` — centering is provided by the `aligncenter` class.

### Styles WordPress Does Not Serialize

The following look like valid CSS but are **not output by WordPress's `save()` function**. Including them in inline `style=""` causes a mismatch because WP won't regenerate them on re-save.

**`style.css` JSON key** — There is no `css` key inside a Gutenberg `style` object. `"style":{"css":"..."}` is silently stripped on save, leaving inline styles that have no JSON backing. Use native block attributes or accepted `style.*` sub-keys instead.

**Flex layout styles on `wp:group` or `wp:buttons`** — When a group or buttons block uses `layout.type:"flex"`, WordPress generates flex behavior via the `is-layout-flex` class and a site-wide stylesheet. It does NOT put `display:flex;flex-wrap:...;align-items:...;justify-content:...;gap:...` in the inline `style=""`. Omit all of those from the wrapper element.

**`gap:` on `wp:columns`** — The `spacing.blockGap` JSON attribute renders as a generated class or CSS custom property, never as an inline `style="gap:..."`. Omit the `style` attribute from the columns wrapper div entirely.

**CSS custom properties (`--wp--style--*`)** — Properties like `--wp--style--block-gap` and `--wp--style--layout--content-size` are injected by WP's PHP rendering engine. They must never appear in serialized markup inline styles.

**Auto-generated heading `id` attributes** — The WordPress editor auto-generates `id="h-slug"` on headings in the UI, but these are NOT serialized to post content. Only include an `id` on a heading element when a matching `"anchor":"slug"` exists in the block's JSON attributes.

**`font-feature-settings` and `white-space:nowrap`** — These CSS properties have no Gutenberg JSON attribute counterpart. Because WP reconstructs the inline style from JSON attributes only, including them creates a value WP won't regenerate. Omit them from both JSON and inline styles.

**`margin:0 auto` on `aligncenter` image figures** — The `aligncenter` class handles centering. WordPress does not add `margin:0 auto` to the `<figure>` wrapper.

**`border-style:solid` on `wp:button` link elements** — WordPress does not serialize `border-style` into the button link's inline style. The border style is applied via the theme stylesheet triggered by `has-border-color`. Including it in the inline style causes a mismatch on re-save.

**`text-align:*` in paragraph/heading inline styles** — The `align` block attribute generates a `has-text-align-*` class only. WordPress does not put `text-align:...` in the element's inline `style=""`. Inline style for text blocks contains only `color`, `margin`, `font-family`, `font-size`, `font-weight`, and `line-height`.

### Never Use `wp:html`

`<!-- wp:html -->` does not work well in this project. The correct approach is to always use native blocks (`wp:group`, `wp:paragraph`, `wp:heading`, etc.) with styles declared in both the JSON attributes and the inline `style=""` of the wrapper element, keeping them in sync.

### Local Preview vs. WordPress Rendering

The local dev server (`server.js`, run with `npm run dev`) serves files from `src/` and applies a **Gutenberg layout shim** that walks `<!-- wp:... -->` comments and replicates what WP's PHP does at render time. Currently it handles `layout.type` of `flex`, `grid`, and `constrained`.

If a block attribute relies on WP PHP processing (anything beyond inline `style=""` from recognized attributes), it will work in WordPress but appear broken in localhost unless the shim handles it. When you encounter that divergence, **extend the shim in `server.js`** rather than working around it in the markup — the markup must stay pasteable into WP's Code Editor without modification.

---

## Reference

### Tailwind → Gutenberg Map

For text blocks (`wp:paragraph`, `wp:heading`):

| Tailwind / Figma class | JSON attribute | Inline style |
|---|---|---|
| `text-[64px]` | `"fontSize":"64px"` | `font-size:64px` |
| `leading-[72px]` | `"lineHeight":"72px"` (or ratio) | `line-height:72px` |
| `font-bold` / `font-weight:700` | `"fontWeight":"700"` | `font-weight:700` |
| `font-['Inter_Tight',…]` | `"fontFamily":"'Inter Tight', sans-serif"` | `font-family:'Inter Tight', sans-serif` |
| `text-center` (self or parent) | `"align":"center"` | *(omit — WP uses `has-text-align-center` class, not inline style)* |
| `text-left` | `"align":"left"` | *(omit — WP uses `has-text-align-left` class)* |
| `text-right` | `"align":"right"` | *(omit — WP uses `has-text-align-right` class)* |
| `text-white` / `text-[#fff]` | `"color":{"text":"#ffffff"}` | `color:#ffffff` |
| `whitespace-nowrap` | *(no Gutenberg attr — omit)* | *(omit — no JSON counterpart, WP won't regenerate)* |
| `fontFeatureSettings:'case' 1` | *(no Gutenberg attr — omit)* | *(omit — no JSON counterpart, WP won't regenerate)* |

For each alignment value, also add the matching wrapper class: `has-text-align-center`, `has-text-align-left`, `has-text-align-right`.

### `metadata.name` Naming Conventions

Format: `[short-role]-[descriptive-slug]`.

| Block type / role | Prefix examples |
|---|---|
| `wp:heading` | `heading-hero`, `heading-section-title` |
| `wp:paragraph` | `paragraph-hero-desc`, `paragraph-stats-footer` |
| `wp:image` (feature icon) | `icon-ai-matching`, `icon-personalized` |
| `wp:image` (chevron/UI) | `chevron-ai-matching`, `chevron-personalized` |
| `wp:image` (content) | `image-anne-johnson` |
| `wp:column` | `column-feature-list`, `column-stat-searches` |
| `wp:columns` | `data-advantage-columns`, `stats-columns` |
| `wp:buttons` / `wp:button` | `hero-buttons`, `filled-button`, `outline-button` |
| `wp:group` (section) | `hero-text`, `ai-features`, `stats-card` |
| `wp:group` (divider/rule) | `divider-after-ai-matching` |
| `wp:group` (wrapper) | `quote-wrapper`, `matching-visual-wrapper` |
| `wp:separator` | `separator-stats` |
| `wp:spacer` | `spacer-allocators-stats` |
