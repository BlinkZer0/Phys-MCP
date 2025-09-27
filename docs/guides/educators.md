---
title: Educator Quick Start
kind: howto
header_svg:
  src: "/assets/svg/distributed-collaboration-hero.svg"
  static: "/assets/svg/distributed-collaboration-hero-static.svg"
  title: "Physics MCP for Educators"
  animate: true
  theme_variant: "auto"
  reduced_motion: "auto"
---

[![Educator Quick Start](https://img.shields.io/badge/educators-quick_start-6366f1?style=for-the-badge)](#quick-start)

# Educator Quick Start

Physics MCP is designed to be re-mixed. This guide shows teachers how to set up the graphing calculator, pick a supporting AI client or IDE assistant, and start running lessons in minutes. Everything here is open-source—fork it, rename it, and shape it to fit your class culture.

## Why Physics MCP in the Classroom?

- **Local-first**: Calculations, plots, and experiments stay on your machine or lab network.
- **Extendable**: Add new tools or tweak existing presets without waiting for vendor updates.
- **AI-friendly**: Pair it with your preferred client (desktop, web, or IDE) to narrate lessons and code live.

## Quick Start

1. **Install dependencies**
   ```bash
   pnpm install
   pnpm build
   ```
   Optionally add the Python worker packages:
   ```bash
   pip install -r packages/python-worker/requirements.txt
   ```
2. **Bring the Graphing Calculator online**
   ```bash
   pnpm --filter tools-graphing-calculator install
   pnpm --filter tools-graphing-calculator build
   ```
3. **Start the MCP server + workers**
   ```bash
   pnpm dev
   ```
4. **Connect your favourite AI interface** (see below) and run the `graphing_calculator` tool for instant plots.

## Choosing an AI Client or IDE Assistant

| Scenario | Recommendation | Notes |
| -------- | -------------- | ----- |
| Chromebook carts / shared lab | [LM Studio](https://lmstudio.ai/) or [Open WebUI](https://github.com/open-webui/open-webui) | Run locally, supports OpenAI-compatible endpoints. |
| Faculty laptop with VS Code | [Cursor](https://cursor.sh/) or VS Code Copilot Chat | Add the MCP server as an extra provider for reproducible plot snippets. |
| Offline demo | [MCP CLI reference client](https://modelcontextprotocol.io/) | Keep everything air-gapped while still using the toolset. |
| LMS integration | Expose MCP via a small web bridge (see `packages/tools-orchestrator`). | Embed generated plots or equations into assignments. |

> Tip: whichever client you pick, point it at the same MCP config so your students and co-instructors get identical tool menus.

## Example Classroom Use Cases

### Calculus Warm-up (10 minutes)
- Plot `sin(x)` vs. `cos(x)` with tangent overlays.
- Use an IDE AI to narrate slope changes or generate guiding questions.

### Lab Prep: Projectile Motion
- Ask the AI assistant to call `graphing_calculator` twice: once for analytical trajectory (`y(x)`) and once for measured data points.
- Export both to SVG and paste into the lab handout.

### Student-led Inquiry
- Let students fork the repo, tweak colour schemes, or add a new preset (e.g., complex-plane visualiser) as extra credit.

## Encourage Remixing

Physics MCP is Apache-licensed. Remind learners they can:

- Clone the repo and adjust `packages/tools-graphing-calculator` to add themed templates.
- Register custom tools in `config/mcp_config.json` so their bots or IDEs surface new commands instantly.
- Share pull requests or GitHub Discussions back with the community.

## Next Steps

- [Graphing Calculator Tooling](../Tools/GraphingCalculator.md)
- [Authoring Guide](../contrib/authoring.md)
- [Mermaid & KaTeX Demo](../examples/mermaid-and-math.md)

Reach out on the project discussion board if you ship your own classroom presets—we love featuring educator stories.
