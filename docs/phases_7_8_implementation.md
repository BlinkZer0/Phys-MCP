---
title: Phases 7 & 8 Implementation
kind: tutorial
header_svg:
  src: "/assets/svg/distributed-collaboration-hero.svg"
  static: "/assets/svg/distributed-collaboration-hero-static.svg"
  title: "Distributed Collaboration & Orchestration"
  animate: true
  theme_variant: "auto"
  reduced_motion: "auto"
---

# Phases 7 & 8 Implementation: Distributed Collaboration & Experiment Orchestration

## Overview

This document describes the implementation of Phases 7 & 8 for Phys-MCP, introducing two major consolidated tools:

- **Phase 7**: `distributed_collaboration` - Graphics-at-scale distributed computing with collaboration features
- **Phase 8**: `experiment_orchestrator` - Unified Digital Physics Lab with DAG-based experiment orchestration

## Architecture

### Consolidated Tool Pattern

Following the established Phys-MCP consolidation pattern, both tools are implemented as:

1. **Single Tool Entry Point**: `distributed_collaboration` and `experiment_orchestrator`
2. **Method-Based Routing**: Uses `method` parameter to route to specific functionality
3. **Legacy Support**: Individual method names still work for backward compatibility
4. **Unified Schemas**: Comprehensive TypeScript schemas with proper validation

### Package Structure

```
packages/
├── tools-distributed/          # Phase 7: Distributed Collaboration
│   ├── src/
│   │   ├── schema.ts           # TypeScript schemas and interfaces
│   │   ├── handlers.ts         # Tool call routing handlers
│   │   └── index.ts            # Main tool definition and exports
│   ├── package.json
│   └── tsconfig.json
├── tools-orchestrator/         # Phase 8: Experiment Orchestrator
│   ├── src/
│   │   ├── schema.ts           # DAG schemas and orchestration types
│   │   ├── handlers.ts         # Orchestration routing handlers
│   │   └── index.ts            # Main tool definition and exports
│   ├── package.json
│   └── tsconfig.json
└── python-worker/
    ├── distributed_collaboration.py  # Phase 7 Python implementation
    ├── experiment_orchestrator.py    # Phase 8 Python implementation
    └── worker.py                     # Updated with new method routing
```

## Phase 7: Distributed Collaboration

### Methods Implemented

#### 1. `job_submit`
- **Purpose**: Submit jobs to Slurm or Kubernetes backends
- **Backends**: 
  - **Slurm**: Uses `sbatch` for batch job submission, polls with `sacct`/`squeue`
  - **Kubernetes**: Creates Jobs/CronJobs, watches pod logs, manages lifecycle
- **Features**:
  - Resource specification (CPU, memory, GPU, time limits)
  - Environment variable injection
  - Volume mounting support
  - Real-time log streaming
  - Automatic artifact retrieval via rsync/scp (Slurm) or volumes/object store (K8s)
  - Full provenance tracking (device, mesh, commit SHA, duration)

#### 2. `session_share`
- **Purpose**: Create multi-user shares for sessions
- **Features**:
  - Read/write access control
  - Expiring share links (configurable hours)
  - Participant management
  - Session-based collaboration

#### 3. `lab_notebook`
- **Purpose**: Create signed, versioned notebook entries
- **Features**:
  - Markdown content support
  - Artifact attachment with thumbnails
  - Digital signatures for authenticity
  - Tool-call provenance tracking
  - PDF generation for archival

#### 4. `artifact_versioning`
- **Purpose**: Git/DVC-style artifact versioning
- **Features**:
  - Content-addressable hashing (SHA-256)
  - Lineage tracking with parent relationships
  - Parameter and code version recording
  - Caching based on content hashes
  - Registry-based storage

### Graphics-at-Scale Features

- **Contact Sheets**: Automatic thumbnail generation for bulk artifacts
- **Provenance Metadata**: Every artifact includes device, mesh, commit, duration
- **Cache Integration**: Device-aware caching with content addressing
- **Artifact Registry**: Centralized storage with lineage tracking

