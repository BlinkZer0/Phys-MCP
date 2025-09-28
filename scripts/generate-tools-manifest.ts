// scripts/generate-tools-manifest.ts
import fg from "fast-glob";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import Ajv from "ajv";
import addFormats from "ajv-formats";

// Optional: only if tools use Zod for schemas
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

type JsonSchema = Record<string, any>;

type ToolExport = {
  name: string;
  description: string;
  category?: string;
  inputSchema?: any;   // Zod schema or JSON Schema
  outputSchema?: any;  // JSON Schema or Zod schema
  exampleUsage?: string | string[];
  capabilities?: string[];
  // Allow sub-tools (array) or nested categories:
  subtools?: ToolExport[];
};

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

function toJsonSchema(maybeSchema: any): JsonSchema | undefined {
  if (!maybeSchema) return undefined;

  // Heuristic: zod schemas expose ._def or .safeParse; JSON Schema is a plain object with "type"/"$schema"/"properties"
  const looksLikeJsonSchema =
    typeof maybeSchema === "object" &&
    (maybeSchema.type || maybeSchema.$schema || maybeSchema.properties);

  if (looksLikeJsonSchema) return maybeSchema as JsonSchema;

  // Try Zod
  try {
    if (typeof maybeSchema.safeParse === "function") {
      const js = zodToJsonSchema(maybeSchema as z.ZodTypeAny, "root", { $refStrategy: "none" });
      return js as JsonSchema;
    }
  } catch {
    // fallthrough
  }

  // Fallback: no schema
  return undefined;
}

function normalizeTool(t: ToolExport) {
  if (!t?.name || !t?.description) {
    throw new Error(`Tool missing required name/description: ${JSON.stringify(t, null, 2)}` );
  }

  const input_schema = toJsonSchema(t.inputSchema);
  const output_schema = toJsonSchema(t.outputSchema);

  // Validate (non-fatal): ensure object-ish schemas
  if (input_schema) { try { ajv.compile(input_schema); } catch { /* ignore */ } }
  if (output_schema) { try { ajv.compile(output_schema); } catch { /* ignore */ } }

  const base = {
    name: t.name,
    description: t.description,
    category: t.category,
    input_schema,
    output_schema,
    example_usage: t.exampleUsage,
    capabilities: t.capabilities,
  };

  // Flatten subtools if provided
  let tools = [base];
  if (Array.isArray(t.subtools)) {
    tools = tools.concat(t.subtools.map(st => normalizeTool(st)).flat());
  }
  return tools;
}

