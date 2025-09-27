/**
 * CAS (Computer Algebra System) tools for Physics MCP
 */
import { getWorkerClient } from "./worker-client.js";
import { evaluateSchema, diffSchema, integrateSchema, solveEquationSchema, solveOdeSchema, propagateUncertaintySchema, } from "./schema.js";
/**
 * Build CAS tools for the MCP server
 */
export function buildCASTools() {
    const worker = getWorkerClient();
    return [
        {
            name: "cas_evaluate",
            description: "Evaluate a symbolic or numeric mathematical expression with optional variables and units",
            inputSchema: evaluateSchema,
        },
        {
            name: "cas_diff",
            description: "Differentiate a mathematical expression with respect to a variable",
            inputSchema: diffSchema,
        },
        {
            name: "cas_integrate",
            description: "Integrate a mathematical expression (definite or indefinite)",
            inputSchema: integrateSchema,
        },
        {
            name: "cas_solve_equation",
            description: "Solve an algebraic equation for a variable",
            inputSchema: solveEquationSchema,
        },
        {
            name: "cas_solve_ode",
            description: "Solve an ordinary differential equation",
            inputSchema: solveOdeSchema,
        },
        {
            name: "cas_propagate_uncertainty",
            description: "Propagate uncertainty through an expression using linear approximation",
            inputSchema: propagateUncertaintySchema,
        },
    ];
}
/**
 * Handle CAS tool calls
 */
export async function handleCASTool(name, arguments_) {
    const worker = getWorkerClient();
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
