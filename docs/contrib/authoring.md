---
title: Authoring Guide
kind: reference
header_svg:
  src: "/assets/svg/physics-mcp-hero.svg"
  static: "/assets/svg/physics-mcp-hero-static.svg"
  title: "Physics MCP Documentation Authoring"
  animate: true
  theme_variant: "auto"
  reduced_motion: "auto"
---

# Authoring Guide

This page consolidates the conventions, guardrails, and automation that keep the Physics MCP wiki accessible, lightweight, and consistent with the Diátaxis model.

## 1. Diátaxis Cheatsheet

| kind | Use it when… | Canonical sections |
| ---- | ------------- | ------------------ |
| `tutorial` | Readers need a guided path from zero to success. | Overview → Prerequisites → Step-by-step → Outcome |
| `howto` | There is a narrowly-scoped task or question. | Brief goal → Task steps → Troubleshooting |
| `reference` | Canonical API/config tables or factual lookups. | Purpose → Tables/lists → Linked resources |
| `explanation` | Concepts, design decisions, rationale, or trade-offs. | Context → Concept deep dive → Implications |

Choose the `kind` in front matter; do not remix multiple kinds in the same page. When content grows beyond one kind, split it.

## 2. Front Matter Contract

```yaml
---
title: Phase 7 Distributed Collaboration
kind: tutorial
header_svg:
  src: "/assets/svg/distributed-collaboration-hero.svg"
  static: "/assets/svg/distributed-collaboration-hero-static.svg"
  title: "Distributed Collaboration"
  animate: true           # default true
  theme_variant: "auto"   # auto|light|dark
  reduced_motion: "auto"  # auto|force_off|force_on
---
```

- `theme_variant` allows dark/light alternates (e.g., `/assets/svg/foo-dark.svg`).
- `static` should point to a non-animated fallback (`-static.svg` or PNG) for crawlers and reduced-motion overrides.
- Set `animate: false` if a header must never play (e.g., certain compliance pages).

## 3. Animated Header Rules

1. **Prefer CSS transforms** inside the SVG. Use SMIL only when CSS cannot express the motion.
2. **Motion safety:** the shared include injects the `prefers-reduced-motion` guard. Avoid inline scripts that bypass it.
3. **Visibility playback:** animations start when 20% of the hero is in view and pause when it leaves the viewport.
4. **Subtlety first:** keep frame rates low and rely on parallax/pulses instead of busy keyframes.
5. **Static backup:** export a still frame (`-static.svg`) and reference it via `header_svg.static`.

## 4. SVG Optimization Workflow

1. Place source assets in `assets/svg/src/` (optional) and keep optimized variants in `assets/svg/`.
2. Run the optimizer before committing:

   ```bash
   npm run svg:optimize
   ```

   This executes 
ode scripts/svg-optimize.ts` which wraps SVGO using `svgo.config.json` (IDs/classes used by CSS/JS are preserved).
3. CI fails if an SVG becomes larger after optimization or if SVGO reports errors.

Use the optional [SVGOMG](https://jakearchibald.github.io/svgomg/) with the config from `svgo.config.json` when experimenting manually.

## 5. Mermaid & KaTeX

- Enable Mermaid so authors can embed diagrams with fences:

  <pre><code>```mermaid
  graph TD;
    AgentA-->AgentB;
    AgentB-->AgentC;
  ```
  </code></pre>

- Enable KaTeX for both inline math `$E=mc^2$` and block math:

  ```latex
  $$
  \mathcal{L}(\theta) = -\sum_i y_i \log f_\theta(x_i)
  $$
  ```

Keep the KaTeX bundle tree-shaken; load it only on pages that contain math (or at build time if your stack supports SSR rendering).

## 6. Author Templates

The `docs/templates/` directory hosts skeletons for each Diátaxis kind. Copy one and start editing instead of cloning existing pages. Each template already includes front matter, stub sections, and TODO comments.

## 7. Quality Gates Checklist

- [ ] 
pm run lint && npm run test` (unchanged baseline).
- [ ] 
pm run svg:optimize` completes with "Optimized" status for changed SVGs.
- [ ] Internal link checker passes (
pm run docs:links` once wired into CI).
- [ ] Mermaid smoke render (
pm run docs:mermaid:smoke`)—exports a tiny PNG from the demo diagram.
- [ ] Spell/term list (`docs/contrib/lexicon.txt`) optional but recommended for physics terminology.

## 8. Stack-specific Notes

### Docusaurus

- Add the `header-svg.html` include to `src/theme/DocItem/index.tsx` or create a `<HeaderSvg hero={frontMatter.header_svg} />` component using the same logic.
- Use MDX front matter to surface `kind`. Add a `DocItemMetadata` badge to render `kind` and provide filters in the sidebar (`sidebarItemsGenerator`).

### MkDocs (Material)

- Enable [custom macros](https://mkdocs-macros-plugin.readthedocs.io/) or [jinja2 includes] to drop `header-svg.html` at the top of `main.html`.
- Extend `mkdocs.yml` navigation metadata with `kind` for filtering and to power search boosting.

### GitBook / Generic Static Sites

- Wherever front matter is parsed, map the properties verbatim; keep the include snippet as the canonical implementation.
- If includes are unsupported, inject the markup via a lightweight script that runs before rendering the page content.

## 9. Adding a New Header (Quickstart)

1. Sketch static composition in Figma or Excalidraw.
2. Export to SVG, remove unnecessary metadata, and annotate with CSS classes.
3. Add animation using CSS keyframes, gating with `.is-playing` to respect viewport playback.
4. Add `@media (prefers-reduced-motion: reduce)` inside the SVG to short-circuit animation.
5. Create a static variant (`-static.svg`).
6. Run 
pm run svg:optimize` and verify size diff.
7. Reference the header via front matter.

## 10. Troubleshooting

| Symptom | Fix |
| ------- | --- |
| Animation never starts | Ensure the `header-svg.html` script runs and IntersectionObserver threshold is reachable. |
| SVG loads but is blank | Check for CSS that depends on `.is-playing`; ensure the script adds it after load. |
| Motion still plays for reduced-motion users | Double-check both front matter (`reduced_motion: auto`) and internal SVG CSS guard. |
| SVGO strips needed IDs/classes | Update `svgo.config.json` `plugins` to `preserve` matching patterns. |

Need help? Ping `#docs` in the workspace or open a draft PR for async review.

