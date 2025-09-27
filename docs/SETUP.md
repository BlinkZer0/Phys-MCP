# Physics MCP Server - Setup Guide

<p align="center">
  <img src="assets/header.svg" width="960" alt="Physics MCP banner" />
</p>

[Home](README.md) · [Docs](docs/README.md) · [Architecture](docs/Architecture.md) · [Configuration](docs/Configuration.md) · Tools: [CAS](docs/Tools/CAS.md) · [Plot](docs/Tools/Plot.md) · [NLI](docs/Tools/NLI.md)

## Prerequisites

### Required Software
- **Node.js 20+** - [Download from nodejs.org](https://nodejs.org/)
- **Python 3.11+** - [Download from python.org](https://www.python.org/)
- **Package Manager**: Either pnpm (recommended) or npm
- **LM Studio** (for NLI features) - [Download from lmstudio.ai](https://lmstudio.ai/)

### Install pnpm (Recommended)
```bash
npm install -g pnpm
```

## Installation Steps

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd phys-mcp

# Install Node.js dependencies (choose one)
pnpm install          # Recommended
# OR
npm install           # Alternative

# Install Python dependencies
cd packages/python-worker
pip install -r requirements.txt
cd ../..
```

### 2. Build the Project

```bash
# Build all packages (choose one)
pnpm build           # If using pnpm
# OR  
npm run build        # If using npm
```

### 3. Configure LM Studio (Optional, for NLI)

1. Download and install LM Studio
2. Download a compatible model (e.g., `qwen2.5-coder`)
3. Start the local server (usually on `http://localhost:1234`)
4. Update `mcp_config.json` with your endpoint:

```json
{
  "mcpServers": {
    "phys-mcp": {
      "command": "node",
      "args": ["packages/server/dist/index.js"],
      "env": {
        "LM_BASE_URL": "http://localhost:1234/v1",
        "DEFAULT_MODEL": "qwen2.5-coder"
      }
    }
  }
}
```

## Running the Server

### Development Mode
```bash
# Start development server (choose one)
pnpm dev             # If using pnpm
# OR
npm run dev          # If using npm
# OR
bash scripts/dev.sh  # Direct script execution
```

### Production Mode
```bash
node packages/server/dist/index.js
```

## Testing the Installation

### 1. Test CAS Operations
```bash
echo '{"jsonrpc":"2.0","id":"1","method":"cas.diff","params":{"expr":"sin(x**2)","symbol":"x"}}' | node packages/server/dist/index.js
```

### 2. Test Plotting
```bash
echo '{"jsonrpc":"2.0","id":"2","method":"plot.function_2d","params":{"f":"sin(x)","x_min":0,"x_max":6.28}}' | node packages/server/dist/index.js
```

### 3. Test NLI (requires LM Studio)
```bash
echo '{"jsonrpc":"2.0","id":"3","method":"nli.parse","params":{"text":"differentiate sin(x) with respect to x"}}' | node packages/server/dist/index.js
```

## Troubleshooting

### Common Issues

1. **Python Dependencies Not Found**
   ```bash
   cd packages/python-worker
   python -m pip install --upgrade pip
   pip install -r requirements.txt
   ```

2. **TypeScript Build Errors**
   ```bash
   # Clean and rebuild
   npm run clean
   npm install
   npm run build
   ```

3. **LM Studio Connection Issues**
   - Ensure LM Studio is running
   - Check the endpoint URL in `mcp_config.json`
   - Verify the model is loaded in LM Studio

4. **Permission Issues (Unix/Linux)**
   ```bash
   chmod +x scripts/*.sh
   ```

### Windows Users

Use the provided batch scripts:
```cmd
scripts\dev.bat
scripts\format.bat
```

Or use PowerShell:
```powershell
npm run dev
npm run build
```

## Development Workflow

1. **Make Changes** to TypeScript files in `packages/*/src/`
2. **Build** with `npm run build` or `pnpm build`
3. **Test** using the example requests in `examples/requests/`
4. **Format Code** with `npm run format`
5. **Lint** with `npm run lint`

## Project Structure

```
phys-mcp/
├── packages/
│   ├── server/          # Main MCP server
│   ├── tools-cas/       # Computer Algebra System tools
│   ├── tools-plot/      # Plotting tools
│   ├── tools-nli/       # Natural Language Interface
│   └── python-worker/   # Python computation backend
├── examples/requests/   # Example JSON-RPC requests
├── scripts/            # Development scripts
└── mcp_config.json     # MCP server configuration
```

## Next Steps

1. Add the server to your MCP client configuration
2. Try the example requests in `examples/requests/`
3. Explore the natural language interface with LM Studio
4. Build your own physics computations!

For more details, see the main README.md file.
