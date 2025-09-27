/**
 * Phase 8: Unified Digital Physics Lab (Experiment Orchestrator) Tool Schemas
 * Provides DAG definition, validation, execution, report publishing, and collaboration
 */
// JSON Schema for define DAG
export const defineDAGSchema = {
    type: 'object',
    properties: {
        method: { type: 'string', const: 'define_dag' },
        spec: {
            type: 'object',
            description: 'Explicit DAG JSON specification',
            properties: {
                nodes: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', description: 'Unique node identifier' },
                            tool: { type: 'string', description: 'Tool name to execute' },
                            method: { type: 'string', description: 'Optional method for consolidated tools' },
                            params: { type: 'object', description: 'Parameters for the tool/method' },
                            dependencies: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'Node IDs this node depends on'
                            },
                            visual_outputs: {
                                type: 'object',
                                properties: {
                                    static: { type: 'boolean', description: 'Produces static plots/images' },
                                    series: { type: 'boolean', description: 'Produces data series/CSV' },
                                    animation: { type: 'boolean', description: 'Produces animations/videos' }
                                },
                                description: 'Declared visual output types'
                            }
                        },
                        required: ['id', 'tool', 'params']
                    },
                    minItems: 1
                },
                edges: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            from: { type: 'string', description: 'Source node ID' },
                            to: { type: 'string', description: 'Target node ID' },
                            data_key: { type: 'string', description: 'Optional data key for parameter passing' }
                        },
                        required: ['from', 'to']
                    }
                },
                metadata: {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                        description: { type: 'string' },
                        author: { type: 'string' },
                        version: { type: 'string' }
                    }
                }
            },
            required: ['nodes', 'edges']
        },
        natural_language: {
            type: 'string',
            description: 'Natural language description to translate to DAG'
        }
    },
    oneOf: [
        { required: ['method', 'spec'] },
        { required: ['method', 'natural_language'] }
    ],
    additionalProperties: false
};
// JSON Schema for validate DAG
export const validateDAGSchema = {
    type: 'object',
    properties: {
        method: { type: 'string', const: 'validate_dag' },
        dag_id: {
            type: 'string',
            description: 'DAG ID to validate'
        }
    },
    required: ['method', 'dag_id'],
    additionalProperties: false
};
// JSON Schema for run DAG
export const runDAGSchema = {
    type: 'object',
    properties: {
        method: { type: 'string', const: 'run_dag' },
        dag_id: {
            type: 'string',
            description: 'DAG ID to execute'
        },
        parallelism: {
            type: 'integer',
            default: 2,
            minimum: 1,
            maximum: 16,
            description: 'Maximum parallel node execution'
        },
        offload_policy: {
            type: 'string',
            enum: ['local_first', 'remote_first', 'auto'],
            default: 'auto',
            description: 'Policy for offloading nodes to remote compute'
        }
    },
    required: ['method', 'dag_id'],
    additionalProperties: false
};
// JSON Schema for publish report
export const publishReportSchema = {
    type: 'object',
    properties: {
        method: { type: 'string', const: 'publish_report' },
        run_id: {
            type: 'string',
            description: 'Run ID to generate report for'
        },
        title: {
            type: 'string',
            description: 'Report title'
        },
        authors: {
            type: 'array',
            items: { type: 'string' },
            description: 'Report authors'
        },
        bib: {
            type: 'array',
            items: { type: 'string' },
            description: 'BibTeX entries'
        }
    },
    required: ['method', 'run_id'],
    additionalProperties: false
};
// JSON Schema for collaborate share
export const collaborateShareSchema = {
    type: 'object',
    properties: {
        method: { type: 'string', const: 'collaborate_share' },
        dag_id: {
            type: 'string',
            description: 'DAG ID to share'
        },
        access: {
            type: 'string',
            enum: ['read', 'write'],
            description: 'Access level for participants'
        },
        participants: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of participant identifiers',
            minItems: 1
        }
    },
    required: ['method', 'dag_id', 'access', 'participants'],
    additionalProperties: false
};
// Consolidated experiment orchestrator schema
export const experimentOrchestratorSchema = {
    type: 'object',
    oneOf: [
        defineDAGSchema,
        validateDAGSchema,
        runDAGSchema,
        publishReportSchema,
        collaborateShareSchema
    ]
};
