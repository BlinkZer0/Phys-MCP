/**
 * Statistical mechanics tools
 */
import { Tool } from "../../mcp-types/dist/types.js";
export declare function buildStatmechTools(): Tool[];
export declare function handleStatmechTool(name: string, args: unknown): Promise<any>;
export * from "./schema.js";
