/**
 * Standardized error handling for Phys-MCP
 */
import { ZodError } from 'zod';
export class ValidationError extends Error {
    code;
    hint;
    cause;
    details;
    constructor(message, code = 'VALIDATION_ERROR', hint, cause, details) {
        super(message);
        this.name = 'ValidationError';
        this.code = code;
        this.hint = hint;
        this.cause = cause;
        this.details = details;
    }
    toJSON() {
        return {
            code: this.code,
            message: this.message,
            hint: this.hint,
            cause: this.cause,
            details: this.details
        };
    }
}
export class UnitsError extends ValidationError {
    constructor(message, hint, details) {
        super(message, 'UNITS_ERROR', hint, undefined, details);
        this.name = 'UnitsError';
    }
}
export class ComputationError extends ValidationError {
    constructor(message, hint, cause, details) {
        super(message, 'COMPUTATION_ERROR', hint, cause, details);
        this.name = 'ComputationError';
    }
}
/**
 * Convert Zod validation errors to friendly PhysicsError format
 */
export function formatZodError(error, toolName) {
    const issues = error.issues.map(issue => {
        const path = issue.path.join('.');
        const message = issue.message;
        // Provide helpful hints based on common validation issues
        let hint;
        switch (issue.code) {
            case 'invalid_type':
                hint = `Expected ${issue.expected} but received ${issue.received}`;
                break;
            case 'invalid_enum_value':
                hint = `Valid options are: ${issue.options?.join(', ')}`;
                break;
            case 'too_small':
                hint = `Minimum value is ${issue.minimum}`;
                break;
            case 'too_big':
                hint = `Maximum value is ${issue.maximum}`;
                break;
            case 'invalid_string':
                if (issue.validation === 'regex') {
                    hint = 'String format is invalid';
                }
                break;
        }
        return {
            path,
            message,
            hint
        };
    });
    const mainIssue = issues[0];
    const message = `Invalid input for ${toolName}${mainIssue.path ? ` (${mainIssue.path})` : ''}: ${mainIssue.message}`;
    return new ValidationError(message, 'VALIDATION_ERROR', mainIssue.hint, undefined, { issues });
}
/**
 * Wrap any error in standardized format
 */
export function wrapError(error, context) {
    if (error instanceof ValidationError) {
        return error.toJSON();
    }
    if (error instanceof ZodError) {
        return formatZodError(error, context || 'tool').toJSON();
    }
    if (error instanceof Error) {
        return {
            code: 'INTERNAL_ERROR',
            message: error.message,
            cause: error.stack,
            details: context ? { context } : undefined
        };
    }
    return {
        code: 'UNKNOWN_ERROR',
        message: String(error),
        details: context ? { context } : undefined
    };
}
