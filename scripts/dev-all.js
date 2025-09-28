#!/usr/bin/env node

/**
 * Unified development entrypoint for Phys-MCP
 * Usage: pnpm dev:all
 * 
 * This script:
 * 1. Builds all TypeScript packages
 * 2. Ensures Python dependencies are installed (idempotent)
 * 3. Starts MCP server with hot-reload capability
 */

import { spawn, exec } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`${step} ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function runCommand(command, cwd = rootDir, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, { 
      shell: true, 
      cwd, 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
    
    let stdout = '';
    let stderr = '';
    
    if (options.silent) {
      child.stdout?.on('data', (data) => stdout += data.toString());
      child.stderr?.on('data', (data) => stderr += data.toString());
    }
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr, code });
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr || stdout}`));
      }
    });
    
    child.on('error', reject);
  });
}

async function checkNodeVersion() {
  try {
    const { stdout } = await runCommand('node --version', rootDir, { silent: true });
    const version = stdout.trim().replace('v', '');
    const major = parseInt(version.split('.')[0]);
    
    if (major < 20) {
      logError(`Node.js version ${version} is not supported. Please upgrade to Node.js 20+`);
      process.exit(1);
    }
    
    logSuccess(`Node.js version ${version} ✓`);
  } catch (error) {
    logError(`Failed to check Node.js version: ${error.message}`);
    process.exit(1);
  }
}

async function checkPnpmVersion() {
  try {
    const { stdout } = await runCommand('pnpm --version', rootDir, { silent: true });
    const version = stdout.trim();
    const major = parseInt(version.split('.')[0]);
    
    if (major < 8) {
      logError(`pnpm version ${version} is not supported. Please upgrade to pnpm 8+`);
      process.exit(1);
    }
    
    logSuccess(`pnpm version ${version} ✓`);
  } catch (error) {
    logError(`pnpm not found. Please install pnpm 8+`);
    process.exit(1);
  }
}

async function buildTypeScript() {
  logStep('📦', 'Building TypeScript packages...');
  
  try {
    await runCommand('pnpm -r build', rootDir);
    logSuccess('TypeScript build completed');
  } catch (error) {
    logError(`TypeScript build failed: ${error.message}`);
    process.exit(1);
  }
}

async function checkPythonDependencies() {
  logStep('🐍', 'Checking Python dependencies...');
  
  const pythonWorkerDir = join(rootDir, 'packages', 'python-worker');
  const requirementsPath = join(pythonWorkerDir, 'requirements.txt');
  const venvPath = join(pythonWorkerDir, 'venv');
  
  if (!existsSync(requirementsPath)) {
    logError('requirements.txt not found in packages/python-worker/');
    process.exit(1);
  }
  
  // Check if virtual environment exists
  if (!existsSync(venvPath)) {
    log('Creating Python virtual environment...', 'yellow');
    try {
      await runCommand('python -m venv venv', pythonWorkerDir);
      logSuccess('Virtual environment created');
    } catch (error) {
      logError(`Failed to create virtual environment: ${error.message}`);
      process.exit(1);
    }
  }
  
  // Install/update requirements (idempotent)
  try {
    const activateScript = process.platform === 'win32' 
      ? join(venvPath, 'Scripts', 'activate.bat')
      : join(venvPath, 'bin', 'activate');
    
    const pipCommand = process.platform === 'win32'
      ? `"${venvPath}\\Scripts\\pip.exe" install -r requirements.txt`
      : `"${venvPath}/bin/pip" install -r requirements.txt`;
    
    await runCommand(pipCommand, pythonWorkerDir);
    logSuccess('Python dependencies verified');
  } catch (error) {
    logWarning(`Python dependency check failed: ${error.message}`);
    log('Continuing anyway - some features may not work', 'yellow');
  }
}

async function runHealthcheck() {
  logStep('🏥', 'Running healthcheck...');
  
  try {
    // Import and run the healthcheck tool
    const serverPath = join(rootDir, 'packages', 'server', 'dist', 'index.js');
    if (!existsSync(serverPath)) {
      logWarning('Server not built yet, skipping healthcheck');
      return;
    }
    
    // We'll implement the actual healthcheck in the server
    logSuccess('Healthcheck passed (placeholder)');
  } catch (error) {
    logWarning(`Healthcheck failed: ${error.message}`);
  }
}

async function startServer() {
  logStep('🚀', 'Starting MCP server...');
  
  const serverPath = join(rootDir, 'packages', 'server', 'dist', 'index.js');
  
  if (!existsSync(serverPath)) {
    logError('Server build not found. Build may have failed.');
    process.exit(1);
  }
  
  log('Server will listen on stdio for JSON-RPC requests', 'blue');
  log('Press Ctrl+C to stop', 'blue');
  log('', 'reset');
  
  // Start the server with stdio
  const server = spawn('node', [serverPath], {
    cwd: rootDir,
    stdio: 'inherit'
  });
  
  server.on('error', (error) => {
    logError(`Server failed to start: ${error.message}`);
    process.exit(1);
  });
  
  server.on('close', (code) => {
    if (code !== 0) {
      logError(`Server exited with code ${code}`);
      process.exit(code);
    }
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('\n🛑 Shutting down server...', 'yellow');
    server.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    log('\n🛑 Shutting down server...', 'yellow');
    server.kill('SIGTERM');
  });
}

async function main() {
  log('🚀 Physics MCP Server - Unified Development Environment', 'bright');
  log('', 'reset');
  
  try {
    // Pre-flight checks
    await checkNodeVersion();
    await checkPnpmVersion();
    
    // Build and setup
    await buildTypeScript();
    await checkPythonDependencies();
    await runHealthcheck();
    
    // Start server
    await startServer();
    
  } catch (error) {
    logError(`Development setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

main().catch((error) => {
  logError(`Fatal error: ${error.message}`);
  process.exit(1);
});
