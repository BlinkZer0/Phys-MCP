---
title: FAQ
kind: reference
header_svg:
  src: "/assets/svg/physics-mcp-hero.svg"
  static: "/assets/svg/physics-mcp-hero-static.svg"
  title: "Frequently Asked Questions"
  animate: true
  theme_variant: "auto"
  reduced_motion: "auto"
---

# FAQ

<p align="center">
  <img src="assets/header.svg" width="960" alt="Physics MCP banner" />
</p>

[Home](../README.md) · [Architecture](Architecture.md) · [Configuration](Configuration.md) · Tools: [CAS](Tools/CAS.md) · [Plot](Tools/Plot.md) · [NLI](Tools/NLI.md) · FAQ

- Why isn’t the header animating?
  - Some viewers (and Git hosting) sanitize animations. Open the file locally or view in an environment that supports inline SVG animation.

- Do I need internet for NLI?
  - No, if you configure a local LM endpoint (e.g., LM Studio). Set `LM_BASE_URL` to your local server.
  - If you don’t configure any LM, NLI still works via a rule-based fallback (no internet required).

- Is LM Studio required?
  - No. It’s optional. Core calculations (CAS, Plot, Tensor, Quantum, StatMech) run in Python/TS workers.
  - LM Studio—or any OpenAI-compatible local server—can speed up and improve NLI parsing by running locally (often on GPU), reducing latency and retries.

- Where are the tool schemas?
  - CAS: `packages/tools-cas/src/schema.ts`
  - Plot: `packages/tools-plot/src/schema.ts`
  - NLI: `packages/tools-nli/src/schema.ts`

- Is there a quick test?
  - Yes: `pnpm run test:install` (runs a few end-to-end calls).

- Can I add more tools?
  - Absolutely. Follow the pattern in the tool packages and register them in the server.

Sardonic aside: our commits observe gauge symmetry—violations are purely a choice of documentation gauge.


