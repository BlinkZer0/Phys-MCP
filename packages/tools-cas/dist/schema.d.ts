/**
 * Type definitions and schemas for CAS (Computer Algebra System) tools
 */
export interface Quantity {
    value: number;
    unit?: string;
}
export type SymbolicExpr = string;
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
    ics?: Record<string, number>;
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
export declare const evaluateSchema: {
    readonly type: "object";
    readonly properties: {
        readonly expr: {
            readonly type: "string";
            readonly description: "Mathematical expression to evaluate";
        };
        readonly vars: {
            readonly type: "object";
            readonly description: "Variables to substitute in the expression";
            readonly additionalProperties: {
                readonly anyOf: readonly [{
                    readonly type: "number";
                }, {
                    readonly type: "object";
                    readonly properties: {
                        readonly value: {
                            readonly type: "number";
                        };
                        readonly unit: {
                            readonly type: "string";
                        };
                    };
                    readonly required: readonly ["value"];
                }];
            };
        };
    };
    readonly required: readonly ["expr"];
};
export declare const diffSchema: {
    readonly type: "object";
    readonly properties: {
        readonly expr: {
            readonly type: "string";
            readonly description: "Expression to differentiate";
        };
        readonly symbol: {
            readonly type: "string";
            readonly description: "Variable to differentiate with respect to";
        };
        readonly order: {
            readonly type: "integer";
            readonly description: "Order of differentiation";
            readonly default: 1;
            readonly minimum: 1;
        };
    };
    readonly required: readonly ["expr", "symbol"];
};
export declare const integrateSchema: {
    readonly type: "object";
    readonly properties: {
        readonly expr: {
            readonly type: "string";
            readonly description: "Expression to integrate";
        };
        readonly symbol: {
            readonly type: "string";
            readonly description: "Variable to integrate with respect to";
        };
        readonly bounds: {
            readonly type: "array";
            readonly description: "Integration bounds [lower, upper] for definite integral";
            readonly items: {
                readonly type: "number";
            };
            readonly minItems: 2;
            readonly maxItems: 2;
        };
    };
    readonly required: readonly ["expr", "symbol"];
};
export declare const solveEquationSchema: {
    readonly type: "object";
    readonly properties: {
        readonly equation: {
            readonly type: "string";
            readonly description: "Equation to solve (e.g., 'x^2 - 4 = 0')";
        };
        readonly symbol: {
            readonly type: "string";
            readonly description: "Variable to solve for";
        };
    };
    readonly required: readonly ["equation", "symbol"];
};
export declare const solveOdeSchema: {
    readonly type: "object";
    readonly properties: {
        readonly ode: {
            readonly type: "string";
            readonly description: "Differential equation (e.g., 'y'' + y = 0')";
        };
        readonly symbol: {
            readonly type: "string";
            readonly description: "Independent variable (e.g., 'x')";
        };
        readonly func: {
            readonly type: "string";
            readonly description: "Dependent function name (e.g., 'y')";
        };
        readonly ics: {
            readonly type: "object";
            readonly description: "Initial conditions";
            readonly additionalProperties: {
                readonly type: "number";
            };
        };
    };
    readonly required: readonly ["ode", "symbol", "func"];
};
export declare const solveEquationEnhancedSchema: {
    readonly type: "object";
    readonly properties: {
        readonly equation: {
            readonly type: "string";
            readonly description: "Equation to solve (e.g., 'x^2 - 4 = 0')";
        };
        readonly symbol: {
            readonly type: "string";
            readonly description: "Variable to solve for";
        };
        readonly assumptions: {
            readonly type: "object";
            readonly description: "Symbol assumptions (real, positive, negative, integer, rational)";
            readonly additionalProperties: {
                readonly type: "boolean";
            };
        };
    };
    readonly required: readonly ["equation", "symbol"];
};
export declare const propagateUncertaintySchema: {
    readonly type: "object";
    readonly properties: {
        readonly expr: {
            readonly type: "string";
            readonly description: "Expression for uncertainty propagation";
        };
        readonly vars: {
            readonly type: "object";
            readonly description: "Variables with values, uncertainties, and optional units";
            readonly additionalProperties: {
                readonly type: "object";
                readonly properties: {
                    readonly value: {
                        readonly type: "number";
                        readonly description: "Mean value";
                    };
                    readonly sigma: {
                        readonly type: "number";
                        readonly description: "Standard uncertainty";
                    };
                    readonly unit: {
                        readonly type: "string";
                        readonly description: "Optional unit";
                    };
                };
                readonly required: readonly ["value", "sigma"];
            };
        };
    };
    readonly required: readonly ["expr", "vars"];
};
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
