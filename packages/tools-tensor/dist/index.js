import { getWorkerClient } from "../../tools-cas/dist/worker-client.js";
import { TensorAlgebraSchema } from './schema.js';

export function buildTensorTools() {
  return [
    {
      name: 'tensor_algebra',
      description: 'Compute Christoffel symbols, curvature tensors, and geodesics',
      inputSchema: TensorAlgebraSchema,
    },
  ];
}

export async function handleTensorTool(name, args) {
  const worker = getWorkerClient();
  
  switch (name) {
    case 'tensor_algebra':
      return await worker.call("tensor_algebra", args);
    default:
      throw new Error(`Unknown Tensor tool: ${name}`);
  }
}

export * from './schema.js';
