# Physics MCP Server

<p align="center">
  <img src="docs/assets/header.svg" width="960" alt="Physics MCP banner" />
</p>

[Home](README.md) · [Docs](docs/README.md) · [Architecture](docs/Architecture.md) · [Configuration](docs/Configuration.md) · Tools: [CAS](docs/Tools/CAS.md) · [Plot](docs/Tools/Plot.md) · [NLI](docs/Tools/NLI.md) · [Report](docs/Tools/Report.md) · [Tensor](docs/Tools/Tensor.md) · [Quantum](docs/Tools/Quantum.md) · [StatMech](docs/Tools/StatMech.md)

A specialized MCP (Model Context Protocol) server for physicists, providing Computer Algebra System (CAS), plotting, and natural language interface capabilities.

## Features

### Phase 1-3 (Current)
- **CAS tools**: evaluate, differentiate, integrate, solve equations/ODEs with optional units
- **Plot tools**: 2D functions, parametric curves, 2D vector fields, 3D surfaces, contours, phase portraits (PNG + CSV + SVG)
- **NLI tool**: parse natural language into structured tool calls (LM Studio compatible)
- **Units & Constants**: Pint-based unit conversion, CODATA and astrophysical constants
- **Report tool**: generate Markdown reports from persisted sessions
- **Tensor algebra**: Christoffel symbols, curvature tensors, geodesics
- **Quantum mechanics**: operator algebra, standard problems (SHO, particle in box), Bloch sphere visualization
- **Statistical mechanics**: partition functions, thermodynamic quantities
- **Device acceleration**: Optional GPU acceleration via PyTorch with CPU fallback

## Architecture

```
phys-mcp/
├── packages/
│  ├── server/          # TypeScript MCP server
│  ├── tools-cas/       # CAS tool adapters
│  ├── tools-plot/      # Plotting tool adapters
│  ├── tools-nli/       # NLI parser
│  ├── tools-units/     # Unit conversion tools
│  ├── tools-constants/ # Physical constants
│  ├── tools-report/    # Report generation
│  ├── tools-tensor/    # Tensor algebra (Phase 3)
│  ├── tools-quantum/   # Quantum mechanics (Phase 3)
│  ├── tools-statmech/  # Statistical mechanics (Phase 3)
│  └── python-worker/   # Python computation backend
├── examples/
│  └── requests/        # Example JSON-RPC requests
├── scripts/            # Dev/format/build helpers
└── mcp_config.json     # MCP server configuration
```

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- pnpm 8+
- LM Studio (for NLI features)

### Installation

```bash
# Install dependencies
pnpm install

# Install Python dependencies
cd packages/python-worker
pip install -r requirements.txt
cd ../..

# Build all packages
pnpm build

# Start development server
pnpm dev
```

### Configuration

- Environment variables used by NLI: `LM_BASE_URL`, `LM_API_KEY` (optional), `DEFAULT_MODEL`
- See `mcp_config.json` for a working example of server + env configuration
- Add the server to your MCP client configuration

See docs/Configuration for details.

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

- docs/Architecture
- docs/Configuration
- docs/Tools/CAS
- docs/Tools/Plot
- docs/Tools/NLI

Side note: We conserve clarity and momentum—any dispersion is purely numerical.

## Roadmap

Phase 2+: tensor calculus (sympy.diffgeom), quantum ops (qutip), 3D rendering, PDE/FEM, scientific data I/O, LaTeX/PDF reporting.

## License

MIT License - see LICENSE file for details.
