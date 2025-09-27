/**
 * Phase 7: Distributed & Collaborative Computing Tool Schemas
 * Provides job submission, session sharing, lab notebook, and artifact versioning
 */
// JSON Schema for job submit
export const jobSubmitSchema = {
    type: 'object',
    properties: {
        method: { type: 'string', const: 'job_submit' },
        backend: {
            type: 'string',
            enum: ['slurm', 'k8s'],
            description: 'Compute backend: Slurm or Kubernetes'
        },
        job_spec: {
            type: 'object',
            description: 'Normalized job specification',
            properties: {
                resources: {
                    type: 'object',
                    properties: {
                        cpu: { type: 'integer', minimum: 1, description: 'CPU cores' },
                        memory: { type: 'string', description: 'Memory (e.g., "4Gi", "8GB")' },
                        gpu: { type: 'integer', minimum: 0, description: 'GPU count' },
                        nodes: { type: 'integer', minimum: 1, description: 'Node count' },
                        time_limit: { type: 'string', description: 'Time limit (e.g., "1:00:00")' }
                    }
                },
                image: { type: 'string', description: 'Container image' },
                command: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Command to execute',
                    minItems: 1
                },
                env: {
                    type: 'object',
                    additionalProperties: { type: 'string' },
                    description: 'Environment variables'
                },
                mounts: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            source: { type: 'string' },
                            target: { type: 'string' },
                            readonly: { type: 'boolean', default: false }
                        },
                        required: ['source', 'target']
                    },
                    description: 'Volume mounts'
                }
            },
            required: ['command']
        },
        artifacts_path: {
            type: 'string',
            description: 'Remote path where job writes artifacts'
        },
        stream_logs: {
            type: 'boolean',
            default: true,
            description: 'Stream job logs in real-time'
        },
        timeout_sec: {
            type: 'integer',
            default: 3600,
            minimum: 60,
            maximum: 86400,
            description: 'Job timeout in seconds'
        }
    },
    required: ['method', 'backend', 'job_spec', 'artifacts_path'],
    additionalProperties: false
};
// JSON Schema for session share
export const sessionShareSchema = {
    type: 'object',
    properties: {
        method: { type: 'string', const: 'session_share' },
        session_id: {
            type: 'string',
            description: 'Session ID to share'
        },
        access: {
            type: 'string',
            enum: ['read', 'write'],
            default: 'read',
            description: 'Access level for participants'
        },
        expires_in_hours: {
            type: 'integer',
            default: 72,
            minimum: 1,
            maximum: 8760,
            description: 'Share expiration in hours'
        },
        participants: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of participant identifiers'
        }
    },
    required: ['method', 'session_id'],
    additionalProperties: false
};
// JSON Schema for lab notebook
export const labNotebookSchema = {
    type: 'object',
    properties: {
        method: { type: 'string', const: 'lab_notebook' },
        session_id: {
            type: 'string',
            description: 'Session ID for the notebook entry'
        },
        title: {
            type: 'string',
            description: 'Entry title',
            minLength: 1,
            maxLength: 200
        },
        notes_md: {
            type: 'string',
            description: 'Markdown notes content'
        },
        attach_artifacts: {
            type: 'array',
            items: { type: 'string' },
            description: 'Artifact paths to attach'
        },
        sign_as: {
            type: 'string',
            description: 'User identity for signature'
        }
    },
    required: ['method', 'session_id', 'title'],
    additionalProperties: false
};
// JSON Schema for artifact versioning
export const artifactVersioningSchema = {
    type: 'object',
    properties: {
        method: { type: 'string', const: 'artifact_versioning' },
        artifacts: {
            type: 'array',
            items: { type: 'string' },
            description: 'Artifact paths to register',
            minItems: 1
        },
        parents: {
            type: 'array',
            items: { type: 'string' },
            description: 'Parent artifact hashes for lineage'
        },
        params_json: {
            type: 'object',
            description: 'Parameters used to generate artifacts'
        },
        code_version: {
            type: 'string',
            description: 'Code version/commit hash'
        }
    },
    required: ['method', 'artifacts'],
    additionalProperties: false
};
// Consolidated distributed collaboration schema
export const distributedCollaborationSchema = {
    type: 'object',
    oneOf: [
        jobSubmitSchema,
        sessionShareSchema,
        labNotebookSchema,
        artifactVersioningSchema
    ]
};
