/**
 * Phase 7: Distributed & Collaborative Computing Tool Package
 * Exports schemas, handlers, and tool definitions for distributed computing capabilities
 */
export * from './schema.js';
export * from './handlers.js';
import { Tool } from '@phys-mcp/mcp-types';
/**
 * Distributed Collaboration tool definition
 * Single consolidated tool with multiple distributed computing methods
 */
export declare const distributedCollaborationTool: Tool;
/**
 * Build all distributed collaboration tools (currently just the consolidated tool)
 */
export declare function buildDistributedTools(): Tool[];
/**
 * Legacy tool names for backward compatibility
 * Maps individual method names to consolidated tool calls
 */
export declare const legacyDistributedToolNames: readonly ["job_submit", "session_share", "lab_notebook", "artifact_versioning"];
export type LegacyDistributedToolName = typeof legacyDistributedToolNames[number];
