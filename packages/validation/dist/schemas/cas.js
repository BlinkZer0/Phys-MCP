/**
 * Validation schemas for CAS (Computer Algebra System) tools
 */
import { z } from 'zod';
import { ExpressionSchema, SymbolSchema, VariablesSchema } from './common.js';
/**
 * CAS action types
 */
export const CASActionSchema = z.enum([
    'evaluate',
    'diff',
    'integrate',
    'solve_equation',
    'solve_ode',
    'propagate_uncertainty'
]).describe('CAS operation to perform');
/**
 * Base CAS input schema
 */
export const CASBaseSchema = z.object({
    action: CASActionSchema
});
/**
 * Evaluate expression schema
 */
export const CASEvaluateSchema = CASBaseSchema.extend({
    action: z.literal('evaluate'),
    expr: ExpressionSchema,
    vars: VariablesSchema.optional().describe('Variables to substitute')
});
/**
 * Differentiation schema
 */
export const CASDiffSchema = CASBaseSchema.extend({
    action: z.literal('diff'),
    expr: ExpressionSchema,
    symbol: SymbolSchema.describe('Variable to differentiate with respect to'),
    order: z.number().int().positive().default(1).describe('Order of differentiation')
});
/**
 * Integration schema
 */
export const CASIntegrateSchema = CASBaseSchema.extend({
    action: z.literal('integrate'),
    expr: ExpressionSchema,
    symbol: SymbolSchema.describe('Variable to integrate with respect to'),
    bounds: z.tuple([z.number(), z.number()]).optional()
        .describe('Integration bounds [lower, upper] for definite integral')
});
/**
 * Equation solving schema
 */
export const CASSolveEquationSchema = CASBaseSchema.extend({
    action: z.literal('solve_equation'),
    equation: z.string().min(1, 'Equation cannot be empty')
        .describe('Equation to solve (e.g., "x^2 - 4 = 0")'),
    symbol: SymbolSchema.describe('Variable to solve for')
});
/**
 * ODE solving schema
 */
export const CASSolveODESchema = CASBaseSchema.extend({
    action: z.literal('solve_ode'),
    ode: z.string().min(1, 'ODE cannot be empty')
        .describe('Differential equation (e.g., "y\'\' + y = 0")'),
    symbol: SymbolSchema.describe('Independent variable'),
    func: SymbolSchema.describe('Dependent function name (e.g., "y")'),
    ics: z.record(z.string(), z.number()).optional()
        .describe('Initial conditions for ODE')
});
/**
 * Uncertainty propagation schema
 */
export const CASPropagateUncertaintySchema = CASBaseSchema.extend({
    action: z.literal('propagate_uncertainty'),
    expr: ExpressionSchema,
    vars: z.record(z.string(), z.object({
        value: z.number().describe('Variable value'),
        unit: z.string().optional().describe('Physical unit'),
        sigma: z.number().positive().describe('Standard uncertainty')
    })).describe('Variables with uncertainties')
});
/**
 * Complete CAS input schema (union of all actions)
 */
export const CASInputSchema = z.discriminatedUnion('action', [
    CASEvaluateSchema,
    CASDiffSchema,
    CASIntegrateSchema,
    CASSolveEquationSchema,
    CASSolveODESchema,
    CASPropagateUncertaintySchema
]);
