/**
 * JSON Schema definitions for Report tools
 */
export const ReportGenerateSchema = {
    type: "object",
    properties: {
        session_id: { type: "string", description: "Target session ID to summarize" },
        format: { type: "string", enum: ["markdown"], default: "markdown" },
        title: { type: "string", description: "Report title" },
        author: { type: "string", description: "Author name(s)" },
        include: {
            type: "array",
            items: { type: "string", enum: ["cas", "plots", "constants", "units", "events", "artifacts"] },
            description: "Sections to include in the report"
        }
    },
    required: ["session_id"],
};
