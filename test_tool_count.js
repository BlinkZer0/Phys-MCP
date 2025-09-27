#!/usr/bin/env node

/**
 * Test to count how many tools are loaded in the server
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testToolCount() {
  console.log('🔧 Testing tool count in Phys-MCP server...');
  
  const serverPath = join(__dirname, 'packages/server/dist/index.js');
  
  // Start the server process
  const server = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  let toolCount = 0;
  let serverReady = false;
  
  // Set up timeout
  const timeout = setTimeout(() => {
    console.log('❌ Server did not respond within 10 seconds');
    server.kill();
    process.exit(1);
  }, 10000);
  
  // Listen for server output
  server.stderr.on('data', (data) => {
    const output = data.toString();
    console.log('📊', output.trim());
    
    // Look for tool loading messages
    if (output.includes('Loaded') && output.includes('tools')) {
      const match = output.match(/Loaded (\d+) tools/);
      if (match) {
        toolCount = parseInt(match[1]);
      }
    }
    
    if (output.includes('Server ready for connections')) {
      console.log('✅ Server started successfully!');
      serverReady = true;
      
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
    
    try {
      const response = JSON.parse(output);
      if (response.result && response.result.tools) {
        const actualCount = response.result.tools.length;
        console.log(`\n🎯 RESULTS:`);
        console.log(`   Tools loaded: ${actualCount}`);
        console.log(`   Expected: ~27 tools`);
        
        if (actualCount >= 25) {
          console.log(`✅ SUCCESS: All tools loaded correctly!`);
        } else {
          console.log(`⚠️  WARNING: Only ${actualCount} tools loaded, expected ~27`);
        }
        
        // List first few tools
        console.log(`\n📋 Sample tools:`);
        response.result.tools.slice(0, 10).forEach((tool, i) => {
          console.log(`   ${i+1}. ${tool.name}`);
        });
        if (response.result.tools.length > 10) {
          console.log(`   ... and ${response.result.tools.length - 10} more`);
        }
        
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
    console.log(`\n🛑 Server exited with code ${code}`);
    clearTimeout(timeout);
  });
}

testToolCount().catch(console.error);
