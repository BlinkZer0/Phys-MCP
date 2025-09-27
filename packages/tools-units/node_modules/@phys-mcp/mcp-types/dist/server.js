/**
 * Local MCP server implementation
 * This provides a basic server implementation when the official SDK is not available
 */
import { stdin, stdout, stderr } from 'process';
export class Server {
    tools = new Map();
    requestHandlers = new Map();
    serverInfo;
    constructor(info) {
        this.serverInfo = info;
    }
    setRequestHandler(schema, handler) {
        const method = schema.method || schema;
        this.requestHandlers.set(method, handler);
        return this;
    }
    addTool(tool, handler) {
        this.tools.set(tool.name, tool);
    }
    async handleRequest(request) {
        // Handle notifications (they don't expect a response)
        if (request.method && request.method.startsWith('notifications/')) {
            // Notifications don't need a response
            return null;
        }
        // Handle requests without an ID (notifications in JSON-RPC 2.0)
        if (!request.id && request.id !== 0) {
            // This is a notification, don't send a response
            return null;
        }
        const handler = this.requestHandlers.get(request.method);
        if (handler) {
            const result = await handler(request);
            return {
                jsonrpc: "2.0",
                id: request.id,
                result
            };
        }
        switch (request.method) {
            case "initialize":
                return this.handleInitialize(request);
            case "tools/list":
                return this.handleListTools(request);
            case "tools/call":
                return this.handleCallTool(request);
            default:
                // Return proper JSON-RPC error for unknown methods
                return {
                    jsonrpc: "2.0",
                    id: request.id,
                    error: {
                        code: -32601,
                        message: `Method not found: ${request.method}`
                    }
                };
        }
    }
    async handleInitialize(request) {
        return {
            jsonrpc: "2.0",
            id: request.id,
            result: {
                protocolVersion: "2024-11-05",
                capabilities: {
                    tools: {
                        listChanged: true
                    }
                },
                serverInfo: this.serverInfo
            }
        };
    }
    async handleListTools(request) {
        const handler = this.requestHandlers.get("tools/list");
        if (handler) {
            const result = await handler(request);
            return {
                jsonrpc: "2.0",
                id: request.id,
                result
            };
        }
        return {
            jsonrpc: "2.0",
            id: request.id,
            result: {
                tools: Array.from(this.tools.values())
            }
        };
    }
    async handleCallTool(request) {
        const handler = this.requestHandlers.get("tools/call");
        if (handler) {
            const result = await handler(request);
            return {
                jsonrpc: "2.0",
                id: request.id,
                result
            };
        }
        throw new Error(`No handler for tools/call`);
    }
    async connect(transport) {
        await transport.start(this);
    }
}
export class StdioServerTransport {
    server;
    constructor() {
        // Initialize stdio transport
    }
    send(message) {
        stdout.write(JSON.stringify(message) + '\n');
    }
    async start(server) {
        this.server = server;
        let buffer = '';
        stdin.on('data', async (chunk) => {
            buffer += chunk.toString();
            // Process complete JSON messages
            let newlineIndex;
            while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
                const line = buffer.slice(0, newlineIndex).trim();
                buffer = buffer.slice(newlineIndex + 1);
                if (line) {
                    try {
                        const request = JSON.parse(line);
                        const response = await server.handleRequest(request);
                        // Only send response if it's not null (notifications return null)
                        if (response !== null) {
                            this.send(response);
                        }
                    }
                    catch (parseError) {
                        // Handle JSON parsing errors
                        if (parseError instanceof SyntaxError) {
                            stderr.write(`JSON parse error: ${parseError.message}\n`);
                            const errorResponse = {
                                jsonrpc: "2.0",
                                id: null,
                                error: {
                                    code: -32700,
                                    message: "Parse error"
                                }
                            };
                            this.send(errorResponse);
                        }
                        else {
                            stderr.write(`Error processing request: ${parseError}\n`);
                            const errorResponse = {
                                jsonrpc: "2.0",
                                id: null,
                                error: {
                                    code: -32603,
                                    message: parseError instanceof Error ? parseError.message : String(parseError)
                                }
                            };
                            this.send(errorResponse);
                        }
                    }
                }
            }
        });
        stdin.on('end', () => {
            process.exit(0);
        });
        // Keep the process alive
        process.stdin.resume();
    }
    async close() {
        // Clean up
    }
}
