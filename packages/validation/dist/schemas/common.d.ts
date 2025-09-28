/**
 * Common validation schemas used across multiple tools
 */
import { z } from 'zod';
/**
 * Unit-aware value schema
 */
export declare const UnitValueSchema: z.ZodObject<{
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
}>;
/**
 * Variable substitution schema - can be number or unit-aware value
 */
export declare const VariableSchema: z.ZodUnion<[z.ZodNumber, z.ZodObject<{
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
}>]>;
/**
 * Variables object schema
 */
export declare const VariablesSchema: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodObject<{
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
}>]>>;
/**
 * Mathematical expression schema with validation
 */
export declare const ExpressionSchema: z.ZodString;
/**
 * Symbol/variable name schema
 */
export declare const SymbolSchema: z.ZodString;
/**
 * Coordinate range schema [min, max] or [min, max, steps]
 */
export declare const RangeSchema: z.ZodUnion<[z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>, z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>]>;
/**
 * 2D point schema
 */
export declare const Point2DSchema: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
/**
 * 3D point schema
 */
export declare const Point3DSchema: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
/**
 * Color schema - hex string or RGB array
 */
export declare const ColorSchema: z.ZodUnion<[z.ZodString, z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>]>;
/**
 * File path schema
 */
export declare const FilePathSchema: z.ZodString;
/**
 * URL schema
 */
export declare const UrlSchema: z.ZodString;
/**
 * Positive integer schema
 */
export declare const PositiveIntSchema: z.ZodNumber;
/**
 * Non-negative number schema
 */
export declare const NonNegativeSchema: z.ZodNumber;
/**
 * Percentage schema (0-100)
 */
export declare const PercentageSchema: z.ZodNumber;
/**
 * Matrix schema - 2D array of numbers
 */
export declare const MatrixSchema: z.ZodEffects<z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">, number[][], number[][]>;
/**
 * Complex number schema
 */
export declare const ComplexSchema: z.ZodObject<{
    real: z.ZodNumber;
    imag: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    real: number;
    imag: number;
}, {
    real: number;
    imag: number;
}>;
/**
 * Date range schema
 */
export declare const DateRangeSchema: z.ZodEffects<z.ZodObject<{
    start: z.ZodString;
    end: z.ZodString;
}, "strip", z.ZodTypeAny, {
    start: string;
    end: string;
}, {
    start: string;
    end: string;
}>, {
    start: string;
    end: string;
}, {
    start: string;
    end: string;
}>;
/**
 * Pagination schema
 */
export declare const PaginationSchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
}, {
    limit?: number | undefined;
    offset?: number | undefined;
}>;
/**
 * Sort order schema
 */
export declare const SortOrderSchema: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
