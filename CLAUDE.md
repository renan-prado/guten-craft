# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

This project generates WordPress Gutenberg block markup (HTML) to be pasted into the **Code Editor** of the iConnections WordPress site. There is no PHP access — all output is pure Gutenberg HTML comment syntax used directly at:

```
https://iconnections.io/wp-admin/post-new.php?post_type=page
```

## What We Build

Static Gutenberg block structures using only native/core WordPress blocks. The output is serialized Gutenberg markup — a mix of HTML and structured `<!-- wp:block-name {...attrs} -->` comments that WordPress parses.

## Gutenberg Markup Rules

- Blocks are wrapped in HTML comments: `<!-- wp:block-name -->` … `<!-- /wp:block-name -->`
- Block attributes are JSON inside the opening comment: `<!-- wp:columns {"verticalAlignment":"top"} -->`
- Self-closing blocks (no inner content): `<!-- wp:spacer {"height":"40px"} /-->`
- All class names follow Gutenberg conventions: `wp-block-*`, `has-*-color`, `has-*-background-color`, etc.
- Inner blocks are nested inside the outer block's wrapper `<div>`

## Common Block Patterns

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

## Figma Integration

The project has a Figma MCP server configured (see `.claude/settings.json`). Use it to read designs from Figma URLs and translate them into Gutenberg block markup — not React/Tailwind output.

When given a Figma URL:
1. Fetch the design with `get_design_context` or `get_screenshot`
2. Map visual sections to the closest native Gutenberg block (group, columns, cover, image, heading, paragraph, buttons, separator, spacer, etc.)
3. Output valid serialized Gutenberg markup ready to paste into the Code Editor

## Output Format

Always deliver the final block markup as a single fenced code block so it can be copy-pasted directly into the WordPress Code Editor without modification.

## Critical Rules

- **Never output plain HTML files** with `<html>`, `<head>`, `<body>`, `<style>` tags. All output must be serialized Gutenberg block markup.
- **Never use plain CSS files or inline `<style>` blocks.** Styles are declared inside the block's JSON attributes (`"style":{...}`) and rendered as inline `style=""` on the wrapper element.
- **Never reference external asset URLs** (e.g. Figma MCP asset URLs). Visual effects like gradients, glows, and overlays must be reproduced with CSS values inside block attributes — `linear-gradient`, `radial-gradient`, `rgba()`, etc.
- **Every file created in this project is Gutenberg markup** ready to paste into the WordPress Code Editor, regardless of the file extension.

## Text Color on Headings and Paragraphs

Never use CSS gradient-clip tricks (`-webkit-background-clip: text; -webkit-text-fill-color: transparent`) to color text. Gutenberg does not recognize this as a text color — the block's color panel shows "no color selected" and the text renders black in the editor.

Always declare text color through the block's native color attribute:

```html
<!-- wp:heading {"level":1,"style":{"color":{"text":"#ffffff"}}} -->
<h1 class="wp-block-heading has-text-color" style="color:#ffffff">Title</h1>
<!-- /wp:heading -->
```

The `"color":{"text":"..."}` JSON attribute and the `style="color:..."` inline style must both be present and in sync.

## Text Alignment on Headings and Paragraphs

When Figma applies `text-center` (or any alignment) to a text element — or to a **parent container** that the element inherits from — all three of the following must be present and in sync on every affected block:

1. `"align":"center"` as a top-level attribute in the JSON comment
2. `has-text-align-center` class on the wrapper element
3. `text-align:center` inside the inline `style=""` attribute

```html
<!-- wp:paragraph {"align":"center","style":{"typography":{...},"color":{"text":"#ffffff"}}} -->
<p class="has-text-color has-text-align-center" style="text-align:center;color:#ffffff;...">Text</p>
<!-- /wp:paragraph -->
```

**Why all three:** `has-text-align-center` only works via WordPress's block styles CSS. The inline `style="text-align:center"` is required for the local preview shim and for visual parity with what WordPress renders. Without it, text appears left-aligned locally and may fail block validation.

**Figma inheritance trap:** The Figma MCP output often places `text-center` on a parent flex row, not on individual text nodes. When translating to Gutenberg — where each block is independent — you must explicitly set alignment on every text block, not assume it will be inherited.

**Tailwind → Gutenberg alignment map (from Figma MCP output):**
- `text-center` on element or ancestor → `"align":"center"`, `has-text-align-center`, `text-align:center`
- `text-left` → `"align":"left"`, `has-text-align-left`, `text-align:left`
- `text-right` → `"align":"right"`, `has-text-align-right`, `text-align:right`

## Capturing All Typography Attributes from Figma MCP

The Figma MCP returns React/Tailwind code. Before writing any text block, scan the element AND its ancestors for every typography-related class. Map each to its Gutenberg equivalent in both the JSON attribute and the inline style:

