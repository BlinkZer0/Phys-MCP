/**
 * Data I/O tools for scientific formats
 */
interface Tool {
    name: string;
    description: string;
    inputSchema: any;
}
export declare const tools: Tool[];
export * from './schema.js';
export * from './handlers.js';
export declare function buildDataIOTools(): Tool[];
export declare function handleDataIOTool(name: string, args: any): Promise<any>;
