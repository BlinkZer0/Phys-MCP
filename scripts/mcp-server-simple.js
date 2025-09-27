#!/usr/bin/env node

// Simple MCP Server implementation

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

async function main() {
  try {
    console.error('🔧 Creating MCP server...');
    
    // Create a new MCP server
    const server = new Server({
      name: 'phys-mcp',
      version: '0.1.0',
      description: 'Physics MCP Server',
    });

    // Handle listTools request
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      console.error('📋 List tools request received');
      return {
        tools: [
          {
            name: 'ping',
            description: 'Simple ping-pong endpoint',
            parameters: {
              type: 'object',
              properties: {
                message: { type: 'string' }
              }
            }
          }
        ]
      };
    });

    // Handle tool execution requests
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      console.error(`🛠️  Tool call: ${request.params.name}`);
      
      if (request.params.name === 'ping') {
        return { content: [{ type: 'text', text: request.params.parameters?.message || 'pong' }] };
      }
      
      throw new Error(`Unknown tool: ${request.params.name}`);
    });

    // Start the server with stdio transport
    console.error('🚀 Starting MCP server...');
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error('✅ MCP server is running');
    
  } catch (error) {
    console.error('❌ Error starting MCP server:');
    console.error(error);
    process.exit(1);
  }
}

main();
