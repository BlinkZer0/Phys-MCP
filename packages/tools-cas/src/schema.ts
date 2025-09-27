/**
 * Type definitions and schemas for CAS (Computer Algebra System) tools
 */

export interface Quantity {
  value: number;
  unit?: string;
}

export type SymbolicExpr = string; // SymPy-compatible expression

export interface EvaluateParams {
  expr: SymbolicExpr;
  vars?: Record<string, Quantity | number>;
}

export interface DiffParams {
  expr: SymbolicExpr;
  symbol: string;
  order?: number;
}

export interface IntegrateParams {
  expr: SymbolicExpr;
  symbol: string;
  bounds?: [number, number];
}

export interface SolveEqParams {
  equation: string;
  symbol: string;
}

export interface SolveOdeParams {
  ode: string;
  symbol: string;
  func: string;
  ics?: Record<string, number>; // Initial conditions
}

export interface CASResult {
  latex: string;
  str: string;
  evalf?: number;
  original?: string;
}

export interface SolveResult {
  solutions: string[];
  latex_solutions: string[];
  count: number;
}

export interface IntegrateResult extends CASResult {
  definite: boolean;
}

// JSON Schema definitions for MCP tools
export const evaluateSchema = {
  type: "object",
  properties: {
    expr: { type: "string", description: "Mathematical expression to evaluate" },
    vars: {
      type: "object",
      description: "Variables to substitute in the expression",
      additionalProperties: {
        anyOf: [
          { type: "number" },
          {
            type: "object",
            properties: {
              value: { type: "number" },
              unit: { type: "string" }
            },
            required: ["value"]
          }
        ]
      }
    }
  },
  required: ["expr"]
} as const;

export const diffSchema = {
  type: "object",
  properties: {
    expr: { type: "string", description: "Expression to differentiate" },
    symbol: { type: "string", description: "Variable to differentiate with respect to" },
    order: { type: "integer", description: "Order of differentiation", default: 1, minimum: 1 }
  },
  required: ["expr", "symbol"]
} as const;

export const integrateSchema = {
  type: "object",
  properties: {
    expr: { type: "string", description: "Expression to integrate" },
    symbol: { type: "string", description: "Variable to integrate with respect to" },
    bounds: {
      type: "array",
      description: "Integration bounds [lower, upper] for definite integral",
      items: { type: "number" },
      minItems: 2,
      maxItems: 2
    }
  },
  required: ["expr", "symbol"]
} as const;

export const solveEquationSchema = {
  type: "object",
  properties: {
    equation: { type: "string", description: "Equation to solve (e.g., 'x^2 - 4 = 0')" },
    symbol: { type: "string", description: "Variable to solve for" }
  },
  required: ["equation", "symbol"]
} as const;

export const solveOdeSchema = {
  type: "object",
  properties: {
    ode: { type: "string", description: "Differential equation (e.g., 'y'' + y = 0')" },
    symbol: { type: "string", description: "Independent variable (e.g., 'x')" },
    func: { type: "string", description: "Dependent function name (e.g., 'y')" },
    ics: {
      type: "object",
      description: "Initial conditions",
      additionalProperties: { type: "number" }
    }
  },
  required: ["ode", "symbol", "func"]
} as const;

export const solveEquationEnhancedSchema = {
  type: "object",
  properties: {
    equation: { type: "string", description: "Equation to solve (e.g., 'x^2 - 4 = 0')" },
    symbol: { type: "string", description: "Variable to solve for" },
    assumptions: {
      type: "object",
      description: "Symbol assumptions (real, positive, negative, integer, rational)",
      additionalProperties: { type: "boolean" }
    }
  },
  required: ["equation", "symbol"]
} as const;

export const propagateUncertaintySchema = {
  type: "object",
  properties: {
    expr: { type: "string", description: "Expression for uncertainty propagation" },
    vars: {
      type: "object",
      description: "Variables with values, uncertainties, and optional units",
      additionalProperties: {
        type: "object",
        properties: {
          value: { type: "number", description: "Mean value" },
          sigma: { type: "number", description: "Standard uncertainty" },
          unit: { type: "string", description: "Optional unit" }
        },
        required: ["value", "sigma"]
      }
    }
  },
  required: ["expr", "vars"]
} as const;

// Enhanced interface definitions
export interface PropagateUncertaintyParams {
  expr: SymbolicExpr;
  vars: Record<string, {
    value: number;
    sigma: number;
    unit?: string;
  }>;
}

export interface SolveEqEnhancedParams {
  equation: string;
  symbol: string;
  assumptions?: Record<string, boolean>;
}

export interface PropagateUncertaintyResult {
  expression: string;
  mean_value: number;
  uncertainty: number;
  relative_uncertainty: number;
  result_with_uncertainty: string;
  partial_contributions: Record<string, {
    partial_derivative: string;
    partial_value: number;
    contribution: number;
  }>;
  latex: string;
}
