/**
 * Phase 8: Unified Digital Physics Lab (Experiment Orchestrator) Tool Schemas
 * Provides DAG definition, validation, execution, report publishing, and collaboration
 */
import { JSONSchema } from '@phys-mcp/mcp-types';
export interface OrchestratorMethodParams {
    method: 'define_dag' | 'validate_dag' | 'run_dag' | 'publish_report' | 'collaborate_share';
}
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
export interface DAGEdge {
    from: string;
    to: string;
    data_key?: string;
}
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
export interface DefineDAGParams extends OrchestratorMethodParams {
    method: 'define_dag';
    spec?: DAGSpec;
    natural_language?: string;
}
export interface ValidateDAGParams extends OrchestratorMethodParams {
    method: 'validate_dag';
    dag_id: string;
}
export interface RunDAGParams extends OrchestratorMethodParams {
    method: 'run_dag';
    dag_id: string;
    parallelism?: number;
    offload_policy?: 'local_first' | 'remote_first' | 'auto';
}
export interface PublishReportParams extends OrchestratorMethodParams {
    method: 'publish_report';
    run_id: string;
    title?: string;
    authors?: string[];
    bib?: string[];
}
export interface CollaborateShareParams extends OrchestratorMethodParams {
    method: 'collaborate_share';
    dag_id: string;
    access: 'read' | 'write';
    participants: string[];
}
export type ExperimentOrchestratorParams = DefineDAGParams | ValidateDAGParams | RunDAGParams | PublishReportParams | CollaborateShareParams;
export declare const defineDAGSchema: JSONSchema;
export declare const validateDAGSchema: JSONSchema;
export declare const runDAGSchema: JSONSchema;
export declare const publishReportSchema: JSONSchema;
export declare const collaborateShareSchema: JSONSchema;
export declare const experimentOrchestratorSchema: JSONSchema;
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
export type ExperimentOrchestratorResponse = DefineDAGResponse | ValidateDAGResponse | RunDAGResponse | PublishReportResponse | CollaborateShareResponse;
