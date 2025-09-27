#!/usr/bin/env node

/**
 * Test script to verify Physics MCP Server installation
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🧪 Testing Physics MCP Server Installation\n');

// Test cases
const tests = [
  {
    name: 'CAS - Differentiation',
    request: {
      jsonrpc: '2.0',
      id: '1',
      method: 'cas_diff',
      params: {
        expr: 'sin(x**2)',
        symbol: 'x'
      }
    }
  },
  {
    name: 'CAS - Evaluation',
    request: {
      jsonrpc: '2.0',
      id: '2',
      method: 'cas_evaluate',
      params: {
        expr: 'x**2 + 2*x + 1',
        vars: { x: 3 }
      }
    }
  },
  {
    name: 'Plot - Function 2D',
    request: {
      jsonrpc: '2.0',
      id: '3',
      method: 'plot_function_2d',
      params: {
        f: 'sin(x)',
        x_min: 0,
        x_max: 6.28,
        samples: 100
      }
    }
  }
];

async function runTest(test) {
  return new Promise((resolve) => {
    console.log(`Testing: ${test.name}`);
    
    const serverPath = join(projectRoot, 'packages', 'server', 'dist', 'index.js');
    const child = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: projectRoot
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0 && output.includes('"result"')) {
        console.log(`✅ ${test.name} - PASSED`);
        resolve(true);
      } else {
        console.log(`❌ ${test.name} - FAILED`);
        if (errorOutput) {
          console.log(`   Error: ${errorOutput.trim()}`);
        }
        resolve(false);
      }
    });

    // Send the test request
    child.stdin.write(JSON.stringify(test.request) + '\n');
    child.stdin.end();

    // Timeout after 10 seconds
    setTimeout(() => {
      child.kill();
      console.log(`⏰ ${test.name} - TIMEOUT`);
      resolve(false);
    }, 10000);
  });
}

async function main() {
  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    const result = await runTest(test);
    if (result) passed++;
    console.log(''); // Empty line for readability
  }

  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Physics MCP Server is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the installation and try again.');
    console.log('\nTroubleshooting tips:');
    console.log('1. Run "npm run build" to ensure all packages are built');
    console.log('2. Check that Python dependencies are installed');
    console.log('3. Verify the server starts without errors');
  }

  process.exit(passed === total ? 0 : 1);
}

main().catch(console.error);
