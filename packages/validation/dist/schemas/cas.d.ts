/**
 * Validation schemas for CAS (Computer Algebra System) tools
 */
import { z } from 'zod';
/**
 * CAS action types
 */
export declare const CASActionSchema: any;
/**
 * Base CAS input schema
 */
export declare const CASBaseSchema: any;
/**
 * Evaluate expression schema
 */
export declare const CASEvaluateSchema: any;
/**
 * Differentiation schema
 */
export declare const CASDiffSchema: any;
/**
 * Integration schema
 */
export declare const CASIntegrateSchema: any;
/**
 * Equation solving schema
 */
export declare const CASSolveEquationSchema: any;
/**
 * ODE solving schema
 */
export declare const CASSolveODESchema: any;
/**
 * Uncertainty propagation schema
 */
export declare const CASPropagateUncertaintySchema: any;
/**
 * Complete CAS input schema (union of all actions)
 */
export declare const CASInputSchema: any;
/**
 * Type inference
 */
export type CASInput = z.infer<typeof CASInputSchema>;
export type CASEvaluateInput = z.infer<typeof CASEvaluateSchema>;
export type CASDiffInput = z.infer<typeof CASDiffSchema>;
export type CASIntegrateInput = z.infer<typeof CASIntegrateSchema>;
export type CASSolveEquationInput = z.infer<typeof CASSolveEquationSchema>;
export type CASSolveODEInput = z.infer<typeof CASSolveODESchema>;
export type CASPropagateUncertaintyInput = z.infer<typeof CASPropagateUncertaintySchema>;
