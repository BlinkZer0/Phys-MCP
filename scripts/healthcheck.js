#!/usr/bin/env node

/**
 * Phys-MCP Healthcheck Tool
 * 
 * Verifies core functionality:
 * - CAS evaluation
 * - Units round-trip conversion
 * - Constants fetch with provenance
 * - Plot rendering (PNG generation)
 * - GPU acceleration capabilities
 * 
 * Returns timings and enabled acceleration mode.
 */

import { spawn } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
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

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

async function sendMCPRequest(method, params = {}) {
  return new Promise((resolve, reject) => {
    const serverPath = join(rootDir, 'packages', 'server', 'dist', 'index.js');
    
    if (!existsSync(serverPath)) {
      reject(new Error('Server build not found'));
      return;
    }
    
    const server = spawn('node', [serverPath], {
      cwd: rootDir,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    const request = {
      jsonrpc: '2.0',
      id: Math.random().toString(36).substr(2, 9),
      method,
      params
    };
    
    let stdout = '';
    let stderr = '';
    
    server.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    server.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    server.on('close', (code) => {
      if (code === 0) {
        try {
          // Parse the last JSON response from stdout
          const lines = stdout.trim().split('\n');
          const lastLine = lines[lines.length - 1];
          const response = JSON.parse(lastLine);
          resolve(response);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}\nStdout: ${stdout}\nStderr: ${stderr}`));
        }
      } else {
        reject(new Error(`Server exited with code ${code}\nStderr: ${stderr}`));
      }
    });
    
    server.on('error', reject);
    
    // Send the request
    server.stdin.write(JSON.stringify(request) + '\n');
    server.stdin.end();
    
    // Timeout after 10 seconds
    setTimeout(() => {
      server.kill();
      reject(new Error('Request timeout'));
    }, 10000);
  });
}

async function testCASEvaluation() {
  const startTime = Date.now();
  
  try {
    const response = await sendMCPRequest('cas', {
      action: 'evaluate',
      expr: '2 + 3 * 4',
      vars: {}
    });
    
    const duration = Date.now() - startTime;
    
    if (response.error) {
      throw new Error(response.error.message || 'CAS evaluation failed');
    }
    
    const result = response.result;
    if (result && result.result === 14) {
      logSuccess(`CAS evaluation: 2 + 3 * 4 = ${result.result} (${duration}ms)`);
      return { success: true, duration };
    } else {
      throw new Error(`Unexpected result: ${JSON.stringify(result)}`);
    }
  } catch (error) {
    logError(`CAS evaluation failed: ${error.message}`);
    return { success: false, duration: Date.now() - startTime, error: error.message };
  }
}

async function testUnitsRoundTrip() {
  const startTime = Date.now();
  
  try {
    // Convert 1 meter to feet
    const toFeetResponse = await sendMCPRequest('units_convert', {
      quantity: { value: 1, unit: 'm' },
      to: 'ft'
    });
    
    if (toFeetResponse.error) {
      throw new Error(toFeetResponse.error.message || 'Units conversion to feet failed');
    }
    
    const feetValue = toFeetResponse.result.result;
    
    // Convert back to meters
    const toMetersResponse = await sendMCPRequest('units_convert', {
      quantity: { value: feetValue, unit: 'ft' },
      to: 'm'
    });
    
    if (toMetersResponse.error) {
      throw new Error(toMetersResponse.error.message || 'Units conversion to meters failed');
    }
    
    const metersValue = toMetersResponse.result.result;
    const duration = Date.now() - startTime;
    
    // Check round-trip accuracy (should be within 1e-9 relative error)
    const relativeError = Math.abs(metersValue - 1) / 1;
    
    if (relativeError < 1e-9) {
      logSuccess(`Units round-trip: 1m → ${feetValue.toFixed(6)}ft → ${metersValue.toFixed(9)}m (${duration}ms, rel_err: ${relativeError.toExponential(2)})`);
      return { success: true, duration, relativeError };
    } else {
      throw new Error(`Round-trip error too large: ${relativeError.toExponential(2)} > 1e-9`);
    }
  } catch (error) {
    logError(`Units round-trip failed: ${error.message}`);
    return { success: false, duration: Date.now() - startTime, error: error.message };
  }
}

async function testConstantsFetch() {
  const startTime = Date.now();
  
  try {
    const response = await sendMCPRequest('constants_get', {
      name: 'c'
    });
    
    const duration = Date.now() - startTime;
    
    if (response.error) {
      throw new Error(response.error.message || 'Constants fetch failed');
    }
    
    const result = response.result;
    if (result && result.value && result.unit && result.source) {
      logSuccess(`Constants fetch: c = ${result.value} ${result.unit} (${result.source}, ${duration}ms)`);
      return { success: true, duration, source: result.source };
    } else {
      throw new Error(`Incomplete constant data: ${JSON.stringify(result)}`);
    }
  } catch (error) {
    logError(`Constants fetch failed: ${error.message}`);
    return { success: false, duration: Date.now() - startTime, error: error.message };
  }
}

async function testPlotGeneration() {
  const startTime = Date.now();
  
  try {
    const response = await sendMCPRequest('plot', {
      plot_type: 'function_2d',
      f: 'sin(x)',
      x_range: [0, 6.28318],
      dpi: 100,
      emit_csv: false
    });
    
    const duration = Date.now() - startTime;
    
    if (response.error) {
      throw new Error(response.error.message || 'Plot generation failed');
    }
    
    const result = response.result;
    if (result && result.artifacts && result.artifacts.length > 0) {
      const plotArtifact = result.artifacts.find(a => a.type === 'image');
      if (plotArtifact) {
        logSuccess(`Plot generation: sin(x) plot created (${duration}ms, ${plotArtifact.path})`);
        return { success: true, duration, path: plotArtifact.path };
      } else {
        throw new Error('No plot artifact found in response');
      }
    } else {
      throw new Error(`No artifacts in plot response: ${JSON.stringify(result)}`);
    }
  } catch (error) {
    logError(`Plot generation failed: ${error.message}`);
    return { success: false, duration: Date.now() - startTime, error: error.message };
  }
}

async function testAccelCaps() {
  const startTime = Date.now();
  
  try {
    const response = await sendMCPRequest('accel_caps', {});
    
    const duration = Date.now() - startTime;
    
    if (response.error) {
      throw new Error(response.error.message || 'Acceleration caps failed');
    }
    
    const result = response.result;
    if (result && result.mode && result.device) {
      logSuccess(`Acceleration: ${result.mode}/${result.device} (${duration}ms)`);
      return { success: true, duration, mode: result.mode, device: result.device };
    } else {
      throw new Error(`Incomplete acceleration data: ${JSON.stringify(result)}`);
    }
  } catch (error) {
    logError(`Acceleration caps failed: ${error.message}`);
    return { success: false, duration: Date.now() - startTime, error: error.message };
  }
}

async function runHealthcheck() {
  log('🏥 Physics MCP Server Healthcheck', 'bright');
  log('', 'reset');
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: {},
    summary: {
      passed: 0,
      failed: 0,
      totalDuration: 0
    }
  };
  
  const tests = [
    { name: 'cas_evaluation', fn: testCASEvaluation },
    { name: 'units_roundtrip', fn: testUnitsRoundTrip },
    { name: 'constants_fetch', fn: testConstantsFetch },
    { name: 'plot_generation', fn: testPlotGeneration },
    { name: 'accel_caps', fn: testAccelCaps }
  ];
  
  for (const test of tests) {
    logInfo(`Running ${test.name}...`);
    const result = await test.fn();
    results.tests[test.name] = result;
    results.summary.totalDuration += result.duration;
    
    if (result.success) {
      results.summary.passed++;
    } else {
      results.summary.failed++;
    }
  }
  
  log('', 'reset');
  log('📊 Healthcheck Summary', 'bright');
  log(`Passed: ${results.summary.passed}/${tests.length}`, results.summary.failed === 0 ? 'green' : 'yellow');
  log(`Failed: ${results.summary.failed}/${tests.length}`, results.summary.failed === 0 ? 'green' : 'red');
  log(`Total Duration: ${results.summary.totalDuration}ms`, 'blue');
  
  // Save results to file
  const artifactsDir = join(rootDir, 'artifacts');
  if (!existsSync(artifactsDir)) {
    mkdirSync(artifactsDir, { recursive: true });
  }
  
  const resultsPath = join(artifactsDir, 'healthcheck-results.json');
  writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  logInfo(`Results saved to: ${resultsPath}`);
  
  // Exit with appropriate code
  if (results.summary.failed === 0) {
    logSuccess('All healthchecks passed! 🎉');
    process.exit(0);
  } else {
    logError(`${results.summary.failed} healthcheck(s) failed`);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled Rejection: ${reason}`);
  process.exit(1);
});

runHealthcheck().catch((error) => {
  logError(`Healthcheck failed: ${error.message}`);
  process.exit(1);
});
