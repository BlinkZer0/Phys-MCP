import { TensorAlgebraSchema } from "./schema.js";
export function buildTensorTools() {
    return [
        {
            name: "tensor_algebra",
            description: "Compute Christoffel symbols, curvature tensors, and geodesics (scaffold)",
            inputSchema: TensorAlgebraSchema,
        },
    ];
}
export async function handleTensorTool(name, args) {
    switch (name) {
        case "tensor_algebra":
            return {
                status: "not_implemented",
                message: "tensor_algebra will be implemented in Phase 3",
                input_echo: args,
            };
        default:
            throw new Error(`Unknown Tensor tool: ${name}`);
    }
}
export * from "./schema.js";
