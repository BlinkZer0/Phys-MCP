/**
 * Type definitions and schemas for CAS (Computer Algebra System) tools
 */
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
};
export const diffSchema = {
    type: "object",
    properties: {
        expr: { type: "string", description: "Expression to differentiate" },
        symbol: { type: "string", description: "Variable to differentiate with respect to" },
        order: { type: "integer", description: "Order of differentiation", default: 1, minimum: 1 }
    },
    required: ["expr", "symbol"]
};
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
};
export const solveEquationSchema = {
    type: "object",
    properties: {
        equation: { type: "string", description: "Equation to solve (e.g., 'x^2 - 4 = 0')" },
        symbol: { type: "string", description: "Variable to solve for" }
    },
    required: ["equation", "symbol"]
};
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
};
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
};
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
};
