/**
 * Plotting tools for Physics MCP
 */
import { Tool } from "../../mcp-types/dist/types.js";
/**
 * Build plotting tools for the MCP server
 */
export declare function buildPlotTools(): Tool[];
/**
 * Handle plotting tool calls
 */
export declare function handlePlotTool(name: string, arguments_: unknown): Promise<any>;
export * from "./schema.js";
