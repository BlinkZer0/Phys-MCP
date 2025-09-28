/**
 * Common validation schemas used across multiple tools
 */
import { z } from 'zod';
/**
 * Unit-aware value schema
 */
export const UnitValueSchema = z.object({
    value: z.number().describe('Numerical value'),
    unit: z.string().describe('Physical unit (e.g., "m", "kg", "s")'),
    sigma: z.number().optional().describe('Standard uncertainty for error propagation')
});
/**
 * Variable substitution schema - can be number or unit-aware value
 */
export const VariableSchema = z.union([
    z.number(),
    UnitValueSchema
]);
/**
 * Variables object schema
 */
export const VariablesSchema = z.record(z.string(), VariableSchema)
    .describe('Variables to substitute in expressions');
/**
 * Mathematical expression schema with validation
 */
export const ExpressionSchema = z.string()
    .min(1, 'Expression cannot be empty')
    .describe('Mathematical expression (e.g., "x^2 + 2*x + 1")');
/**
 * Symbol/variable name schema
 */
export const SymbolSchema = z.string()
    .min(1, 'Symbol cannot be empty')
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Symbol must be a valid variable name')
    .describe('Variable or symbol name');
/**
 * Coordinate range schema [min, max] or [min, max, steps]
 */
export const RangeSchema = z.union([
    z.tuple([z.number(), z.number()]).describe('Range [min, max]'),
    z.tuple([z.number(), z.number(), z.number()]).describe('Range [min, max, steps]')
]);
/**
 * 2D point schema
 */
export const Point2DSchema = z.tuple([z.number(), z.number()])
    .describe('2D point [x, y]');
/**
 * 3D point schema
 */
export const Point3DSchema = z.tuple([z.number(), z.number(), z.number()])
    .describe('3D point [x, y, z]');
/**
 * Color schema - hex string or RGB array
 */
export const ColorSchema = z.union([
    z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be hex format (#RRGGBB)'),
    z.tuple([z.number().min(0).max(255), z.number().min(0).max(255), z.number().min(0).max(255)])
        .describe('RGB color [r, g, b]')
]);
/**
 * File path schema
 */
export const FilePathSchema = z.string()
    .min(1, 'File path cannot be empty')
    .describe('File system path');
/**
 * URL schema
 */
export const UrlSchema = z.string()
    .url('Must be a valid URL')
    .describe('HTTP/HTTPS URL');
/**
 * Positive integer schema
 */
export const PositiveIntSchema = z.number()
    .int('Must be an integer')
    .positive('Must be positive');
/**
 * Non-negative number schema
 */
export const NonNegativeSchema = z.number()
    .nonnegative('Must be non-negative');
/**
 * Percentage schema (0-100)
 */
export const PercentageSchema = z.number()
    .min(0, 'Percentage must be at least 0')
    .max(100, 'Percentage must be at most 100')
    .describe('Percentage value (0-100)');
/**
 * Matrix schema - 2D array of numbers
 */
export const MatrixSchema = z.array(z.array(z.number()))
    .min(1, 'Matrix must have at least one row')
    .refine((matrix) => matrix.every(row => row.length === matrix[0].length), 'All matrix rows must have the same length')
    .describe('2D matrix as array of arrays');
/**
 * Complex number schema
 */
export const ComplexSchema = z.object({
    real: z.number().describe('Real part'),
    imag: z.number().describe('Imaginary part')
}).describe('Complex number');
/**
 * Date range schema
 */
export const DateRangeSchema = z.object({
    start: z.string().datetime().describe('Start date (ISO format)'),
    end: z.string().datetime().describe('End date (ISO format)')
}).refine((data) => new Date(data.start) < new Date(data.end), 'Start date must be before end date');
/**
 * Pagination schema
 */
export const PaginationSchema = z.object({
    limit: z.number().int().min(1).max(1000).default(10).describe('Maximum number of results'),
    offset: z.number().int().nonnegative().default(0).describe('Number of results to skip')
});
/**
 * Sort order schema
 */
export const SortOrderSchema = z.enum(['asc', 'desc']).default('asc')
    .describe('Sort order: ascending or descending');
