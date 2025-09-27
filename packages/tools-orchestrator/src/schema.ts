/**
 * Phase 8: Unified Digital Physics Lab (Experiment Orchestrator) Tool Schemas
 * Provides DAG definition, validation, execution, report publishing, and collaboration
 */

import { JSONSchema } from '@phys-mcp/mcp-types';

// Base orchestrator method parameter interface
export interface OrchestratorMethodParams {
  method: 'define_dag' | 'validate_dag' | 'run_dag' | 'publish_report' | 'collaborate_share';
}

// DAG Node Definition
export interface DAGNode {
  id: string;
  tool: string;
  method?: string;
  params: any;
  dependencies?: string[];
  visual_outputs?: {
    static?: boolean;
    series?: boolean;
    animation?: boolean;
  };
}

// DAG Edge Definition
export interface DAGEdge {
  from: string;
  to: string;
  data_key?: string;
}

// DAG Specification
export interface DAGSpec {
  nodes: DAGNode[];
  edges: DAGEdge[];
  metadata?: {
    title?: string;
    description?: string;
    author?: string;
    version?: string;
  };
}

// Define DAG Parameters
export interface DefineDAGParams extends OrchestratorMethodParams {
  method: 'define_dag';
  spec?: DAGSpec;
  natural_language?: string;
}

// Validate DAG Parameters
export interface ValidateDAGParams extends OrchestratorMethodParams {
  method: 'validate_dag';
  dag_id: string;
}

// Run DAG Parameters
export interface RunDAGParams extends OrchestratorMethodParams {
  method: 'run_dag';
  dag_id: string;
  parallelism?: number;
  offload_policy?: 'local_first' | 'remote_first' | 'auto';
}

// Publish Report Parameters
export interface PublishReportParams extends OrchestratorMethodParams {
  method: 'publish_report';
  run_id: string;
  title?: string;
  authors?: string[];
  bib?: string[];
}

// Collaborate Share Parameters
export interface CollaborateShareParams extends OrchestratorMethodParams {
  method: 'collaborate_share';
  dag_id: string;
  access: 'read' | 'write';
  participants: string[];
}

// Union type for all orchestrator method parameters
export type ExperimentOrchestratorParams = 
  | DefineDAGParams 
  | ValidateDAGParams 
  | RunDAGParams 
  | PublishReportParams 
  | CollaborateShareParams;

// JSON Schema for define DAG
export const defineDAGSchema: JSONSchema = {
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
export const validateDAGSchema: JSONSchema = {
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
export const runDAGSchema: JSONSchema = {
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
export const publishReportSchema: JSONSchema = {
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
export const collaborateShareSchema: JSONSchema = {
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
export const experimentOrchestratorSchema: JSONSchema = {
  type: 'object',
  oneOf: [
    defineDAGSchema,
    validateDAGSchema,
    runDAGSchema,
    publishReportSchema,
    collaborateShareSchema
  ]
};

// Response interfaces
export interface DefineDAGResponse {
  dag_id: string;
  validated: boolean;
  nodes: DAGNode[];
  edges: DAGEdge[];
  ui_overview_png_b64: string;
}

export interface ValidateDAGResponse {
  dag_id: string;
  ok: boolean;
  warnings: string[];
}

export interface RunDAGResponse {
  run_id: string;
  artifacts: string[];
  reportable: {
    figures: Array<{
      path: string;
      caption: string;
      node_id: string;
    }>;
    tables: Array<{
      path: string;
      caption: string;
      node_id: string;
    }>;
  };
  meta: {
    device_mix: string[];
    cache_hits: number;
    duration_ms: number;
  };
}

export interface PublishReportResponse {
  pdf_path: string;
}

export interface CollaborateShareResponse {
  share_url: string;
  expires_at: string;
}

export type ExperimentOrchestratorResponse = 
  | DefineDAGResponse 
  | ValidateDAGResponse 
  | RunDAGResponse 
  | PublishReportResponse 
  | CollaborateShareResponse;
