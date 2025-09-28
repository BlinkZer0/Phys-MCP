/**
 * Natural Language Interface for Physics MCP
 */

import { Tool } from "../../mcp-types/dist/types.js";
// Use global fetch if available, otherwise provide a fallback
const fetch = globalThis.fetch || (() => {
  throw new Error("Fetch not available - please install node-fetch or use Node.js 18+");
});
import { NLIParams, NLIResult, nliSchema, SYSTEM_PROMPT, PHYSICS_PATTERNS } from "./schema.js";

/**
 * Build NLI tools for the MCP server
 */
export function buildNLITools(): Tool[] {
  return [
    {
      name: "nli_parse",
      description: "Parse natural language physics requests into structured tool calls",
      inputSchema: nliSchema,
    },
  ];
}

/**
 * Parse natural language text using local LM
 */
async function parseWithLM(text: string): Promise<NLIResult> {
  const baseUrl = process.env.LM_BASE_URL;
  const apiKey = process.env.LM_API_KEY || "";
  const model = process.env.DEFAULT_MODEL || "qwen2.5-coder";

  if (!baseUrl) {
    throw new Error("LM_BASE_URL environment variable not set");
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": apiKey ? `Bearer ${apiKey}` : "",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text }
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`LM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from language model");
    }

    // Try to extract JSON from the response
    let parsed: any;
    try {
      // Look for JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(content);
      }
    } catch (error) {
      throw new Error(`Failed to parse LM response as JSON: ${content}`);
    }

    // Validate the response structure
    if (!parsed.intent || !parsed.args) {
      throw new Error("Invalid response structure from language model");
    }

    return {
      intent: parsed.intent,
      args: parsed.args,
      confidence: parsed.confidence,
      explanation: parsed.explanation,
    };

  } catch (error) {
    console.error("LM parsing error:", error);
    throw error;
  }
}

/**
 * Fallback rule-based parser for when LM is unavailable
 */
function parseWithRules(text: string): NLIResult {
  const lowerText = text.toLowerCase();
  
  // Differentiation
  if (PHYSICS_PATTERNS.differentiate.test(text)) {
    // Extract expression and variable
    const exprMatch = text.match(/(?:of|differentiate)\s+([^,\s]+)/i);
    const varMatch = text.match(/(?:with respect to|wrt|d\/d)\s*([a-z])/i);
    
    if (exprMatch && varMatch) {
      return {
        intent: "cas",
        args: {
          action: "diff",
          expr: exprMatch[1].replace(/\^/g, "**"),
          symbol: varMatch[1]
        }
      };
    }
  }
  
  // Integration
  if (PHYSICS_PATTERNS.integrate.test(text)) {
    const exprMatch = text.match(/(?:integrate|integral of)\s+([^,\s]+)/i);
    const varMatch = text.match(/(?:with respect to|wrt|d)\s*([a-z])/i);
    const boundsMatch = text.match(/from\s+(-?\d+(?:\.\d+)?)\s+to\s+(-?\d+(?:\.\d+)?)/i);
    
    if (exprMatch && varMatch) {
      const args: any = {
        action: "integrate",
        expr: exprMatch[1].replace(/\^/g, "**"),
        symbol: varMatch[1]
      };
      
      if (boundsMatch) {
        args.bounds = [parseFloat(boundsMatch[1]), parseFloat(boundsMatch[2])];
      }
      
      return { intent: "cas", args };
    }
  }
  
  // Plotting
  if (PHYSICS_PATTERNS.plot.test(text)) {
    // Simple function plot
    const funcMatch = text.match(/(?:plot|graph)\s+(?:y\s*=\s*)?([^,\s]+)/i);
    const rangeMatch = text.match(/from\s+(-?\d+(?:\.\d+)?)\s+to\s+(-?\d+(?:\.\d+)?)/i);
    
    if (funcMatch) {
      const args: any = {
        plot_type: "function_2d",
        f: funcMatch[1].replace(/\^/g, "**"),
        x_min: -10,
        x_max: 10
      };
      
      if (rangeMatch) {
        args.x_min = parseFloat(rangeMatch[1]);
        args.x_max = parseFloat(rangeMatch[2]);
      }
      
      return { intent: "plot", args };
    }
  }
  
  // API searches
  if (lowerText.includes("arxiv") || lowerText.includes("search papers")) {
    const queryMatch = text.match(/(?:search|find|look for)\s+(?:papers?\s+(?:on|about)\s+)?(.+?)(?:\s+(?:on|in)\s+arxiv)?$/i);
    return {
      intent: "api_tools",
      args: {
        api: "arxiv",
        query: queryMatch ? queryMatch[1] : text
      }
    };
  }
  
  // Data processing
  if (lowerText.includes("fft") || lowerText.includes("fourier")) {
    return {
      intent: "data",
      args: {
        action: "fft",
        signal_data: [],
        sample_rate: 1000
      },
      explanation: "FFT operation detected. Please provide signal_data and sample_rate parameters."
    };
  }
  
  // Unit conversions
  if (lowerText.includes("convert") && (lowerText.includes("to") || lowerText.includes("into"))) {
    const convertMatch = text.match(/convert\s+(\d+(?:\.\d+)?)\s*([a-zA-Z]+)\s+(?:to|into)\s+([a-zA-Z]+)/i);
    if (convertMatch) {
      return {
        intent: "units_convert",
        args: {
          quantity: { value: parseFloat(convertMatch[1]), unit: convertMatch[2] },
          to: convertMatch[3]
        }
      };
    }
  }
  
  // Physical constants
  if (lowerText.includes("speed of light") || lowerText.includes("planck")) {
    let constantName = "c";
    if (lowerText.includes("planck")) constantName = "h";
    if (lowerText.includes("boltzmann")) constantName = "k_B";
    if (lowerText.includes("gravitational")) constantName = "G";
    
    return {
      intent: "constants_get",
      args: { name: constantName }
    };
  }
  
  // Quantum computing
  if (lowerText.includes("quantum") || lowerText.includes("bell state") || lowerText.includes("grover")) {
    let problem = "sho";
    if (lowerText.includes("bell")) problem = "bell_state";
    if (lowerText.includes("grover")) problem = "grover";
    if (lowerText.includes("vqe")) problem = "vqe";
    if (lowerText.includes("qaoa")) problem = "qaoa";
    
    return {
      intent: "quantum",
      args: {
        action: "solve",
        problem: problem
      }
    };
  }
  
  // Tensor algebra / General relativity
  if (lowerText.includes("christoffel") || lowerText.includes("schwarzschild") || lowerText.includes("tensor")) {
    if (lowerText.includes("schwarzschild")) {
      return {
        intent: "tensor_algebra",
        args: {
          metric: "schwarzschild",
          compute: ["christoffel", "riemann"]
        }
      };
    }
    return {
      intent: "tensor_algebra",
      args: {
        metric: [[1, 0], [0, -1]],
        coords: ["t", "r"],
        compute: ["christoffel"]
      }
    };
  }
  
  // Default fallback
  return {
    intent: "unknown",
    args: {},
    explanation: "Could not parse the request. Please try rephrasing or use more specific mathematical notation."
  };
}

/**
 * Handle NLI tool calls
 */
export async function handleNLITool(name: string, arguments_: unknown): Promise<any> {
  if (name !== "nli_parse") {
    throw new Error(`Unknown NLI tool: ${name}`);
  }

  const params = arguments_ as NLIParams;
  
  try {
    // Try LM parsing first
    return await parseWithLM(params.text);
  } catch (error) {
    console.warn("LM parsing failed, falling back to rules:", error);
    
    // Fallback to rule-based parsing
    return parseWithRules(params.text);
  }
}

// Re-export types for convenience
export * from "./schema.js";
