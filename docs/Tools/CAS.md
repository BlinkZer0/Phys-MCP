---
title: CAS Tools
kind: reference
header_svg:
  src: "/assets/svg/tool-cas-hero.svg"
  static: "/assets/svg/tool-cas-hero-static.svg"
  title: "CAS Tools"
  animate: true
  theme_variant: "auto"
  reduced_motion: "auto"
---

{% assign header_svg = page.header_svg %}
{% include header-svg.html %}

# CAS Tools

[Home](../../README.md) · [Architecture](../Architecture.md) · [Configuration](../Configuration.md) · Tools: [CAS](CAS.md) · [Plot](Plot.md) · [NLI](NLI.md)

CAS operations are handled by the Python worker via SymPy/Pint and exposed as MCP tools.

Common Notes
- Expressions use SymPy-compatible syntax (`^` becomes `**`).
- Units accepted via `{ value, unit }` using Pint (SI units recommended).
- Most results include both `str` and `latex` forms; definite operations may include numeric `evalf`.

Tools
- `cas_evaluate`
  - Params: `expr` (string), `vars` (object of number or `{value, unit}`)
  - Returns: `{ latex, str, evalf?, original }`
  - Example request:
    ```json
    {"jsonrpc":"2.0","id":"1","method":"cas_evaluate","params":{
      "expr":"(1/2)*m*v**2",
      "vars": {"m": {"value": 2, "unit": "kg"}, "v": {"value": 3, "unit": "m/s"}}
    }}
    ```

- `cas_diff`
  - Params: `expr` (string), `symbol` (string), `order?` (integer >=1)
  - Returns: `{ latex, str, original }`

- `cas_integrate`
  - Params: `expr` (string), `symbol` (string), `bounds?` ([lower, upper])
  - Returns: `{ latex, str, evalf?, definite }`

- `cas_solve_equation`
  - Params: `equation` (string, e.g. `x**2 - 4 = 0` or `x**2 - 4`), `symbol` (string)
  - Returns: `{ solutions[], latex_solutions[], count }`

- `cas_solve_ode`
  - Params: `ode` (string, e.g. `y'' + y`), `symbol` (string, independent variable), `func` (string), `ics?` (object)
  - Returns: `{ general_solution, latex, ode }`

Schemas
- Source of truth: `packages/tools-cas/src/schema.ts`

Backend
- Implementations: `packages/python-worker/worker.py`

A joke with measured units: All derivations are left as an exercise to SymPy; our wrists are conserved quantities.
