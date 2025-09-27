# SVG Asset Rules

This directory stores optimized header artwork used across the documentation wiki.

## Structure

- `physics-mcp-hero.svg` — canonical animated header for the home/docs landing page.
- `*-hero.svg` — animated variants for feature clusters (CAS, distributed collaboration, experiment orchestrator, etc.).
- `*-hero-static.svg` — single-frame fallback used when animation is disabled or when crawlers render the page.
- `src/` *(optional)* — drop unoptimized originals here; they are ignored by CI.

## Naming

```
<topic>-hero.svg
<topic>-hero-static.svg
```

Use lowercase, hyphen-separated tokens. For theme-specific variants append `-dark` or `-light` before the extension.

## Optimization

- Run `npm run svg:optimize` before committing. This calls SVGO with `svgo.config.json` to preserve IDs and animation attributes.
- CI rejects SVG files that increase in size compared to the optimized output.
- Keep SMIL usage to a minimum; prefer CSS keyframes and toggle playback with the `.is-playing` class.

## Accessibility

- Always include `<title>` and `<desc>` elements.
- Provide descriptive `aria-label` text if an SVG is used inline.
- Implement `@media (prefers-reduced-motion: reduce)` guards inside the SVG when animation is present.

## Static Fallbacks

Provide at least one fallback frame but prefer SVG over raster PNG unless gradients or filters require rasterization. Reference the fallback in front matter via `header_svg.static`.
