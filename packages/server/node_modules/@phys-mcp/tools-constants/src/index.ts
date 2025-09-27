/**
 * Constants Tools for Physics MCP Server
 * 
 * Provides access to physical constants from CODATA and astrophysical sources.
 */

import { spawn, ChildProcess } from 'child_process';
import { ConstantsGetSchema } from './schema.js';

export interface Tool {
  name: string;
  description: string;
  inputSchema: any;
}

let workerProcess: ChildProcess | null = null;
let requestId = 0;

/**
 * Initialize the Python worker process
 */
function initWorkerProcess(): ChildProcess {
  if (workerProcess) {
    return workerProcess;
  }

  const pythonPath = process.env.PYTHON_PATH || 'python';
  const workerPath = '../python-worker/worker.py';
  
  workerProcess = spawn(pythonPath, [workerPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: process.cwd()
  });

  workerProcess.on('error', (error) => {
    console.error('Python worker error:', error);
    workerProcess = null;
  });

  workerProcess.on('exit', (code) => {
    console.error(`Python worker exited with code ${code}`);
    workerProcess = null;
  });

  return workerProcess;
}

/**
 * Send a request to the Python worker and get the response
 */
async function callWorker(method: string, params: any): Promise<any> {
  const worker = initWorkerProcess();
  
  return new Promise((resolve, reject) => {
    const id = ++requestId;
    const request = {
      id,
      method,
      params
    };

    let responseData = '';
    
    const onData = (data: Buffer) => {
      responseData += data.toString();
      
      // Check if we have a complete JSON response
      const lines = responseData.split('\n');
      for (const line of lines) {
        if (line.trim()) {
          try {
            const response = JSON.parse(line);
            if (response.id === id) {
              worker.stdout?.off('data', onData);
              
              if (response.error) {
                reject(new Error(response.error.message));
              } else {
                resolve(response.result);
              }
              return;
            }
          } catch (e) {
            // Not a complete JSON yet, continue
          }
        }
      }
    };

    worker.stdout?.on('data', onData);
    
    // Send request
    worker.stdin?.write(JSON.stringify(request) + '\n');
    
    // Timeout after 30 seconds
    setTimeout(() => {
      worker.stdout?.off('data', onData);
      reject(new Error('Request timeout'));
    }, 30000);
  });
}

/**
 * Build the list of available constants tools
 */
export function buildConstantsTools(): Tool[] {
  return [
    {
      name: "constants_get",
      description: "Get a physical constant by name. Available constants include CODATA values (c, h, hbar, e, m_e, m_p, k_B, N_A, epsilon_0, mu_0, G, R, sigma, a_0, alpha) and astrophysical constants (M_sun, pc, ly, au).",
      inputSchema: ConstantsGetSchema
    }
  ];
}

/**
 * Handle constants tool calls
 */
export async function handleConstantsTool(name: string, args: any): Promise<any> {
  switch (name) {
    case "constants_get":
      return await callWorker("constants_get", args);
    
    default:
      throw new Error(`Unknown constants tool: ${name}`);
  }
}

/**
 * Shutdown the worker process
 */
export function shutdownWorkerClient(): void {
  if (workerProcess) {
    workerProcess.kill();
    workerProcess = null;
  }
}
