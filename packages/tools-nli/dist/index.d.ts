/**
 * Natural Language Interface for Physics MCP
 */
import { Tool } from "../../mcp-types/dist/types.js";
/**
 * Build NLI tools for the MCP server
 */
export declare function buildNLITools(): Tool[];
/**
 * Handle NLI tool calls
 */
export declare function handleNLITool(name: string, arguments_: unknown): Promise<any>;
export * from "./schema.js";
