/**
 * Quantum tools (scaffold)
 */
import { Tool } from "../../mcp-types/dist/types.js";
// Individual schemas available in schema.js but using consolidated schema inline

export function buildQuantumTools(): Tool[] {
  return [
    {
      name: "quantum",
      description: "Quantum computing operations: operator utilities (commutators, matrix representations), quantum solver for standard problems or custom Hamiltonians, quantum state visualization (Bloch sphere, probability density) - scaffold",
      inputSchema: {
        type: "object",
        properties: {
          action: {
            type: "string",
            description: "Quantum operation to perform",
            enum: ["ops", "solve", "visualize"]
          },
          // Quantum ops parameters
          operators: { type: "array", items: { type: "string" }, description: "Operator names/definitions" },
          task: { type: "string", enum: ["commutator", "matrix_rep"], description: "Operation to perform" },
          
          // Quantum solve parameters
          problem: { type: "string", enum: ["sho", "particle_in_box", "custom"], description: "Preset or custom" },
          hamiltonian: { type: "string", description: "Hamiltonian expression (for custom)" },
          params: { type: "object", additionalProperties: true, description: "Problem parameters" },
          
          // Quantum visualize parameters
          state: { type: "string", description: "State vector or density matrix in a simple string form" },
          kind: { type: "string", enum: ["bloch", "prob_density"], description: "Visualization type" }
        },
        required: ["action"]
      }
    }
  ];
}

export async function handleQuantumTool(name: string, args: any): Promise<any> {
  const { getWorkerClient } = await import("../../tools-cas/dist/worker-client.js");
  const worker = getWorkerClient();
  
  if (name === 'quantum') {
    const action = args.action;
    
    switch (action) {
      case 'ops':
        return await worker.call("quantum_ops", {
          operators: args.operators,
          task: args.task
        });
        
      case 'solve':
        return await worker.call("quantum_solve", {
          problem: args.problem,
          hamiltonian: args.hamiltonian,
          params: args.params
        });
        
      case 'visualize':
        return await worker.call("quantum_visualize", {
          state: args.state,
          kind: args.kind
        });
        
      default:
        throw new Error(`Unknown quantum action: ${action}`);
    }
  }
  
  // Legacy support for individual tools
  if (name === 'quantum_ops' || name === 'quantum_solve' || name === 'quantum_visualize') {
    // Convert individual quantum tool calls to consolidated format
    const actionMap: Record<string, string> = {
      'quantum_ops': 'ops',
      'quantum_solve': 'solve',
      'quantum_visualize': 'visualize'
    };
    
    const action = actionMap[name];
    return await handleQuantumTool('quantum', { ...args, action });
  }
  
  throw new Error(`Unknown quantum tool: ${name}`);
}

export * from "./schema.js";
