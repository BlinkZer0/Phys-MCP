/**
 * JSON Schema definitions for Report tools
 */
export declare const ReportGenerateSchema: {
    readonly type: "object";
    readonly properties: {
        readonly session_id: {
            readonly type: "string";
            readonly description: "Target session ID to summarize";
        };
        readonly format: {
            readonly type: "string";
            readonly enum: readonly ["markdown"];
            readonly default: "markdown";
        };
        readonly title: {
            readonly type: "string";
            readonly description: "Report title";
        };
        readonly author: {
            readonly type: "string";
            readonly description: "Author name(s)";
        };
        readonly include: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: readonly ["cas", "plots", "constants", "units", "events", "artifacts"];
            };
            readonly description: "Sections to include in the report";
        };
    };
    readonly required: readonly ["session_id"];
};
