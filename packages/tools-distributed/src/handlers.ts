/**
 * Phase 7: Distributed & Collaborative Computing Tool Handlers
 * Routes method calls to Python worker for execution
 */

import { 
  DistributedCollaborationParams, 
  DistributedCollaborationResponse,
  JobSubmitParams,
  SessionShareParams,
  LabNotebookParams,
  ArtifactVersioningParams
} from './schema.js';

import { getWorkerClient } from '../../tools-cas/dist/worker-client.js';

/**
 * Handle distributed collaboration tool calls
 * Routes to appropriate Python worker method based on the method parameter
 */
export async function handleDistributedCollaborationTool(
  toolName: string, 
  params: DistributedCollaborationParams
): Promise<DistributedCollaborationResponse> {
  
  // Legacy support: convert individual tool names to method calls
  let method = params.method;
  let actualParams = params;

  if (toolName !== 'distributed_collaboration') {
    // Handle legacy individual tool names
    const { method: _, ...restParams } = params;
    if (toolName === 'job_submit') {
      method = 'job_submit';
      actualParams = { ...restParams, method: 'job_submit' } as JobSubmitParams;
    } else if (toolName === 'session_share') {
      method = 'session_share';
      actualParams = { ...restParams, method: 'session_share' } as SessionShareParams;
    } else if (toolName === 'lab_notebook') {
      method = 'lab_notebook';
      actualParams = { ...restParams, method: 'lab_notebook' } as LabNotebookParams;
    } else if (toolName === 'artifact_versioning') {
      method = 'artifact_versioning';
      actualParams = { ...restParams, method: 'artifact_versioning' } as ArtifactVersioningParams;
    } else {
      throw new Error(`Unknown distributed collaboration tool: ${toolName}`);
    }
  }

  // Route to Python worker based on method
  const pythonMethod = `distributed_${method}`;
  
  try {
    // This will be handled by the Python worker
    // The actual implementation will be in distributed_collaboration.py
    const result = await callPythonWorker(pythonMethod, actualParams);
    return result as DistributedCollaborationResponse;
  } catch (error) {
    throw new Error(`Distributed collaboration ${method} failed: ${error}`);
  }
}

/**
 * Communicate with the shared Python worker process.
 */
async function callPythonWorker(method: string, params: any): Promise<any> {
  const worker = getWorkerClient();
  return worker.call(method, params);
}
