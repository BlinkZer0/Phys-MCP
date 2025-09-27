/**
 * Phase 8: Unified Digital Physics Lab (Experiment Orchestrator) Tool Package
 * Exports schemas, handlers, and tool definitions for experiment orchestration capabilities
 */
export * from './schema.js';
export * from './handlers.js';
import { experimentOrchestratorSchema } from './schema.js';
/**
 * Experiment Orchestrator tool definition
 * Single consolidated tool with multiple experiment orchestration methods
 */
export const experimentOrchestratorTool = {
    name: 'experiment_orchestrator',
    description: `🔬 **Unified Digital Physics Lab (Experiment Orchestrator)** - Graphics-centric orchestration for complex physics experiments. Provides DAG definition, validation, execution, report publishing, and collaboration.

**Methods Available:**
- **define_dag**: Create validated Directed Acyclic Graphs from NL or JSON with declared visual outputs
- **validate_dag**: Static checks for acyclic structure, schema validation, caps enforcement, and graphics audit
- **run_dag**: Execute DAGs locally or via distributed computing with parallelization and caching
- **publish_report**: Generate paper-like PDFs with auto-captioned figures and BibTeX integration
- **collaborate_share**: Share DAG + artifacts + reports with participants using session sharing

**DAG Features:**
- **Node Types**: Support for all existing Phys-MCP tools (cas, plot, data, quantum, ml_ai_augmentation, etc.)
- **Visual Outputs**: Every numeric node declares emit_plots, emit_csv, emit_animation
- **Parallelization**: GPU-friendly nodes executed in parallel where safe
- **Caching**: Parameter-based caching with content-addressable artifacts
- **Provenance**: Full lineage tracking with device, mesh, commit SHA, duration

**Graphics-Centric Design:**
- **Auto-Captions**: Figures captioned from tool parameters and metadata
- **Thumbnails**: Link to full-resolution artifacts in reports
- **Contact Sheets**: Preview grids for bulk visualizations
- **Professional Output**: LaTeX-quality PDFs with proper figure placement

**Execution Policies:**
- **local_first**: Prefer local execution, offload only when necessary
- **remote_first**: Prefer distributed execution via job_submit
- **auto**: Intelligent scheduling based on resource requirements and availability

**Integration Features:**
- **Distributed Computing**: Seamless integration with distributed_collaboration.job_submit
- **Session Management**: Built on session_share infrastructure for collaboration
- **Artifact Registry**: Content-addressable storage with Git/DVC-style versioning
- **Safety Contracts**: Honors all acceleration, graphics, and safety caps from previous phases`,
    inputSchema: experimentOrchestratorSchema
};
/**
 * Build all experiment orchestrator tools (currently just the consolidated tool)
 */
export function buildOrchestratorTools() {
    return [experimentOrchestratorTool];
}
/**
 * Legacy tool names for backward compatibility
 * Maps individual method names to consolidated tool calls
 */
export const legacyOrchestratorToolNames = [
    'define_dag',
    'validate_dag',
    'run_dag',
    'publish_report',
    'collaborate_share'
];
