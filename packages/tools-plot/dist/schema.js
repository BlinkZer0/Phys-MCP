/**
 * Type definitions and schemas for plotting tools
 */
// JSON Schema definitions
export const function2DSchema = {
    type: "object",
    properties: {
        f: { type: "string", description: "Function expression f(x)" },
        x_min: { type: "number", description: "Minimum x value" },
        x_max: { type: "number", description: "Maximum x value" },
        samples: { type: "integer", description: "Number of sample points", default: 1000, minimum: 10 },
        title: { type: "string", description: "Plot title" },
        xlabel: { type: "string", description: "X-axis label", default: "x" },
        ylabel: { type: "string", description: "Y-axis label", default: "f(x)" },
        dpi: { type: "integer", description: "Image DPI", default: 100, minimum: 50 },
        width: { type: "number", description: "Figure width in inches", default: 8 },
        height: { type: "number", description: "Figure height in inches", default: 6 }
    },
    required: ["f", "x_min", "x_max"]
};
export const parametric2DSchema = {
    type: "object",
    properties: {
        x_t: { type: "string", description: "Parametric x(t) expression" },
        y_t: { type: "string", description: "Parametric y(t) expression" },
        t_min: { type: "number", description: "Minimum parameter value" },
        t_max: { type: "number", description: "Maximum parameter value" },
        samples: { type: "integer", description: "Number of sample points", default: 1000, minimum: 10 },
        title: { type: "string", description: "Plot title" },
        xlabel: { type: "string", description: "X-axis label", default: "x" },
        ylabel: { type: "string", description: "Y-axis label", default: "y" },
        dpi: { type: "integer", description: "Image DPI", default: 100, minimum: 50 },
        width: { type: "number", description: "Figure width in inches", default: 8 },
        height: { type: "number", description: "Figure height in inches", default: 6 }
    },
    required: ["x_t", "y_t", "t_min", "t_max"]
};
export const field2DSchema = {
    type: "object",
    properties: {
        fx: { type: "string", description: "X-component of vector field F_x(x,y)" },
        fy: { type: "string", description: "Y-component of vector field F_y(x,y)" },
        x_min: { type: "number", description: "Minimum x value" },
        x_max: { type: "number", description: "Maximum x value" },
        y_min: { type: "number", description: "Minimum y value" },
        y_max: { type: "number", description: "Maximum y value" },
        grid_points: { type: "integer", description: "Grid points per axis", default: 20, minimum: 5 },
        plot_type: {
            type: "string",
            description: "Type of field plot",
            enum: ["quiver", "stream"],
            default: "quiver"
        },
        title: { type: "string", description: "Plot title" },
        xlabel: { type: "string", description: "X-axis label", default: "x" },
        ylabel: { type: "string", description: "Y-axis label", default: "y" },
        dpi: { type: "integer", description: "Image DPI", default: 100, minimum: 50 },
        width: { type: "number", description: "Figure width in inches", default: 8 },
        height: { type: "number", description: "Figure height in inches", default: 6 }
    },
    required: ["fx", "fy", "x_min", "x_max", "y_min", "y_max"]
};
export const phasePortraitSchema = {
    type: "object",
    properties: {
        dx: { type: "string", description: "dx/dt expression for the dynamical system" },
        dy: { type: "string", description: "dy/dt expression for the dynamical system" },
        x_min: { type: "number", description: "Minimum x value" },
        x_max: { type: "number", description: "Maximum x value" },
        y_min: { type: "number", description: "Minimum y value" },
        y_max: { type: "number", description: "Maximum y value" },
        grid_points: { type: "integer", description: "Grid points per axis", default: 20, minimum: 5 },
        title: { type: "string", description: "Plot title" },
        xlabel: { type: "string", description: "X-axis label", default: "x" },
        ylabel: { type: "string", description: "Y-axis label", default: "y" },
        dpi: { type: "integer", description: "Image DPI", default: 100, minimum: 50 },
        width: { type: "number", description: "Figure width in inches", default: 8 },
        height: { type: "number", description: "Figure height in inches", default: 6 }
    },
    required: ["dx", "dy", "x_min", "x_max", "y_min", "y_max"]
};
export const surface3DSchema = {
    type: "object",
    properties: {
        f: { type: "string", description: "3D surface function z = f(x,y)" },
        x_min: { type: "number", description: "Minimum x value" },
        x_max: { type: "number", description: "Maximum x value" },
        y_min: { type: "number", description: "Minimum y value" },
        y_max: { type: "number", description: "Maximum y value" },
        samples: { type: "integer", description: "Grid samples per axis", default: 50, minimum: 10, maximum: 100 },
        title: { type: "string", description: "Plot title" },
        xlabel: { type: "string", description: "X-axis label", default: "x" },
        ylabel: { type: "string", description: "Y-axis label", default: "y" },
        zlabel: { type: "string", description: "Z-axis label", default: "z" },
        dpi: { type: "integer", description: "Image DPI", default: 100, minimum: 50 },
        width: { type: "number", description: "Figure width in inches", default: 10 },
        height: { type: "number", description: "Figure height in inches", default: 8 }
    },
    required: ["f", "x_min", "x_max", "y_min", "y_max"]
};
export const contour2DSchema = {
    type: "object",
    properties: {
        f: { type: "string", description: "Function f(x,y) for contour plot" },
        x_min: { type: "number", description: "Minimum x value" },
        x_max: { type: "number", description: "Maximum x value" },
        y_min: { type: "number", description: "Minimum y value" },
        y_max: { type: "number", description: "Maximum y value" },
        levels: { type: "integer", description: "Number of contour levels", default: 15, minimum: 5 },
        samples: { type: "integer", description: "Grid samples per axis", default: 100, minimum: 20 },
        title: { type: "string", description: "Plot title" },
        xlabel: { type: "string", description: "X-axis label", default: "x" },
        ylabel: { type: "string", description: "Y-axis label", default: "y" },
        dpi: { type: "integer", description: "Image DPI", default: 100, minimum: 50 },
        width: { type: "number", description: "Figure width in inches", default: 8 },
        height: { type: "number", description: "Figure height in inches", default: 6 }
    },
    required: ["f", "x_min", "x_max", "y_min", "y_max"]
};
export const volume3DSchema = {
    type: "object",
    properties: {
        f: { type: "string", description: "SymPy-like expression in x,y,z; numeric eval is vectorized" },
        x: { type: "array", items: { type: "number" }, minItems: 2, maxItems: 3, description: "[min,max,steps?]" },
        y: { type: "array", items: { type: "number" }, minItems: 2, maxItems: 3 },
        z: { type: "array", items: { type: "number" }, minItems: 2, maxItems: 3 },
        mode: { type: "string", enum: ["slices", "isosurface"], default: "slices" },
        iso_level: { type: "number", description: "Used when mode='isosurface'" },
        emit_animation: { type: "boolean", default: false },
        animate_axis: { type: "string", enum: ["x", "y", "z"], default: "z" },
        fps: { type: "integer", default: 24 },
        format: { type: "string", enum: ["mp4", "webm", "gif"], default: "mp4" },
        samples_cap: { type: "integer", default: 160 },
        allow_large: { type: "boolean", default: false }
    },
    required: ["f", "x", "y", "z"]
};
export const animationSchema = {
    type: "object",
    properties: {
        frame_expr: { type: "string", description: "Expression producing frame array or 2D function value at (x,t)" },
        x_range: { type: "array", items: { type: "number" }, minItems: 2, maxItems: 3 },
        t_range: { type: "array", items: { type: "number" }, minItems: 2, maxItems: 3 },
        renderer: { type: "string", enum: ["imshow", "contour", "line"], default: "imshow" },
        fps: { type: "integer", default: 24 },
        format: { type: "string", enum: ["mp4", "webm", "gif"], default: "mp4" },
        dpi: { type: "integer", default: 120 },
        emit_frames: { type: "boolean", default: false },
        emit_csv: { type: "boolean", default: false },
        frames_cap: { type: "integer", default: 300 },
        allow_large: { type: "boolean", default: false }
    },
    required: ["frame_expr", "t_range"]
};
export const interactiveSchema = {
    type: "object",
    properties: {
        expr: { type: "string" },
        x_range: { type: "array", items: { type: "number" }, minItems: 2, maxItems: 3 },
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
            }
        },
        renderer: { type: "string", enum: ["line", "contour", "surface"], default: "line" },
        grid_limit: { type: "integer", default: 24 } // produce at most N precomputed thumbnails
    },
    required: ["expr", "controls"]
};
export const vrExportSchema = {
    type: "object",
    properties: {
        geometry: {
            type: "object",
            properties: {
                vertices: { type: "array", items: { type: "array", items: { type: "number" }, minItems: 3, maxItems: 3 } },
                faces: { type: "array", items: { type: "array", items: { type: "integer", minimum: 0 } } },
                normals: { type: "array", items: { type: "array", items: { type: "number" } }, nullable: true },
                colors: { type: "array", items: { type: "array", items: { type: "number" } }, nullable: true }
            },
            required: ["vertices", "faces"]
        },
        format: { type: "string", enum: ["glb", "ply"], default: "glb" },
        extras: { type: "object" }
    },
    required: ["geometry"]
};
