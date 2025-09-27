/**
 * Local MCP server implementation
 * This provides a basic server implementation when the official SDK is not available
 */
export class Server {
    tools = new Map();
    toolHandlers = new Map();
    constructor() {
        // Basic server initialization
    }
    setRequestHandler(schema, handler) {
        // For now, we'll handle this in a simplified way
        return this;
    }
    addTool(tool, handler) {
        this.tools.set(tool.name, tool);
        this.toolHandlers.set(tool.name, handler);
    }
    async handleRequest(request) {
        switch (request.method) {
            case "initialize":
                return this.handleInitialize(request);
            case "tools/list":
                return this.handleListTools(request);
            case "tools/call":
                return this.handleCallTool(request);
            default:
                throw new Error(`Unknown method: ${request.method}`);
        }
    }
    async handleInitialize(request) {
        return {
            protocolVersion: "2024-11-05",
            capabilities: {
                tools: {
                    listChanged: true
                }
            },
            serverInfo: {
                name: "phys-mcp",
                version: "0.1.0"
            }
        };
    }
    async handleListTools(request) {
        return {
            tools: Array.from(this.tools.values())
        };
    }
    async handleCallTool(request) {
        const handler = this.toolHandlers.get(request.params.name);
        if (!handler) {
            throw new Error(`Unknown tool: ${request.params.name}`);
        }
        return await handler(request.params.arguments);
    }
    async connect(transport) {
        // Basic connection handling - will be implemented when needed
    }
}
export class StdioServerTransport {
    onMessage;
    constructor() {
        // Simplified transport - will be implemented when needed
    }
    send(message) {
        console.log(JSON.stringify(message));
    }
    async start() {
        // Transport is ready
    }
    async close() {
        // Clean up
    }
}
