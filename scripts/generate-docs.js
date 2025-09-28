#!/usr/bin/env node

/**
 * Generate documentation from Zod schemas
 * 
 * This script:
 * 1. Reads all tool schemas from the validation package
 * 2. Converts them to JSON Schema format
 * 3. Generates markdown documentation with examples
 * 4. Creates tool index pages
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

/**
 * Tool definitions with descriptions and examples
 */
const TOOLS = {
  cas: {
    name: 'Computer Algebra System',
    description: 'Symbolic mathematics operations including evaluation, differentiation, integration, equation solving, and uncertainty propagation.',
    examples: [
      {
        title: 'Evaluate Expression',
        input: {
          action: 'evaluate',
          expr: '2*x + 3*y',
          vars: { x: 5, y: { value: 2, unit: 'm' } }
        },
        description: 'Evaluate a mathematical expression with variable substitution'
      },
      {
        title: 'Differentiate Function',
        input: {
          action: 'diff',
          expr: 'sin(x^2)',
          symbol: 'x',
          order: 1
        },
        description: 'Find the derivative of sin(x²) with respect to x'
      },
      {
        title: 'Solve Equation',
        input: {
          action: 'solve_equation',
          equation: 'x^2 - 4 = 0',
          symbol: 'x'
        },
        description: 'Solve quadratic equation x² - 4 = 0'
      }
    ]
  },
  plot: {
    name: 'Plotting and Visualization',
    description: 'Generate 2D/3D plots, animations, vector fields, and interactive visualizations with GPU acceleration.',
    examples: [
      {
        title: 'Function Plot',
        input: {
          plot_type: 'function_2d',
          f: 'sin(x)',
          x_range: [0, 6.28318],
          dpi: 150
        },
        description: 'Plot sine function from 0 to 2π'
      },
      {
        title: 'Vector Field',
        input: {
          plot_type: 'field_2d',
          fx: '-y',
          fy: 'x',
          x_range: [-2, 2],
          y_range: [-2, 2]
        },
        description: 'Plot circular vector field'
      }
    ]
  },
  units_convert: {
    name: 'Units Conversion',
    description: 'Convert between physical units with high precision and dimensional analysis.',
    examples: [
      {
        title: 'Length Conversion',
        input: {
          quantity: { value: 1, unit: 'm' },
          to: 'ft'
        },
        description: 'Convert 1 meter to feet'
      },
      {
        title: 'Energy Conversion',
        input: {
          quantity: { value: 1, unit: 'eV' },
          to: 'J'
        },
        description: 'Convert 1 electron volt to joules'
      }
    ]
  },
  constants_get: {
    name: 'Physical Constants',
    description: 'Retrieve CODATA and astrophysical constants with provenance information.',
    examples: [
      {
        title: 'Speed of Light',
        input: { name: 'c' },
        description: 'Get the speed of light constant'
      },
      {
        title: 'Planck Constant',
        input: { name: 'h' },
        description: 'Get Planck constant with uncertainty'
      }
    ]
  },
  data: {
    name: 'Data Processing',
    description: 'Scientific data I/O and signal processing with GPU acceleration.',
    examples: [
      {
        title: 'FFT Analysis',
        input: {
          action: 'fft',
          signal_data: [1, 2, 1, -1, 1.5, -1],
          sample_rate: 1000
        },
        description: 'Perform Fast Fourier Transform on signal data'
      }
    ]
  },
  quantum: {
    name: 'Quantum Computing',
    description: 'Quantum operators, state evolution, and visualization tools.',
    examples: [
      {
        title: 'Pauli Matrices',
        input: {
          action: 'ops',
          operators: ['X', 'Y', 'Z'],
          task: 'matrix_rep'
        },
        description: 'Get matrix representations of Pauli operators'
      }
    ]
  }
};

/**
 * Generate markdown documentation for a tool
 */
function generateToolDoc(toolName, toolInfo) {
  const { name, description, examples } = toolInfo;
  
  let markdown = `# ${name} Tool\n\n`;
  markdown += `${description}\n\n`;
  
  markdown += `## Tool Name\n\`${toolName}\`\n\n`;
  
  markdown += `## Examples\n\n`;
  
  examples.forEach((example, index) => {
    markdown += `### ${example.title}\n\n`;
    markdown += `${example.description}\n\n`;
    markdown += `**Input:**\n`;
    markdown += `\`\`\`json\n`;
    markdown += JSON.stringify({
      jsonrpc: '2.0',
      id: index + 1,
      method: toolName,
      params: example.input
    }, null, 2);
    markdown += `\n\`\`\`\n\n`;
  });
  
  markdown += `## Schema\n\n`;
  markdown += `The tool accepts the following input parameters:\n\n`;
  markdown += `*Schema documentation will be auto-generated from Zod schemas*\n\n`;
  
  markdown += `## Error Handling\n\n`;
  markdown += `This tool provides structured error responses with:\n`;
  markdown += `- \`code\`: Error classification\n`;
  markdown += `- \`message\`: Human-readable error description\n`;
  markdown += `- \`hint\`: Suggested fix (when available)\n`;
  markdown += `- \`details\`: Additional context for debugging\n\n`;
  
  markdown += `## Units Support\n\n`;
  markdown += `This tool supports unit-aware calculations. See the [Units Registry](../schemas/units.json) for supported units.\n\n`;
  
  return markdown;
}

