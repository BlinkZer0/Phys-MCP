/**
 * Phase 7: Distributed & Collaborative Computing Tool Package
 * Exports schemas, handlers, and tool definitions for distributed computing capabilities
 */
export * from './schema.js';
export * from './handlers.js';
import { distributedCollaborationSchema } from './schema.js';
/**
 * Distributed Collaboration tool definition
 * Single consolidated tool with multiple distributed computing methods
 */
export const distributedCollaborationTool = {
    name: 'distributed_collaboration',
    description: `🌐 **Distributed & Collaborative Computing Tool** - Graphics-at-scale distributed computing with comprehensive collaboration features. Provides job submission, session sharing, lab notebook, and artifact versioning.

**Methods Available:**
- **job_submit**: Run remote jobs on Slurm or Kubernetes with log streaming and artifact retrieval
- **session_share**: Create multi-user shares for sessions with read/write access control
- **lab_notebook**: Append signed, versioned notebook entries with tool-call provenance
- **artifact_versioning**: Register artifacts with content-addressable hashes and lineage tracking

**Compute Backends:**
- **Slurm**: Submit batch jobs via sbatch, poll status, retrieve artifacts via rsync/scp
- **Kubernetes**: Create Jobs/CronJobs, watch pod logs, pull artifacts from volumes/object store

**Graphics-at-Scale Features:**
- Remote jobs push artifacts back to local registry with full provenance (device, mesh, commit)
- Contact sheet previews and thumbnail sets for long sweeps/animations
- Cache keys include device_kind and code_version for reproducibility

**Collaboration Features:**
- Multi-user session sharing with expiring links and role management
- Signed notebook entries with tool-call provenance and artifact thumbnails
- Git/DVC-style artifact versioning with content-addressable hashes and lineage

**Key Features:**
- Full provenance tracking (device, mesh, commit SHA, duration)
- Content-addressable artifact registry with lineage
- Professional collaboration workflows with signatures and versioning
- Integration with existing Phys-MCP acceleration and graphics contracts`,
    inputSchema: distributedCollaborationSchema
};
/**
 * Build all distributed collaboration tools (currently just the consolidated tool)
 */
export function buildDistributedTools() {
    return [distributedCollaborationTool];
}
/**
 * Legacy tool names for backward compatibility
 * Maps individual method names to consolidated tool calls
 */
export const legacyDistributedToolNames = [
    'job_submit',
    'session_share',
    'lab_notebook',
    'artifact_versioning'
];
