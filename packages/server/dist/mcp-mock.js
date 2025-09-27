/**
 * Minimal MCP SDK mock for when the real SDK isn't available
 * This provides the essential types and classes needed for the Physics MCP Server
 */
export class Server {
    config;
    capabilities;
    requestHandlers = new Map();
    constructor(config, capabilities) {
        this.config = config;
        this.capabilities = capabilities;
    }
    setRequestHandler(schema, handler) {
        this.requestHandlers.set(schema, handler);
    }
    async connect(transport) {
        // Mock implementation - in real SDK this would start the server
        console.log(`Mock MCP Server ${this.config.name} v${this.config.version} connected`);
    }
    // Mock method to handle requests (for testing)
    async handleRequest(method, params) {
        const handler = this.requestHandlers.get(method);
        if (handler) {
            return await handler({ params });
        }
        throw new Error(`No handler for method: ${method}`);
    }
}
export class StdioServerTransport {
    constructor() {
        // Mock implementation
    }
}
// Schemas for MCP requests
export const CallToolRequestSchema = "call_tool";
export const ListToolsRequestSchema = "list_tools";
