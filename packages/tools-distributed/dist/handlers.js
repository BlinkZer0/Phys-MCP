/**
 * Phase 7: Distributed & Collaborative Computing Tool Handlers
 * Routes method calls to Python worker for execution
 */
import { getWorkerClient } from '../../tools-cas/dist/worker-client.js';
const SUPPORTED_DISTRIBUTED_METHODS = [
    'job_submit',
    'session_share',
    'lab_notebook',
    'artifact_versioning'
];
const LEGACY_DISTRIBUTED_TOOL = {
    job_submit: 'job_submit',
    session_share: 'session_share',
    lab_notebook: 'lab_notebook',
    artifact_versioning: 'artifact_versioning'
};
function normalizeDistributedCall(toolName, params) {
    if (toolName !== 'distributed_collaboration') {
        const legacyMethod = LEGACY_DISTRIBUTED_TOOL[toolName];
        if (!legacyMethod) {
            throw new Error(`Unknown distributed collaboration tool: ${toolName}`);
        }
        const restParams = { ...params };
        delete restParams.method;
        return {
            method: legacyMethod,
            actualParams: { ...restParams, method: legacyMethod }
        };
    }
    const rawMethodValue = typeof params?.method === 'string' ? params.method.trim() : '';
    if (!rawMethodValue) {
        throw new Error(`[distributed_collaboration] Missing "method" parameter. Supported methods: ${SUPPORTED_DISTRIBUTED_METHODS.join(', ')}`);
    }
    // Handle both prefixed and non-prefixed method names
    let normalizedMethod = rawMethodValue;
    if (rawMethodValue.startsWith('distributed_')) {
        normalizedMethod = rawMethodValue.slice('distributed_'.length);
    }
    // Also handle undefined or malformed method names
    if (normalizedMethod === 'undefined' || !normalizedMethod) {
        throw new Error(`[distributed_collaboration] Invalid method "${rawMethodValue}". Supported methods: ${SUPPORTED_DISTRIBUTED_METHODS.join(', ')}`);
    }
    if (!SUPPORTED_DISTRIBUTED_METHODS.includes(normalizedMethod)) {
        throw new Error(`[distributed_collaboration] Unsupported method "${rawMethodValue}". Supported methods: ${SUPPORTED_DISTRIBUTED_METHODS.join(', ')}`);
    }
    return {
        method: normalizedMethod,
        actualParams: { ...params, method: normalizedMethod }
    };
}
/**
 * Handle distributed collaboration tool calls
 * Routes to appropriate Python worker method based on the method parameter
 */
export async function handleDistributedCollaborationTool(toolName, params) {
    const { method, actualParams } = normalizeDistributedCall(toolName, params);
    // Route to Python worker based on method
    const pythonMethod = `distributed_${method}`;
    try {
        const result = await callPythonWorker(pythonMethod, actualParams);
        return result;
    }
    catch (error) {
        throw new Error(`Distributed collaboration ${method} failed: ${error}`);
    }
}
/**
 * Communicate with the shared Python worker process.
 */
async function callPythonWorker(method, params) {
    const worker = getWorkerClient();
    return worker.call(method, params);
}
