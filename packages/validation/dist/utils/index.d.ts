/**
 * Validation utilities for Phys-MCP
 */
import { ZodSchema } from 'zod';
import { ValidationError } from '../errors/index.js';
/**
 * Validate input against a Zod schema with friendly error messages
 */
export declare function validateInput<T>(schema: ZodSchema<T>, input: unknown, toolName: string): T;
/**
 * Safe validation that returns result or error
 */
export declare function safeValidateInput<T>(schema: ZodSchema<T>, input: unknown, toolName: string): {
    success: true;
    data: T;
} | {
    success: false;
    error: ValidationError;
};
/**
 * Convert Zod schema to JSON Schema for documentation
 */
export declare function zodToJsonSchema(schema: ZodSchema): any;
/**
 * Create a validation decorator for tool handlers
 */
export declare function withValidation<T>(schema: ZodSchema<T>, toolName: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
