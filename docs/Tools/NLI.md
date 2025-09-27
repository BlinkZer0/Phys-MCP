# NLI Tool

<p align="center">
  <img src="../assets/header.svg" width="960" alt="Physics MCP banner" />
</p>

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
- Primary: calls local LM API (`/chat/completions`) with a physics-aware system prompt.
- Fallback: rule-based parser using regex patterns for common tasks.

Configuration
- Requires LM Studio or a compatible local endpoint.
- Environment: `LM_BASE_URL`, optional `LM_API_KEY`, `DEFAULT_MODEL`.

Schemas & Prompt
- Types and prompt: `packages/tools-nli/src/schema.ts`
- Logic and LM usage: `packages/tools-nli/src/index.ts`

A gentle quip: we keep the parsing Hamiltonian simple—no unnecessary terms, just enough to reach the ground truth.
