---
title: Architecture
kind: explanation
header_svg:
  src: "/assets/svg/distributed-collaboration-hero.svg"
  static: "/assets/svg/distributed-collaboration-hero-static.svg"
  title: "Architecture Overview"
  animate: true
  theme_variant: "auto"
  reduced_motion: "auto"
---

# Architecture

<p align="center">
  <img src="assets/header.svg" width="960" alt="Physics MCP banner" />
</p>

[Home](../README.md) · [Architecture](Architecture.md) · [Configuration](Configuration.md) · Tools: [CAS](Tools/CAS.md) · [Plot](Tools/Plot.md) · [NLI](Tools/NLI.md)

- Server: TypeScript MCP server orchestrates CAS, Plot, and NLI tools.
- Transport: JSON-RPC over stdio compatible with MCP clients.
- Python worker: Performs CAS and plotting, returns results to server.
- NLI: Optionally uses a local LM API (e.g., LM Studio) when configured; otherwise falls back to a rule-based parser.

Flow
- MCP client sends `tools/list` and `tools/call`.
- Server registers tool metadata from tool packages and routes calls by prefix (`cas.*`, `plot.*`, 
li.*`).
- CAS/Plot calls are proxied to the Python worker via a lightweight JSON-RPC protocol over stdin/stdout.
- NLI calls go to a local LM REST API (`/chat/completions`) when configured; otherwise a rule-based parser is used.

Key Files
- Server entry: `packages/server/src/index.ts`
- Python worker: `packages/python-worker/worker.py`
- CAS tools: `packages/tools-cas/src/index.ts`, `packages/tools-cas/src/schema.ts`
- Plot tools: `packages/tools-plot/src/index.ts`, `packages/tools-plot/src/schema.ts`
- NLI tools: `packages/tools-nli/src/index.ts`, `packages/tools-nli/src/schema.ts`
- Local MCP types (fallback): `packages/mcp-types/`

Notes
- The server tries to import the official MCP SDK; if missing, it uses a local mock implementation.
- The Python worker uses SymPy, NumPy, SciPy, Pint, and Matplotlib.
- Images are returned as base64-encoded PNG; CSV data is included where relevant.

Humorous invariant: this diagram conserves coherence better than most wavefunctions.


