/**
 * Validation schemas for CAS (Computer Algebra System) tools
 */
import { z } from 'zod';
/**
 * CAS action types
 */
export declare const CASActionSchema: z.ZodEnum<["evaluate", "diff", "integrate", "solve_equation", "solve_ode", "propagate_uncertainty"]>;
/**
 * Base CAS input schema
 */
export declare const CASBaseSchema: z.ZodObject<{
    action: z.ZodEnum<["evaluate", "diff", "integrate", "solve_equation", "solve_ode", "propagate_uncertainty"]>;
}, "strip", z.ZodTypeAny, {
    action: "evaluate" | "diff" | "integrate" | "solve_equation" | "solve_ode" | "propagate_uncertainty";
}, {
    action: "evaluate" | "diff" | "integrate" | "solve_equation" | "solve_ode" | "propagate_uncertainty";
}>;
/**
 * Evaluate expression schema
 */
export declare const CASEvaluateSchema: z.ZodObject<{} & {
    action: z.ZodLiteral<"evaluate">;
    expr: z.ZodString;
    vars: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodObject<{
        value: z.ZodNumber;
        unit: z.ZodString;
        sigma: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        value: number;
        unit: string;
        sigma?: number | undefined;
    }, {
        value: number;
        unit: string;
        sigma?: number | undefined;
    }>]>>>;
}, "strip", z.ZodTypeAny, {
    action: "evaluate";
    expr: string;
    vars?: Record<string, number | {
        value: number;
        unit: string;
        sigma?: number | undefined;
    }> | undefined;
}, {
    action: "evaluate";
    expr: string;
    vars?: Record<string, number | {
        value: number;
        unit: string;
        sigma?: number | undefined;
    }> | undefined;
}>;
/**
 * Differentiation schema
 */
export declare const CASDiffSchema: z.ZodObject<{} & {
    action: z.ZodLiteral<"diff">;
    expr: z.ZodString;
    symbol: z.ZodString;
    order: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    symbol: string;
    action: "diff";
    expr: string;
    order: number;
}, {
    symbol: string;
    action: "diff";
    expr: string;
    order?: number | undefined;
}>;
/**
 * Integration schema
 */
export declare const CASIntegrateSchema: z.ZodObject<{} & {
    action: z.ZodLiteral<"integrate">;
    expr: z.ZodString;
    symbol: z.ZodString;
    bounds: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
}, "strip", z.ZodTypeAny, {
    symbol: string;
    action: "integrate";
    expr: string;
    bounds?: [number, number] | undefined;
}, {
    symbol: string;
    action: "integrate";
    expr: string;
    bounds?: [number, number] | undefined;
}>;
/**
 * Equation solving schema
 */
export declare const CASSolveEquationSchema: z.ZodObject<{} & {
    action: z.ZodLiteral<"solve_equation">;
    equation: z.ZodString;
    symbol: z.ZodString;
}, "strip", z.ZodTypeAny, {
    symbol: string;
    action: "solve_equation";
    equation: string;
}, {
    symbol: string;
    action: "solve_equation";
    equation: string;
}>;
/**
 * ODE solving schema
 */
export declare const CASSolveODESchema: z.ZodObject<{} & {
    action: z.ZodLiteral<"solve_ode">;
    ode: z.ZodString;
    symbol: z.ZodString;
    func: z.ZodString;
    ics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    symbol: string;
    action: "solve_ode";
    ode: string;
    func: string;
    ics?: Record<string, number> | undefined;
}, {
    symbol: string;
    action: "solve_ode";
    ode: string;
    func: string;
    ics?: Record<string, number> | undefined;
}>;
/**
 * Uncertainty propagation schema
 */
