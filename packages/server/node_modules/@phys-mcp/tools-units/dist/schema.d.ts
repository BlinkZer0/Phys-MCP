/**
 * JSON Schema definitions for Units tools
 */
export declare const UnitsConvertSchema: {
    readonly type: "object";
    readonly properties: {
        readonly quantity: {
            readonly type: "object";
            readonly properties: {
                readonly value: {
                    readonly type: "number";
                };
                readonly unit: {
                    readonly type: "string";
                };
            };
            readonly required: readonly ["value", "unit"];
            readonly description: "Input quantity with value and unit";
        };
        readonly to: {
            readonly type: "string";
            readonly description: "Target unit for conversion";
        };
    };
    readonly required: readonly ["quantity", "to"];
};
