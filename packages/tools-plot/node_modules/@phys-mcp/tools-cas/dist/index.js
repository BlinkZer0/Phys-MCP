/**
 * CAS (Computer Algebra System) tools for Physics MCP
 */
import { getWorkerClient } from "./worker-client.js";
/**
 * Build CAS tools for the MCP server
 */
export function buildCASTools() {
    const worker = getWorkerClient();
    return [
        {
            name: "cas",
            description: "Computer Algebra System operations: evaluate expressions, differentiate, integrate, solve equations and ODEs, propagate uncertainty",
            inputSchema: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        description: "CAS operation to perform",
                        enum: ["evaluate", "diff", "integrate", "solve_equation", "solve_ode", "propagate_uncertainty"]
                    },
                    expr: {
                        type: "string",
                        description: "Mathematical expression to process"
                    },
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
                                        unit: { type: "string" },
                                        sigma: { type: "number", description: "Standard uncertainty (for uncertainty propagation)" }
                                    },
                                    required: ["value"]
                                }
                            ]
                        }
                    },
                    symbol: {
                        type: "string",
                        description: "Variable to differentiate/integrate with respect to, or solve for"
                    },
                    order: {
                        type: "integer",
                        description: "Order of differentiation",
                        default: 1,
                        minimum: 1
                    },
                    bounds: {
                        type: "array",
                        description: "Integration bounds [lower, upper] for definite integral",
                        items: { type: "number" },
                        minItems: 2,
                        maxItems: 2
                    },
                    equation: {
                        type: "string",
                        description: "Equation to solve (e.g., 'x^2 - 4 = 0')"
                    },
                    ode: {
                        type: "string",
                        description: "Differential equation (e.g., 'y'' + y = 0')"
                    },
                    func: {
                        type: "string",
                        description: "Dependent function name for ODE (e.g., 'y')"
                    },
                    ics: {
                        type: "object",
                        description: "Initial conditions for ODE",
                        additionalProperties: { type: "number" }
                    }
                },
                required: ["action"]
            }
        }
    ];
}
/**
 * Handle CAS tool calls
 */
export async function handleCASTool(name, arguments_) {
    const worker = getWorkerClient();
    if (name === "cas") {
        const args = arguments_;
        const action = args.action;
        switch (action) {
            case "evaluate":
                return await worker.call("cas_evaluate", {
                    expr: args.expr,
                    vars: args.vars
                });
            case "diff":
                return await worker.call("cas_diff", {
                    expr: args.expr,
                    symbol: args.symbol,
                    order: args.order
                });
            case "integrate":
                return await worker.call("cas_integrate", {
                    expr: args.expr,
                    symbol: args.symbol,
                    bounds: args.bounds
                });
            case "solve_equation":
                return await worker.call("cas_solve_equation", {
                    equation: args.equation,
                    symbol: args.symbol
                });
            case "solve_ode":
                return await worker.call("cas_solve_ode", {
                    ode: args.ode,
                    symbol: args.symbol,
                    func: args.func,
                    ics: args.ics
                });
            case "propagate_uncertainty":
                return await worker.call("cas_propagate_uncertainty", {
                    expr: args.expr,
                    vars: args.vars
                });
            default:
                throw new Error(`Unknown CAS action: ${action}`);
        }
    }
    // Legacy support for old tool names
    switch (name) {
        case "cas_evaluate":
            return await worker.call("cas_evaluate", arguments_);
        case "cas_diff":
            return await worker.call("cas_diff", arguments_);
        case "cas_integrate":
            return await worker.call("cas_integrate", arguments_);
        case "cas_solve_equation":
            return await worker.call("cas_solve_equation", arguments_);
        case "cas_solve_ode":
            return await worker.call("cas_solve_ode", arguments_);
        case "cas_propagate_uncertainty":
            return await worker.call("cas_propagate_uncertainty", arguments_);
        default:
            throw new Error(`Unknown CAS tool: ${name}`);
    }
}
// Re-export types for convenience
export * from "./schema.js";
export { getWorkerClient, shutdownWorkerClient } from "./worker-client.js";
