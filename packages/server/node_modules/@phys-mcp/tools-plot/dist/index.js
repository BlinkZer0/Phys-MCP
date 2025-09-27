/**
 * Plotting tools for Physics MCP
 */
import { getWorkerClient } from "../../tools-cas/dist/worker-client.js";
import { function2DSchema, parametric2DSchema, field2DSchema, phasePortraitSchema, surface3DSchema, contour2DSchema, } from "./schema.js";
// Minimal schema for accel_caps
const accelCapsSchema = {
    type: "object",
    properties: {},
    additionalProperties: false,
};
/**
 * Build plotting tools for the MCP server
 */
export function buildPlotTools() {
    return [
        {
            name: "plot_function_2d",
            description: "Plot a 2D function f(x) over a specified range",
            inputSchema: function2DSchema,
        },
        {
            name: "plot_parametric_2d",
            description: "Plot a 2D parametric curve x(t), y(t)",
            inputSchema: parametric2DSchema,
        },
        {
            name: "plot_field_2d",
            description: "Plot a 2D vector field using quiver or streamline plots",
            inputSchema: field2DSchema,
        },
        {
            name: "plot_phase_portrait",
            description: "Plot a phase portrait for a 2D dynamical system",
            inputSchema: phasePortraitSchema,
        },
        {
            name: "plot_surface_3d",
            description: "Plot a 3D surface z = f(x,y)",
            inputSchema: surface3DSchema,
        },
        {
            name: "plot_contour_2d",
            description: "Plot 2D contour lines of a function f(x,y)",
            inputSchema: contour2DSchema,
        },
        {
            name: "accel_caps",
            description: "Report device acceleration capabilities and mode (ACCEL_MODE/ACCEL_DEVICE)",
            inputSchema: accelCapsSchema,
        },
    ];
}
/**
 * Handle plotting tool calls
 */
export async function handlePlotTool(name, arguments_) {
    const worker = getWorkerClient();
    switch (name) {
        case "plot_function_2d":
            return await worker.call("plot_function_2d", arguments_);
        case "plot_parametric_2d":
            return await worker.call("plot_parametric_2d", arguments_);
        case "plot_field_2d":
            return await worker.call("plot_field_2d", arguments_);
        case "plot_phase_portrait":
            return await worker.call("plot_phase_portrait", arguments_);
        case "plot_surface_3d":
            return await worker.call("plot_surface_3d", arguments_);
        case "plot_contour_2d":
            return await worker.call("plot_contour_2d", arguments_);
        case "accel_caps":
            return await worker.call("accel_caps", {});
        default:
            throw new Error(`Unknown plot tool: ${name}`);
    }
}
// Re-export types for convenience
export * from "./schema.js";
