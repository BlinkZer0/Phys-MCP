#!/usr/bin/env node

/**
 * Phys-MCP Server Launcher
 * 
 * This script launches the Phys-MCP server from any directory.
 * Use this in your MCP client configuration instead of the direct path.
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Find the server file relative to this script
const serverPath = join(__dirname, '..', 'packages', 'server', 'dist', 'index.js');

console.error(`🚀 Starting Phys-MCP server from: ${serverPath}`);

// Launch the server
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  cwd: __dirname
});

// Handle process signals
process.on('SIGINT', () => {
  console.error('🛑 Received SIGINT, shutting down...');
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('🛑 Received SIGTERM, shutting down...');
  server.kill('SIGTERM');
  process.exit(0);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  console.error(`🛑 Server exited with code ${code}`);
  process.exit(code);
});
