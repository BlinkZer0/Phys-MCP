# Physics MCP Server 2.0

<p align="center">
  <img src="docs/assets/header.svg" width="960" alt="Physics MCP banner" />
</p>

[Home](README.md) | [Docs](docs/README.md) | [Architecture](docs/Architecture.md) | [Configuration](docs/Configuration.md) | Tool Docs: [All Tools](docs/Tools/AllTools.md) | [CAS](docs/Tools/CAS.md) | [Plot](docs/Tools/Plot.md) | [NLI](docs/Tools/NLI.md) | [Report](docs/Tools/Report.md) | [Tensor](docs/Tools/Tensor.md) | [Quantum](docs/Tools/Quantum.md) | [StatMech](docs/Tools/StatMech.md)

<p align="center">
  <a href="docs/guides/educators.md"><img alt="Educators Guide" src="https://img.shields.io/badge/Educators-Handbook-blueviolet?style=for-the-badge&logo=googlescholar&logoColor=white" /></a>
  <a href="https://github.com/BlinkZer0/Phys-MCP/stargazers"><img alt="Star Phys-MCP" src="https://img.shields.io/github/stars/BlinkZer0/Phys-MCP?style=for-the-badge&label=Star%20Project&logo=github" /></a>
</p>

A specialized MCP (Model Context Protocol) server for physicists, providing Computer Algebra System (CAS), plotting, and natural language interface capabilities.

## Features

### Server 2.0 Highlights
- **Core CAS and graphing**: symbolic manipulation, equation solving, and high-resolution plots cover both planning and presentation workflows.
- **Unit-aware physics**: `units_convert` and `constants_get` keep results consistent across SI, imperial, and astrophysical contexts.
- **Spectral and signal analysis**: GPU-ready FFT, filtering, spectrogram, and wavelet utilities accelerate large datasets.
- **Quantum and relativity scaffolding**: dedicated toolchains for operator algebra, standard Hamiltonians, and tensor calculus.
- **Thermodynamics and partition functions**: `statmech_partition` captures canonical ensemble workflows with cached summaries.
- **Hardware awareness**: `accel_caps` reports device acceleration modes so you can right-size jobs.
- **Natural language + API ingress**: `nli_parse` bridges plain English to tool calls and `api_tools` pulls reference data.
- **AI augmentation**: `ml_ai_augmentation` delivers symbolic regression, PINN surrogates, and derivation explainers with GPU-first defaults.
- **Collaboration and orchestration**: distributed job submission, experiment DAGs, exports, and Markdown report generation stay in-sync.

## Tool Suite (17)
- **cas**: Computer Algebra System operations for evaluating expressions, differentiation, integration, solving equations and ODEs, and propagating uncertainty.
- **units_convert**: Convert between units via the Pint registry with SI, imperial, and specialized physics unit coverage.
- **constants_get**: Retrieve CODATA and astrophysical constants including `c`, `h`, `G`, `M_sun`, `pc`, `ly`, and more.
- **plot**: Generate 2D/3D plots, vector fields, phase portraits, contours, volume plots, animations, and interactive visualizations.
- **accel_caps**: Report available acceleration hardware and the active `ACCEL_MODE`/`ACCEL_DEVICE`.
- **nli_parse**: Translate natural language physics requests into structured MCP tool calls.
- **tensor_algebra**: Compute Christoffel symbols, curvature tensors, and geodesics (scaffold).
- **quantum**: Quantum computing utilities for operators, solvers, and Bloch/probability visualizations (scaffold).
- **statmech_partition**: Build partition functions and derived thermodynamic quantities from energy levels.
- **data**: Unified data toolkit for HDF5/FITS/ROOT I/O plus GPU-first FFT, filtering, spectrogram, and wavelet analysis via the `action` parameter.
- **api_tools**: Access external scientific APIs such as arXiv, CERN Open Data, NASA datasets, and NIST references.
- **export_tool**: Publish research artifacts to Overleaf, GitHub, Zenodo, Jupyter, and immersive formats.
- **ml_ai_augmentation**: GPU-first ML workflows for symbolic regression, PDE surrogates, pattern recognition, and derivation explanations.
- **graphing_calculator**: Full-featured calculator with CAS, graphing, statistics, matrices, and programmable utilities.
- **distributed_collaboration**: Distributed job submission, session sharing, lab notebooks, and artifact versioning.
- **experiment_orchestrator**: DAG-driven orchestration with validation, execution, publishing, and collaboration hooks.
- **report_generate**: Summarize MCP sessions into Markdown reports with linked artifacts.

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- pnpm 8+

Optional (recommended for faster NLI):
- LM Studio or any OpenAI-compatible local LM server

### Installation

**One-Command Setup** (Recommended):
```bash
# Clone repository
git clone <repository-url>
cd phys-mcp

# Single command setup: builds TypeScript, installs Python deps, runs healthcheck, starts server
pnpm dev:all
```

**Manual Setup**:
```bash
# Install Node.js dependencies
pnpm install

# Install Python dependencies
cd packages/python-worker
pip install -r requirements.txt
cd ../..

# Build all packages
pnpm build

# Run healthcheck to verify installation
pnpm healthcheck

# Start development server
pnpm dev
```

### Configuration

