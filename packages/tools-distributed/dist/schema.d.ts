/**
 * Phase 7: Distributed & Collaborative Computing Tool Schemas
 * Provides job submission, session sharing, lab notebook, and artifact versioning
 */
import { JSONSchema } from '@phys-mcp/mcp-types';
export interface DistributedMethodParams {
    method: 'job_submit' | 'session_share' | 'lab_notebook' | 'artifact_versioning';
}
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
        env?: {
            [key: string]: string;
        };
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
export interface SessionShareParams extends DistributedMethodParams {
    method: 'session_share';
    session_id: string;
    access?: 'read' | 'write';
    expires_in_hours?: number;
    participants?: string[];
}
export interface LabNotebookParams extends DistributedMethodParams {
    method: 'lab_notebook';
    session_id: string;
    title: string;
    notes_md?: string;
    attach_artifacts?: string[];
    sign_as?: string;
}
export interface ArtifactVersioningParams extends DistributedMethodParams {
    method: 'artifact_versioning';
    artifacts: string[];
    parents?: string[];
    params_json?: any;
    code_version?: string;
}
export type DistributedCollaborationParams = JobSubmitParams | SessionShareParams | LabNotebookParams | ArtifactVersioningParams;
export declare const jobSubmitSchema: JSONSchema;
export declare const sessionShareSchema: JSONSchema;
export declare const labNotebookSchema: JSONSchema;
export declare const artifactVersioningSchema: JSONSchema;
export declare const distributedCollaborationSchema: JSONSchema;
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
export type DistributedCollaborationResponse = JobSubmitResponse | SessionShareResponse | LabNotebookResponse | ArtifactVersioningResponse;
