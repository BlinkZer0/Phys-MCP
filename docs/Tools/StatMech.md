<p align="center">
  <img src="/assets/svg/headers/numerics-solvers.svg" alt="Statistical Mechanics — Phys-MCP" width="100%">
</p>

# Statistical Mechanics Tool

- Name: `statmech_partition`
- Description: Calculate partition function and thermodynamic quantities from energy levels
- Package: `packages/tools-statmech/`

## Input Schema

```json
{
  "type": "object",
  "properties": {
    "energy_levels": {
      "type": "array",
      "items": { "type": "number" },
      "description": "Energy levels in Joules"
    },
    "temperature": {
      "type": "number", 
      "description": "Temperature in Kelvin",
      "default": 300.0
    },
    "degeneracies": {
      "type": "array",
      "items": { "type": "number" },
      "description": "Degeneracies for each energy level (optional, defaults to 1)"
    }
  },
  "required": ["energy_levels"]
}
```

## Computed Quantities

- **Partition Function**: Z = Σ g_i * exp(-β E_i)
- **Internal Energy**: U = ⟨E⟩
- **Heat Capacity**: C_V = k_B β² (⟨E²⟩ - ⟨E⟩²)
- **Helmholtz Free Energy**: F = -k_B T ln(Z)
- **Entropy**: S = k_B (ln(Z) + β U)
- **Population Probabilities**: P_i = g_i exp(-β E_i) / Z

## Example Requests

### Two-Level System
```json
{
  "jsonrpc": "2.0",
  "id": "statmech-1",
  "method": "statmech_partition",
  "params": {
    "energy_levels": [0.0, 1.602e-19],
    "temperature": 300.0,
    "degeneracies": [1, 1]
  }
}
```

### Three-Level System with Degeneracy
```json
{
  "jsonrpc": "2.0",
  "id": "statmech-2", 
  "method": "statmech_partition",
  "params": {
    "energy_levels": [0.0, 2.07e-21, 4.14e-21],
    "temperature": 77.0,
    "degeneracies": [1, 2, 1]
  }
}
```

## Notes

- Energy levels should be in Joules
- Temperature in Kelvin
- Uses CODATA 2018 Boltzmann constant: k_B = 1.380649×10⁻²³ J/K
- Automatically shifts energies to avoid numerical overflow
- Returns most populated energy level index


