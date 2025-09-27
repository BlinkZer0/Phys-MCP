---
title: Tensor Tool
kind: reference
header_svg:
  src: "/assets/svg/tool-tensor-hero.svg"
  static: "/assets/svg/tool-tensor-hero-static.svg"
  title: "Tensor Tool"
  animate: true
  theme_variant: "auto"
  reduced_motion: "auto"
---

{% assign header_svg = page.header_svg %}
{% include header-svg.html %}

# Tensor Tool

- Name: `tensor_algebra`
- Description: Compute Christoffel symbols, curvature tensors, and geodesics
- Package: `packages/tools-tensor/`

## Input Schema

```json
{
  "type": "object",
  "properties": {
    "metric": {
      "description": "Metric tensor components as nested array in chosen coordinates",
      "type": "array",
      "items": { "type": "array", "items": { "anyOf": [{ "type": "number" }, { "type": "string" }] } }
    },
    "coords": {
      "description": "Coordinate names (e.g., ['t','r','theta','phi'])",
      "type": "array",
      "items": { "type": "string" }
    },
    "compute": {
      "description": "Quantities to compute",
      "type": "array",
      "items": { "type": "string", "enum": ["christoffel", "riemann", "ricci", "ricci_scalar", "geodesics"] }
    }
  },
  "required": ["metric", "coords", "compute"]
}
```

## Behavior

- Computes Christoffel symbols using the formula: Γ^k_{ij} = (1/2) g^{kl} (∂g_{il}/∂x^j + ∂g_{jl}/∂x^i - ∂g_{ij}/∂x^l)
- Returns symbolic expressions and LaTeX representations
- Riemann, Ricci tensors, and geodesics return partial implementations with guidance for full computation

## Example Requests

### 2D Polar Coordinates
```json
{
  "jsonrpc": "2.0",
  "id": "tensor-1",
  "method": "tensor_algebra",
  "params": {
    "metric": [["1", "0"], ["0", "r**2"]],
    "coords": ["r", "theta"],
    "compute": ["christoffel"]
  }
}
```

### Schwarzschild Metric
```json
{
  "jsonrpc": "2.0", 
  "id": "tensor-2",
  "method": "tensor_algebra",
  "params": {
    "metric": [
      ["-(1-2*M/r)", "0", "0", "0"],
      ["0", "1/(1-2*M/r)", "0", "0"],
      ["0", "0", "r**2", "0"],
      ["0", "0", "0", "r**2*sin(theta)**2"]
    ],
    "coords": ["t", "r", "theta", "phi"],
    "compute": ["christoffel", "geodesics"]
  }
}
```

## Notes

- Uses SymPy for symbolic computation with safe parsing
- Full Riemann tensor computation requires sympy.diffgeom for production use
- Geodesic equations are provided symbolically; numerical integration requires initial conditions
