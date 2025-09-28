/**
 * Phase 8: Unified Digital Physics Lab (Experiment Orchestrator) Tool Handlers
 * Routes method calls to Python worker for execution
 */
import { getWorkerClient } from '../../tools-cas/dist/worker-client.js';
const SUPPORTED_ORCHESTRATOR_METHODS = [
    'define_dag',
    'validate_dag',
    'run_dag',
    'publish_report',
    'collaborate_share'
];
const LEGACY_ORCHESTRATOR_TOOL = {
    define_dag: 'define_dag',
    validate_dag: 'validate_dag',
    run_dag: 'run_dag',
    publish_report: 'publish_report',
    collaborate_share: 'collaborate_share'
};
function normalizeOrchestratorCall(toolName, params) {
    if (toolName !== 'experiment_orchestrator') {
        const legacyMethod = LEGACY_ORCHESTRATOR_TOOL[toolName];
        if (!legacyMethod) {
            throw new Error(`Unknown experiment orchestrator tool: ${toolName}`);
        }
        const { method: _ignored, ...restParams } = params;
        return {
            method: legacyMethod,
            actualParams: { ...restParams, method: legacyMethod }
        };
    }
    const rawMethodValue = typeof params?.method === 'string' ? params.method.trim() : '';
    if (!rawMethodValue) {
        throw new Error(`[experiment_orchestrator] Missing "method" parameter. Supported methods: ${SUPPORTED_ORCHESTRATOR_METHODS.join(', ')}`);
    }
    // Handle both prefixed and non-prefixed method names
    let normalizedMethod = rawMethodValue;
    if (rawMethodValue.startsWith('orchestrator_')) {
        normalizedMethod = rawMethodValue.slice('orchestrator_'.length);
    }
    // Also handle undefined or malformed method names
    if (normalizedMethod === 'undefined' || !normalizedMethod) {
        throw new Error(`[experiment_orchestrator] Invalid method "${rawMethodValue}". Supported methods: ${SUPPORTED_ORCHESTRATOR_METHODS.join(', ')}`);
    }
    if (!SUPPORTED_ORCHESTRATOR_METHODS.includes(normalizedMethod)) {
        throw new Error(`[experiment_orchestrator] Unsupported method "${rawMethodValue}". Supported methods: ${SUPPORTED_ORCHESTRATOR_METHODS.join(', ')}`);
    }
    return {
        method: normalizedMethod,
        actualParams: { ...params, method: normalizedMethod }
    };
}
/**
 * Handle experiment orchestrator tool calls
 * Routes to appropriate Python worker method based on the method parameter
 */
export async function handleExperimentOrchestratorTool(toolName, params) {
    const { method, actualParams } = normalizeOrchestratorCall(toolName, params);
    // Route to Python worker based on method
    const pythonMethod = `orchestrator_${method}`;
    try {
        const result = await callPythonWorker(pythonMethod, actualParams);
        return result;
    }
    catch (error) {
        throw new Error(`Experiment orchestrator ${method} failed: ${error}`);
    }
}
/**
 * Communicate with the shared Python worker process.
 */
async function callPythonWorker(method, params) {
    const worker = getWorkerClient();
    return worker.call(method, params);
}
