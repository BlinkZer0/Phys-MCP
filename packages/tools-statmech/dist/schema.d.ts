/**
 * JSON Schema for statistical mechanics tools
 */
export declare const StatmechPartitionSchema: {
    readonly type: "object";
    readonly properties: {
        readonly energy_levels: {
            readonly type: "array";
            readonly items: {
                readonly type: "number";
            };
            readonly description: "Energy levels in Joules";
        };
        readonly temperature: {
            readonly type: "number";
            readonly description: "Temperature in Kelvin";
            readonly default: 300;
        };
        readonly degeneracies: {
            readonly type: "array";
            readonly items: {
                readonly type: "number";
            };
            readonly description: "Degeneracies for each energy level (optional, defaults to 1)";
        };
    };
    readonly required: readonly ["energy_levels"];
};
