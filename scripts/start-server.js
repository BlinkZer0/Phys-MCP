// CommonJS wrapper for Windows compatibility. Spawns the Phys-MCP server
// with stdio inherited so MCP JSON-RPC flows directly over stdio.
const { spawn } = require('node:child_process');
const path = require('node:path');

console.error('🔧 Starting Phys-MCP server via wrapper (CJS)...');

const serverEntry = path.join(__dirname, 'packages/server/dist/index.js');

const child = spawn(process.execPath, [serverEntry], {
  stdio: 'inherit', // pass stdin/stdout/stderr through directly
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'production',
  },
});

child.on('exit', (code, signal) => {
  console.error(`🛑 Phys-MCP child process exited (code=${code}, signal=${signal || ''})`);
  process.exit(code ?? 1);
});

process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
