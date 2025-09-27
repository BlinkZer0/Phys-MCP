/**
 * Phase 8: Unified Digital Physics Lab (Experiment Orchestrator) Tool Package
 * Exports schemas, handlers, and tool definitions for experiment orchestration capabilities
 */
export * from './schema.js';
export * from './handlers.js';
import { Tool } from '@phys-mcp/mcp-types';
/**
 * Experiment Orchestrator tool definition
 * Single consolidated tool with multiple experiment orchestration methods
 */
export declare const experimentOrchestratorTool: Tool;
/**
 * Build all experiment orchestrator tools (currently just the consolidated tool)
 */
export declare function buildOrchestratorTools(): Tool[];
/**
 * Legacy tool names for backward compatibility
 * Maps individual method names to consolidated tool calls
 */
export declare const legacyOrchestratorToolNames: readonly ["define_dag", "validate_dag", "run_dag", "publish_report", "collaborate_share"];
export type LegacyOrchestratorToolName = typeof legacyOrchestratorToolNames[number];
