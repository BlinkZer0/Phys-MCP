/**
 * JSON Schema for tensor_algebra (scaffold)
 */
export declare const TensorAlgebraSchema: {
    readonly type: "object";
    readonly properties: {
        readonly metric: {
            readonly description: "Metric tensor components as nested array in chosen coordinates";
            readonly type: "array";
            readonly items: {
                readonly type: "array";
                readonly items: {
                    readonly anyOf: readonly [{
                        readonly type: "number";
                    }, {
                        readonly type: "string";
                    }];
                };
            };
        };
        readonly coords: {
            readonly description: "Coordinate names (e.g., ['t','r','theta','phi'])";
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly compute: {
            readonly description: "Quantities to compute";
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: readonly ["christoffel", "riemann", "ricci", "ricci_scalar", "geodesics"];
            };
        };
    };
    readonly required: readonly ["metric", "coords", "compute"];
};
