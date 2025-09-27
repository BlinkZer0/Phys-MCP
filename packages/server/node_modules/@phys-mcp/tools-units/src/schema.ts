/**
 * JSON Schema definitions for Units tools
 */

export const UnitsConvertSchema = {
  type: "object",
  properties: {
    quantity: {
      type: "object",
      properties: {
        value: { type: "number" },
        unit: { type: "string" }
      },
      required: ["value", "unit"],
      description: "Input quantity with value and unit"
    },
    to: {
      type: "string",
      description: "Target unit for conversion"
    }
  },
  required: ["quantity", "to"]
} as const;
