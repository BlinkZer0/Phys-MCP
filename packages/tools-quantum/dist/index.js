import { getWorkerClient } from "../../tools-cas/dist/worker-client.js";
import { QuantumOpsSchema, QuantumSolveSchema, QuantumVisualizeSchema } from './schema.js';

export function buildQuantumTools() {
  return [
    {
      name: 'quantum_ops',
      description: 'Quantum operator utilities (commutators, matrix representations)',
      inputSchema: QuantumOpsSchema,
    },
    {
      name: 'quantum_solve',
      description: 'Quantum solver for standard problems or custom Hamiltonians',
      inputSchema: QuantumSolveSchema,
    },
    {
      name: 'quantum_visualize',
      description: 'Visualize quantum states (Bloch sphere, probability density)',
      inputSchema: QuantumVisualizeSchema,
    },
  ];
}

export async function handleQuantumTool(name, args) {
  const worker = getWorkerClient();
  
  switch (name) {
    case 'quantum_ops':
      return await worker.call("quantum_ops", args);
    case 'quantum_solve':
      return await worker.call("quantum_solve", args);
    case 'quantum_visualize':
      return await worker.call("quantum_visualize", args);
    default:
      throw new Error(`Unknown Quantum tool: ${name}`);
  }
}

export * from './schema.js';
