/**
 * Enhanced export tools
 */
import { exportOverleafHandler, exportGithubHandler, exportZenodoHandler, exportJupyterHandler, exportVRHandler } from './handlers.js';
export const tools = [
    {
        name: 'export_tool',
        description: 'Export research outputs to various platforms: Overleaf LaTeX projects, GitHub repositories, Zenodo datasets, Jupyter notebooks, VR/AR formats',
        inputSchema: {
            type: "object",
            properties: {
                export_type: {
                    type: "string",
                    description: "Export destination",
                    enum: ["overleaf", "github", "zenodo", "jupyter", "vr_export"]
                },
                // Common parameters
                title: { type: "string", description: "Title for the export" },
                description: { type: "string", description: "Description of the content" },
                // Overleaf parameters
                project_name: { type: "string", description: "Name for the Overleaf project" },
                template: { type: "string", enum: ["article", "report", "book", "beamer", "poster"], default: "article", description: "LaTeX document template" },
                authors: { type: "array", items: { type: "string" }, description: "List of author names" },
                abstract: { type: "string", description: "Document abstract" },
                artifacts: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            type: { type: "string", enum: ["figure", "table", "equation"] },
                            content: { type: "string" },
                            caption: { type: "string" },
                            label: { type: "string" }
                        }
                    },
                    description: "Artifacts to include in the document"
                },
                bibliography: { type: "array", items: { type: "string" }, description: "BibTeX entries" },
                // GitHub parameters
                repository_name: { type: "string", description: "GitHub repository name" },
                private: { type: "boolean", default: false, description: "Make repository private" },
                include_artifacts: { type: "boolean", default: true, description: "Include generated artifacts (plots, data)" },
                include_code: { type: "boolean", default: true, description: "Include analysis code and notebooks" },
                license: { type: "string", enum: ["MIT", "Apache-2.0", "GPL-3.0", "BSD-3-Clause", "CC-BY-4.0"], default: "MIT", description: "Repository license" },
                topics: { type: "array", items: { type: "string" }, description: "GitHub topics/tags" },
                readme_content: { type: "string", description: "Custom README content" },
                // Zenodo parameters
                creators: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            affiliation: { type: "string" },
                            orcid: { type: "string" }
                        },
                        required: ["name"]
                    },
                    description: "Dataset creators"
                },
                keywords: { type: "array", items: { type: "string" }, description: "Keywords for the dataset" },
                upload_type: { type: "string", enum: ["dataset", "software", "publication"], default: "dataset", description: "Type of upload" },
                related_identifiers: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            identifier: { type: "string" },
                            relation: { type: "string" },
                            resource_type: { type: "string" }
                        }
                    },
                    description: "Related publications or datasets"
                },
                // Jupyter parameters
                notebook_name: { type: "string", description: "Jupyter notebook filename" },
                session_data: { type: "object", description: "Session data to convert to notebook" },
                include_outputs: { type: "boolean", default: true, description: "Include cell outputs (plots, results)" },
                kernel: { type: "string", enum: ["python3", "julia", "r"], default: "python3", description: "Jupyter kernel to use" },
                export_format: { type: "string", enum: ["ipynb", "html", "pdf", "slides"], default: "ipynb", description: "Export format" },
                // VR Export parameters
                geometry: {
                    type: "object",
                    properties: {
                        vertices: {
                            type: "array",
                            items: {
                                type: "array",
                                items: { type: "number" },
                                minItems: 3,
                                maxItems: 3
                            },
                            description: "Array of [x,y,z] coordinates"
                        },
                        faces: {
                            type: "array",
                            items: {
                                type: "array",
                                items: { type: "integer", minimum: 0 }
                            },
                            description: "Array of vertex indices"
                        },
                        normals: {
                            type: "array",
                            items: {
                                type: "array",
                                items: { type: "number" }
                            },
                            nullable: true,
                            description: "Optional normals"
                        },
                        colors: {
                            type: "array",
                            items: {
                                type: "array",
                                items: { type: "number" }
                            },
                            nullable: true,
                            description: "Optional colors"
                        }
                    },
                    required: ["vertices", "faces"],
                    description: "3D geometry data"
                },
                format: {
                    type: "string",
                    enum: ["glb", "ply"],
                    default: "glb",
                    description: "Export format"
                },
                extras: {
                    type: "object",
                    description: "Additional metadata"
                }
            },
            required: ["export_type"]
        }
    }
];
// Handler mapping
const handlers = {
    'export_overleaf': exportOverleafHandler,
    'export_github': exportGithubHandler,
    'export_zenodo': exportZenodoHandler,
    'export_jupyter': exportJupyterHandler,
    'export_vr': exportVRHandler
};
export * from './schema.js';
export * from './handlers.js';
// Server integration functions
export function buildExportTools() {
    return tools;
}
export async function handleExportTool(name, args) {
    if (name === 'export_tool') {
        const exportType = args.export_type;
        switch (exportType) {
            case 'overleaf':
                return await exportOverleafHandler({
                    project_name: args.project_name,
                    template: args.template,
                    title: args.title,
                    authors: args.authors,
                    abstract: args.abstract,
                    artifacts: args.artifacts,
                    bibliography: args.bibliography
                });
            case 'github':
                return await exportGithubHandler({
                    repository_name: args.repository_name,
                    description: args.description,
                    private: args.private,
                    include_artifacts: args.include_artifacts,
                    include_code: args.include_code,
                    license: args.license,
                    topics: args.topics,
                    readme_content: args.readme_content
                });
            case 'zenodo':
                return await exportZenodoHandler({
                    title: args.title,
                    description: args.description,
                    creators: args.creators,
                    keywords: args.keywords,
                    license: args.license,
                    upload_type: args.upload_type,
                    related_identifiers: args.related_identifiers
                });
            case 'jupyter':
                return await exportJupyterHandler({
                    notebook_name: args.notebook_name,
                    title: args.title,
                    description: args.description,
                    session_data: args.session_data,
                    include_outputs: args.include_outputs,
                    kernel: args.kernel,
                    export_format: args.export_format
                });
            case 'vr_export':
                return await exportVRHandler({
                    geometry: args.geometry,
                    format: args.format,
                    extras: args.extras
                });
            default:
                throw new Error(`Unknown export type: ${exportType}`);
        }
    }
    // Legacy support for individual tools
    const handler = handlers[name];
    if (!handler) {
        throw new Error(`Unknown export tool: ${name}`);
    }
    return await handler(args);
}
