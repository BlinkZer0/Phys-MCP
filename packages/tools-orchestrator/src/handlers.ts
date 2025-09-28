/**
 * Phase 8: Unified Digital Physics Lab (Experiment Orchestrator) Tool Handlers
 * Routes method calls to Python worker for execution
 */

import { 
  ExperimentOrchestratorParams,
  ExperimentOrchestratorResponse
} from './schema.js';

import { getWorkerClient } from '../../tools-cas/dist/worker-client.js';

const SUPPORTED_ORCHESTRATOR_METHODS = [
  'define_dag',
  'validate_dag',
  'run_dag',
  'publish_report',
  'collaborate_share'
] as const;

type OrchestratorMethod = typeof SUPPORTED_ORCHESTRATOR_METHODS[number];

const LEGACY_ORCHESTRATOR_TOOL: Partial<Record<string, OrchestratorMethod>> = {
  define_dag: 'define_dag',
  validate_dag: 'validate_dag',
  run_dag: 'run_dag',
  publish_report: 'publish_report',
  collaborate_share: 'collaborate_share'
};

function normalizeOrchestratorCall(
  toolName: string,
  params: ExperimentOrchestratorParams
): { method: OrchestratorMethod; actualParams: ExperimentOrchestratorParams } {
  if (toolName !== 'experiment_orchestrator') {
    const legacyMethod = LEGACY_ORCHESTRATOR_TOOL[toolName];
    if (!legacyMethod) {
      throw new Error(`Unknown experiment orchestrator tool: ${toolName}`);
    }

    const restParams = { ...params };
    delete (restParams as Partial<ExperimentOrchestratorParams>).method;

    return {
      method: legacyMethod,
      actualParams: { ...restParams, method: legacyMethod } as ExperimentOrchestratorParams
    };
  }

  const rawMethodValue = typeof params?.method === 'string' ? params.method.trim() : '';

  if (!rawMethodValue) {
    throw new Error(
      `[experiment_orchestrator] Missing "method" parameter. Supported methods: ${SUPPORTED_ORCHESTRATOR_METHODS.join(', ')}`
    );
  }

  // Handle both prefixed and non-prefixed method names
  let normalizedMethod = rawMethodValue;
  if (rawMethodValue.startsWith('orchestrator_')) {
    normalizedMethod = rawMethodValue.slice('orchestrator_'.length);
  }
  
  // Also handle undefined or malformed method names
  if (normalizedMethod === 'undefined' || !normalizedMethod) {
    throw new Error(
      `[experiment_orchestrator] Invalid method "${rawMethodValue}". Supported methods: ${SUPPORTED_ORCHESTRATOR_METHODS.join(', ')}`
    );
  }

  if (!SUPPORTED_ORCHESTRATOR_METHODS.includes(normalizedMethod as OrchestratorMethod)) {
    throw new Error(
      `[experiment_orchestrator] Unsupported method "${rawMethodValue}". Supported methods: ${SUPPORTED_ORCHESTRATOR_METHODS.join(', ')}`
    );
  }

  return {
    method: normalizedMethod as OrchestratorMethod,
    actualParams: { ...params, method: normalizedMethod } as ExperimentOrchestratorParams
  };
}

/**
 * Handle experiment orchestrator tool calls
 * Routes to appropriate Python worker method based on the method parameter
 */
export async function handleExperimentOrchestratorTool(
  toolName: string,
  params: ExperimentOrchestratorParams
): Promise<ExperimentOrchestratorResponse> {
  const { method, actualParams } = normalizeOrchestratorCall(toolName, params);

  // Route to Python worker based on method
  const pythonMethod = `orchestrator_${method}`;

  try {
    const result = await callPythonWorker(pythonMethod, actualParams);
    return result as ExperimentOrchestratorResponse;
  } catch (error) {
    throw new Error(`Experiment orchestrator ${method} failed: ${error}`);
  }
}

/**
 * Communicate with the shared Python worker process.
 */
async function callPythonWorker(
  method: string,
  params: ExperimentOrchestratorParams
): Promise<ExperimentOrchestratorResponse> {
  const worker = getWorkerClient();
  return worker.call(method, params) as Promise<ExperimentOrchestratorResponse>;
}
