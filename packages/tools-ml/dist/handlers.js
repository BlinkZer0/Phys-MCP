/**
 * Phase 6: ML/AI Augmentation Tool Handlers
 * Routes ML method calls to Python worker implementations
 */
import { getWorkerClient } from "../../tools-cas/dist/worker-client.js";
const SUPPORTED_ML_METHODS = [
    'symbolic_regression_train',
    'surrogate_pde_train',
    'pattern_recognition_infer',
    'explain_derivation'
];
const WORKER_METHOD_TO_CANONICAL = {
    ml_symbolic_regression: 'symbolic_regression_train',
    ml_surrogate_pde: 'surrogate_pde_train',
    ml_pattern_recognition: 'pattern_recognition_infer',
    ml_explain_derivation: 'explain_derivation'
};
const LEGACY_TOOL_METHOD = {
    symbolic_regression_train: 'symbolic_regression_train',
    surrogate_pde_train: 'surrogate_pde_train',
    pattern_recognition_infer: 'pattern_recognition_infer',
    explain_derivation: 'explain_derivation'
};
function normalizeMLParams(toolName, rawArgs) {
    if (toolName !== 'ml_ai_augmentation') {
        const legacyMethod = LEGACY_TOOL_METHOD[toolName];
        if (!legacyMethod) {
            throw new Error(`Unknown ML tool: ${toolName}`);
        }
        return { ...rawArgs, method: legacyMethod };
    }
    const rawMethod = typeof rawArgs?.method === 'string' ? rawArgs.method.trim() : '';
    if (!rawMethod) {
        throw new Error(`[ml_ai_augmentation] Missing "method" parameter. Supported methods: ${SUPPORTED_ML_METHODS.join(', ')}`);
    }
    // Handle undefined or malformed method names
    if (rawMethod === 'undefined' || rawMethod === 'null') {
        throw new Error(`[ml_ai_augmentation] Invalid method "${rawMethod}". Supported methods: ${SUPPORTED_ML_METHODS.join(', ')}`);
    }
    const canonicalMethod = (SUPPORTED_ML_METHODS.find((method) => method === rawMethod) ??
        WORKER_METHOD_TO_CANONICAL[rawMethod]);
    if (!canonicalMethod) {
        throw new Error(`[ml_ai_augmentation] Unsupported method "${rawMethod}". Supported methods: ${SUPPORTED_ML_METHODS.join(', ')}`);
    }
    return { ...rawArgs, method: canonicalMethod };
}
/**
 * Main handler for ML/AI augmentation tool
 * Routes to appropriate method based on the method parameter
 */
export async function handleMLAugmentationTool(toolName, args) {
    const worker = getWorkerClient();
    const params = normalizeMLParams(toolName, args ?? {});
    console.log(`[ML] Handling ${params.method} request`);
    try {
        switch (params.method) {
            case 'symbolic_regression_train':
                return await handleSymbolicRegression(params, worker);
            case 'surrogate_pde_train':
                return await handleSurrogatePDE(params, worker);
            case 'pattern_recognition_infer':
                return await handlePatternRecognition(params, worker);
            case 'explain_derivation':
                return await handleExplainDerivation(params, worker);
            default:
                throw new Error('Unknown ML method');
        }
    }
    catch (error) {
        console.error(`[ML] Error in ${params.method}:`, error);
        throw error;
    }
}
/**
 * Handle symbolic regression training
 */
async function handleSymbolicRegression(params, worker) {
    console.log('[ML] Starting symbolic regression...');
    // Set defaults
    const fullParams = {
        ops: ['+', '-', '*', '/', 'sin', 'cos', 'exp', 'log', 'pow'],
        max_depth: 12,
        pop_size: 1000,
        trials: 1,
        metric: 'mse',
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
async function handleSurrogatePDE(params, worker) {
    console.log('[ML] Starting surrogate PDE training...');
    // Set defaults
    const fullParams = {
        epochs: 200,
        batch_size: 1024,
        lr: 1e-3,
        animate: false,
        fps: 24,
        format: 'mp4',
        ...params,
        problem: params.problem || 'pinn'
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
async function handlePatternRecognition(params, worker) {
    console.log('[ML] Starting pattern recognition...');
    // Set defaults
    const fullParams = {
        threshold: 0.25,
        ...params,
        task: params.task || 'detect'
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
async function handleExplainDerivation(params, worker) {
    console.log('[ML] Starting derivation explanation...');
    // Set defaults
    const fullParams = {
        audience_level: 'grad',
        assumptions: [],
        ...params,
        goal: params.goal || 'explain'
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
export function createLegacyHandlers(pythonWorker) {
    return {
        // Legacy symbolic regression handler
        async handleSymbolicRegressionTrain(params) {
            return handleSymbolicRegression({ ...params, method: 'symbolic_regression_train' }, pythonWorker);
        },
        // Legacy surrogate PDE handler
        async handleSurrogatePDETrain(params) {
            return handleSurrogatePDE({ ...params, method: 'surrogate_pde_train' }, pythonWorker);
        },
        // Legacy pattern recognition handler
        async handlePatternRecognitionInfer(params) {
            return handlePatternRecognition({ ...params, method: 'pattern_recognition_infer' }, pythonWorker);
        },
        // Legacy explain derivation handler
        async handleExplainDerivation(params) {
            return handleExplainDerivation({ ...params, method: 'explain_derivation' }, pythonWorker);
        }
    };
}
