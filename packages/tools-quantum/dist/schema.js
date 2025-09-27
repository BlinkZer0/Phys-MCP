/**
 * JSON Schemas for Quantum tools (scaffold)
 */
export const QuantumOpsSchema = {
    type: "object",
    properties: {
        operators: { type: "array", items: { type: "string" }, description: "Operator names/definitions" },
        task: { type: "string", enum: ["commutator", "matrix_rep"], description: "Operation to perform" }
    },
    required: ["operators", "task"]
};
export const QuantumSolveSchema = {
    type: "object",
    properties: {
        problem: { type: "string", enum: ["sho", "particle_in_box", "custom"], description: "Preset or custom" },
        hamiltonian: { type: "string", description: "Hamiltonian expression (for custom)" },
        params: { type: "object", additionalProperties: true }
    },
    required: ["problem"]
};
export const QuantumVisualizeSchema = {
    type: "object",
    properties: {
        state: { type: "string", description: "State vector or density matrix in a simple string form" },
        kind: { type: "string", enum: ["bloch", "prob_density"], description: "Visualization type" }
    },
    required: ["state", "kind"]
};
