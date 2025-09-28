/**
 * Validation middleware for Phys-MCP server
 *
 * Provides input validation using Zod schemas with friendly error messages
 */
import { validateInput, wrapError } from '@phys-mcp/validation';
import { CASInputSchema, UnitsConvertInputSchema,
// Add other schemas as they're implemented
 } from '@phys-mcp/validation';
/**
 * Tool name to schema mapping
 */
const TOOL_SCHEMAS = {
    cas: CASInputSchema,
    units_convert: UnitsConvertInputSchema,
    // Add more as schemas are implemented
};
/**
 * Validate tool input and return validated data or error
 */
export function validateToolInput(toolName, input) {
    try {
        // Check if we have a schema for this tool
        const schema = TOOL_SCHEMAS[toolName];
        if (!schema) {
            // No validation schema available - pass through
            return { success: true, data: input };
        }
        // Validate input
        const validatedData = validateInput(schema, input, toolName);
        return { success: true, data: validatedData };
    }
    catch (error) {
        return {
            success: false,
            error: wrapError(error, toolName)
        };
    }
}
/**
 * Middleware function to wrap tool handlers with validation
 */
export function withValidation(toolName, handler) {
    return (async (...args) => {
        // Assume first argument is the input to validate
        const [input, ...restArgs] = args;
        const validation = validateToolInput(toolName, input);
        if (!validation.success) {
            throw new Error(JSON.stringify(validation.error));
        }
        // Call original handler with validated input
        return await handler(validation.data, ...restArgs);
    });
}
/**
 * Create standardized error response
 */
export function createErrorResponse(error, toolName) {
    const wrappedError = wrapError(error, toolName);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify({
                    error: wrappedError,
                    tool: toolName,
                    timestamp: new Date().toISOString()
                }, null, 2),
            },
        ],
        isError: true,
    };
}
/**
 * Log structured error with context
 */
export function logStructuredError(error, context) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'error',
        tool: context.toolName,
        requestId: context.requestId,
        error: wrapError(error, context.toolName),
        // Redact large payloads unless in debug mode
        input: process.env.DEBUG_VERBOSE === '1' ? context.input : '[redacted]'
    };
    console.error(JSON.stringify(logEntry));
}
