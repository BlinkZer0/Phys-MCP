/**
 * Statistical mechanics tools
 */
import { Tool } from "../../mcp-types/dist/types.js";
import { getWorkerClient } from "../../tools-cas/dist/worker-client.js";
import { StatmechPartitionSchema } from "./schema.js";

export function buildStatmechTools(): Tool[] {
  return [
    {
      name: "statmech_partition",
      description: "Calculate partition function and thermodynamic quantities from energy levels",
      inputSchema: StatmechPartitionSchema,
    },
  ];
}

export async function handleStatmechTool(name: string, args: unknown): Promise<any> {
  const worker = getWorkerClient();
  
  switch (name) {
    case "statmech_partition":
      return await worker.call("statmech_partition", args);
    default:
      throw new Error(`Unknown StatMech tool: ${name}`);
  }
}

export * from "./schema.js";
