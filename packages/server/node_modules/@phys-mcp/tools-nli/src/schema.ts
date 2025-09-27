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

export type SupportedIntent = 
  | "cas_evaluate"
  | "cas_diff" 
  | "cas_integrate"
  | "cas_solve_equation"
  | "cas_solve_ode"
  | "plot_function_2d"
  | "plot_parametric_2d"
  | "plot_field_2d"
  | "unknown";

export const nliSchema = {
  type: "object",
  properties: {
    text: { 
      type: "string", 
      description: "Natural language request to parse into a structured tool call"
    }
  },
  required: ["text"]
} as const;

// System prompt for the local language model
export const SYSTEM_PROMPT = `You are a physics-focused natural language parser that converts user requests into structured tool calls.

Available tools and their intents:
- cas_evaluate: Evaluate mathematical expressions with variables/units
- cas_diff: Differentiate expressions  
- cas_integrate: Integrate expressions (definite or indefinite)
- cas_solve_equation: Solve algebraic equations
- cas_solve_ode: Solve ordinary differential equations
- plot_function_2d: Plot 2D functions
- plot_parametric_2d: Plot parametric curves
- plot_field_2d: Plot vector fields

Guidelines:
1. Use SymPy-compatible syntax for mathematical expressions
2. Use SI units when units are mentioned
3. For derivatives, use symbols like x, t, etc.
4. For ODEs, use standard notation (y'', y', etc.)
5. For plots, extract function expressions and ranges

Respond ONLY with valid JSON in this format:
{
  "intent": "tool_name",
  "args": {
    "param1": "value1",
    "param2": "value2"
  }
}

Examples:
Input: "Differentiate sin(x^2) with respect to x"
Output: {"intent": "cas_diff", "args": {"expr": "sin(x**2)", "symbol": "x"}}

Input: "Plot y = x^2 from -5 to 5"  
Output: {"intent": "plot_function_2d", "args": {"f": "x**2", "x_min": -5, "x_max": 5}}

Input: "Solve y'' + y = 0 with y(0)=0, y'(0)=1"
Output: {"intent": "cas_solve_ode", "args": {"ode": "y'' + y", "symbol": "x", "func": "y", "ics": {"y(0)": 0, "y'(0)": 1}}}`;

// Common physics patterns for better parsing
export const PHYSICS_PATTERNS = {
  // Differentiation patterns
  differentiate: /(?:differentiate|derive|find (?:the )?derivative|d\/d[a-z])/i,
  partial: /(?:partial|∂)/i,
  
  // Integration patterns  
  integrate: /(?:integrate|find (?:the )?integral|∫)/i,
  definite: /(?:from|between).+(?:to|and)/i,
  
  // Equation solving
  solve: /(?:solve|find|determine).+(?:equation|for)/i,
  ode: /(?:differential equation|ode|y['′]+|d²?y\/dx²?)/i,
  
  // Plotting
  plot: /(?:plot|graph|draw|show|visualize)/i,
  parametric: /(?:parametric|x\(t\)|y\(t\))/i,
  field: /(?:vector field|field|quiver|stream)/i,
  
  // Units and constants
  units: /(?:kg|m|s|J|eV|Hz|N|Pa|V|A|Ω|T|Wb|°C|K)/,
  constants: /(?:speed of light|planck|boltzmann|electron mass|proton mass)/i,
};
