export const StatmechPartitionSchema = {
  type: "object",
  properties: {
    energy_levels: {
      type: "array",
      items: { type: "number" },
      description: "Energy levels in Joules"
    },
    temperature: {
      type: "number",
      description: "Temperature in Kelvin",
      default: 300.0
    },
    degeneracies: {
      type: "array",
      items: { type: "number" },
      description: "Degeneracies for each energy level (optional, defaults to 1)"
    }
  },
  required: ["energy_levels"]
};
