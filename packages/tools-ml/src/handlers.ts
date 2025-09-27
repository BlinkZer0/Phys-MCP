/**
 * Phase 6: ML/AI Augmentation Tool Handlers
 * Routes ML method calls to Python worker implementations
 */

import { getWorkerClient } from "../../tools-cas/dist/worker-client.js";
import { 
  MLAugmentationParams, 
  MLAugmentationResponse,
  SymbolicRegressionParams,
  SurrogatePDEParams,
  PatternRecognitionParams,
  ExplainDerivationParams
} from './schema.js';

/**
 * Main handler for ML/AI augmentation tool
 * Routes to appropriate method based on the method parameter
 */
export async function handleMLAugmentationTool(
  toolName: string,
  args: any
): Promise<MLAugmentationResponse> {
  const worker = getWorkerClient();
  
  // Handle legacy individual tool names by converting to consolidated format
  let params: MLAugmentationParams;
  
  if (toolName === 'symbolic_regression_train') {
    params = { method: 'symbolic_regression_train', ...args };
  } else if (toolName === 'surrogate_pde_train') {
    params = { method: 'surrogate_pde_train', ...args };
  } else if (toolName === 'pattern_recognition_infer') {
    params = { method: 'pattern_recognition_infer', ...args };
  } else if (toolName === 'explain_derivation') {
    params = { method: 'explain_derivation', ...args };
  } else if (toolName === 'ml_ai_augmentation') {
    params = args as MLAugmentationParams;
  } else {
    throw new Error(`Unknown ML tool: ${toolName}`);
  }
  console.log(`[ML] Handling ${params.method} request`);
  
  try {
    switch (params.method) {
      case 'symbolic_regression_train':
        return await handleSymbolicRegression(params as SymbolicRegressionParams, worker);
      
      case 'surrogate_pde_train':
        return await handleSurrogatePDE(params as SurrogatePDEParams, worker);
      
      case 'pattern_recognition_infer':
        return await handlePatternRecognition(params as PatternRecognitionParams, worker);
      
      case 'explain_derivation':
        return await handleExplainDerivation(params as ExplainDerivationParams, worker);
      
      default:
        throw new Error(`Unknown ML method: ${(params as any).method}`);
    }
  } catch (error) {
    console.error(`[ML] Error in ${params.method}:`, error);
    throw error;
  }
}

/**
 * Handle symbolic regression training
 */
async function handleSymbolicRegression(
  params: SymbolicRegressionParams,
  worker: any
): Promise<MLAugmentationResponse> {
  console.log('[ML] Starting symbolic regression...');
  
  // Set defaults
  const fullParams = {
    ops: ['+', '-', '*', '/', 'sin', 'cos', 'exp', 'log', 'pow'],
    max_depth: 12,
    pop_size: 1000,
    trials: 1,
    metric: 'mse' as const,
    seed: 0,
    use_pysr: true,
    ...params
  };
  
  // Call Python worker
  const result = await worker.call('ml_symbolic_regression', fullParams);
  
  console.log('[ML] Symbolic regression completed');
  return result;
}

/**
 * Handle surrogate PDE training
 */
async function handleSurrogatePDE(
  params: SurrogatePDEParams,
  worker: any
): Promise<MLAugmentationResponse> {
  console.log('[ML] Starting surrogate PDE training...');
  
  // Set defaults
  const fullParams = {
    epochs: 200,
    batch_size: 1024,
    lr: 1e-3,
    animate: false,
    fps: 24,
    format: 'mp4' as const,
    ...params,
    problem: params.problem || 'pinn' as const
  };
  
  // Validate domain specification
  if (!fullParams.domain || Object.keys(fullParams.domain).length === 0) {
    throw new Error('Domain specification is required for PDE surrogate training');
  }
  
  // Call Python worker
  const result = await worker.call('ml_surrogate_pde', fullParams);
  
  console.log('[ML] Surrogate PDE training completed');
  return result;
}

/**
 * Handle pattern recognition inference
 */
async function handlePatternRecognition(
  params: PatternRecognitionParams,
  worker: any
): Promise<MLAugmentationResponse> {
  console.log('[ML] Starting pattern recognition...');
  
  // Set defaults
  const fullParams = {
    threshold: 0.25,
    ...params,
    task: params.task || 'detect' as const
  };
  
  // Validate inputs
  if (!fullParams.images || fullParams.images.length === 0) {
    throw new Error('At least one image is required for pattern recognition');
  }
  
  if (!fullParams.model) {
    throw new Error('Model specification is required for pattern recognition');
  }
  
  // Call Python worker
  const result = await worker.call('ml_pattern_recognition', fullParams);
  
  console.log('[ML] Pattern recognition completed');
  return result;
}

/**
 * Handle derivation explanation
 */
async function handleExplainDerivation(
  params: ExplainDerivationParams,
  worker: any
): Promise<MLAugmentationResponse> {
  console.log('[ML] Starting derivation explanation...');
  
  // Set defaults
  const fullParams = {
    audience_level: 'grad' as const,
    assumptions: [],
    ...params,
    goal: params.goal || 'explain' as const
  };
  
  // Call Python worker
  const result = await worker.call('ml_explain_derivation', fullParams);
  
  console.log('[ML] Derivation explanation completed');
  return result;
}

/**
 * Legacy support for individual method calls
 * Maintains backward compatibility if individual tools were used
 */
export function createLegacyHandlers(pythonWorker: any) {
  return {
    // Legacy symbolic regression handler
    async handleSymbolicRegressionTrain(params: Omit<SymbolicRegressionParams, 'method'>) {
      return handleSymbolicRegression({ ...params, method: 'symbolic_regression_train' }, pythonWorker);
    },
    
    // Legacy surrogate PDE handler
    async handleSurrogatePDETrain(params: Omit<SurrogatePDEParams, 'method'>) {
      return handleSurrogatePDE({ ...params, method: 'surrogate_pde_train' }, pythonWorker);
    },
    
    // Legacy pattern recognition handler
    async handlePatternRecognitionInfer(params: Omit<PatternRecognitionParams, 'method'>) {
      return handlePatternRecognition({ ...params, method: 'pattern_recognition_infer' }, pythonWorker);
    },
    
    // Legacy explain derivation handler
    async handleExplainDerivation(params: Omit<ExplainDerivationParams, 'method'>) {
      return handleExplainDerivation({ ...params, method: 'explain_derivation' }, pythonWorker);
    }
  };
}
