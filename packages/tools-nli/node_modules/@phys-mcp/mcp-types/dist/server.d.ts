/**
 * Local MCP server implementation
 * This provides a basic server implementation when the official SDK is not available
 */
export declare class Server {
    private tools;
    private requestHandlers;
    private serverInfo;
    constructor(info: {
        name: string;
        version: string;
    });
    setRequestHandler(schema: any, handler: any): this;
    addTool(tool: any, handler: any): void;
    handleRequest(request: any): Promise<any>;
    private handleInitialize;
    private handleListTools;
    private handleCallTool;
    connect(transport: StdioServerTransport): Promise<void>;
}
export declare class StdioServerTransport {
    private server?;
    constructor();
    send(message: any): void;
    start(server: Server): Promise<void>;
    close(): Promise<void>;
}
