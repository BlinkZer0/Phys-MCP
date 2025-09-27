/**
 * Report Tools for Physics MCP Server
 *
 * Exposes the report_generate tool (advertised here) while the server provides the implementation
 * using the persistence layer. This package only defines the tool schema and metadata.
 */
import { Tool } from "../../mcp-types/dist/types.js";
/**
 * Build the list of available report tools.
 */
export declare function buildReportTools(): Tool[];
export * from "./schema.js";
