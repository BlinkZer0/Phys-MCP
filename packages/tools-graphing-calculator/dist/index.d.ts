import { Tool } from '@phys-mcp/mcp-types';
/**
 * Comprehensive Graphing Calculator Tool
 *
 * Provides all the functionality of a modern graphing calculator including:
 * - Basic arithmetic and algebraic operations
 * - Computer Algebra System (CAS) operations
 * - 2D graphing (function, parametric, polar, implicit)
 * - Matrix operations and linear algebra
 * - Statistical analysis and regression
 * - Equation solving (numerical and symbolic)
 * - Calculus operations (derivatives, integrals, limits)
 * - Data analysis and list operations
 * - Variable storage and programming
 * - Unit conversions and financial calculations
 */
export declare const graphingCalculatorTool: Tool;
/**
 * Handle graphing calculator operations
 */
export declare function handleGraphingCalculatorTool(params: any): Promise<any>;
export declare const buildGraphingCalculatorTools: () => Tool[];
export default graphingCalculatorTool;
