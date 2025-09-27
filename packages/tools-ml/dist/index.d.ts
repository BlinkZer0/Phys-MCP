/**
 * Phase 6: ML/AI Augmentation Tool Package
 * Exports schemas, handlers, and tool definitions for machine learning capabilities
 */
export * from './schema.js';
export * from './handlers.js';
import { Tool } from '@phys-mcp/mcp-types';
/**
 * ML/AI Augmentation tool definition
 * Single consolidated tool with multiple ML methods
 */
export declare const mlAugmentationTool: Tool;
/**
 * Build all ML tools (currently just the consolidated tool)
 */
export declare function buildMLTools(): Tool[];
/**
 * Legacy tool names for backward compatibility
 * Maps individual method names to consolidated tool calls
 */
export declare const legacyMLToolNames: readonly ["symbolic_regression_train", "surrogate_pde_train", "pattern_recognition_infer", "explain_derivation"];
export type LegacyMLToolName = typeof legacyMLToolNames[number];