export declare const CASPropagateUncertaintySchema: z.ZodObject<{} & {
    action: z.ZodLiteral<"propagate_uncertainty">;
    expr: z.ZodString;
    vars: z.ZodRecord<z.ZodString, z.ZodObject<{
        value: z.ZodNumber;
        unit: z.ZodOptional<z.ZodString>;
        sigma: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        sigma: number;
        unit?: string | undefined;
    }, {
        value: number;
        sigma: number;
        unit?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    action: "propagate_uncertainty";
    expr: string;
    vars: Record<string, {
        value: number;
        sigma: number;
        unit?: string | undefined;
    }>;
}, {
    action: "propagate_uncertainty";
    expr: string;
    vars: Record<string, {
        value: number;
        sigma: number;
        unit?: string | undefined;
    }>;
}>;
/**
 * Complete CAS input schema (union of all actions)
 */
export declare const CASInputSchema: z.ZodDiscriminatedUnion<"action", [z.ZodObject<{} & {
    action: z.ZodLiteral<"evaluate">;
    expr: z.ZodString;
    vars: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodObject<{
        value: z.ZodNumber;
        unit: z.ZodString;
        sigma: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        value: number;
        unit: string;
        sigma?: number | undefined;
    }, {
        value: number;
        unit: string;
        sigma?: number | undefined;
    }>]>>>;
}, "strip", z.ZodTypeAny, {
    action: "evaluate";
    expr: string;
    vars?: Record<string, number | {
        value: number;
        unit: string;
        sigma?: number | undefined;
    }> | undefined;
}, {
    action: "evaluate";
    expr: string;
    vars?: Record<string, number | {
        value: number;
        unit: string;
        sigma?: number | undefined;
    }> | undefined;
}>, z.ZodObject<{} & {
    action: z.ZodLiteral<"diff">;
    expr: z.ZodString;
    symbol: z.ZodString;
    order: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    symbol: string;
    action: "diff";
    expr: string;
    order: number;
}, {
    symbol: string;
    action: "diff";
    expr: string;
    order?: number | undefined;
}>, z.ZodObject<{} & {
    action: z.ZodLiteral<"integrate">;
    expr: z.ZodString;
    symbol: z.ZodString;
    bounds: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
}, "strip", z.ZodTypeAny, {
    symbol: string;
    action: "integrate";
    expr: string;
    bounds?: [number, number] | undefined;
}, {
    symbol: string;
    action: "integrate";
    expr: string;
    bounds?: [number, number] | undefined;
}>, z.ZodObject<{} & {
    action: z.ZodLiteral<"solve_equation">;
    equation: z.ZodString;
    symbol: z.ZodString;
}, "strip", z.ZodTypeAny, {
    symbol: string;
    action: "solve_equation";
    equation: string;
}, {
    symbol: string;
    action: "solve_equation";
    equation: string;
}>, z.ZodObject<{} & {
    action: z.ZodLiteral<"solve_ode">;
    ode: z.ZodString;
    symbol: z.ZodString;
    func: z.ZodString;
    ics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    symbol: string;
    action: "solve_ode";
    ode: string;
    func: string;
    ics?: Record<string, number> | undefined;
}, {
    symbol: string;
    action: "solve_ode";
    ode: string;
    func: string;
    ics?: Record<string, number> | undefined;
}>, z.ZodObject<{} & {
    action: z.ZodLiteral<"propagate_uncertainty">;
    expr: z.ZodString;
    vars: z.ZodRecord<z.ZodString, z.ZodObject<{
        value: z.ZodNumber;
        unit: z.ZodOptional<z.ZodString>;
        sigma: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        sigma: number;
        unit?: string | undefined;
    }, {
        value: number;
        sigma: number;
        unit?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    action: "propagate_uncertainty";
    expr: string;
    vars: Record<string, {
        value: number;
        sigma: number;
        unit?: string | undefined;
    }>;
}, {
    action: "propagate_uncertainty";
    expr: string;
    vars: Record<string, {
        value: number;
        sigma: number;
        unit?: string | undefined;
    }>;
}>]>;
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
