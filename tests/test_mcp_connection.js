#!/usr/bin/env node

/**
 * Simple test to verify MCP server is responding correctly
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testMCPServer() {
  console.log('🧪 Testing Phys-MCP server connection...');
  
  const serverPath = join(__dirname, '..', 'packages/server/dist/index.js');
  
  // Start the server process
  const server = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  let responseReceived = false;
  
  // Set up timeout
  const timeout = setTimeout(() => {
    if (!responseReceived) {
      console.log('❌ Server did not respond within 5 seconds');
      server.kill();
      process.exit(1);
    }
  }, 5000);
  
  // Listen for server output
  server.stderr.on('data', (data) => {
    const output = data.toString();
    console.log('Server stderr:', output);
    
    if (output.includes('Server ready for connections')) {
      console.log('✅ Server started successfully!');
      
      // Send a tools/list request
      const request = {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/list",
        params: {}
      };
      
      server.stdin.write(JSON.stringify(request) + '\n');
    }
  });
  
  server.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('Server response:', output);
    
    try {
      const response = JSON.parse(output);
      if (response.result && response.result.tools) {
        console.log(`✅ MCP Protocol working! Found ${response.result.tools.length} tools`);
        responseReceived = true;
        clearTimeout(timeout);
        server.kill();
        process.exit(0);
      }
    } catch (e) {
      // Ignore JSON parse errors, might be partial data
    }
  });
  
  server.on('error', (error) => {
    console.error('❌ Server error:', error);
    clearTimeout(timeout);
    process.exit(1);
  });
  
  server.on('exit', (code) => {
    console.log(`Server exited with code ${code}`);
    clearTimeout(timeout);
    if (!responseReceived) {
      process.exit(1);
    }
  });
}

testMCPServer().catch(console.error);
