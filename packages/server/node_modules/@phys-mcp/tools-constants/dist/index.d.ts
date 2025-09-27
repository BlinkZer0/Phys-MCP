/**
 * Constants Tools for Physics MCP Server
 *
 * Provides access to physical constants from CODATA and astrophysical sources.
 */
export interface Tool {
    name: string;
    description: string;
    inputSchema: any;
}
/**
 * Build the list of available constants tools
 */
export declare function buildConstantsTools(): Tool[];
/**
 * Handle constants tool calls
 */
export declare function handleConstantsTool(name: string, args: any): Promise<any>;
/**
 * Shutdown the worker process
 */
export declare function shutdownWorkerClient(): void;
