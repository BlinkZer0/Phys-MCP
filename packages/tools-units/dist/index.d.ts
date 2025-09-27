/**
 * Units Tools for Physics MCP Server
 *
 * Provides unit conversion capabilities using the Python worker.
 */
export interface Tool {
    name: string;
    description: string;
    inputSchema: any;
}
/**
 * Build the list of available units tools
 */
export declare function buildUnitsTools(): Tool[];
/**
 * Handle units tool calls
 */
export declare function handleUnitsTool(name: string, args: any): Promise<any>;
/**
 * Shutdown the worker process
 */
export declare function shutdownWorkerClient(): void;
