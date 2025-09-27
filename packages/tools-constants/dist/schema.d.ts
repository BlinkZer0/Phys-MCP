/**
 * JSON Schema definitions for Constants tools
 */
export declare const ConstantsGetSchema: {
    readonly type: "object";
    readonly properties: {
        readonly name: {
            readonly type: "string";
            readonly description: "Name of the physical constant (e.g., 'c', 'h', 'e', 'k_B', 'G', 'M_sun', 'pc', 'ly')";
        };
    };
    readonly required: readonly ["name"];
};
