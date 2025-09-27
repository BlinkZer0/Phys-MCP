/**
 * GPU-accelerated signal processing tools
 */
interface Tool {
    name: string;
    description: string;
    inputSchema: any;
}
export type ToolHandler = (params: any) => Promise<any>;
export declare const tools: Tool[];
export * from './schema.js';
export * from './handlers.js';
export declare function buildSignalTools(): Tool[];
export declare function handleSignalTool(name: string, args: any): Promise<any>;
