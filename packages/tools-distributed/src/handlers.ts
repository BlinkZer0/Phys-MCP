/**
 * Phase 7: Distributed & Collaborative Computing Tool Handlers
 * Routes method calls to Python worker for execution
 */

import { 
  DistributedCollaborationParams,
  DistributedCollaborationResponse
} from './schema.js';

import { getWorkerClient } from '../../tools-cas/dist/worker-client.js';

const SUPPORTED_DISTRIBUTED_METHODS = [
  'job_submit',
  'session_share',
  'lab_notebook',
  'artifact_versioning'
] as const;

type DistributedMethod = typeof SUPPORTED_DISTRIBUTED_METHODS[number];

const LEGACY_DISTRIBUTED_TOOL: Partial<Record<string, DistributedMethod>> = {
  job_submit: 'job_submit',
  session_share: 'session_share',
  lab_notebook: 'lab_notebook',
  artifact_versioning: 'artifact_versioning'
};

function normalizeDistributedCall(
  toolName: string,
  params: DistributedCollaborationParams
): { method: DistributedMethod; actualParams: DistributedCollaborationParams } {
  if (toolName !== 'distributed_collaboration') {
    const legacyMethod = LEGACY_DISTRIBUTED_TOOL[toolName];
    if (!legacyMethod) {
      throw new Error(`Unknown distributed collaboration tool: ${toolName}`);
    }

    const restParams = { ...params };
    delete (restParams as Partial<DistributedCollaborationParams>).method;

    return {
      method: legacyMethod,
      actualParams: { ...restParams, method: legacyMethod } as DistributedCollaborationParams
    };
  }

  const rawMethodValue = typeof params?.method === 'string' ? params.method.trim() : '';

  if (!rawMethodValue) {
    throw new Error(
      `[distributed_collaboration] Missing "method" parameter. Supported methods: ${SUPPORTED_DISTRIBUTED_METHODS.join(', ')}`
    );
  }

  // Handle both prefixed and non-prefixed method names
  let normalizedMethod = rawMethodValue;
  if (rawMethodValue.startsWith('distributed_')) {
    normalizedMethod = rawMethodValue.slice('distributed_'.length);
  }
  
  // Also handle undefined or malformed method names
  if (normalizedMethod === 'undefined' || !normalizedMethod) {
    throw new Error(
      `[distributed_collaboration] Invalid method "${rawMethodValue}". Supported methods: ${SUPPORTED_DISTRIBUTED_METHODS.join(', ')}`
    );
  }

  if (!SUPPORTED_DISTRIBUTED_METHODS.includes(normalizedMethod as DistributedMethod)) {
    throw new Error(
      `[distributed_collaboration] Unsupported method "${rawMethodValue}". Supported methods: ${SUPPORTED_DISTRIBUTED_METHODS.join(', ')}`
    );
  }

  return {
    method: normalizedMethod as DistributedMethod,
    actualParams: { ...params, method: normalizedMethod } as DistributedCollaborationParams
  };
}

/**
 * Handle distributed collaboration tool calls
 * Routes to appropriate Python worker method based on the method parameter
 */
export async function handleDistributedCollaborationTool(
  toolName: string,
  params: DistributedCollaborationParams
): Promise<DistributedCollaborationResponse> {
  const { method, actualParams } = normalizeDistributedCall(toolName, params);

  // Route to Python worker based on method
  const pythonMethod = `distributed_${method}`;

  try {
    const result = await callPythonWorker(pythonMethod, actualParams);
    return result as DistributedCollaborationResponse;
  } catch (error) {
    throw new Error(`Distributed collaboration ${method} failed: ${error}`);
  }
}

/**
 * Communicate with the shared Python worker process.
 */
async function callPythonWorker(
  method: string,
  params: DistributedCollaborationParams
): Promise<DistributedCollaborationResponse> {
  const worker = getWorkerClient();
  return worker.call(method, params) as Promise<DistributedCollaborationResponse>;
}
