#!/usr/bin/env node

/**
 * Minimal MCP Server Test
 */

async function startMinimalServer() {
  try {
    console.error('🔧 Loading MCP SDK...');
    const { Server } = await import('@modelcontextprotocol/sdk/server/index.js');
    const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js');
    const { ListToolsRequestSchema, CallToolRequestSchema } = await import('@modelcontextprotocol/sdk/types.js');
    
    console.error('🔧 Creating minimal server...');
    const server = new Server({
      name: "minimal-phys-mcp",
      version: "0.1.0",
    }, {});
    
    console.error('🔧 Setting up handlers...');
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return { tools: [] };
    });
    
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      throw new Error(`Unknown tool: ${request.params.name}`);
    });
    
    console.error('🔧 Starting server...');
    const transport = new StdioServerTransport();
    
    console.error('🎯 Minimal server ready for connections');
    await server.connect(transport);
    
  } catch (error) {
    console.error('❌ Minimal server failed:', error);
    process.exit(1);
  }
}

startMinimalServer();
