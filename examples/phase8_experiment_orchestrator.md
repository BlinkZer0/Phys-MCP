# Phase 8: Experiment Orchestrator Examples

This document provides examples of using the `experiment_orchestrator` tool for DAG definition, validation, execution, and collaboration.

## Define DAG Examples

### Hydrogen 2p Exemplar (Natural Language)

```json
{
  "tool": "experiment_orchestrator",
  "method": "define_dag",
  "natural_language": "Analyze hydrogen 2p orbital: get physical constants, solve Schrödinger equation, plot wavefunction, and create time evolution animation"
}
```

### Explicit DAG Specification

```json
{
  "tool": "experiment_orchestrator",
  "method": "define_dag",
  "spec": {
    "nodes": [
      {
        "id": "get_constants",
        "tool": "constants_get",
        "params": {"name": "hbar"},
        "visual_outputs": {"static": false, "series": false, "animation": false}
      },
      {
        "id": "solve_quantum",
        "tool": "quantum",
        "method": "solve",
        "params": {
          "problem": "particle_in_box",
          "params": {"n": 2, "L": 1.0}
        },
        "dependencies": ["get_constants"],
        "visual_outputs": {"static": true, "series": true, "animation": false}
      },
      {
        "id": "plot_wavefunction",
        "tool": "plot",
        "method": "function_2d",
        "params": {
          "f": "sin(2*pi*x)",
          "x": [-1, 1, 100],
          "title": "Hydrogen 2p Wavefunction",
          "emit_plots": true,
          "emit_csv": true
        },
        "dependencies": ["solve_quantum"],
        "visual_outputs": {"static": true, "series": true, "animation": false}
      },
      {
        "id": "create_animation",
        "tool": "plot",
        "method": "animation",
        "params": {
          "frame_expr": "sin(2*pi*x - t)",
          "x_range": [-1, 1, 100],
          "t_range": [0, 2, 60],
          "title": "Time Evolution",
          "emit_animation": true,
          "format": "mp4"
        },
        "dependencies": ["plot_wavefunction"],
        "visual_outputs": {"static": false, "series": false, "animation": true}
      },
      {
        "id": "symbolic_analysis",
        "tool": "ml_ai_augmentation",
        "method": "symbolic_regression_train",
        "params": {
          "X": "wavefunction_data.csv",
          "y": "energy_data.csv",
          "max_depth": 8,
          "pop_size": 500
        },
        "dependencies": ["solve_quantum"],
        "visual_outputs": {"static": true, "series": true, "animation": false}
      }
    ],
    "edges": [
      {"from": "get_constants", "to": "solve_quantum", "data_key": "hbar"},
      {"from": "solve_quantum", "to": "plot_wavefunction", "data_key": "wavefunction"},
      {"from": "plot_wavefunction", "to": "create_animation", "data_key": "static_plot"},
      {"from": "solve_quantum", "to": "symbolic_analysis", "data_key": "quantum_data"}
    ],
    "metadata": {
      "title": "Comprehensive Hydrogen 2p Analysis",
      "description": "Multi-method analysis combining quantum mechanics, visualization, and ML",
      "author": "Physics Research Team",
      "version": "1.0"
    }
  }
}
```

## Validate DAG Examples

```json
{
  "tool": "experiment_orchestrator",
  "method": "validate_dag",
  "dag_id": "dag_abc123def456"
}
```

## Run DAG Examples

### Local Execution

```json
{
  "tool": "experiment_orchestrator",
  "method": "run_dag",
  "dag_id": "dag_abc123def456",
  "parallelism": 4,
  "offload_policy": "local_first"
}
```

### Distributed Execution

```json
{
  "tool": "experiment_orchestrator",
  "method": "run_dag",
  "dag_id": "dag_abc123def456",
  "parallelism": 8,
  "offload_policy": "remote_first"
}
```

### Auto Scheduling

```json
{
  "tool": "experiment_orchestrator",
  "method": "run_dag",
  "dag_id": "dag_abc123def456",
  "parallelism": 6,
  "offload_policy": "auto"
}
```

## Publish Report Examples

### Basic Report

```json
{
  "tool": "experiment_orchestrator",
  "method": "publish_report",
  "run_id": "run_xyz789abc123",
  "title": "Hydrogen 2p Orbital Analysis Results",
  "authors": ["Dr. Jane Smith", "Dr. John Doe"],
  "bib": [
    "@article{schrodinger1926, title={An Undulatory Theory of the Mechanics of Atoms and Molecules}, author={Schrödinger, Erwin}, journal={Physical Review}, volume={28}, number={6}, pages={1049--1070}, year={1926}}",
    "@book{griffiths2018, title={Introduction to Quantum Mechanics}, author={Griffiths, David J.}, edition={3}, publisher={Cambridge University Press}, year={2018}}"
  ]
}
```

## Collaborate Share Examples

### Share DAG with Team

```json
{
  "tool": "experiment_orchestrator",
  "method": "collaborate_share",
  "dag_id": "dag_abc123def456",
  "access": "write",
  "participants": [
    "alice@physics-lab.edu",
    "bob@physics-lab.edu",
    "research-team@university.edu"
  ]
}
```

