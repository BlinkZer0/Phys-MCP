/**
 * JSON Schemas for Quantum tools (scaffold)
 */
export declare const QuantumOpsSchema: {
    readonly type: "object";
    readonly properties: {
        readonly operators: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly description: "Operator names/definitions";
        };
        readonly task: {
            readonly type: "string";
            readonly enum: readonly ["commutator", "matrix_rep"];
            readonly description: "Operation to perform";
        };
    };
    readonly required: readonly ["operators", "task"];
};
export declare const QuantumSolveSchema: {
    readonly type: "object";
    readonly properties: {
        readonly problem: {
            readonly type: "string";
            readonly enum: readonly ["sho", "particle_in_box", "custom"];
            readonly description: "Preset or custom";
        };
        readonly hamiltonian: {
            readonly type: "string";
            readonly description: "Hamiltonian expression (for custom)";
        };
        readonly params: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
    };
    readonly required: readonly ["problem"];
};
export declare const QuantumVisualizeSchema: {
    readonly type: "object";
    readonly properties: {
        readonly state: {
            readonly type: "string";
            readonly description: "State vector or density matrix in a simple string form";
        };
        readonly kind: {
            readonly type: "string";
            readonly enum: readonly ["bloch", "prob_density"];
            readonly description: "Visualization type";
        };
    };
    readonly required: readonly ["state", "kind"];
};
