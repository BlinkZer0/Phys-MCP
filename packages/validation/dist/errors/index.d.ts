/**
 * Standardized error handling for Phys-MCP
 */
import { ZodError } from 'zod';
export interface PhysicsError {
    code: string;
    message: string;
    hint?: string;
    cause?: string;
    details?: Record<string, any>;
}
export declare class ValidationError extends Error implements PhysicsError {
    readonly code: string;
    readonly hint?: string;
    readonly cause?: string;
    readonly details?: Record<string, any>;
    constructor(message: string, code?: string, hint?: string, cause?: string, details?: Record<string, any>);
    toJSON(): PhysicsError;
}
export declare class UnitsError extends ValidationError {
    constructor(message: string, hint?: string, details?: Record<string, any>);
}
export declare class ComputationError extends ValidationError {
    constructor(message: string, hint?: string, cause?: string, details?: Record<string, any>);
}
/**
 * Convert Zod validation errors to friendly PhysicsError format
 */
export declare function formatZodError(error: ZodError, toolName: string): ValidationError;
/**
 * Wrap any error in standardized format
 */
export declare function wrapError(error: unknown, context?: string): PhysicsError;
