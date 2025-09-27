/**
 * Phase 7: Distributed & Collaborative Computing Tool Schemas
 * Provides job submission, session sharing, lab notebook, and artifact versioning
 */

import { JSONSchema } from '@phys-mcp/mcp-types';

// Base distributed method parameter interface
export interface DistributedMethodParams {
  method: 'job_submit' | 'session_share' | 'lab_notebook' | 'artifact_versioning';
}

// Job Submit Parameters
export interface JobSubmitParams extends DistributedMethodParams {
  method: 'job_submit';
  backend: 'slurm' | 'k8s';
  job_spec: {
    resources?: {
      cpu?: number;
      memory?: string;
      gpu?: number;
      nodes?: number;
      time_limit?: string;
    };
    image?: string;
    command: string[];
    env?: { [key: string]: string };
    mounts?: Array<{
      source: string;
      target: string;
      readonly?: boolean;
    }>;
  };
  artifacts_path: string;
  stream_logs?: boolean;
  timeout_sec?: number;
}

// Session Share Parameters
export interface SessionShareParams extends DistributedMethodParams {
  method: 'session_share';
  session_id: string;
  access?: 'read' | 'write';
  expires_in_hours?: number;
  participants?: string[];
}

// Lab Notebook Parameters
export interface LabNotebookParams extends DistributedMethodParams {
  method: 'lab_notebook';
  session_id: string;
  title: string;
  notes_md?: string;
  attach_artifacts?: string[];
  sign_as?: string;
}

// Artifact Versioning Parameters
export interface ArtifactVersioningParams extends DistributedMethodParams {
  method: 'artifact_versioning';
  artifacts: string[];
  parents?: string[];
  params_json?: any;
  code_version?: string;
}

// Union type for all distributed method parameters
export type DistributedCollaborationParams = 
  | JobSubmitParams 
  | SessionShareParams 
  | LabNotebookParams 
  | ArtifactVersioningParams;

// JSON Schema for job submit
export const jobSubmitSchema: JSONSchema = {
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
export const sessionShareSchema: JSONSchema = {
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
export const labNotebookSchema: JSONSchema = {
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
export const artifactVersioningSchema: JSONSchema = {
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
export const distributedCollaborationSchema: JSONSchema = {
  type: 'object',
  oneOf: [
    jobSubmitSchema,
    sessionShareSchema,
    labNotebookSchema,
    artifactVersioningSchema
  ]
};

// Response interfaces
export interface JobSubmitResponse {
  job_id: string;
  log_stream_path: string;
  returned_artifacts: string[];
  meta: {
    backend: 'slurm' | 'k8s';
    device: string;
    mesh?: number[];
    commit?: string;
    duration_ms: number;
  };
}

export interface SessionShareResponse {
  share_url: string;
  expires_at: string;
  participants: string[];
}

export interface LabNotebookResponse {
  entry_id: string;
  pdf_path: string;
  meta: {
    hash: string;
  };
}

export interface ArtifactVersioningResponse {
  records: Array<{
    artifact: string;
    hash: string;
    lineage_id: string;
  }>;
  meta: {
    cached: boolean;
  };
}

export type DistributedCollaborationResponse = 
  | JobSubmitResponse 
  | SessionShareResponse 
  | LabNotebookResponse 
  | ArtifactVersioningResponse;
