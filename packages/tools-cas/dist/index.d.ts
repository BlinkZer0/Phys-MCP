/**
 * CAS (Computer Algebra System) tools for Physics MCP
 */
import { Tool } from "../../mcp-types/dist/types.js";
/**
 * Build CAS tools for the MCP server
 */
export declare function buildCASTools(): Tool[];
/**
 * Handle CAS tool calls
 */
export declare function handleCASTool(name: string, arguments_: unknown): Promise<any>;
export * from "./schema.js";
export { getWorkerClient, shutdownWorkerClient } from "./worker-client.js";
