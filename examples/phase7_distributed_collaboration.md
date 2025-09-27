# Phase 7: Distributed Collaboration Examples

This document provides examples of using the `distributed_collaboration` tool for distributed computing and collaboration features.

## Job Submit Examples

### Slurm Job Submission

```json
{
  "tool": "distributed_collaboration",
  "method": "job_submit",
  "backend": "slurm",
  "job_spec": {
    "resources": {
      "cpu": 4,
      "memory": "8GB",
      "gpu": 1,
      "time_limit": "2:00:00"
    },
    "command": ["python", "physics_simulation.py"],
    "env": {
      "CUDA_VISIBLE_DEVICES": "0",
      "OMP_NUM_THREADS": "4"
    }
  },
  "artifacts_path": "/scratch/user/results",
  "stream_logs": true,
  "timeout_sec": 7200
}
```

### Kubernetes Job Submission

```json
{
  "tool": "distributed_collaboration",
  "method": "job_submit",
  "backend": "k8s",
  "job_spec": {
    "resources": {
      "cpu": 2,
      "memory": "4Gi",
      "gpu": 0
    },
    "image": "python:3.11-slim",
    "command": ["python", "-c", "import numpy as np; print('Hello from K8s!')"],
    "env": {
      "PYTHONPATH": "/app"
    },
    "mounts": [
      {
        "source": "/data",
        "target": "/app/data",
        "readonly": true
      }
    ]
  },
  "artifacts_path": "/app/output",
  "stream_logs": true
}
```

## Session Share Examples

### Create Read-Only Share

```json
{
  "tool": "distributed_collaboration",
  "method": "session_share",
  "session_id": "session_abc123",
  "access": "read",
  "expires_in_hours": 72,
  "participants": ["alice@example.com", "bob@example.com"]
}
```

### Create Collaborative Share

```json
{
  "tool": "distributed_collaboration",
  "method": "session_share",
  "session_id": "session_def456",
  "access": "write",
  "expires_in_hours": 168,
  "participants": ["team@physics-lab.edu"]
}
```

## Lab Notebook Examples

### Create Notebook Entry

```json
{
  "tool": "distributed_collaboration",
  "method": "lab_notebook",
  "session_id": "session_abc123",
  "title": "Hydrogen 2p Orbital Analysis",
  "notes_md": "# Analysis Results\n\nSuccessfully computed the 2p orbital wavefunction with high precision.\n\n## Key Findings\n- Energy eigenvalue: -3.4 eV\n- Radial nodes: 0\n- Angular momentum: l=1\n\n## Next Steps\n- Compare with experimental data\n- Extend to 3d orbitals",
  "attach_artifacts": [
    "artifacts/session_abc123/wavefunction_plot.png",
    "artifacts/session_abc123/energy_data.csv"
  ],
  "sign_as": "Dr. Jane Smith"
}
```

## Artifact Versioning Examples

### Register Artifacts with Lineage

```json
{
  "tool": "distributed_collaboration",
  "method": "artifact_versioning",
  "artifacts": [
    "artifacts/session_abc123/final_plot.png",
    "artifacts/session_abc123/simulation_data.csv",
    "artifacts/session_abc123/analysis_report.pdf"
  ],
  "parents": [
    "sha256:abc123def456...",
    "sha256:789xyz012..."
  ],
  "params_json": {
    "temperature": 300,
    "pressure": 1.0,
    "method": "DFT",
    "basis_set": "6-31G*"
  },
  "code_version": "v2.1.3"
}
```

## Legacy Tool Usage

The individual methods can also be called directly for backward compatibility:

```json
{
  "tool": "job_submit",
  "backend": "slurm",
  "job_spec": {...},
  "artifacts_path": "/scratch/results"
}
```

```json
{
  "tool": "session_share",
  "session_id": "session_123",
  "access": "read"
}
```

## Response Examples

### Job Submit Response

```json
{
  "job_id": "slurm_12345",
  "log_stream_path": "artifacts/session_abc123/job_12345.log",
  "returned_artifacts": [
    "artifacts/session_abc123/result_plot.png",
    "artifacts/session_abc123/output_data.csv"
  ],
  "meta": {
    "backend": "slurm",
    "device": "cuda",
    "mesh": [64, 64],
    "commit": "a1b2c3d4",
    "duration_ms": 45000
  }
}
```

### Session Share Response

```json
{
  "share_url": "https://phys-mcp.example.com/share/abc123def456",
  "expires_at": "2024-01-15T12:00:00Z",
  "participants": ["alice@example.com", "bob@example.com"]
}
```

### Lab Notebook Response

```json
{
  "entry_id": "notebook_789xyz",
  "pdf_path": "artifacts/session_abc123/notebook_789xyz.pdf",
  "meta": {
    "hash": "sha256:def456abc789..."
  }
}
```

### Artifact Versioning Response

```json
{
  "records": [
    {
      "artifact": "artifacts/session_abc123/final_plot.png",
      "hash": "sha256:abc123def456...",
      "lineage_id": "lineage_xyz789"
    },
    {
      "artifact": "artifacts/session_abc123/simulation_data.csv", 
      "hash": "sha256:def456abc123...",
      "lineage_id": "lineage_abc456"
    }
  ],
  "meta": {
    "cached": false
  }
}
```
