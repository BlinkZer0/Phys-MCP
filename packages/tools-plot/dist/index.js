/**
 * Plotting tools for Physics MCP
 */
import { getWorkerClient } from "../../tools-cas/dist/worker-client.js";
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
            name: "plot",
            description: "Generate various types of plots: 2D functions, parametric curves, vector fields, phase portraits, 3D surfaces, contour plots, volume visualizations, animations, interactive plots",
            inputSchema: {
                type: "object",
                properties: {
                    plot_type: {
                        type: "string",
                        description: "Type of plot to generate",
                        enum: ["function_2d", "parametric_2d", "field_2d", "phase_portrait", "surface_3d", "contour_2d", "volume_3d", "animation", "interactive"]
                    },
                    // Function expressions
                    f: { type: "string", description: "Function expression f(x) or f(x,y)" },
                    x_t: { type: "string", description: "Parametric x(t) expression" },
                    y_t: { type: "string", description: "Parametric y(t) expression" },
                    fx: { type: "string", description: "X-component of vector field F_x(x,y)" },
                    fy: { type: "string", description: "Y-component of vector field F_y(x,y)" },
                    dx: { type: "string", description: "dx/dt expression for dynamical system" },
                    dy: { type: "string", description: "dy/dt expression for dynamical system" },
                    // Range parameters
                    x_min: { type: "number", description: "Minimum x value" },
                    x_max: { type: "number", description: "Maximum x value" },
                    y_min: { type: "number", description: "Minimum y value" },
                    y_max: { type: "number", description: "Maximum y value" },
                    t_min: { type: "number", description: "Minimum parameter value" },
                    t_max: { type: "number", description: "Maximum parameter value" },
                    // Phase 5: Advanced range parameters
                    x: { type: "array", items: { type: "number" }, minItems: 2, maxItems: 3, description: "[min,max,steps?]" },
                    y: { type: "array", items: { type: "number" }, minItems: 2, maxItems: 3 },
                    z: { type: "array", items: { type: "number" }, minItems: 2, maxItems: 3 },
                    x_range: { type: "array", items: { type: "number" }, minItems: 2, maxItems: 3 },
                    t_range: { type: "array", items: { type: "number" }, minItems: 2, maxItems: 3 },
                    // Sampling and display options
                    samples: { type: "integer", description: "Number of sample points", default: 1000, minimum: 10 },
                    grid_points: { type: "integer", description: "Grid points per axis", default: 20, minimum: 5 },
                    levels: { type: "integer", description: "Number of contour levels", default: 15, minimum: 5 },
                    plot_type_field: {
                        type: "string",
                        description: "Type of field plot",
                        enum: ["quiver", "stream"],
                        default: "quiver"
                    },
                    // Phase 5: Advanced visualization parameters
                    frame_expr: { type: "string", description: "Expression producing frame array or 2D function value at (x,t)" },
                    expr: { type: "string", description: "Mathematical expression for interactive plots" },
                    mode: { type: "string", enum: ["slices", "isosurface"], default: "slices", description: "Volume rendering mode" },
                    iso_level: { type: "number", description: "Used when mode='isosurface'" },
                    renderer: { type: "string", enum: ["imshow", "contour", "line", "surface"], default: "imshow", description: "Rendering method" },
                    // Animation and interactive parameters
                    emit_animation: { type: "boolean", default: false, description: "Generate animation" },
                    animate_axis: { type: "string", enum: ["x", "y", "z"], default: "z", description: "Animation axis" },
                    fps: { type: "integer", default: 24, description: "Frames per second" },
                    format: { type: "string", enum: ["mp4", "webm", "gif"], default: "mp4", description: "Output format" },
                    emit_frames: { type: "boolean", default: false, description: "Export individual frames" },
                    emit_csv: { type: "boolean", default: false, description: "Export data as CSV" },
                    frames_cap: { type: "integer", default: 300, description: "Maximum frames" },
                    samples_cap: { type: "integer", default: 160, description: "Maximum samples" },
                    allow_large: { type: "boolean", default: false, description: "Allow large computations" },
                    grid_limit: { type: "integer", default: 24, description: "Grid limit for interactive plots" },
                    // Interactive controls
                    controls: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                                min: { type: "number" },
                                max: { type: "number" },
                                step: { type: "number" },
                                default: { type: "number" }
                            },
                            required: ["name", "min", "max", "step", "default"]
                        },
                        description: "Interactive control parameters"
                    },
                    // Styling options
                    title: { type: "string", description: "Plot title" },
                    xlabel: { type: "string", description: "X-axis label" },
                    ylabel: { type: "string", description: "Y-axis label" },
                    zlabel: { type: "string", description: "Z-axis label" },
                    dpi: { type: "integer", description: "Image DPI", default: 100, minimum: 50 },
                    width: { type: "number", description: "Figure width in inches", default: 8 },
                    height: { type: "number", description: "Figure height in inches", default: 6 }
                },
                required: ["plot_type"]
            }
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
    if (name === "plot") {
        const args = arguments_;
        const plotType = args.plot_type;
        switch (plotType) {
            case "function_2d":
                return await worker.call("plot_function_2d", {
                    f: args.f,
                    x_min: args.x_min,
                    x_max: args.x_max,
                    samples: args.samples,
                    title: args.title,
                    xlabel: args.xlabel,
                    ylabel: args.ylabel,
                    dpi: args.dpi,
                    width: args.width,
                    height: args.height
                });
            case "parametric_2d":
                return await worker.call("plot_parametric_2d", {
                    x_t: args.x_t,
                    y_t: args.y_t,
                    t_min: args.t_min,
                    t_max: args.t_max,
                    samples: args.samples,
                    title: args.title,
                    xlabel: args.xlabel,
                    ylabel: args.ylabel,
                    dpi: args.dpi,
                    width: args.width,
                    height: args.height
                });
            case "field_2d":
                return await worker.call("plot_field_2d", {
                    fx: args.fx,
                    fy: args.fy,
                    x_min: args.x_min,
                    x_max: args.x_max,
                    y_min: args.y_min,
                    y_max: args.y_max,
                    grid_points: args.grid_points,
                    plot_type: args.plot_type_field,
                    title: args.title,
                    xlabel: args.xlabel,
                    ylabel: args.ylabel,
                    dpi: args.dpi,
                    width: args.width,
                    height: args.height
                });
            case "phase_portrait":
                return await worker.call("plot_phase_portrait", {
                    dx: args.dx,
                    dy: args.dy,
                    x_min: args.x_min,
                    x_max: args.x_max,
                    y_min: args.y_min,
                    y_max: args.y_max,
                    grid_points: args.grid_points,
                    title: args.title,
                    xlabel: args.xlabel,
                    ylabel: args.ylabel,
                    dpi: args.dpi,
                    width: args.width,
                    height: args.height
                });
            case "surface_3d":
                return await worker.call("plot_surface_3d", {
                    f: args.f,
                    x_min: args.x_min,
                    x_max: args.x_max,
                    y_min: args.y_min,
                    y_max: args.y_max,
                    samples: args.samples,
                    title: args.title,
                    xlabel: args.xlabel,
                    ylabel: args.ylabel,
                    zlabel: args.zlabel,
                    dpi: args.dpi,
                    width: args.width,
                    height: args.height
                });
            case "contour_2d":
                return await worker.call("plot_contour_2d", {
                    f: args.f,
                    x_min: args.x_min,
                    x_max: args.x_max,
                    y_min: args.y_min,
                    y_max: args.y_max,
                    levels: args.levels,
                    samples: args.samples,
                    title: args.title,
                    xlabel: args.xlabel,
                    ylabel: args.ylabel,
                    dpi: args.dpi,
                    width: args.width,
                    height: args.height
                });
            case "volume_3d":
                return await worker.call("plot_volume_3d", {
                    f: args.f,
                    x: args.x,
                    y: args.y,
                    z: args.z,
                    mode: args.mode,
                    iso_level: args.iso_level,
                    emit_animation: args.emit_animation,
                    animate_axis: args.animate_axis,
                    fps: args.fps,
                    format: args.format,
                    samples_cap: args.samples_cap,
                    allow_large: args.allow_large
                });
            case "animation":
                return await worker.call("plot_animation", {
                    frame_expr: args.frame_expr,
                    x_range: args.x_range,
                    t_range: args.t_range,
                    renderer: args.renderer,
                    fps: args.fps,
                    format: args.format,
                    dpi: args.dpi,
                    emit_frames: args.emit_frames,
                    emit_csv: args.emit_csv,
                    frames_cap: args.frames_cap,
                    allow_large: args.allow_large
                });
            case "interactive":
                return await worker.call("plot_interactive", {
                    expr: args.expr,
                    x_range: args.x_range,
                    controls: args.controls,
                    renderer: args.renderer,
                    grid_limit: args.grid_limit
                });
            default:
                throw new Error(`Unknown plot type: ${plotType}`);
        }
    }
    // Handle individual tools and legacy support
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
