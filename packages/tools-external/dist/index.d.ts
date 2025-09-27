/**
 * External API integration tools
 */
interface Tool {
    name: string;
    description: string;
    inputSchema: any;
}
export declare const tools: Tool[];
export * from './schema.js';
export * from './handlers.js';
export declare function buildExternalTools(): Tool[];
export declare function handleExternalTool(name: string, args: any): Promise<any>;