| Tailwind / Figma class | JSON attribute | Inline style |
|---|---|---|
| `text-[64px]` | `"fontSize":"64px"` | `font-size:64px` |
| `leading-[72px]` | `"lineHeight":"72px"` (or ratio) | `line-height:72px` |
| `font-bold` / `font-weight:700` | `"fontWeight":"700"` | `font-weight:700` |
| `font-['Inter_Tight',…]` | `"fontFamily":"'Inter Tight', sans-serif"` | `font-family:'Inter Tight', sans-serif` |
| `text-center` (self or parent) | `"align":"center"` | `text-align:center` |
| `text-white` / `text-[#fff]` | `"color":{"text":"#ffffff"}` | `color:#ffffff` |
| `whitespace-nowrap` | *(no Gutenberg attr — omit)* | `white-space:nowrap` |
| `fontFeatureSettings:'case' 1` | *(no Gutenberg attr — omit)* | `font-feature-settings:'case' 1` |

Never omit an attribute just because it is inherited in Figma — Gutenberg blocks do not inherit styles from siblings or parents.

## Block Identification: metadata.name on Every Block

**Every `wp:*` block — without exception — must have `metadata.name`.**

This includes `wp:paragraph`, `wp:heading`, `wp:image`, `wp:column`, `wp:columns`, `wp:buttons`, `wp:button`, `wp:separator`, `wp:spacer`, and all `wp:group` blocks. The name appears in the WordPress editor's List View, making it possible to locate and update any block by name — essential when updating markup via the Code Editor.

`metadata` is always the **first key** in the block's JSON attribute object:

```html
<!-- wp:paragraph {"metadata":{"name":"paragraph-hero-desc"},"style":{...}} -->
<p class="has-text-color" style="...">Text</p>
<!-- /wp:paragraph -->

<!-- wp:spacer {"metadata":{"name":"spacer-section-gap"},"height":"80px"} /-->
```

**Naming convention:** `[short-role]-[descriptive-slug]`

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

Never use random hashes. Always derive the name from the block's type and content/purpose so a reader can identify the block in the List View without opening it.

## Stable Block Identity with `anchor`

`metadata.name` is a display label — it helps humans navigate in the editor but does not persist as a technical ID across Code Editor pastes (WordPress assigns a new internal `clientId` on every paste).

**`clientId` is runtime-only and is never serialized to post content.** Do not try to embed it in markup.

The `anchor` attribute is the only serialized identifier. It renders as an HTML `id` on the wrapper element and survives round-trips through the Code Editor:

```html
<!-- wp:group {"metadata":{"name":"stats-card"},"anchor":"stats-card",...} -->
<div id="stats-card" class="wp-block-group ...">...</div>
<!-- /wp:group -->
```

Use `anchor` only when a block needs a stable HTML id — for in-page navigation (`#stats-card`), CSS targeting, or JavaScript hooks. It is not required on every block. When used, keep the value a short kebab-case slug that matches the `metadata.name`.

## Handling Figma Paddings

Figma designs export large fixed padding values (e.g. 260px left/right, 80px top/bottom) that simulate a centered frame — these are **frame-level constraints, not real spacing**. Never copy them blindly.

**Left/right padding**: Do not use large pixel values to manually center content. Use `"layout":{"type":"constrained"}` instead — Gutenberg centers content to the theme's content width automatically. No left/right padding needed.

**Top/bottom padding**: Evaluate whether the breathing room is genuinely intentional. Large values from Figma (e.g. 80px) often exist only to give the frame visual margin in the design tool, not as design intent. Use only what the layout actually requires.

**When padding is needed**: Only add padding that serves a real visual purpose — inner spacing between a background edge and its content, not to replicate what Gutenberg's layout engine already handles.

## Always Be Explicit About Partial Styles

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

## Max-Width on Containers (Never Use `dimensions.maxWidth`)

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

## "Attempt Recovery" in the WordPress Editor

WordPress validates native blocks by re-serializing their JSON attributes and comparing to the saved HTML. Any mismatch triggers the "Attempt Recovery" prompt.

- **Never use `<!-- wp:html -->`** — it does not work well in this project.
- The correct approach is to always use native blocks (`wp:group`, `wp:paragraph`, `wp:heading`, etc.) with styles declared in both the JSON attributes and the inline `style=""` of the wrapper element, keeping them in sync.

## Local Preview vs. WordPress Rendering

The local dev server (`server.js`, run with `npm run dev`) serves files from `src/` and applies a **Gutenberg layout shim** that walks `<!-- wp:... -->` comments and replicates what WP's PHP does at render time. Currently it handles `layout.type` of `flex`, `grid`, and `constrained`.