// Extract tools from Phys-MCP's specific structure
function extractPhysMCPTools(mod: any): ToolExport[] {
  const tools: ToolExport[] = [];
  
  // Look for buildXXXTools functions that return Tool arrays
  for (const key of Object.keys(mod)) {
    if (key.startsWith('build') && key.endsWith('Tools') && typeof mod[key] === 'function') {
      try {
        const toolArray = mod[key]();
        if (Array.isArray(toolArray)) {
          for (const tool of toolArray) {
            if (tool.name && tool.description && tool.inputSchema) {
              // Determine category from the build function name
              const categoryMatch = key.match(/build(\w+)Tools/);
              const category = categoryMatch ? categoryMatch[1].toLowerCase() : 'physics';
              
              // Create example usage based on tool name and description
              const exampleUsage = generateExampleUsage(tool.name, tool.description);
              
              // Extract capabilities from description and schema
              const capabilities = extractCapabilities(tool.description, tool.inputSchema);
              
              tools.push({
                name: tool.name,
                description: tool.description,
                category,
                inputSchema: tool.inputSchema,
                outputSchema: tool.outputSchema,
                exampleUsage,
                capabilities
              });
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to extract tools from ${key}:`, error);
      }
    }
  }
  
  return tools;
}

function generateExampleUsage(name: string, description: string): string[] {
  const examples: string[] = [];
  
  // Generate examples based on tool name patterns
  switch (name) {
    case 'cas':
      examples.push(
        "Calculate the derivative of x^2 + 3x + 1",
        "Solve the equation x^2 - 4 = 0",
        "Integrate sin(x) from 0 to π"
      );
      break;
    case 'plot':
      examples.push(
        "Plot the function y = x^2 from -5 to 5",
        "Create a 3D surface plot of z = sin(x)*cos(y)",
        "Generate a phase portrait for a dynamical system"
      );
      break;
    case 'units_convert':
      examples.push(
        "Convert 1 meter to feet",
        "Convert 100 joules to calories"
      );
      break;
    case 'constants_get':
      examples.push(
        "Get the speed of light constant",
        "Retrieve Planck's constant"
      );
      break;
    case 'quantum':
      examples.push(
        "Solve the quantum harmonic oscillator",
        "Visualize a quantum state on the Bloch sphere"
      );
      break;
    case 'graphing_calculator':
      examples.push(
        "Evaluate 2 + 3 * 4",
        "Find the roots of x^2 - 5x + 6 = 0",
        "Calculate the matrix determinant of [[1,2],[3,4]]"
      );
      break;
    case 'ml_ai_augmentation':
      examples.push(
        "Train symbolic regression to discover equation from data",
        "Train a physics-informed neural network for PDE solving"
      );
      break;
    default:
      // Generate generic examples based on description
      if (description.includes('plot') || description.includes('visualiz')) {
        examples.push(`Generate visualization using ${name}`);
      }
      if (description.includes('calculat') || description.includes('compute')) {
        examples.push(`Perform calculations using ${name}`);
      }
      if (description.includes('convert') || description.includes('transform')) {
        examples.push(`Convert data using ${name}`);
      }
      if (examples.length === 0) {
        examples.push(`Use ${name} for ${description.split('.')[0].toLowerCase()}`);
      }
  }
  
  return examples;
}

function extractCapabilities(description: string, inputSchema: any): string[] {
  const capabilities: string[] = [];
  
  // Extract capabilities from description
  if (description.includes('algebra') || description.includes('symbolic')) {
    capabilities.push('symbolic_computation');
  }
  if (description.includes('plot') || description.includes('visualiz')) {
    capabilities.push('visualization');
  }
  if (description.includes('integrat')) {
    capabilities.push('integration');
  }
  if (description.includes('different')) {
    capabilities.push('differentiation');
  }
  if (description.includes('solve') || description.includes('equation')) {
    capabilities.push('equation_solving');
  }
  if (description.includes('quantum')) {
    capabilities.push('quantum_computing');
  }
  if (description.includes('machine learning') || description.includes('ML') || description.includes('AI')) {
    capabilities.push('machine_learning');
  }
  if (description.includes('3D') || description.includes('surface')) {
    capabilities.push('3d_visualization');
  }
  if (description.includes('animation')) {
    capabilities.push('animation');
  }
  if (description.includes('export')) {
    capabilities.push('data_export');
  }
  if (description.includes('convert') || description.includes('unit')) {
    capabilities.push('unit_conversion');
  }
  
  // Extract capabilities from input schema
  if (inputSchema && inputSchema.properties) {
    const props = inputSchema.properties;
    if (props.action && props.action.enum) {
      capabilities.push(...props.action.enum.map((a: string) => `action_${a}`));
    }
    if (props.plot_type && props.plot_type.enum) {
      capabilities.push(...props.plot_type.enum.map((t: string) => `plot_${t}`));
    }
    if (props.operation && props.operation.enum) {
      capabilities.push(...props.operation.enum.map((o: string) => `operation_${o}`));
    }
  }
  
  return [...new Set(capabilities)]; // Remove duplicates
}

async function main() {
  const root = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(root, "..");

  // Phys-MCP uses a specific structure: packages/tools-*/dist/index.js
  const patterns = [
    "packages/tools-*/dist/index.js",
  ];
  const entries = await fg(patterns, { cwd: repoRoot, absolute: true });

  console.log(`Found ${entries.length} tool packages to process...`);

  const toolDefs: any[] = [];

  for (const file of entries) {
    console.log(`Processing: ${file}`);
    try {
      // dynamic import
      const mod = await import(pathToFileURL(file).href);
      
      // Extract tools using Phys-MCP specific structure
      const candidates = extractPhysMCPTools(mod);
      
      for (const c of candidates) {
        const normalized = normalizeTool(c);
        toolDefs.push(...normalized);
      }
    } catch (error) {
      console.warn(`Failed to process ${file}:`, error);
    }
  }

  console.log(`Discovered ${toolDefs.length} tools total`);

  // Build categories → tool name arrays (optional, helps planners)
  const tool_categories: Record<string, string[]> = {};
  for (const t of toolDefs) {
    if (!t.category) continue;
    if (!tool_categories[t.category]) tool_categories[t.category] = [];
    tool_categories[t.category].push(t.name);
  }

  // Minimal server info (adjust from package.json if desired)
  const manifest = {
    mcp_tools_manifest: {
      server_info: {
        name: "phys-mcp",
        version: "0.1.0",
        description: "Physics/Numerics MCP tool suite for scientific computing with GPU acceleration, advanced visualization, and comprehensive mathematical operations.",
        protocol_version: "1.0.0"
      },
      tools: toolDefs,
      tool_categories,
      // Optional slots for workflows & NL examples:
      use_case_workflows: {
        "solve_physics_problem": ["cas", "plot", "units_convert"],
        "quantum_simulation": ["quantum", "plot", "constants_get"],
        "data_analysis": ["graphing_calculator", "plot", "ml_ai_augmentation"],
        "scientific_visualization": ["plot", "export_tool", "data"],
        "symbolic_math": ["cas", "graphing_calculator", "constants_get"]
      },
      integration_examples: {
        "natural_language": [
          "Calculate the derivative of x^2 + 3x + 1",
          "Plot a sine wave from 0 to 2π", 
          "Convert 100 meters to feet",
          "Solve the quantum harmonic oscillator",
          "Generate a 3D surface plot of z = x^2 + y^2"
        ]
      }
    }
  };

  // Ensure dist
  const outDir = path.join(repoRoot, "dist");
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  // Write JSON (nice for inspection)
  const jsonPath = path.join(outDir, "tools-manifest.json");
  writeFileSync(jsonPath, JSON.stringify(manifest, null, 2), "utf8");

  // Write JS (CommonJS export to satisfy various clients/pipelines)
  const jsPath = path.join(repoRoot, "tools_manifest.js");
  const js = `// Auto-generated by scripts/generate-tools-manifest.ts
module.exports = ${JSON.stringify(manifest, null, 2)};
`;
  writeFileSync(jsPath, js, "utf8");

  console.log(`✅ Wrote:\n- ${jsPath}\n- ${jsonPath}\n📊 Tools discovered: ${toolDefs.length}`);
  console.log(`📂 Categories: ${Object.keys(tool_categories).join(', ')}`);
}

main().catch((e) => {
  console.error("❌ Error generating tools manifest:", e);
  process.exit(1);
});
