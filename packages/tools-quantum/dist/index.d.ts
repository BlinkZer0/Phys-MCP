/**
 * Quantum tools (scaffold)
 */
import { Tool } from "../../mcp-types/dist/types.js";
export declare function buildQuantumTools(): Tool[];
export declare function handleQuantumTool(name: string, args: any): Promise<any>;
export * from "./schema.js";
