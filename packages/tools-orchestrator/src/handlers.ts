/**
 * Phase 8: Unified Digital Physics Lab (Experiment Orchestrator) Tool Handlers
 * Routes method calls to Python worker for execution
 */

import { 
  ExperimentOrchestratorParams, 
  ExperimentOrchestratorResponse,
  DefineDAGParams,
  ValidateDAGParams,
  RunDAGParams,
  PublishReportParams,
  CollaborateShareParams
} from './schema.js';

import { getWorkerClient } from '../../tools-cas/dist/worker-client.js';

/**
 * Handle experiment orchestrator tool calls
 * Routes to appropriate Python worker method based on the method parameter
 */
export async function handleExperimentOrchestratorTool(
  toolName: string, 
  params: ExperimentOrchestratorParams
): Promise<ExperimentOrchestratorResponse> {
  
  // Legacy support: convert individual tool names to method calls
  let method = params.method;
  let actualParams = params;

  if (toolName !== 'experiment_orchestrator') {
    // Handle legacy individual tool names
    const { method: _, ...restParams } = params;
    if (toolName === 'define_dag') {
      method = 'define_dag';
      actualParams = { ...restParams, method: 'define_dag' } as DefineDAGParams;
    } else if (toolName === 'validate_dag') {
      method = 'validate_dag';
      actualParams = { ...restParams, method: 'validate_dag' } as ValidateDAGParams;
    } else if (toolName === 'run_dag') {
      method = 'run_dag';
      actualParams = { ...restParams, method: 'run_dag' } as RunDAGParams;
    } else if (toolName === 'publish_report') {
      method = 'publish_report';
      actualParams = { ...restParams, method: 'publish_report' } as PublishReportParams;
    } else if (toolName === 'collaborate_share') {
      method = 'collaborate_share';
      actualParams = { ...restParams, method: 'collaborate_share' } as CollaborateShareParams;
    } else {
      throw new Error(`Unknown experiment orchestrator tool: ${toolName}`);
    }
  }

  // Route to Python worker based on method
  const pythonMethod = `orchestrator_${method}`;
  
  try {
    // This will be handled by the Python worker
    // The actual implementation will be in experiment_orchestrator.py
    const result = await callPythonWorker(pythonMethod, actualParams);
    return result as ExperimentOrchestratorResponse;
  } catch (error) {
    throw new Error(`Experiment orchestrator ${method} failed: ${error}`);
  }
}

/**
 * Communicate with the shared Python worker process.
 */
async function callPythonWorker(method: string, params: any): Promise<any> {
  const worker = getWorkerClient();
  return worker.call(method, params);
}
