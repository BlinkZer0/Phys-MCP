/**
 * Validation utilities for Phys-MCP
 */
import { z } from 'zod';
import { formatZodError, ValidationError } from '../errors/index.js';
/**
 * Validate input against a Zod schema with friendly error messages
 */
export function validateInput(schema, input, toolName) {
    try {
        return schema.parse(input);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            throw formatZodError(error, toolName);
        }
        throw error;
    }
}
/**
 * Safe validation that returns result or error
 */
export function safeValidateInput(schema, input, toolName) {
    try {
        const data = validateInput(schema, input, toolName);
        return { success: true, data };
    }
    catch (error) {
        if (error instanceof ValidationError) {
            return { success: false, error };
        }
        return {
            success: false,
            error: new ValidationError(`Unexpected validation error: ${error}`, 'VALIDATION_ERROR', 'Please check your input format', undefined, { toolName })
        };
    }
}
/**
 * Convert Zod schema to JSON Schema for documentation
 */
export function zodToJsonSchema(schema) {
    // This is a simplified conversion - in production you'd use a library like zod-to-json-schema
    // For now, we'll provide a basic implementation
    if (schema instanceof z.ZodObject) {
        const shape = schema.shape;
        const properties = {};
        const required = [];
        for (const [key, value] of Object.entries(shape)) {
            properties[key] = zodToJsonSchema(value);
            // Check if field is optional
            if (!value.isOptional()) {
                required.push(key);
            }
        }
        return {
            type: 'object',
            properties,
            required: required.length > 0 ? required : undefined
        };
    }
    if (schema instanceof z.ZodString) {
        const result = { type: 'string' };
        // Add enum if present
        if (schema._def.checks) {
            for (const check of schema._def.checks) {
                if (check.kind === 'regex') {
                    result.pattern = check.regex.source;
                }
            }
        }
        return result;
    }
    if (schema instanceof z.ZodNumber) {
        const result = { type: 'number' };
        if (schema._def.checks) {
            for (const check of schema._def.checks) {
                if (check.kind === 'min') {
                    result.minimum = check.value;
                }
                if (check.kind === 'max') {
                    result.maximum = check.value;
                }
            }
        }
        return result;
    }
    if (schema instanceof z.ZodBoolean) {
        return { type: 'boolean' };
    }
    if (schema instanceof z.ZodArray) {
        return {
            type: 'array',
            items: zodToJsonSchema(schema.element)
        };
    }
    if (schema instanceof z.ZodEnum) {
        return {
            type: 'string',
            enum: schema.options
        };
    }
    if (schema instanceof z.ZodOptional) {
        return zodToJsonSchema(schema.unwrap());
    }
    if (schema instanceof z.ZodUnion) {
        return {
            anyOf: schema.options.map((option) => zodToJsonSchema(option))
        };
    }
    // Fallback for unknown types
    return { type: 'any' };
}
/**
 * Create a validation decorator for tool handlers
 */
export function withValidation(schema, toolName) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            // Assume first argument is the input to validate
            const [input, ...restArgs] = args;
            try {
                const validatedInput = validateInput(schema, input, toolName);
                return await originalMethod.call(this, validatedInput, ...restArgs);
            }
            catch (error) {
                if (error instanceof ValidationError) {
                    throw error;
                }
                throw new ValidationError(`Validation failed for ${toolName}: ${error}`, 'VALIDATION_ERROR', 'Please check your input parameters');
            }
        };
        return descriptor;
    };
}
