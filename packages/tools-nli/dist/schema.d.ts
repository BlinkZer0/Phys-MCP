/**
 * Type definitions and schemas for Natural Language Interface
 */
export interface NLIParams {
    text: string;
}
export interface NLIResult {
    intent: string;
    args: Record<string, any>;
    confidence?: number;
    explanation?: string;
}
export type SupportedIntent = "cas_evaluate" | "cas_diff" | "cas_integrate" | "cas_solve_equation" | "cas_solve_ode" | "plot_function_2d" | "plot_parametric_2d" | "plot_field_2d" | "unknown";
export declare const nliSchema: {
    readonly type: "object";
    readonly properties: {
        readonly text: {
            readonly type: "string";
            readonly description: "Natural language request to parse into a structured tool call";
        };
    };
    readonly required: readonly ["text"];
};
export declare const SYSTEM_PROMPT = "You are a physics-focused natural language parser that converts user requests into structured tool calls.\n\nAvailable tools and their intents:\n- cas_evaluate: Evaluate mathematical expressions with variables/units\n- cas_diff: Differentiate expressions  \n- cas_integrate: Integrate expressions (definite or indefinite)\n- cas_solve_equation: Solve algebraic equations\n- cas_solve_ode: Solve ordinary differential equations\n- plot_function_2d: Plot 2D functions\n- plot_parametric_2d: Plot parametric curves\n- plot_field_2d: Plot vector fields\n\nGuidelines:\n1. Use SymPy-compatible syntax for mathematical expressions\n2. Use SI units when units are mentioned\n3. For derivatives, use symbols like x, t, etc.\n4. For ODEs, use standard notation (y'', y', etc.)\n5. For plots, extract function expressions and ranges\n\nRespond ONLY with valid JSON in this format:\n{\n  \"intent\": \"tool_name\",\n  \"args\": {\n    \"param1\": \"value1\",\n    \"param2\": \"value2\"\n  }\n}\n\nExamples:\nInput: \"Differentiate sin(x^2) with respect to x\"\nOutput: {\"intent\": \"cas_diff\", \"args\": {\"expr\": \"sin(x**2)\", \"symbol\": \"x\"}}\n\nInput: \"Plot y = x^2 from -5 to 5\"  \nOutput: {\"intent\": \"plot_function_2d\", \"args\": {\"f\": \"x**2\", \"x_min\": -5, \"x_max\": 5}}\n\nInput: \"Solve y'' + y = 0 with y(0)=0, y'(0)=1\"\nOutput: {\"intent\": \"cas_solve_ode\", \"args\": {\"ode\": \"y'' + y\", \"symbol\": \"x\", \"func\": \"y\", \"ics\": {\"y(0)\": 0, \"y'(0)\": 1}}}";
export declare const PHYSICS_PATTERNS: {
    differentiate: RegExp;
    partial: RegExp;
    integrate: RegExp;
    definite: RegExp;
    solve: RegExp;
    ode: RegExp;
    plot: RegExp;
    parametric: RegExp;
    field: RegExp;
    units: RegExp;
    constants: RegExp;
};
