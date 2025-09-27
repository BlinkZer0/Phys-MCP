/**
 * Enhanced export tools
 */
import { exportOverleafSchema, exportGithubSchema, exportZenodoSchema, exportJupyterSchema } from './schema.js';
import { exportOverleafHandler, exportGithubHandler, exportZenodoHandler, exportJupyterHandler } from './handlers.js';
export const tools = [
    {
        name: 'export_overleaf',
        description: 'Create Overleaf project with LaTeX document and embedded artifacts',
        inputSchema: exportOverleafSchema
    },
    {
        name: 'export_github',
        description: 'Create GitHub repository with code, data, and documentation',
        inputSchema: exportGithubSchema
    },
    {
        name: 'export_zenodo',
        description: 'Publish dataset to Zenodo with DOI for citation',
        inputSchema: exportZenodoSchema
    },
    {
        name: 'export_jupyter',
        description: 'Generate Jupyter notebook from session data with embedded outputs',
        inputSchema: exportJupyterSchema
    }
];
// Handler mapping
const handlers = {
    'export_overleaf': exportOverleafHandler,
    'export_github': exportGithubHandler,
    'export_zenodo': exportZenodoHandler,
    'export_jupyter': exportJupyterHandler
};
export * from './schema.js';
export * from './handlers.js';
// Server integration functions
export function buildExportTools() {
    return tools;
}
export async function handleExportTool(name, args) {
    const handler = handlers[name];
    if (!handler) {
        throw new Error(`Unknown export tool: ${name}`);
    }
    return await handler(args);
}