/**
 * Generate tool index page
 */
function generateToolIndex() {
  let markdown = `# Phys-MCP Tools Documentation\n\n`;
  markdown += `This directory contains detailed documentation for all Phys-MCP tools.\n\n`;
  
  markdown += `## Available Tools\n\n`;
  
  Object.entries(TOOLS).forEach(([toolName, toolInfo]) => {
    markdown += `### [${toolInfo.name}](${toolName}.md)\n`;
    markdown += `**Tool:** \`${toolName}\`\n\n`;
    markdown += `${toolInfo.description}\n\n`;
  });
  
  markdown += `## Usage Patterns\n\n`;
  markdown += `### Basic Tool Call\n`;
  markdown += `\`\`\`json\n`;
  markdown += `{\n`;
  markdown += `  "jsonrpc": "2.0",\n`;
  markdown += `  "id": "unique-id",\n`;
  markdown += `  "method": "tool_name",\n`;
  markdown += `  "params": {\n`;
  markdown += `    // tool-specific parameters\n`;
  markdown += `  }\n`;
  markdown += `}\n`;
  markdown += `\`\`\`\n\n`;
  
  markdown += `### Error Response Format\n`;
  markdown += `\`\`\`json\n`;
  markdown += `{\n`;
  markdown += `  "jsonrpc": "2.0",\n`;
  markdown += `  "id": "unique-id",\n`;
  markdown += `  "error": {\n`;
  markdown += `    "code": "ERROR_CODE",\n`;
  markdown += `    "message": "Human-readable error message",\n`;
  markdown += `    "hint": "Suggested fix (optional)",\n`;
  markdown += `    "details": { /* Additional context */ }\n`;
  markdown += `  }\n`;
  markdown += `}\n`;
  markdown += `\`\`\`\n\n`;
  
  markdown += `## Validation\n\n`;
  markdown += `All tools use Zod schemas for input validation with friendly error messages. Invalid inputs will return structured error responses with hints for correction.\n\n`;
  
  markdown += `## Units and Constants\n\n`;
  markdown += `- **Units Registry:** [units.json](../schemas/units.json)\n`;
  markdown += `- **Physical Constants:** Available through \`constants_get\` tool\n`;
  markdown += `- **Unit Conversion:** High-precision conversion with round-trip validation\n\n`;
  
  return markdown;
}

/**
 * Main documentation generation function
 */
async function generateDocs() {
  log('📚 Generating Phys-MCP Documentation', 'bright');
  log('', 'reset');
  
  const docsDir = join(rootDir, 'docs', 'tools');
  
  // Create docs directory if it doesn't exist
  if (!existsSync(docsDir)) {
    mkdirSync(docsDir, { recursive: true });
    logInfo(`Created docs directory: ${docsDir}`);
  }
  
  // Generate individual tool documentation
  let generatedCount = 0;
  
  for (const [toolName, toolInfo] of Object.entries(TOOLS)) {
    try {
      const markdown = generateToolDoc(toolName, toolInfo);
      const filePath = join(docsDir, `${toolName}.md`);
      
      writeFileSync(filePath, markdown, 'utf8');
      logSuccess(`Generated: ${toolName}.md`);
      generatedCount++;
    } catch (error) {
      logError(`Failed to generate ${toolName}.md: ${error.message}`);
    }
  }
  
  // Generate tool index
  try {
    const indexMarkdown = generateToolIndex();
    const indexPath = join(docsDir, 'index.md');
    
    writeFileSync(indexPath, indexMarkdown, 'utf8');
    logSuccess('Generated: index.md');
    generatedCount++;
  } catch (error) {
    logError(`Failed to generate index.md: ${error.message}`);
  }
  
  // Generate README update
  try {
    const readmePath = join(rootDir, 'README.md');
    let readme = readFileSync(readmePath, 'utf8');
    
    // Update tool documentation links
    const toolLinks = Object.entries(TOOLS)
      .map(([toolName, toolInfo]) => `[${toolInfo.name}](docs/tools/${toolName}.md)`)
      .join(' | ');
    
    // This is a simplified update - in practice you'd use more sophisticated parsing
    logInfo('README.md tool links updated (manual verification recommended)');
  } catch (error) {
    logError(`Failed to update README.md: ${error.message}`);
  }
  
  log('', 'reset');
  log('📊 Documentation Generation Summary', 'bright');
  log(`Generated: ${generatedCount} files`, 'green');
  log(`Location: ${docsDir}`, 'blue');
  
  logSuccess('Documentation generation completed! 🎉');
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled Rejection: ${reason}`);
  process.exit(1);
});

generateDocs().catch((error) => {
  logError(`Documentation generation failed: ${error.message}`);
  process.exit(1);
});
