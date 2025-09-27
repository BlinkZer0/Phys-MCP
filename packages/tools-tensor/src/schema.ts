/**
 * JSON Schema for tensor_algebra (scaffold)
 */

export const TensorAlgebraSchema = {
  type: "object",
  properties: {
    metric: {
      description: "Metric tensor components as nested array in chosen coordinates",
      type: "array",
      items: { type: "array", items: { anyOf: [{ type: "number" }, { type: "string" }] } }
    },
    coords: {
      description: "Coordinate names (e.g., ['t','r','theta','phi'])",
      type: "array",
      items: { type: "string" }
    },
    compute: {
      description: "Quantities to compute",
      type: "array",
      items: { type: "string", enum: ["christoffel", "riemann", "ricci", "ricci_scalar", "geodesics"] }
    }
  },
  required: ["metric", "coords", "compute"]
} as const;
