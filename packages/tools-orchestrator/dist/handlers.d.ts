/**
 * Phase 8: Unified Digital Physics Lab (Experiment Orchestrator) Tool Handlers
 * Routes method calls to Python worker for execution
 */
import { ExperimentOrchestratorParams, ExperimentOrchestratorResponse } from './schema.js';
/**
 * Handle experiment orchestrator tool calls
 * Routes to appropriate Python worker method based on the method parameter
 */
export declare function handleExperimentOrchestratorTool(toolName: string, params: ExperimentOrchestratorParams): Promise<ExperimentOrchestratorResponse>;
