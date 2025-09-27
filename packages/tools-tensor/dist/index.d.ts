/**
 * Tensor tools (scaffold)
 */
import { Tool } from "../../mcp-types/dist/types.js";
export declare function buildTensorTools(): Tool[];
export declare function handleTensorTool(name: string, args: unknown): Promise<any>;
export * from "./schema.js";