### Read-Only Share

```json
{
  "tool": "experiment_orchestrator",
  "method": "collaborate_share",
  "dag_id": "dag_abc123def456",
  "access": "read",
  "participants": ["reviewer@journal.com"]
}
```

## Legacy Tool Usage

Individual methods can be called directly:

```json
{
  "tool": "define_dag",
  "natural_language": "Create a simple physics simulation workflow"
}
```

```json
{
  "tool": "run_dag",
  "dag_id": "dag_123",
  "parallelism": 2
}
```

## Response Examples

### Define DAG Response

```json
{
  "dag_id": "dag_abc123def456",
  "validated": true,
  "nodes": [
    {
      "id": "get_constants",
      "tool": "constants_get",
      "params": {"name": "hbar"},
      "visual_outputs": {"static": false, "series": false, "animation": false}
    }
  ],
  "edges": [
    {"from": "get_constants", "to": "solve_quantum", "data_key": "hbar"}
  ],
  "ui_overview_png_b64": "iVBORw0KGgoAAAANSUhEUgAAAoAAAAHgCAYAAAA..."
}
```

### Validate DAG Response

```json
{
  "dag_id": "dag_abc123def456",
  "ok": true,
  "warnings": [
    "Node 'plot_node' should declare visual outputs for better report generation"
  ]
}
```

### Run DAG Response

```json
{
  "run_id": "run_xyz789abc123",
  "artifacts": [
    "artifacts/session_abc123/wavefunction_plot.png",
    "artifacts/session_abc123/energy_data.csv",
    "artifacts/session_abc123/time_evolution.mp4",
    "artifacts/session_abc123/symbolic_regression_results.png"
  ],
  "reportable": {
    "figures": [
      {
        "path": "artifacts/session_abc123/wavefunction_plot.png",
        "caption": "Hydrogen 2p wavefunction visualization showing radial and angular components",
        "node_id": "plot_wavefunction"
      },
      {
        "path": "artifacts/session_abc123/symbolic_regression_results.png",
        "caption": "Symbolic regression analysis revealing underlying mathematical structure",
        "node_id": "symbolic_analysis"
      }
    ],
    "tables": [
      {
        "path": "artifacts/session_abc123/energy_data.csv",
        "caption": "Computed energy eigenvalues and quantum numbers",
        "node_id": "solve_quantum"
      }
    ]
  },
  "meta": {
    "device_mix": ["cuda", "cpu"],
    "cache_hits": 2,
    "duration_ms": 15000
  }
}
```

### Publish Report Response

```json
{
  "pdf_path": "artifacts/session_abc123/report_xyz789abc123.pdf"
}
```

### Collaborate Share Response

```json
{
  "share_url": "https://phys-mcp.example.com/dag/abc123def456/share",
  "expires_at": "2024-01-22T12:00:00Z"
}
```

## Complex Workflow Examples

### Multi-Physics Simulation Pipeline

```json
{
  "tool": "experiment_orchestrator",
  "method": "define_dag",
  "spec": {
    "nodes": [
      {
        "id": "molecular_dynamics",
        "tool": "data",
        "method": "import_hdf5",
        "params": {"file_path": "md_trajectory.h5"},
        "visual_outputs": {"static": false, "series": true, "animation": false}
      },
      {
        "id": "analyze_structure",
        "tool": "ml_ai_augmentation",
        "method": "pattern_recognition_infer",
        "params": {
          "task": "classify",
          "images": ["structure_snapshots/*.png"],
          "model": "molecular_classifier.pt"
        },
        "dependencies": ["molecular_dynamics"],
        "visual_outputs": {"static": true, "series": true, "animation": false}
      },
      {
        "id": "quantum_calculation",
        "tool": "quantum",
        "method": "solve",
        "params": {"problem": "custom", "hamiltonian": "H_molecular"},
        "dependencies": ["analyze_structure"],
        "visual_outputs": {"static": true, "series": true, "animation": false}
      },
      {
        "id": "visualize_results",
        "tool": "plot",
        "method": "volume_3d",
        "params": {
          "mode": "isosurface",
          "iso_level": 0.1,
          "emit_animation": true,
          "format": "mp4"
        },
        "dependencies": ["quantum_calculation"],
        "visual_outputs": {"static": true, "series": false, "animation": true}
      },
      {
        "id": "export_to_vr",
        "tool": "export_tool",
        "method": "vr_export",
        "params": {
          "format": "glb",
          "geometry": {"vertices": [], "faces": []}
        },
        "dependencies": ["visualize_results"],
        "visual_outputs": {"static": false, "series": false, "animation": false}
      }
    ],
    "edges": [
      {"from": "molecular_dynamics", "to": "analyze_structure"},
      {"from": "analyze_structure", "to": "quantum_calculation"},
      {"from": "quantum_calculation", "to": "visualize_results"},
      {"from": "visualize_results", "to": "export_to_vr"}
    ],
    "metadata": {
      "title": "Multi-Physics Molecular Analysis Pipeline",
      "description": "Comprehensive workflow combining MD, ML, quantum mechanics, and VR visualization"
    }
  }
}
```
