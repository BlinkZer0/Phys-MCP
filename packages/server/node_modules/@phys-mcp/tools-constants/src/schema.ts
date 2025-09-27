/**
 * JSON Schema definitions for Constants tools
 */

export const ConstantsGetSchema = {
  type: "object",
  properties: {
    name: {
      type: "string",
      description: "Name of the physical constant (e.g., 'c', 'h', 'e', 'k_B', 'G', 'M_sun', 'pc', 'ly')"
    }
  },
  required: ["name"]
} as const;
