/**
 * Validation middleware for Phys-MCP server
 *
 * Provides input validation using Zod schemas with friendly error messages
 */
/**
 * Validate tool input and return validated data or error
 */
export declare function validateToolInput(toolName: string, input: unknown): {
    success: true;
    data: any;
} | {
    success: false;
    error: any;
};
/**
 * Middleware function to wrap tool handlers with validation
 */
export declare function withValidation<T extends (...args: any[]) => Promise<any>>(toolName: string, handler: T): T;
/**
 * Create standardized error response
 */
export declare function createErrorResponse(error: any, toolName: string): {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
};
/**
 * Log structured error with context
 */
export declare function logStructuredError(error: any, context: {
    toolName: string;
    requestId?: string;
    input?: any;
}): void;