## Phase 8: Experiment Orchestrator

### Methods Implemented

#### 1. `define_dag`
- **Purpose**: Create validated Directed Acyclic Graphs
- **Input Options**:
  - **Natural Language**: Converts NL descriptions to DAG specifications
  - **Explicit JSON**: Direct DAG specification with nodes and edges
- **Features**:
  - Node validation against available tools
  - Visual output declarations (static, series, animation)
  - Dependency graph construction
  - UI overview generation

#### 2. `validate_dag`
- **Purpose**: Comprehensive DAG validation
- **Checks**:
  - Acyclic graph structure (using NetworkX)
  - Tool availability validation
  - Schema compliance for all nodes
  - Graphics audit (visual output declarations)
  - Safety caps enforcement
  - Device hint validation

#### 3. `run_dag`
- **Purpose**: Execute DAGs with intelligent scheduling
- **Execution Policies**:
  - **local_first**: Prefer local execution, offload when necessary
  - **remote_first**: Prefer distributed execution via `job_submit`
  - **auto**: Intelligent scheduling based on resource requirements
- **Features**:
  - Topological sort for dependency resolution
  - Parallel execution with configurable limits
  - Parameter-based caching with content addressing
  - Device mix tracking (CUDA, CPU, etc.)
  - Artifact collection and reportable item generation

#### 4. `publish_report`
- **Purpose**: Generate paper-like PDF reports
- **Features**:
  - Auto-captioned figures from tool parameters
  - BibTeX integration
  - Professional LaTeX-quality formatting
  - Thumbnail links to full-resolution artifacts
  - Comprehensive metadata inclusion

#### 5. `collaborate_share`
- **Purpose**: Share complete experiment bundles
- **Features**:
  - DAG + artifacts + reports sharing
  - Leverages `session_share` infrastructure
  - Read/write access control
  - Participant management

### DAG Features

#### Node Types
- Support for all existing Phys-MCP tools:
  - `cas`, `plot`, `data`, `quantum`, `ml_ai_augmentation`
  - `api_tools`, `export_tool`, `distributed_collaboration`
  - `constants_get`, `units_convert`, etc.

#### Visual Output Declarations
Every numeric node must declare:
- `static`: Produces static plots/images
- `series`: Produces data series/CSV files  
- `animation`: Produces animations/videos

#### Intelligent Offloading
Heuristics for distributed execution:
- ML/AI operations → remote GPU clusters
- Large animations → distributed rendering
- Compute-intensive simulations → HPC resources

## Cross-Phase Contracts

### Acceleration Contract
- **Device Detection**: Automatic CUDA/HIP/MPS/XPU detection with CPU fallback
- **Memory Management**: VRAM monitoring and batch size adjustment
- **Error Handling**: Graceful degradation on GPU memory exhaustion
- **Warnings**: Clear metadata about device fallbacks

### Graphics Contract
- **Universal Support**: All numeric nodes support `emit_plots`, `emit_csv`, `emit_animation`
- **Return Format**: Standardized response with `png_b64`, `svg`, `csv_path`, `mp4_path`, `thumbnails`
- **Metadata**: Comprehensive meta information (device, dtype, samples, mesh, duration, cached)

### Safety & Caps Contract
- **Timeouts**: 3-10 second limits with `allow_large` override
- **Surface Limits**: ≤160×160 points for surfaces
- **Field Limits**: ≤64×64 points for vector fields
- **Animation Limits**: ≤300 frames maximum
- **Override**: `allow_large=true` parameter for special cases

### Caching & Provenance Contract
- **Cache Keys**: Include tool/method, params hash, data hash, code version, device kind
- **Content Addressing**: SHA-256 hashes for all artifacts
- **Lineage Tracking**: Parent relationships and parameter provenance
- **Git Integration**: Automatic commit SHA recording

## Server Integration

### Tool Registration
Both tools are integrated into the server routing with:
- Consolidated tool handlers (`handleDistributedCollaborationTool`, `handleExperimentOrchestratorTool`)
- Legacy support for individual method names
- Proper error handling and validation

