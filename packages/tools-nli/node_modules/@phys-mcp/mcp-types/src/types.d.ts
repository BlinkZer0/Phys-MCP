/**
 * Local MCP type definitions
 * This provides the essential types needed for the Physics MCP server
 * when the official @modelcontextprotocol/sdk is not available
 */
export interface JSONSchema {
    type?: string;
    properties?: Record<string, JSONSchema>;
    required?: string[];
    items?: JSONSchema;
    description?: string;
    enum?: any[];
    [key: string]: any;
}
export interface Tool {
    name: string;
    description: string;
    inputSchema: JSONSchema;
}
export interface CallToolRequest {
    method: "tools/call";
    params: {
        name: string;
        arguments?: any;
    };
}
export interface CallToolResult {
    content: Array<{
        type: "text" | "image" | "resource";
        text?: string;
        data?: string;
        mimeType?: string;
    }>;
    isError?: boolean;
}
export interface ListToolsRequest {
    method: "tools/list";
}
export interface ListToolsResult {
    tools: Tool[];
}
export interface ServerCapabilities {
    tools?: {
        listChanged?: boolean;
    };
}
export interface InitializeRequest {
    method: "initialize";
    params: {
        protocolVersion: string;
        capabilities: any;
        clientInfo: {
            name: string;
            version: string;
        };
    };
}
export interface InitializeResult {
    protocolVersion: string;
    capabilities: ServerCapabilities;
    serverInfo: {
        name: string;
        version: string;
    };
}
