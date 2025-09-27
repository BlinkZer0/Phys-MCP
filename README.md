# Physics MCP Server 2.0

<p align="center">
  <img src="docs/assets/header.svg" width="960" alt="Physics MCP banner" />
</p>

[Home](README.md) | [Docs](docs/README.md) | [Architecture](docs/Architecture.md) | [Configuration](docs/Configuration.md) | Tool Docs: [All Tools](docs/Tools/AllTools.md) | [CAS](docs/Tools/CAS.md) | [Plot](docs/Tools/Plot.md) | [NLI](docs/Tools/NLI.md) | [Report](docs/Tools/Report.md) | [Tensor](docs/Tools/Tensor.md) | [Quantum](docs/Tools/Quantum.md) | [StatMech](docs/Tools/StatMech.md)

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

## Tool Suite (21)
- **cas**: Computer Algebra System operations for evaluating expressions, differentiation, integration, solving equations and ODEs, and propagating uncertainty.
- **units_convert**: Convert between units via the Pint registry with SI, imperial, and specialized physics unit coverage.
- **constants_get**: Retrieve CODATA and astrophysical constants including `c`, `h`, `G`, `M_sun`, `pc`, `ly`, and more.
- **plot**: Generate 2D/3D plots, vector fields, phase portraits, contours, volume plots, animations, and interactive visualizations.
- **accel_caps**: Report available acceleration hardware and the active `ACCEL_MODE`/`ACCEL_DEVICE`.
- **nli_parse**: Translate natural language physics requests into structured MCP tool calls.
- **tensor_algebra**: Compute Christoffel symbols, curvature tensors, and geodesics (scaffold).
- **quantum**: Quantum computing utilities for operators, solvers, and Bloch/probability visualizations (scaffold).
- **statmech_partition**: Build partition functions and derived thermodynamic quantities from energy levels.
- **data**: Import/export scientific data formats (HDF5, FITS, ROOT) plus FFT, filtering, spectrogram, and wavelet helpers.
- **data_fft**: GPU-accelerated Fast Fourier Transform with detailed diagnostic plots.
- **data_filter**: GPU-accelerated digital filtering (IIR/FIR) with response analysis.
- **data_spectrogram**: Short-Time Fourier Transform utilities for time-frequency analysis.
- **data_wavelet**: Continuous wavelet transform for time-scale analysis.
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

Run these commands from the repository root directory (`phys-mcp/`).

```bash
# Install Node.js dependencies from the repo root
pnpm install

# Install Python dependencies (from packages/python-worker/)
cd packages/python-worker
pip install -r requirements.txt
cd ../..

# Build all packages from the repo root
pnpm build

# Start the development server from phys-mcp/
pnpm dev
```

### Configuration

- Environment variables used by NLI: `LM_BASE_URL`, `LM_API_KEY` (optional), `DEFAULT_MODEL`
- See `config/mcp_config.json` for a working example of server + env configuration
- Add the server to your MCP client configuration

See docs/Configuration for details.

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

```json
// Differentiate an expression
{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "cas_diff",
  "params": { "expr": "sin(x**2)", "symbol": "x" }
}

// Evaluate with units
{
  "jsonrpc": "2.0",
  "id": "2",
  "method": "cas_evaluate",
  "params": {
    "expr": "(1/2)*m*v**2",
    "vars": { "m": {"value": 1.0, "unit": "kg"}, "v": {"value": 3.0, "unit": "m/s"} }
  }
}

// Plot a function
{
  "jsonrpc": "2.0",
  "id": "3",
  "method": "plot_function_2d",
  "params": { "f": "sin(x)", "x_min": 0, "x_max": 6.28318, "dpi": 160 }
}

// Natural language parsing
{
  "jsonrpc": "2.0",
  "id": "4",
  "method": "nli_parse",
  "params": { "text": "Solve y'' + y = 0 with y(0)=0 and y'(0)=1" }
}
```

## Development

### Building
```bash
pnpm build
```

### Linting & Formatting
```bash
pnpm lint
pnpm format
```

### Testing
```bash
pnpm test
pnpm run test:install
```

## Documentation

- Docs index: `docs/README.md`
- Tool catalog: `docs/Tools/AllTools.md`
- Architecture: `docs/Architecture.md`
- Configuration: `docs/Configuration.md`
- Tools:
  - CAS: `docs/Tools/CAS.md`
  - Plot: `docs/Tools/Plot.md`
  - NLI: `docs/Tools/NLI.md`
  - Report: `docs/Tools/Report.md`
  - Tensor: `docs/Tools/Tensor.md`
  - Quantum: `docs/Tools/Quantum.md`
  - StatMech: `docs/Tools/StatMech.md`
- Examples: `examples/requests/`

Side note: We conserve clarity and momentum—any dispersion is purely numerical.

## Roadmap

Phase 2+: tensor calculus (sympy.diffgeom), quantum ops (qutip), 3D rendering, PDE/FEM, scientific data I/O, LaTeX/PDF reporting.

## License

MIT License - see LICENSE file for details.