If a block attribute relies on WP PHP processing (anything beyond inline `style=""` from recognized attributes), it will work in WordPress but appear broken in localhost unless the shim handles it. When you encounter that divergence, extend the shim in `server.js` rather than working around it in the markup — the markup must stay pasteable into WP's Code Editor without modification.

## Image Sizing: Always Use CSS Inline Styles, Never HTML Attributes

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
- JSON attributes use **string** values with units: `"width":"40px"` not `"width":40`
- The `<img>` tag uses `style="width:40px;height:40px"` instead of `width="40" height="40"` HTML attributes
- Both must be present and in sync

## Layout Classes in Block JSON `className`

WordPress automatically adds layout-related classes to the `className` attribute in the block's JSON comment. Without them, re-serialization produces a mismatch and triggers Attempt Recovery.

**Rules:**
- `wp:group` with `layout.type:"default"` or no layout → add `"className":"is-layout-flow wp-block-group-is-layout-flow"` in JSON and on the wrapper `<div>`
- `wp:group` with `layout.type:"constrained"` → add `"className":"is-layout-constrained wp-block-group-is-layout-constrained"` in JSON and on the wrapper `<div>`
- `wp:group` with `layout.type:"flex"` → add `"className":"is-layout-flex wp-block-group-is-layout-flex"` in JSON and on the wrapper `<div>`
- `wp:columns` → add `"className":"is-layout-flex wp-block-columns-is-layout-flex"` in JSON and on the wrapper `<div>`
- `wp:column` → add `"className":"is-layout-flow wp-block-column-is-layout-flow"` in JSON and on the wrapper `<div>`

**Example:**
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

## `has-border-color` Class on Bordered Groups

When a `wp:group` has a `border.color` in its JSON attributes, WordPress automatically adds the `has-border-color` class to the wrapper element. Always include it:

```html
<!-- wp:group {"style":{"border":{"color":"rgba(75,31,89,0.4)","width":"2px","style":"solid"}}} -->
<div class="wp-block-group has-border-color has-background" style="border-color:rgba(75,31,89,0.4);border-style:solid;border-width:2px;...">
</div>
<!-- /wp:group -->
```

## Separator Blocks: Include `has-text-color` When Colored

WordPress adds `has-text-color` to `wp:separator` blocks that have a background color, and mirrors the background as both `background-color` and `color` in the inline style:

```html
<!-- wp:separator {"metadata":{"name":"separator-stats"},"className":"is-style-wide","style":{"color":{"background":"rgba(255,255,255,0.15)"}}} -->
<hr class="wp-block-separator has-text-color has-alpha-channel-opacity has-background is-style-wide" style="background-color:rgba(255,255,255,0.15);color:rgba(255,255,255,0.15)"/>
<!-- /wp:separator -->
```

## Inline Style Property Order

WordPress re-serializes inline styles in a specific order during block validation. Follow this order to avoid mismatches:

For **layout containers** (`wp:group`, `wp:column`):
`border-* → background-color / background → padding-* → margin-* → min-height → other`

For **text blocks** (`wp:paragraph`, `wp:heading`):
`color → margin-* → font-family → font-size → font-weight → line-height`

For **buttons** (`wp:button > a`):
`border-color → border-width → border-radius → color → background / background-color → padding-* → font-family → font-size → line-height → text-decoration`

When in doubt, follow the order WordPress outputs when you manually create the same block in the visual editor.

## Cover Block Attributes

When using `wp:cover` with an uploaded image, WordPress serializes several additional attributes beyond what may seem necessary. Always include:

- `"id"` — the attachment ID (use a placeholder integer if unknown)
- `"sizeSlug"` — typically `"large"` or `"full"`
- `"isUserOverlayColor"` — `true` or `false`
- `"customOverlayColor"` — if a custom overlay is used

```html
<!-- wp:cover {"metadata":{"name":"hero-text"},"url":"...","id":8,"dimRatio":0,"customOverlayColor":"#240f2e","isUserOverlayColor":false,"minHeight":720,"minHeightUnit":"px","sizeSlug":"large","layout":{...}} -->
```

Note: In the local dev environment, `id` and `sizeSlug` can be omitted since there is no media library. But before pasting into WordPress, these must be added (WordPress assigns them on image upload).

## Button `border-style` Must Be Explicit

WordPress requires `border-style:solid` in both the JSON and inline style for buttons with visible borders. Without it, the border may be stripped on save:

```html
<!-- wp:button {"style":{"border":{"color":"#e2e8f0","width":"2px","radius":"4px"},...}} -->
<div class="wp-block-button"><a class="... has-border-color ..." href="#"
  style="border-color:#e2e8f0;border-width:2px;border-style:solid;border-radius:4px;...">Label</a></div>
<!-- /wp:button -->
```

Always include `border-style:solid` in the inline style even if omitted from the JSON `border` object — WordPress infers it from the presence of `border.width` and `border.color`, but the rendered HTML must have it.
