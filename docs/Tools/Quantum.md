---
title: Quantum Tooling
kind: reference
header_svg:
  src: "/assets/svg/physics-mcp-hero.svg"
  static: "/assets/svg/physics-mcp-hero-static.svg"
  title: "Quantum Modules"
  animate: true
  theme_variant: "auto"
  reduced_motion: "auto"
---

{% assign header_svg = page.header_svg %}
{% include header-svg.html %}

# Quantum Tools

Phase 3 quantum mechanics tools for operator algebra, solving standard problems, and visualization.

## quantum_ops

- Description: Quantum operator utilities (commutators, matrix representations)
- Package: `packages/tools-quantum/`

### Input Schema
```json
{
  "type": "object",
  "properties": {
    "operators": { "type": "array", "items": { "type": "string" } },
    "task": { "type": "string", "enum": ["commutator", "matrix_rep"] }
  },
  "required": ["operators", "task"]
}
```

### Example: Pauli Commutator
```json
{
  "jsonrpc": "2.0",
  "id": "qops-1", 
  "method": "quantum_ops",
  "params": {
    "operators": ["sigma_x", "sigma_y"],
    "task": "commutator"
  }
}
```

## quantum_solve

- Description: Quantum solver for standard problems or custom Hamiltonians
- Supports: Simple Harmonic Oscillator (sho), Particle in Box (particle_in_box), Custom

### Input Schema
```json
{
  "type": "object",
  "properties": {
    "problem": { "type": "string", "enum": ["sho", "particle_in_box", "custom"] },
    "hamiltonian": { "type": "string" },
    "params": { "type": "object", "additionalProperties": true }
  },
  "required": ["problem"]
}
```

### Example: Quantum Harmonic Oscillator
```json
{
  "jsonrpc": "2.0",
  "id": "qsolve-1",
  "method": "quantum_solve", 
  "params": {
    "problem": "sho",
    "params": {
      "n_levels": 4,
      "omega": 1.0,
      "hbar": 1.0
    }
  }
}
```

## quantum_visualize

- Description: Visualize quantum states (Bloch sphere, probability density)
- Requires: qutip for Bloch sphere visualization

### Input Schema
```json
{
  "type": "object",
  "properties": {
    "state": { "type": "string" },
    "kind": { "type": "string", "enum": ["bloch", "prob_density"] }
  },
  "required": ["state", "kind"]
}
```

### Example: Bloch Sphere
```json
{
  "jsonrpc": "2.0",
  "id": "qvis-1",
  "method": "quantum_visualize",
  "params": {
    "state": "|0⟩ + |1⟩",
    "kind": "bloch"
  }
}
```

## Dependencies

- **qutip**: Optional for matrix representations and Bloch sphere visualization
- **sympy**: Required for symbolic operator algebra
- Install qutip: `pip install qutip`


