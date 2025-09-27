/**
 * External API integration tools
 */
import { apiArxivSchema, apiCernSchema, apiNasaSchema, apiNistSchema } from './schema.js';
import { apiArxivHandler, apiCernHandler, apiNasaHandler, apiNistHandler } from './handlers.js';
export const tools = [
    {
        name: 'api_arxiv',
        description: 'Search and download papers from arXiv with metadata extraction',
        inputSchema: apiArxivSchema
    },
    {
        name: 'api_cern',
        description: 'Access CERN Open Data Portal for particle physics datasets',
        inputSchema: apiCernSchema
    },
    {
        name: 'api_nasa',
        description: 'Access NASA datasets and imagery from various missions',
        inputSchema: apiNasaSchema
    },
    {
        name: 'api_nist',
        description: 'Access NIST physical data and reference constants',
        inputSchema: apiNistSchema
    }
];
// Handler mapping
const handlers = {
    'api_arxiv': apiArxivHandler,
    'api_cern': apiCernHandler,
    'api_nasa': apiNasaHandler,
    'api_nist': apiNistHandler
};
export * from './schema.js';
export * from './handlers.js';
// Server integration functions
export function buildExternalTools() {
    return tools;
}
export async function handleExternalTool(name, args) {
    const handler = handlers[name];
    if (!handler) {
        throw new Error(`Unknown external API tool: ${name}`);
    }
    return await handler(args);
}
