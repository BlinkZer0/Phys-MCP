#!/usr/bin/env node

/**
 * Test MCP Server Connection
 */

import { spawn } from 'child_process';

async function testMCPServer() {
  console.log('🧪 Testing MCP Server Connection...');
  
  try {
    // Start the server process
    const serverProcess = spawn('node', ['packages/server/dist/index.js'], {
      stdio: ['pipe', 'pipe', 'inherit'],
      cwd: process.cwd()
    });

    // Send a list tools request
    const listToolsRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {}
    };

    console.log('📤 Sending list tools request...');
    serverProcess.stdin.write(JSON.stringify(listToolsRequest) + '\n');

    // Listen for response
    serverProcess.stdout.on('data', (data) => {
      try {
        const response = JSON.parse(data.toString());
        console.log('📥 Received response:', JSON.stringify(response, null, 2));
        
        if (response.result && response.result.tools) {
          console.log(`✅ Server responded with ${response.result.tools.length} tools`);
          response.result.tools.forEach((tool, index) => {
            console.log(`   ${index + 1}. ${tool.name}: ${tool.description}`);
          });
        }
        
        // Clean up
        serverProcess.kill();
        process.exit(0);
        
      } catch (error) {
        console.log('📥 Raw response:', data.toString());
      }
    });

    // Handle server errors
    serverProcess.on('error', (error) => {
      console.error('❌ Server process error:', error);
      process.exit(1);
    });

    // Handle server exit
    serverProcess.on('exit', (code) => {
      console.log(`🔚 Server process exited with code ${code}`);
      if (code !== 0) {
        process.exit(1);
      }
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      console.log('⏰ Test timeout - killing server');
      serverProcess.kill();
      process.exit(1);
    }, 10000);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testMCPServer();
