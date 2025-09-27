---
title: Graphing Calculator Tooling
kind: reference
header_svg:
  src: "/assets/svg/experiment-orchestrator-hero.svg"
  static: "/assets/svg/experiment-orchestrator-hero-static.svg"
  title: "Graphing Calculator Tool"
  animate: true
  theme_variant: "auto"
  reduced_motion: "auto"
---

# Graphing Calculator Tooling

The Graphing Calculator tool gives educators and researchers an interactive plotting surface directly inside Physics MCP. It wraps the `graphing_calculator` MCP tool package and exposes quick multi-plot visualisations that run locally while remaining scriptable through the MCP protocol.

## Capabilities

| Feature | Description |
| ------- | ----------- |
| Multi-series plotting | Render multiple functions on the same canvas with shared domains. |
| Implicit curves | Visualise level-sets using sampled heatmaps or contour projections. |
| Parametric sweeps | Animate parameters or generate tabular outputs for classroom demonstrations. |
| Export targets | Save SVG/PNG plots, share JSON specifications, or stream sampled data into downstream tools. |

## Invocation Schema Overview

```json
{
  "tool": "graphing_calculator",
  "params": {
    "series": [
      { "expression": "sin(x)", "color": "#22d3ee" },
      { "expression": "cos(x)", "color": "#fbbf24" }
    ],
    "domain": { "start": -6.28, "end": 6.28, "step": 0.05 },
    "grid": true,
    "export": { "format": "svg" }
  }
}
```

### Key Parameters

- `series` *(required)* — ordered list of functions, parametric tuples, or implicit definitions. Each entry supports titles, colour hints, dashed styles, and tooltips.
- `domain` — numeric range for the independent variable; defaults to `[-10, 10]` if omitted.
- `grid` / `axes` — toggles for classroom-friendly overlays.
- `export` — configure export target (`svg`, `png`, `json`, or `dataframe`).
- `animations` — optional block for parameter sweeps with FPS, duration, and output format.

## Example Workflows

### 1. Quick Comparison Plot

```json
{
  "tool": "graphing_calculator",
  "params": {
    "series": [
      { "expression": "exp(-x**2)", "label": "Gaussian" },
      { "expression": "1/(1+x**2)", "label": "Lorentzian" }
    ],
    "domain": { "start": -4, "end": 4, "step": 0.01 },
    "axes": { "x": "x", "y": "f(x)" },
    "legend": true
  }
}
```

### 2. Parametric Animation

```json
{
  "tool": "graphing_calculator",
  "params": {
    "series": [
      {
        "parametric": {
          "x": "cos(t)",
          "y": "sin(2*t)"
        },
        "label": "Lissajous"
      }
    ],
    "parameter": { "symbol": "t", "start": 0, "end": 6.283, "step": 0.01 },
    "animations": {
      "sweep": { "variable": "t", "fps": 24, "format": "mp4" }
    }
  }
}
```

## Installation

```bash
# From repo root, ensure workspace dependencies are installed
pnpm install

# Build and register the graphing calculator package
pnpm --filter tools-graphing-calculator install
pnpm --filter tools-graphing-calculator build
```

The package exports its MCP manifest automatically once built. If you prefer Python worker integration, drop the equivalent spec into `packages/python-worker/graphing_calculator.py` and reload the worker.

## Extending the Tool

- Adjust axis styling defaults in `packages/tools-graphing-calculator/src/config.ts` (or equivalent) to match classroom branding.
- Add new plot types by extending the renderer registry; the tool accepts custom series handlers via simple hooks.
- Provide curated presets for courses by shipping JSON snippets alongside the docs or bundling them into the package.

Because Physics MCP is open-source, we encourage you to fork the tool, rename presets, and tailor the visual style to resonate with your learners.

## Related Material

- [Plot Tool Reference](Plot.md)
- [Mermaid & KaTeX Demo](../examples/mermaid-and-math.md)
- [Authoring Guide](../contrib/authoring.md)
