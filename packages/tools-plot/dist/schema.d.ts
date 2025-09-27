/**
 * Type definitions and schemas for plotting tools
 */
export interface Function2DParams {
    f: string;
    x_min: number;
    x_max: number;
    samples?: number;
    title?: string;
    xlabel?: string;
    ylabel?: string;
    dpi?: number;
    width?: number;
    height?: number;
}
export interface Parametric2DParams {
    x_t: string;
    y_t: string;
    t_min: number;
    t_max: number;
    samples?: number;
    title?: string;
    xlabel?: string;
    ylabel?: string;
    dpi?: number;
    width?: number;
    height?: number;
}
export interface Field2DParams {
    fx: string;
    fy: string;
    x_min: number;
    x_max: number;
    y_min: number;
    y_max: number;
    grid_points?: number;
    plot_type?: "quiver" | "stream";
    title?: string;
    xlabel?: string;
    ylabel?: string;
    dpi?: number;
    width?: number;
    height?: number;
}
export interface PlotResult {
    image_png_b64: string;
    image_svg?: string;
    csv_data?: string;
    x_range?: [number, number];
    y_range?: [number, number];
    samples?: number;
}
export declare const function2DSchema: {
    readonly type: "object";
    readonly properties: {
        readonly f: {
            readonly type: "string";
            readonly description: "Function expression f(x)";
        };
        readonly x_min: {
            readonly type: "number";
            readonly description: "Minimum x value";
        };
        readonly x_max: {
            readonly type: "number";
            readonly description: "Maximum x value";
        };
        readonly samples: {
            readonly type: "integer";
            readonly description: "Number of sample points";
            readonly default: 1000;
            readonly minimum: 10;
        };
        readonly title: {
            readonly type: "string";
            readonly description: "Plot title";
        };
        readonly xlabel: {
            readonly type: "string";
            readonly description: "X-axis label";
            readonly default: "x";
        };
        readonly ylabel: {
            readonly type: "string";
            readonly description: "Y-axis label";
            readonly default: "f(x)";
        };
        readonly dpi: {
            readonly type: "integer";
            readonly description: "Image DPI";
            readonly default: 100;
            readonly minimum: 50;
        };
        readonly width: {
            readonly type: "number";
            readonly description: "Figure width in inches";
            readonly default: 8;
        };
        readonly height: {
            readonly type: "number";
            readonly description: "Figure height in inches";
            readonly default: 6;
        };
    };
    readonly required: readonly ["f", "x_min", "x_max"];
};
export declare const parametric2DSchema: {
    readonly type: "object";
    readonly properties: {
        readonly x_t: {
            readonly type: "string";
            readonly description: "Parametric x(t) expression";
        };
        readonly y_t: {
            readonly type: "string";
            readonly description: "Parametric y(t) expression";
        };
        readonly t_min: {
            readonly type: "number";
            readonly description: "Minimum parameter value";
        };
        readonly t_max: {
            readonly type: "number";
            readonly description: "Maximum parameter value";
        };
        readonly samples: {
            readonly type: "integer";
            readonly description: "Number of sample points";
            readonly default: 1000;
            readonly minimum: 10;
        };
        readonly title: {
            readonly type: "string";
            readonly description: "Plot title";
        };
        readonly xlabel: {
            readonly type: "string";
            readonly description: "X-axis label";
            readonly default: "x";
        };
        readonly ylabel: {
            readonly type: "string";
            readonly description: "Y-axis label";
            readonly default: "y";
        };
        readonly dpi: {
            readonly type: "integer";
            readonly description: "Image DPI";
            readonly default: 100;
            readonly minimum: 50;
        };
        readonly width: {
            readonly type: "number";
            readonly description: "Figure width in inches";
            readonly default: 8;
        };
        readonly height: {
            readonly type: "number";
            readonly description: "Figure height in inches";
            readonly default: 6;
        };
    };
    readonly required: readonly ["x_t", "y_t", "t_min", "t_max"];
};
export declare const field2DSchema: {
    readonly type: "object";
    readonly properties: {
        readonly fx: {
            readonly type: "string";
            readonly description: "X-component of vector field F_x(x,y)";
        };
        readonly fy: {
            readonly type: "string";
            readonly description: "Y-component of vector field F_y(x,y)";
        };
        readonly x_min: {
            readonly type: "number";
            readonly description: "Minimum x value";
        };
        readonly x_max: {
            readonly type: "number";
            readonly description: "Maximum x value";
        };
        readonly y_min: {
            readonly type: "number";
            readonly description: "Minimum y value";
        };
        readonly y_max: {
            readonly type: "number";
            readonly description: "Maximum y value";
        };
        readonly grid_points: {
            readonly type: "integer";
            readonly description: "Grid points per axis";
            readonly default: 20;
            readonly minimum: 5;
        };
        readonly plot_type: {
            readonly type: "string";
            readonly description: "Type of field plot";
            readonly enum: readonly ["quiver", "stream"];
            readonly default: "quiver";
        };
        readonly title: {
            readonly type: "string";
            readonly description: "Plot title";
        };
        readonly xlabel: {
            readonly type: "string";
            readonly description: "X-axis label";
            readonly default: "x";
        };
        readonly ylabel: {
            readonly type: "string";
            readonly description: "Y-axis label";
            readonly default: "y";
        };
        readonly dpi: {
            readonly type: "integer";
            readonly description: "Image DPI";
            readonly default: 100;
            readonly minimum: 50;
        };
        readonly width: {
            readonly type: "number";
            readonly description: "Figure width in inches";
            readonly default: 8;
        };
        readonly height: {
            readonly type: "number";
            readonly description: "Figure height in inches";
            readonly default: 6;
        };
    };
    readonly required: readonly ["fx", "fy", "x_min", "x_max", "y_min", "y_max"];
};
export interface PhasePortraitParams {
    dx: string;
    dy: string;
    x_min: number;
    x_max: number;
    y_min: number;
    y_max: number;
    grid_points?: number;
    title?: string;
    xlabel?: string;
    ylabel?: string;
    dpi?: number;
    width?: number;
    height?: number;
}
export interface Surface3DParams {
    f: string;
    x_min: number;
    x_max: number;
    y_min: number;
    y_max: number;
    samples?: number;
    title?: string;
    xlabel?: string;
    ylabel?: string;
    zlabel?: string;
    dpi?: number;
    width?: number;
    height?: number;
}
export interface Contour2DParams {
    f: string;
    x_min: number;
    x_max: number;
    y_min: number;
    y_max: number;
    levels?: number;
    samples?: number;
    title?: string;
    xlabel?: string;
    ylabel?: string;
    dpi?: number;
    width?: number;
    height?: number;
}
export declare const phasePortraitSchema: {
    readonly type: "object";
    readonly properties: {
        readonly dx: {
            readonly type: "string";
            readonly description: "dx/dt expression for the dynamical system";
        };
        readonly dy: {
            readonly type: "string";
            readonly description: "dy/dt expression for the dynamical system";
        };
        readonly x_min: {
            readonly type: "number";
            readonly description: "Minimum x value";
        };
        readonly x_max: {
            readonly type: "number";
            readonly description: "Maximum x value";
        };
        readonly y_min: {
            readonly type: "number";
            readonly description: "Minimum y value";
        };
        readonly y_max: {
            readonly type: "number";
            readonly description: "Maximum y value";
        };
        readonly grid_points: {
            readonly type: "integer";
            readonly description: "Grid points per axis";
            readonly default: 20;
            readonly minimum: 5;
        };
        readonly title: {
            readonly type: "string";
            readonly description: "Plot title";
        };
        readonly xlabel: {
            readonly type: "string";
            readonly description: "X-axis label";
            readonly default: "x";
        };
        readonly ylabel: {
            readonly type: "string";
            readonly description: "Y-axis label";
            readonly default: "y";
        };
        readonly dpi: {
            readonly type: "integer";
            readonly description: "Image DPI";
            readonly default: 100;
            readonly minimum: 50;
        };
        readonly width: {
            readonly type: "number";
            readonly description: "Figure width in inches";
            readonly default: 8;
        };
        readonly height: {
            readonly type: "number";
            readonly description: "Figure height in inches";
            readonly default: 6;
        };
    };
    readonly required: readonly ["dx", "dy", "x_min", "x_max", "y_min", "y_max"];
};
export declare const surface3DSchema: {
    readonly type: "object";
    readonly properties: {
        readonly f: {
            readonly type: "string";
            readonly description: "3D surface function z = f(x,y)";
        };
        readonly x_min: {
            readonly type: "number";
            readonly description: "Minimum x value";
        };
        readonly x_max: {
            readonly type: "number";
            readonly description: "Maximum x value";
        };
        readonly y_min: {
            readonly type: "number";
            readonly description: "Minimum y value";
        };
        readonly y_max: {
            readonly type: "number";
            readonly description: "Maximum y value";
        };
        readonly samples: {
            readonly type: "integer";
            readonly description: "Grid samples per axis";
            readonly default: 50;
            readonly minimum: 10;
            readonly maximum: 100;
        };
        readonly title: {
            readonly type: "string";
            readonly description: "Plot title";
        };
        readonly xlabel: {
            readonly type: "string";
            readonly description: "X-axis label";
            readonly default: "x";
        };
        readonly ylabel: {
            readonly type: "string";
            readonly description: "Y-axis label";
            readonly default: "y";
        };
        readonly zlabel: {
            readonly type: "string";
            readonly description: "Z-axis label";
            readonly default: "z";
        };
        readonly dpi: {
            readonly type: "integer";
            readonly description: "Image DPI";
            readonly default: 100;
            readonly minimum: 50;
        };
        readonly width: {
            readonly type: "number";
            readonly description: "Figure width in inches";
            readonly default: 10;
        };
        readonly height: {
            readonly type: "number";
            readonly description: "Figure height in inches";
            readonly default: 8;
        };
    };
    readonly required: readonly ["f", "x_min", "x_max", "y_min", "y_max"];
};
export declare const contour2DSchema: {
    readonly type: "object";
    readonly properties: {
        readonly f: {
            readonly type: "string";
            readonly description: "Function f(x,y) for contour plot";
        };
        readonly x_min: {
            readonly type: "number";
            readonly description: "Minimum x value";
        };
        readonly x_max: {
            readonly type: "number";
            readonly description: "Maximum x value";
        };
        readonly y_min: {
            readonly type: "number";
            readonly description: "Minimum y value";
        };
        readonly y_max: {
            readonly type: "number";
            readonly description: "Maximum y value";
        };
        readonly levels: {
            readonly type: "integer";
            readonly description: "Number of contour levels";
            readonly default: 15;
            readonly minimum: 5;
        };
        readonly samples: {
            readonly type: "integer";
            readonly description: "Grid samples per axis";
            readonly default: 100;
            readonly minimum: 20;
        };
        readonly title: {
            readonly type: "string";
            readonly description: "Plot title";
        };
        readonly xlabel: {
            readonly type: "string";
            readonly description: "X-axis label";
            readonly default: "x";
        };
        readonly ylabel: {
            readonly type: "string";
            readonly description: "Y-axis label";
            readonly default: "y";
        };
        readonly dpi: {
            readonly type: "integer";
            readonly description: "Image DPI";
            readonly default: 100;
            readonly minimum: 50;
        };
        readonly width: {
            readonly type: "number";
            readonly description: "Figure width in inches";
            readonly default: 8;
        };
        readonly height: {
            readonly type: "number";
            readonly description: "Figure height in inches";
            readonly default: 6;
        };
    };
    readonly required: readonly ["f", "x_min", "x_max", "y_min", "y_max"];
};
export interface Volume3DParams {
    f: string;
    x: [number, number] | [number, number, number];
    y: [number, number] | [number, number, number];
    z: [number, number] | [number, number, number];
    mode?: "slices" | "isosurface";
    iso_level?: number;
    emit_animation?: boolean;
    animate_axis?: "x" | "y" | "z";
    fps?: number;
    format?: "mp4" | "webm" | "gif";
    samples_cap?: number;
    allow_large?: boolean;
}
export interface AnimationParams {
    frame_expr: string;
    x_range?: [number, number] | [number, number, number];
    t_range: [number, number] | [number, number, number];
    renderer?: "imshow" | "contour" | "line";
    fps?: number;
    format?: "mp4" | "webm" | "gif";
    dpi?: number;
    emit_frames?: boolean;
    emit_csv?: boolean;
    frames_cap?: number;
    allow_large?: boolean;
}
export interface InteractiveParams {
    expr: string;
    x_range?: [number, number] | [number, number, number];
    controls: Array<{
        name: string;
        min: number;
        max: number;
        step: number;
        default: number;
    }>;
    renderer?: "line" | "contour" | "surface";
    grid_limit?: number;
}
export interface VRExportParams {
    geometry: {
        vertices: number[][];
        faces: number[][];
        normals?: number[][];
        colors?: number[][];
    };
    format?: "glb" | "ply";
    extras?: Record<string, any>;
}
export declare const volume3DSchema: {
    readonly type: "object";
    readonly properties: {
        readonly f: {
            readonly type: "string";
            readonly description: "SymPy-like expression in x,y,z; numeric eval is vectorized";
        };
        readonly x: {
            readonly type: "array";
            readonly items: {
                readonly type: "number";
            };
            readonly minItems: 2;
            readonly maxItems: 3;
            readonly description: "[min,max,steps?]";
        };
        readonly y: {
            readonly type: "array";
            readonly items: {
                readonly type: "number";
            };
            readonly minItems: 2;
            readonly maxItems: 3;
        };
        readonly z: {
            readonly type: "array";
            readonly items: {
                readonly type: "number";
            };
            readonly minItems: 2;
            readonly maxItems: 3;
        };
        readonly mode: {
            readonly type: "string";
            readonly enum: readonly ["slices", "isosurface"];
            readonly default: "slices";
        };
        readonly iso_level: {
            readonly type: "number";
            readonly description: "Used when mode='isosurface'";
        };
        readonly emit_animation: {
            readonly type: "boolean";
            readonly default: false;
        };
        readonly animate_axis: {
            readonly type: "string";
            readonly enum: readonly ["x", "y", "z"];
            readonly default: "z";
        };
        readonly fps: {
            readonly type: "integer";
            readonly default: 24;
        };
        readonly format: {
            readonly type: "string";
            readonly enum: readonly ["mp4", "webm", "gif"];
            readonly default: "mp4";
        };
        readonly samples_cap: {
            readonly type: "integer";
            readonly default: 160;
        };
        readonly allow_large: {
            readonly type: "boolean";
            readonly default: false;
        };
    };
    readonly required: readonly ["f", "x", "y", "z"];
};
export declare const animationSchema: {
    readonly type: "object";
    readonly properties: {
        readonly frame_expr: {
            readonly type: "string";
            readonly description: "Expression producing frame array or 2D function value at (x,t)";
        };
        readonly x_range: {
            readonly type: "array";
            readonly items: {
                readonly type: "number";
            };
            readonly minItems: 2;
            readonly maxItems: 3;
        };
        readonly t_range: {
            readonly type: "array";
            readonly items: {
                readonly type: "number";
            };
            readonly minItems: 2;
            readonly maxItems: 3;
        };
        readonly renderer: {
            readonly type: "string";
            readonly enum: readonly ["imshow", "contour", "line"];
            readonly default: "imshow";
        };
        readonly fps: {
            readonly type: "integer";
            readonly default: 24;
        };
        readonly format: {
            readonly type: "string";
            readonly enum: readonly ["mp4", "webm", "gif"];
            readonly default: "mp4";
        };
        readonly dpi: {
            readonly type: "integer";
            readonly default: 120;
        };
        readonly emit_frames: {
            readonly type: "boolean";
            readonly default: false;
        };
        readonly emit_csv: {
            readonly type: "boolean";
            readonly default: false;
        };
        readonly frames_cap: {
            readonly type: "integer";
            readonly default: 300;
        };
        readonly allow_large: {
            readonly type: "boolean";
            readonly default: false;
        };
    };
    readonly required: readonly ["frame_expr", "t_range"];
};
export declare const interactiveSchema: {
    readonly type: "object";
    readonly properties: {
        readonly expr: {
            readonly type: "string";
        };
        readonly x_range: {
            readonly type: "array";
            readonly items: {
                readonly type: "number";
            };
            readonly minItems: 2;
            readonly maxItems: 3;
        };
        readonly controls: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly properties: {
                    readonly name: {
                        readonly type: "string";
                    };
                    readonly min: {
                        readonly type: "number";
                    };
                    readonly max: {
                        readonly type: "number";
                    };
                    readonly step: {
                        readonly type: "number";
                    };
                    readonly default: {
                        readonly type: "number";
                    };
                };
                readonly required: readonly ["name", "min", "max", "step", "default"];
            };
        };
        readonly renderer: {
            readonly type: "string";
            readonly enum: readonly ["line", "contour", "surface"];
            readonly default: "line";
        };
        readonly grid_limit: {
            readonly type: "integer";
            readonly default: 24;
        };
    };
    readonly required: readonly ["expr", "controls"];
};
export declare const vrExportSchema: {
    readonly type: "object";
    readonly properties: {
        readonly geometry: {
            readonly type: "object";
            readonly properties: {
                readonly vertices: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "number";
                        };
                        readonly minItems: 3;
                        readonly maxItems: 3;
                    };
                };
                readonly faces: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "integer";
                            readonly minimum: 0;
                        };
                    };
                };
                readonly normals: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "number";
                        };
                    };
                    readonly nullable: true;
                };
                readonly colors: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "number";
                        };
                    };
                    readonly nullable: true;
                };
            };
            readonly required: readonly ["vertices", "faces"];
        };
        readonly format: {
            readonly type: "string";
            readonly enum: readonly ["glb", "ply"];
            readonly default: "glb";
        };
        readonly extras: {
            readonly type: "object";
        };
    };
    readonly required: readonly ["geometry"];
};
