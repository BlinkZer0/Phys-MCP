/**
 * Minimal MCP SDK mock for when the real SDK isn't available
 * This provides the essential types and classes needed for the Physics MCP Server
 */
import type { Tool } from "./types.js";
export interface MCPServer {
    setRequestHandler(schema: any, handler: (request: any) => Promise<any>): void;
    connect(transport: any): Promise<void>;
}
export interface MCPServerTransport {
}
export declare class Server implements MCPServer {
    private config;
    private capabilities;
    private requestHandlers;
    constructor(config: {
        name: string;
        version: string;
    }, capabilities: {
        capabilities: any;
    });
    setRequestHandler(schema: any, handler: (request: any) => Promise<any>): void;
    connect(transport: MCPServerTransport): Promise<void>;
    handleRequest(method: string, params: any): Promise<any>;
}
export declare class StdioServerTransport implements MCPServerTransport {
    constructor();
}
export declare const CallToolRequestSchema = "call_tool";
export declare const ListToolsRequestSchema = "list_tools";
export interface JSONRPCRequest {
    jsonrpc: "2.0";
    id: string | number;
    method: string;
    params?: any;
}
export interface JSONRPCResponse {
    jsonrpc: "2.0";
    id: string | number;
    result?: any;
    error?: {
        code: number;
        message: string;
    };
}
export type { Tool };
