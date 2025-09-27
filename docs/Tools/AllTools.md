---
title: Tool Catalog
kind: reference
---

# Physics MCP Tool Catalog (17)

Current server version: 2.0. Every tool listed below is available through the Physics MCP Server and can be orchestrated individually or chained inside the experiment orchestrator.

## cas
Computer Algebra System operations: evaluate expressions, differentiate, integrate, solve equations and ODEs, and propagate uncertainty.

## units_convert
Convert between different units using the Pint unit registry, including SI, imperial, and common physics-specific units.

## constants_get
Request CODATA and astrophysical constants such as `c`, `h`, `hbar`, `e`, `m_e`, `m_p`, `k_B`, `N_A`, `epsilon_0`, `mu_0`, `G`, `R`, `sigma`, `a_0`, `alpha`, `M_sun`, `pc`, `ly`, and `au`.

## plot
Produce plots and visualizations: 2D functions, parametric curves, vector fields, phase portraits, 3D surfaces, contour plots, volume renderings, animations, and interactive plots.

## accel_caps
Report device acceleration capabilities, exposing the active `ACCEL_MODE` and `ACCEL_DEVICE` for downstream scheduling.

## nli_parse
Translate natural language physics requests into structured MCP tool calls with intent tags and typed parameters.

## tensor_algebra
Compute Christoffel symbols, curvature tensors, and geodesics (scaffold implementation ready for extension).

## quantum
Quantum computing utilities for commutators, matrix representations, solver scaffolds for standard Hamiltonians, and quantum state visualization (Bloch sphere, probability density).

## statmech_partition
Calculate partition functions and derived thermodynamic quantities from supplied energy levels.

## data
Unified data toolkit covering HDF5/FITS/ROOT import/export and GPU-first signal processing (FFT, filtering, spectrogram, wavelet) via the `action` parameter.

## api_tools
Connect to external scientific APIs including arXiv, CERN Open Data, NASA datasets, and NIST physical data catalogs.

## export_tool
Export research assets to Overleaf LaTeX projects, GitHub repositories, Zenodo datasets, Jupyter notebooks, and VR/AR formats.

## ml_ai_augmentation
GPU-first machine learning augmentation: symbolic regression (PySR/genetic programming), physics-informed neural networks, scientific pattern recognition, and derivation explainers with LaTeX output.

## graphing_calculator
Comprehensive graphing calculator with CAS, plotting, matrix operations, statistics, data lists, and programmable utilities.

## distributed_collaboration
Distributed and collaborative computing: remote job submission, session sharing, lab notebook entries, and artifact versioning with provenance.

## experiment_orchestrator
Unified digital physics lab: define, validate, execute, and publish DAG-based experiments with automatic artifact capture and sharing.

## report_generate
Create Markdown session reports summarizing tool events, artifacts, and linked outputs.

