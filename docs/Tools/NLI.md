---
title: NLI Tool
kind: reference
header_svg:
  src: "/assets/svg/tool-nli-hero.svg"
  static: "/assets/svg/tool-nli-hero-static.svg"
  title: "NLI Tool"
  animate: true
  theme_variant: "auto"
  reduced_motion: "auto"
---

{% assign header_svg = page.header_svg %}
{% include header-svg.html %}

# NLI Tool

[Home](../../README.md) · [Architecture](../Architecture.md) · [Configuration](../Configuration.md) · Tools: [CAS](CAS.md) · [Plot](Plot.md) · [NLI](NLI.md)

Natural Language Interface parses free-text physics requests into structured tool calls.

Tool
- `nli_parse`
  - Params: `text` (string)
  - Returns: `{ intent, args, confidence?, explanation? }`
  - Example request:
    ```json
    {"jsonrpc":"2.0","id":"1","method":"nli_parse","params":{
      "text":"Plot y = x^2 from -5 to 5"
    }}
    ```

Intents
- CAS: `cas_evaluate`, `cas_diff`, `cas_integrate`, `cas_solve_equation`, `cas_solve_ode`
- Plot: `plot_function_2d`, `plot_parametric_2d`, `plot_field_2d`
- Unknown: `unknown` with an explanation when parsing fails

Operation
- Primary (optional): Calls a local LM API (`/chat/completions`) with a physics-aware system prompt when configured.
- Fallback (default when no LM configured): Uses a built-in rule-based parser with curated physics patterns for common tasks. This requires no external services and works entirely offline.

Configuration
- Optional: LM Studio (or any OpenAI-compatible local endpoint). Not required for core calculations.
- Environment (optional):
  - `LM_BASE_URL`: Base URL to your OpenAI-compatible endpoint (e.g., `http://localhost:1234/v1`). If not set, the NLI automatically uses the rule-based fallback.
  - `DEFAULT_MODEL`: Model name to use when `LM_BASE_URL` is set.
  - `LM_API_KEY`: API key if your local server requires it.
  - `NLI_DISABLE_LM`: Set to `true` to force the rule-based parser even if `LM_BASE_URL` is configured.
  - `NLI_LM_TIMEOUT_MS`: Milliseconds to wait for the LM before falling back (default: 2500ms).

Why a local LM helps (optional)
- Lower latency and fewer retries on complex requests → faster end-to-end results.
- Uses your GPU (when available) to accelerate parsing.
- Privacy and cost benefits from keeping tokens local.

Quick setup (LM Studio)
1. Install and run LM Studio.
2. Set `LM_BASE_URL` to the OpenAI-compatible endpoint (e.g., `http://localhost:1234/v1`).
3. Set `DEFAULT_MODEL` to your chosen local model.

Schemas & Prompt
- Types and prompt: `packages/tools-nli/src/schema.ts`
- Logic and LM usage: `packages/tools-nli/src/index.ts`

Notes
- If `LM_BASE_URL` is not provided (as in the default Windsurf MCP config), the NLI will gracefully and immediately use the rule-based parser. This keeps the system independent of LM Studio by default while still allowing you to opt-in to LM-powered parsing later.

A gentle quip: we keep the parsing Hamiltonian simple-no unnecessary terms, just enough to reach the ground truth.
