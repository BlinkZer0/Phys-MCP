# Tool Coding Guidelines for Phys-MCP

This document provides guidelines for creating tools that work with the tools manifest generator.

## Tool Structure

Each tool file should export the following components:

### Required Exports

```typescript
import { z } from "zod";

// Input schema with strong typing and documentation
export const inputSchema = z.object({
  n: z.number().int().min(1).describe("Number of samples"),
  method: z.enum(["rk4", "euler"]).default("rk4").describe("Integrator method"),
  tolerance: z.number().optional().describe("Absolute error tolerance")
});

// Output schema
export const outputSchema = z.object({
  success: z.boolean(),
  data: z.any().describe("Result payload"),
  diagnostics: z.object({
    iterations: z.number().int().optional(),
    runtime_ms: z.number().optional()
  }).optional()
});

// Tool metadata
export const name = "simulate_oscillator";
export const description = "Simulate a (damped) harmonic oscillator and return the timeseries.";
export const category = "simulation";
export const exampleUsage = [
  "Simulate a damped harmonic oscillator for 10s with RK4",
  "Run Euler method with n=1000"
];
export const capabilities = ["ode_integration", "timeseries_generation"];
```

### Alternative: buildXXXTools Function Pattern

Phys-MCP uses a specific pattern where tools are built via functions:

```typescript
export function buildSimulationTools(): Tool[] {
  return [
    {
      name: "simulate_oscillator",
      description: "Simulate a (damped) harmonic oscillator and return the timeseries.",
      inputSchema: {
        type: "object",
        properties: {
          n: { type: "integer", minimum: 1, description: "Number of samples" },
          method: { 
            type: "string", 
            enum: ["rk4", "euler"], 
            default: "rk4", 
            description: "Integrator method" 
          },
          tolerance: { type: "number", description: "Absolute error tolerance" }
        },
        required: ["n"]
      }
    }
  ];
}
```

## Schema Guidelines

### Input Schema Best Practices

1. **Use descriptive field names**: `sample_rate` instead of `sr`
2. **Include descriptions**: Every field should have a clear description
3. **Set appropriate constraints**: Use `minimum`, `maximum`, `enum` where applicable
4. **Mark required fields**: Use `required` array for mandatory parameters
5. **Provide defaults**: Use `default` for optional parameters with sensible defaults

### Example Schema Patterns

```typescript
// Enumerated values
method: {
  type: "string",
  enum: ["linear", "quadratic", "cubic"],
  default: "linear",
  description: "Regression method to use"
}

// Numeric ranges
temperature: {
  type: "number",
  minimum: 0,
  maximum: 1000,
  description: "Temperature in Kelvin"
}

// Arrays with constraints
data_points: {
  type: "array",
  items: { type: "number" },
  minItems: 2,
  description: "Input data points for analysis"
}

// Complex objects
boundary_conditions: {
  type: "object",
  properties: {
    left: { type: "number", description: "Left boundary value" },
    right: { type: "number", description: "Right boundary value" }
  },
  required: ["left", "right"]
}
```

## Categories

Use these standard categories for consistency:

- `physics` - General physics computations
- `math` - Mathematical operations
- `visualization` - Plotting and graphics
- `data` - Data processing and I/O
- `simulation` - Numerical simulations
- `quantum` - Quantum computing
- `ml` - Machine learning
- `export` - Data export and publishing

## Capabilities

List specific capabilities your tool provides:

- `symbolic_computation` - Symbolic math operations
- `numerical_integration` - Numerical integration methods
- `visualization` - Plotting and graphics generation
- `gpu_acceleration` - GPU-accelerated computations
- `3d_visualization` - 3D plotting capabilities
- `animation` - Animation generation
- `data_export` - Export to various formats
- `unit_conversion` - Unit conversion support

## Example Usage

Provide clear, actionable examples:

```typescript
export const exampleUsage = [
  "Simulate a damped harmonic oscillator with ω=1, γ=0.1 for 10 seconds",
  "Compare RK4 vs Euler methods with 1000 time steps",
  "Generate phase space plot of oscillator dynamics"
];
```

## Testing Your Tool

After creating your tool, test the manifest generation:

```bash
pnpm run gen:manifest
```

Check that your tool appears in `tools_manifest.js` with correct schema and metadata.
