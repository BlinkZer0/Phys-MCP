/**
 * Minimal MCP SDK mock for when the real SDK isn't available
 * This provides the essential types and classes needed for the Physics MCP Server
 */

import type { Tool } from "./types.js";

// Types for MCP
export interface MCPServer {
  setRequestHandler(schema: any, handler: (request: any) => Promise<any>): void;
  connect(transport: any): Promise<void>;
}

export interface MCPServerTransport {
  // Transport interface - implementation depends on the specific transport
}

export class Server implements MCPServer {
  private requestHandlers = new Map();

  constructor(
    private config: { name: string; version: string },
    private capabilities: { capabilities: any }
  ) {}

  setRequestHandler(schema: any, handler: (request: any) => Promise<any>): void {
    this.requestHandlers.set(schema, handler);
  }

  async connect(transport: MCPServerTransport): Promise<void> {
    // Mock implementation - in real SDK this would start the server
    console.log(`Mock MCP Server ${this.config.name} v${this.config.version} connected`);
  }

  // Mock method to handle requests (for testing)
  async handleRequest(method: string, params: any): Promise<any> {
    const handler = this.requestHandlers.get(method);
    if (handler) {
      return await handler({ params });
    }
    throw new Error(`No handler for method: ${method}`);
  }
}

export class StdioServerTransport implements MCPServerTransport {
  constructor() {
    // Mock implementation
  }
}

// Schemas for MCP requests
export const CallToolRequestSchema = "call_tool";
export const ListToolsRequestSchema = "list_tools";

// JSON-RPC types
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

// Export Tool type for use in other modules
export type { Tool };
