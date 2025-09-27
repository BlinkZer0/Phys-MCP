/**
 * Phase 7: Distributed & Collaborative Computing Tool Handlers
 * Routes method calls to Python worker for execution
 */
import { DistributedCollaborationParams, DistributedCollaborationResponse } from './schema.js';
/**
 * Handle distributed collaboration tool calls
 * Routes to appropriate Python worker method based on the method parameter
 */
export declare function handleDistributedCollaborationTool(toolName: string, params: DistributedCollaborationParams): Promise<DistributedCollaborationResponse>;