### Method Routing
```typescript
// Consolidated tools
else if (name === "distributed_collaboration" && handleDistributedCollaborationTool) {
  result = await handleDistributedCollaborationTool(name, args);
} else if (name === "experiment_orchestrator" && handleExperimentOrchestratorTool) {
  result = await handleExperimentOrchestratorTool(name, args);
}

// Legacy support
else if ((name === "job_submit" || name === "session_share" || 
          name === "lab_notebook" || name === "artifact_versioning") && handleDistributedCollaborationTool) {
  result = await handleDistributedCollaborationTool(name, args);
}
```

### Python Worker Integration
The Python worker includes new method routing:
```python
# Phase 7 methods - Distributed Collaboration
elif method == "distributed_job_submit":
    return distributed_collaboration.distributed_job_submit(params, config)
elif method == "distributed_session_share":
    return distributed_collaboration.distributed_session_share(params, config)
# ... etc

# Phase 8 methods - Experiment Orchestrator  
elif method == "orchestrator_define_dag":
    return experiment_orchestrator.orchestrator_define_dag(params, config)
# ... etc
```

## Dependencies & Prerequisites

### Phase 7 Dependencies
- **Optional**: `kubernetes` Python client for K8s support
- **Optional**: `yaml` for configuration parsing
- **System**: Slurm commands (`sbatch`, `sacct`, `squeue`) for Slurm support
- **System**: `rsync`/`scp` for artifact retrieval

### Phase 8 Dependencies
- **Required**: 
etworkx` for DAG validation and topological sorting
- **Required**: `matplotlib` for DAG visualization
- **Integration**: All existing Phys-MCP tool dependencies

### Configuration
Extended `server.config.json` with sections for:
- Distributed computing backend settings
- Artifact storage configuration
- Collaboration and sharing settings
- DAG execution policies

## Testing & Validation

### Acceptance Criteria

#### Phase 7 Acceptance
- ✅ Local→Slurm mock submission with artifact retrieval and indexing
- ✅ Local→K8s Job execution with log streaming and cleanup
- ✅ Notebook+Versioning with hash/lineage resolution and cache hits

#### Phase 8 Acceptance
- ✅ Hydrogen 2p exemplar: define→validate→run with GPU fallback
- ✅ Static + animated visual generation
- ✅ Cache hits on repeat execution
- ✅ PDF report generation with correct figures and provenance

### Example Workflows

#### Distributed Physics Simulation
1. Define DAG with compute-intensive quantum simulation
2. Validate DAG structure and resource requirements
3. Execute with `remote_first` policy → offloads to Slurm/K8s
4. Collect artifacts with full provenance
5. Generate publication-ready report
6. Share with collaborators

#### Multi-Method Analysis Pipeline
1. Import experimental data via `data` tool
2. Apply ML pattern recognition via `ml_ai_augmentation`
3. Perform quantum calculations via `quantum` tool
4. Create visualizations via `plot` tool
5. Export to VR format via `export_tool`
6. Version all artifacts with lineage tracking

## Benefits & Impact

### Unified Digital Physics Lab
- **Single Interface**: All distributed computing and orchestration through two consolidated tools
- **Professional Workflows**: Publication-ready reports with proper provenance
- **Collaboration Ready**: Built-in sharing and versioning for team science
- **Scalable**: From laptop to supercomputer with the same interface

### Graphics-at-Scale
- **Contact Sheets**: Efficient preview of bulk visualizations
- **Device Awareness**: Optimal resource utilization across heterogeneous hardware
- **Professional Output**: LaTeX-quality reports with auto-generated captions
- **Artifact Registry**: Centralized storage with content addressing

### Research Reproducibility
- **Full Provenance**: Every artifact traceable to exact parameters and code version
- **Content Addressing**: Immutable artifact identification via cryptographic hashes
- **Lineage Tracking**: Complete dependency graphs for complex workflows
- **Caching**: Efficient re-execution with parameter-aware caching

This implementation establishes Phys-MCP as a comprehensive platform for distributed, collaborative, and reproducible computational physics research.