Copy `.env.example` to `.env` and customize:
```bash
cp .env.example .env
```

Key environment variables:
- `LM_BASE_URL`: Local LM server URL (e.g., `http://localhost:1234/v1`)
- `DEFAULT_MODEL`: Model name for NLI parsing
- `DEBUG_VERBOSE`: Set to `1` for detailed logging
- `ACCEL_MODE`: GPU acceleration mode (`auto`, `cuda`, `cpu`)

See [Configuration Guide](docs/Configuration.md) for details.

### Optional: Faster NLI with LM Studio

LM Studio is not required. All CAS/plot/tensor/quantum/stat-mech calculations run in TypeScript/Python workers and work out of the box. Configuring a local LM endpoint such as LM Studio only accelerates the Natural Language Interface (NLI) that turns plain English into structured tool calls.

Why it helps
- Lower latency: local inference avoids network round-trips and rate limits.
- GPU utilization: LM Studio can use your GPU to speed up prompt parsing.
- Better parsing on complex requests: higher-quality intent extraction reduces retries before calculations begin.
- Privacy & cost: keep tokens local; no external API keys required.

How it speeds up “calculations” end-to-end
- The math is computed by our Python/TS backends; the LM is used to decide “what to compute.” Faster parsing → fewer back-and-forths → quicker CAS/plot calls → faster overall results.

How to enable
- Install and run LM Studio (or any OpenAI-compatible local server).
- Set `LM_BASE_URL` (e.g., `http://localhost:1234/v1`) and `DEFAULT_MODEL`.
- Optionally set `LM_API_KEY` if your local server requires it.

### Example Usage

**Consolidated Tool Format** (Recommended):
```json
// Computer Algebra System
{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "cas",
  "params": { 
    "action": "diff", 
    "expr": "sin(x**2)", 
    "symbol": "x" 
  }
}

// Smart Units Evaluation
{
  "jsonrpc": "2.0",
  "id": "2", 
  "method": "units_smart_eval",
  "params": {
    "expr": "c * 1 ns",
    "constants": {"c": true}
  }
}

// Quantum Computing
{
  "jsonrpc": "2.0",
  "id": "3",
  "method": "quantum",
  "params": {
    "action": "visualize",
    "state": "0.707,0.707",
    "kind": "bloch"
  }
}

// Advanced Plotting
{
  "jsonrpc": "2.0",
  "id": "4",
  "method": "plot",
  "params": {
    "plot_type": "function_2d",
    "f": "sin(x)",
    "x_range": [0, 6.28318],
    "dpi": 160,
    "emit_csv": true
  }
}
```

**Legacy Format** (Still Supported):
```json
// Individual tool names work for backward compatibility
{
  "jsonrpc": "2.0",
  "id": "5",
  "method": "cas_diff",
  "params": { "expr": "sin(x**2)", "symbol": "x" }
}
```

## Development

### Quick Commands
```bash
pnpm dev:all        # Build, setup, healthcheck, start server
pnpm build          # Build all TypeScript packages  
pnpm test           # Run all tests
pnpm healthcheck    # Verify system functionality
pnpm lint           # Check code style
pnpm typecheck      # TypeScript type checking
pnpm precommit      # Run pre-commit checks
```

### Advanced Development
```bash
# Generate documentation
pnpm docs:generate

# Run with coverage
pnpm test:coverage

# Python worker testing
cd packages/python-worker
python -m pytest tests/ -v

# Type checking
pnpm -r typecheck
```

## Documentation

### Core Documentation
- **[Tool Index](docs/tools/index.md)**: Complete tool reference with examples
- **[Architecture](docs/Architecture.md)**: System design and components
- **[Configuration](docs/Configuration.md)**: Setup and environment variables
- **[Improvements Summary](IMPROVEMENTS_SUMMARY.md)**: Recent enhancements and features

### Tool Documentation (Auto-generated)
- **[CAS](docs/tools/cas.md)**: Computer Algebra System operations
- **[Plot](docs/tools/plot.md)**: Plotting and visualization
- **[Quantum](docs/tools/quantum.md)**: Quantum computing operations
- **[Units Convert](docs/tools/units_convert.md)**: Unit conversions and smart evaluation
- **[Constants](docs/tools/constants_get.md)**: Physical constants lookup
- **[Data](docs/tools/data.md)**: Data I/O and signal processing

### Quickstart Guides
- **[Projectile Motion](examples/quickstart/projectile-motion.mdx)**: Physics with units
- **[Signal Analysis](examples/quickstart/signal-analysis.mdx)**: FFT and spectrograms  
- **[Partition Functions](examples/quickstart/partition-function.mdx)**: Statistical mechanics
- **[NLI Workflow](examples/quickstart/nli-workflow.mdx)**: Natural language interface

### Schemas & Validation
- **[Units Registry](schemas/units.json)**: Comprehensive unit definitions
- **API Schemas**: Auto-generated from Zod validation schemas

Side note: We conserve clarity and momentum—any dispersion is purely numerical.

## Roadmap

Phase 2+: tensor calculus (sympy.diffgeom), quantum ops (qutip), 3D rendering, PDE/FEM, scientific data I/O, LaTeX/PDF reporting.

## License

MIT License - see LICENSE file for details.
