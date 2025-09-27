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
