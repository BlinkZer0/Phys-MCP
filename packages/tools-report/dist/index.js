/**
 * Report Tools for Physics MCP Server
 *
 * Exposes the report_generate tool (advertised here) while the server provides the implementation
 * using the persistence layer. This package only defines the tool schema and metadata.
 */
import { ReportGenerateSchema } from "./schema.js";
/**
 * Build the list of available report tools.
 */
export function buildReportTools() {
    return [
        {
            name: "report_generate",
            description: "Generate a session report (Markdown) summarizing tool events and artifacts.",
            inputSchema: ReportGenerateSchema,
        },
    ];
}
// Re-export schema for convenience
export * from "./schema.js";
