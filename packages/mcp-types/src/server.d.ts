/**
 * Local MCP server implementation
 * This provides a basic server implementation when the official SDK is not available
 */
import { Tool, CallToolResult } from "./types";
export interface RequestHandler {
    (request: any): Promise<any>;
}
export declare class Server {
    private tools;
    private toolHandlers;
    constructor();
    setRequestHandler<T>(schema: any, handler: RequestHandler): Server;
    addTool(tool: Tool, handler: (args: any) => Promise<CallToolResult>): void;
    handleRequest(request: any): Promise<any>;
    private handleInitialize;
    private handleListTools;
    private handleCallTool;
    connect(transport: any): Promise<void>;
}
export declare class StdioServerTransport {
    onMessage?: (message: any) => void;
    constructor();
    send(message: any): void;
    start(): Promise<void>;
    close(): Promise<void>;
}
